/**
 * Cliente da API externa FIPE (Parallelum, v2).
 * Documentação: https://deividfortuna.github.io/fipe/v2/
 *
 * O front-end consulta a FIPE diretamente e trata as respostas antes de
 * exibir (Cenário 1 do MVP). As respostas ficam em cache na memória para
 * poupar o limite diário de requisições gratuitas.
 */
import { ApiError, request } from './http'

const FIPE_URL = 'https://fipe.parallelum.com.br/api/v2'

// tipos usados no sistema -> tipos usados pela FIPE
const TIPO_FIPE = {
  carros: 'cars',
  motos: 'motorcycles',
  caminhoes: 'trucks',
}

const cache = new Map()

async function getFipe(caminho) {
  if (cache.has(caminho)) {
    return cache.get(caminho)
  }
  try {
    const dados = await request(`${FIPE_URL}${caminho}`)
    cache.set(caminho, dados)
    return dados
  } catch (erro) {
    if (erro.status === 429) {
      throw new ApiError('Limite diário de consultas à FIPE atingido. Tente novamente amanhã.', 429)
    }
    if (erro.status === 0) {
      throw new ApiError('A API FIPE está indisponível no momento.', 0)
    }
    throw new ApiError('Não foi possível consultar a tabela FIPE.', erro.status)
  }
}

/** Converte "R$ 68.500,00" em 68500. */
export function parsePrecoFipe(preco) {
  const numero = String(preco).replace(/[^\d,]/g, '').replace(',', '.')
  return Number(numero)
}

/** Na FIPE, o ano 32000 indica veículo zero quilômetro. */
function nomeDoAno(nome) {
  return nome.replace(/^32000/, 'Zero KM')
}

export async function listarMarcas(tipo) {
  const marcas = await getFipe(`/${TIPO_FIPE[tipo]}/brands`)
  return marcas.map(({ code, name }) => ({ value: code, label: name }))
}

export async function listarModelos(tipo, marcaId) {
  const modelos = await getFipe(`/${TIPO_FIPE[tipo]}/brands/${marcaId}/models`)
  return modelos.map(({ code, name }) => ({ value: code, label: name }))
}

export async function listarAnos(tipo, marcaId, modeloId) {
  const anos = await getFipe(`/${TIPO_FIPE[tipo]}/brands/${marcaId}/models/${modeloId}/years`)
  return anos.map(({ code, name }) => ({ value: code, label: nomeDoAno(name) }))
}

/** Busca o preço do veículo e já devolve os campos no formato da API do Cotador. */
export async function buscarVeiculo(tipo, marcaId, modeloId, anoId) {
  const veiculo = await getFipe(
    `/${TIPO_FIPE[tipo]}/brands/${marcaId}/models/${modeloId}/years/${anoId}`,
  )
  return {
    tipo_veiculo: tipo,
    marca: veiculo.brand,
    modelo: veiculo.model,
    ano_modelo: veiculo.modelYear,
    combustivel: veiculo.fuel,
    codigo_fipe: veiculo.codeFipe,
    valor_fipe: parsePrecoFipe(veiculo.price),
    mes_referencia: veiculo.referenceMonth?.trim(),
  }
}
