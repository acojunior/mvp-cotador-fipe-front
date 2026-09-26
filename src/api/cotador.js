/**
 * Cliente da API do Cotador (back-end em Flask).
 * O endereço vem da variável de ambiente VITE_API_URL.
 */
import { request, toQueryString } from './http'

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

// GET: lista de cotações (com busca e filtro por status)
export const listarCotacoes = (filtros) => request(`${API_URL}/cotacoes${toQueryString(filtros)}`)

// GET: mensalidade do veículo em cada plano
export const simularPrecos = ({ valor_fipe, tipo_veiculo, ano_modelo }) =>
  request(`${API_URL}/planos/precos${toQueryString({ valor_fipe, tipo_veiculo, ano_modelo })}`)

// GET: números gerais para o painel da tela de cotações
export const buscarResumo = () => request(`${API_URL}/dashboard/resumo`)

// POST: nova cotação
export const criarCotacao = (cotacao) =>
  request(`${API_URL}/cotacoes`, { method: 'POST', body: cotacao })

// PUT: atualização da cotação
export const atualizarCotacao = (id, dados) =>
  request(`${API_URL}/cotacoes/${id}`, { method: 'PUT', body: dados })

// DELETE: remoção da cotação
export const removerCotacao = (id) => request(`${API_URL}/cotacoes/${id}`, { method: 'DELETE' })
