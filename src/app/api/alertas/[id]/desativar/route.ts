import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, context: RouteParams) {
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
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Token de autorização necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    console.log("Desativando alerta:", id)

    const response = await fetch(`${API_BASE_URL}/alertas/${id}/desativar`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Status da resposta:", response.status)

    let data
    try {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = { message: "Alerta desativado com sucesso" }
      }
    } catch {
      // Se não conseguir parsear, usar mensagem padrão
      data = { message: "Alerta desativado com sucesso" }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Erro na API de desativação:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
