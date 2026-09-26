import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { criarCotacao, simularPrecos } from '../api/cotador'
import { buscarVeiculo, listarAnos, listarMarcas, listarModelos } from '../api/fipe'
import PlanoCard from '../components/PlanoCard'
import VeiculoCard from '../components/VeiculoCard'
import { TIPOS_VEICULO } from '../utils/constants'

const CLIENTE_VAZIO = { cliente_nome: '', cliente_telefone: '', cliente_email: '' }

export default function NovaCotacao() {
  // listas vindas da API FIPE
  const [tipo, setTipo] = useState('carros')
  const [marcas, setMarcas] = useState([])
  const [modelos, setModelos] = useState([])
  const [anos, setAnos] = useState([])
  const [selecao, setSelecao] = useState({ marca: '', modelo: '', ano: '' })
  const [veiculo, setVeiculo] = useState(null)

  // dados vindos da API do Cotador
  const [simulacao, setSimulacao] = useState(null)
  const [planoId, setPlanoId] = useState(null)
  const [cliente, setCliente] = useState(CLIENTE_VAZIO)

  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  /** Executa uma chamada mostrando "carregando" e tratando o erro. */
  const executar = async (chamada) => {
    setCarregando(true)
    setMensagem(null)
    try {
      return await chamada()
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message })
      return null
    } finally {
      setCarregando(false)
    }
  }

  const limparVeiculo = () => {
    setVeiculo(null)
    setSimulacao(null)
    setPlanoId(null)
  }

  // 1. marcas: sempre que o tipo de veículo muda
  useEffect(() => {
    setSelecao({ marca: '', modelo: '', ano: '' })
    setModelos([])
    setAnos([])
    limparVeiculo()
    executar(() => listarMarcas(tipo)).then((lista) => setMarcas(lista ?? []))
  }, [tipo])

  // 2. modelos da marca escolhida
  const escolherMarca = async (marca) => {
    setSelecao({ marca, modelo: '', ano: '' })
    setModelos([])
    setAnos([])
    limparVeiculo()
    if (marca) setModelos((await executar(() => listarModelos(tipo, marca))) ?? [])
  }

  // 3. anos do modelo escolhido
  const escolherModelo = async (modelo) => {
    setSelecao((atual) => ({ ...atual, modelo, ano: '' }))
    setAnos([])
    limparVeiculo()
    if (modelo) setAnos((await executar(() => listarAnos(tipo, selecao.marca, modelo))) ?? [])
  }

  // 4. preço na FIPE e, em seguida, mensalidade de cada plano na API do Cotador
  const escolherAno = async (ano) => {
    setSelecao((atual) => ({ ...atual, ano }))
    limparVeiculo()
    if (!ano) return

    const dados = await executar(() => buscarVeiculo(tipo, selecao.marca, selecao.modelo, ano))
    if (!dados) return
    setVeiculo(dados)

    const resultado = await executar(() => simularPrecos(dados))
    if (!resultado) return
    setSimulacao(resultado)
    setPlanoId(resultado.opcoes.find((o) => o.mensalidade !== null)?.plano_id ?? null)
  }

  const salvar = async (evento) => {
    evento.preventDefault()
    const cotacao = await executar(() =>
      criarCotacao({
        ...veiculo,
        plano_id: planoId,
        cliente_nome: cliente.cliente_nome.trim(),
        cliente_telefone: cliente.cliente_telefone || null,
        cliente_email: cliente.cliente_email || null,
      }),
    )
    if (!cotacao) return

    setMensagem({
      tipo: 'sucesso',
      texto: `Cotação #${cotacao.id} salva: plano ${cotacao.plano_nome} por R$ ${cotacao.mensalidade.toFixed(2).replace('.', ',')}/mês.`,
    })
    setCliente(CLIENTE_VAZIO)
    setSelecao({ marca: '', modelo: '', ano: '' })
    setModelos([])
    setAnos([])
    limparVeiculo()
  }

  const alterarCliente = (campo) => (evento) => setCliente({ ...cliente, [campo]: evento.target.value })

  return (
    <section className="pagina">
      <h1>Nova cotação</h1>

      {mensagem && (
        <p className={`mensagem mensagem--${mensagem.tipo}`}>
          {mensagem.texto} {mensagem.tipo === 'sucesso' && <Link to="/cotacoes">Ver cotações</Link>}
        </p>
      )}

      {/* 1. Veículo (API FIPE) */}
      <div className="cartao">
        <h2>1. Veículo</h2>
        <div className="grade">
          <label>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_VEICULO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Marca
            <select value={selecao.marca} onChange={(e) => escolherMarca(e.target.value)} disabled={!marcas.length}>
              <option value="">Selecione</option>
              {marcas.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Modelo
            <select value={selecao.modelo} onChange={(e) => escolherModelo(e.target.value)} disabled={!modelos.length}>
              <option value="">Selecione</option>
              {modelos.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ano
            <select value={selecao.ano} onChange={(e) => escolherAno(e.target.value)} disabled={!anos.length}>
              <option value="">Selecione</option>
              {anos.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {carregando && <p className="carregando">Carregando…</p>}
      </div>

      {veiculo && <VeiculoCard veiculo={veiculo} />}

      {/* 2. Plano (API do Cotador) */}
      {simulacao && (
        <div className="cartao">
          <h2>2. Plano</h2>
          {simulacao.aceito ? (
            <div className="planos">
              {simulacao.opcoes.map((opcao) => (
                <PlanoCard
                  key={opcao.plano_id}
                  opcao={opcao}
                  selecionado={opcao.plano_id === planoId}
                  onSelecionar={setPlanoId}
                />
              ))}
            </div>
          ) : (
            <p className="mensagem mensagem--erro">Veículo não aceito: {simulacao.motivo}</p>
          )}
        </div>
      )}

      {/* 3. Cliente e envio (POST) */}
      {simulacao?.aceito && planoId && (
        <form className="cartao" onSubmit={salvar}>
          <h2>3. Cliente</h2>
          <div className="grade">
            <label>
              Nome *
              <input value={cliente.cliente_nome} onChange={alterarCliente('cliente_nome')} required minLength={3} />
            </label>
            <label>
              Telefone
              <input value={cliente.cliente_telefone} onChange={alterarCliente('cliente_telefone')} />
            </label>
            <label>
              E-mail
              <input type="email" value={cliente.cliente_email} onChange={alterarCliente('cliente_email')} />
            </label>
          </div>
          <button type="submit" className="botao" disabled={carregando}>
            Salvar cotação
          </button>
        </form>
      )}
    </section>
  )
}
