import { labelDoTipo } from '../utils/constants'
import { formatarAno, formatarMoeda } from '../utils/formatters'

/** Resumo do veículo consultado na Tabela FIPE. */
export default function VeiculoCard({ veiculo }) {
  return (
    <section className="cartao veiculo">
      <div className="veiculo__linha">
        <div>
          <small>{veiculo.marca}</small>
          <h3>{veiculo.modelo}</h3>
          <small>
            {labelDoTipo(veiculo.tipo_veiculo)} · {formatarAno(veiculo.ano_modelo)} · {veiculo.combustivel} · FIPE{' '}
            {veiculo.codigo_fipe} · {veiculo.mes_referencia}
          </small>
        </div>
        <strong className="veiculo__valor">{formatarMoeda(veiculo.valor_fipe)}</strong>
      </div>
    </section>
  )
}
