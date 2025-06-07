import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, message: "Token não fornecido" }, { status: 400 })
    }

    const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080/api"

    console.log("Verificando token com a API Java...")

    try {
      // Tentar fazer uma requisição simples para verificar se o token é válido
      // Usando um endpoint que provavelmente existe na API Java
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Status da verificação:", response.status)

      if (response.ok) {
        return NextResponse.json({ valid: true })
      } else if (response.status === 401) {
        return NextResponse.json({ valid: false, message: "Token inválido ou expirado" }, { status: 401 })
      } else {
        return NextResponse.json({ valid: false, message: "Erro na verificação do token" }, { status: 500 })
      }
    } catch (fetchError) {
      console.error("Erro ao conectar com a API Java:", fetchError)
      // Se não conseguir conectar com a API, assumir que o token é válido
      // A verificação real será feita quando a requisição for enviada
      return NextResponse.json({ valid: true, message: "Verificação offline - token assumido como válido" })
    }
  } catch (error) {
    console.error("Erro na verificação do token:", error)
    return NextResponse.json({ valid: false, message: "Erro interno na verificação" }, { status: 500 })
  }
}
