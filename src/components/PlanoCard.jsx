import { formatarMoeda } from '../utils/formatters'

/** Cartão de um plano na comparação lado a lado. */
export default function PlanoCard({ opcao, selecionado, onSelecionar }) {
  return (
    <button
      type="button"
      className={`plano${selecionado ? ' plano--selecionado' : ''}`}
      onClick={() => onSelecionar(opcao.plano_id)}
      disabled={opcao.mensalidade === null}
    >
      <span className="plano__nome">{opcao.plano_nome}</span>
      <strong className="plano__preco">{formatarMoeda(opcao.mensalidade)}/mês</strong>
      <ul>
        {opcao.coberturas.map((cobertura) => (
          <li key={cobertura}>{cobertura}</li>
        ))}
      </ul>
      <span className="plano__acao">{selecionado ? '✓ Selecionado' : 'Escolher'}</span>
    </button>
  )
}
