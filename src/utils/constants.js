export const TIPOS_VEICULO = [
  { value: 'carros', label: 'Carro' },
  { value: 'motos', label: 'Moto' },
  { value: 'caminhoes', label: 'Caminhão' },
]

export const STATUS_COTACAO = [
  { value: 'ABERTA', label: 'Aberta' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'FECHADA', label: 'Fechada' },
  { value: 'PERDIDA', label: 'Perdida' },
]

export const labelDoTipo = (valor) => TIPOS_VEICULO.find((t) => t.value === valor)?.label ?? valor
