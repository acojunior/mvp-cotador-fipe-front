import { useCallback, useEffect, useState } from 'react'
import { atualizarCotacao, buscarResumo, listarCotacoes, removerCotacao } from '../api/cotador'
import ResumoCotacoes from '../components/ResumoCotacoes'
import { STATUS_COTACAO } from '../utils/constants'
import { formatarAno, formatarDataHora, formatarMoeda } from '../utils/formatters'

export default function Cotacoes() {
  const [cotacoes, setCotacoes] = useState([])
  const [resumo, setResumo] = useState(null)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [mensagem, setMensagem] = useState(null)

  // GET: carrega a lista (com busca e filtro de status) e o resumo do painel
  const carregar = useCallback(async () => {
    try {
      const [dados, numeros] = await Promise.all([
        listarCotacoes({ busca, status, por_pagina: 50 }),
        buscarResumo(),
      ])
      setCotacoes(dados.itens)
      setResumo(numeros)
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message })
    }
  }, [busca, status])

  useEffect(() => {
    const espera = setTimeout(carregar, 300) // aguarda o usuário parar de digitar
    return () => clearTimeout(espera)
  }, [carregar])

  // PUT: altera o status direto na tabela
  const alterarStatus = async (cotacao, novoStatus) => {
    try {
      await atualizarCotacao(cotacao.id, {
        cliente_nome: cotacao.cliente_nome,
        cliente_telefone: cotacao.cliente_telefone,
        cliente_email: cotacao.cliente_email,
        plano_id: cotacao.plano_id,
        observacao: cotacao.observacao,
        status: novoStatus,
      })
      setMensagem({ tipo: 'sucesso', texto: `Cotação #${cotacao.id} atualizada.` })
      carregar()
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message })
    }
  }

  // DELETE: remove a cotação após confirmação
  const excluir = async (cotacao) => {
    if (!window.confirm(`Excluir a cotação #${cotacao.id} de ${cotacao.cliente_nome}?`)) return
    try {
      await removerCotacao(cotacao.id)
      setMensagem({ tipo: 'sucesso', texto: `Cotação #${cotacao.id} excluída.` })
      carregar()
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message })
    }
  }

  return (
    <section className="pagina">
      <h1>Cotações</h1>

      <ResumoCotacoes resumo={resumo} />

      {mensagem && <p className={`mensagem mensagem--${mensagem.tipo}`}>{mensagem.texto}</p>}

      <div className="cartao">
        <div className="cartao__topo">
          <div className="filtros">
            <input
              type="search"
              placeholder="Buscar cliente, marca ou modelo"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_COTACAO.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cotacoes.length === 0 ? (
          <p className="vazio">Nenhuma cotação encontrada.</p>
        ) : (
          <div className="rolagem">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Valor FIPE</th>
                  <th>Plano</th>
                  <th>Mensalidade</th>
                  <th>Status</th>
                  <th>Criada em</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cotacoes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.cliente_nome}</td>
                    <td>
                      {c.marca} {c.modelo}
                      <small>{formatarAno(c.ano_modelo)}</small>
                    </td>
                    <td>{formatarMoeda(c.valor_fipe)}</td>
                    <td>{c.plano_nome}</td>
                    <td>
                      <strong>{formatarMoeda(c.mensalidade)}</strong>
                    </td>
                    <td>
                      <select
                        className={`status status--${c.status.toLowerCase()}`}
                        value={c.status}
                        onChange={(e) => alterarStatus(c, e.target.value)}
                        aria-label={`Status da cotação ${c.id}`}
                      >
                        {STATUS_COTACAO.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatarDataHora(c.criado_em)}</td>
                    <td>
                      <button type="button" className="botao-excluir" onClick={() => excluir(c)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
