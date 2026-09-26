import { formatarMoeda } from '../utils/formatters'

/** Painel com os números gerais das cotações (GET /dashboard/resumo). */
export default function ResumoCotacoes({ resumo }) {
  if (!resumo) return null

  const indicadores = [
    { titulo: 'Cotações', valor: resumo.total_cotacoes, detalhe: `${resumo.por_status.ABERTA} aberta(s)` },
    {
      titulo: 'Taxa de conversão',
      valor: `${resumo.taxa_conversao.toLocaleString('pt-BR')}%`,
      detalhe: `${resumo.por_status.FECHADA} fechada(s)`,
    },
    { titulo: 'Ticket médio', valor: formatarMoeda(resumo.ticket_medio), detalhe: 'mensalidade média' },
    {
      titulo: 'Receita mensal',
      valor: formatarMoeda(resumo.receita_mensal_fechada),
      detalhe: 'cotações fechadas',
    },
  ]

  return (
    <div className="indicadores">
      {indicadores.map((item) => (
        <div key={item.titulo} className="cartao indicador">
          <span>{item.titulo}</span>
          <strong>{item.valor}</strong>
          <small>{item.detalhe}</small>
        </div>
      ))}
    </div>
  )
}
