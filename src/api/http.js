/**
 * Cliente HTTP compartilhado pelos módulos de API.
 * Centraliza o fetch, a leitura do JSON e a conversão de erros.
 */

export class ApiError extends Error {
  constructor(mensagem, status, detalhes = null) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.detalhes = detalhes
  }
}

export async function request(url, { method = 'GET', body, headers } = {}) {
  let resposta
  try {
    resposta = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  const texto = await resposta.text()
  const dados = texto ? safeJson(texto) : null

  if (!resposta.ok) {
    const mensagem = dados?.mensagem || `Erro ${resposta.status} na requisição.`
    throw new ApiError(mensagem, resposta.status, dados?.detalhes ?? null)
  }

  return dados
}

function safeJson(texto) {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

/** Monta a query string ignorando valores vazios. */
export function toQueryString(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(chave, valor)
    }
  })
  const texto = query.toString()
  return texto ? `?${texto}` : ''
}
