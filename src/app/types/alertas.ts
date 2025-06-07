export interface AlertaDefesaCivil {
  id: number
  titulo: string
  descricao?: string
  nivelAlerta: "BAIXO" | "MEDIO" | "ALTO"
  bairrosAfetados?: string
  dataInicio: string
  ativo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AlertaRequest {
  titulo: string
  descricao?: string
  nivelAlerta: "BAIXO" | "MEDIO" | "ALTO"
  bairrosAfetados?: string
  dataInicio?: string
}
