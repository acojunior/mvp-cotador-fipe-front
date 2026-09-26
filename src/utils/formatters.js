const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export const formatarMoeda = (valor) => moeda.format(valor ?? 0)

export const formatarDataHora = (iso) => (iso ? dataHora.format(new Date(iso)) : '')

// na FIPE, o ano 32000 representa veículo zero quilômetro
export const formatarAno = (ano) => (ano === 32000 ? 'Zero KM' : String(ano))
