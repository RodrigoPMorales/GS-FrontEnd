// Tipos para Alagamentos
export interface Endereco {
  logradouro: string
  bairro: string
  cep: string
  tipoSolo: string
  altitudeRua: string
  tipoConstrucao: string
  bairroRisco: string
  proximoCorrego: boolean
}

export interface AlagamentoRequest {
  descricao: string | null
  dataOcorrencia: string
  endereco: Endereco
}

export interface AlagamentoResponse {
  id: number
  usuarioId: number
  descricao: string
  dataOcorrencia: string
  endereco: Endereco
}

// Tipos para Deslizamentos
export interface DeslizamentoRequest {
  descricao: string | null
  dataOcorrencia: string
  endereco: Endereco
}

export interface DeslizamentoResponse {
  id: number
  usuarioId: number
  descricao: string
  dataOcorrencia: string
  endereco: Endereco
}
