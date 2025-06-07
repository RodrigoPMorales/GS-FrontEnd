import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

// Buscar um alerta específico
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Verificar se a API_BASE_URL está configurada
    const API_BASE_URL = process.env.API_BASE_URL

    if (!API_BASE_URL) {
      console.error("API_BASE_URL não está configurada no arquivo .env")
      return NextResponse.json(
        { message: "Configuração da API não encontrada. Verifique a variável API_BASE_URL no arquivo .env" },
        { status: 500 },
      )
    }

    const { id } = await context.params

    console.log("Buscando alerta ID:", id)

    // Fazer requisição simples
    const resposta = await fetch(`${API_BASE_URL}/alertas/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (resposta.ok) {
      const dados = await resposta.json()
      return NextResponse.json(dados)
    } else if (resposta.status === 404) {
      return NextResponse.json({ message: "Alerta não encontrado" }, { status: 404 })
    } else {
      return NextResponse.json({ message: "Erro ao buscar alerta" }, { status: resposta.status })
    }
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({ message: "Erro de conexão" }, { status: 503 })
  }
}
