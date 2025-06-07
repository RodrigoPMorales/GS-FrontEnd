import { type NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{ id: string }>
}

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
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Token de autorização necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    console.log("Buscando deslizamento por ID:", id)
    console.log("URL da API:", `${API_BASE_URL}/deslizamentos/${id}`)

    const response = await fetch(`${API_BASE_URL}/deslizamentos/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Status da resposta:", response.status)

    let data
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const textResponse = await response.text()
      console.log("Resposta não-JSON:", textResponse)

      if (response.status === 404) {
        data = { message: "Deslizamento não encontrado" }
      } else {
        data = { message: textResponse || "Erro ao buscar deslizamento" }
      }
    }

    console.log("Dados recebidos:", data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Erro na API de busca de deslizamento:", error)

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
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
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Token de autorização necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    console.log("Atualizando deslizamento ID:", id)
    console.log("Payload:", JSON.stringify(body, null, 2))
    console.log("URL da API:", `${API_BASE_URL}/deslizamentos/${id}`)

    const response = await fetch(`${API_BASE_URL}/deslizamentos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    console.log("Status da resposta:", response.status)

    let data
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const textResponse = await response.text()
      console.log("Resposta não-JSON:", textResponse)

      if (response.ok) {
        data = { message: "Deslizamento atualizado com sucesso" }
      } else {
        data = { message: textResponse || "Erro ao atualizar deslizamento" }
      }
    }

    console.log("Dados da resposta:", data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Erro na API de atualização de deslizamento:", error)

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
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

    if (!authHeader) {
      return NextResponse.json({ message: "Token necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    const response = await fetch(`${API_BASE_URL}/deslizamentos/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ message: "Erro de conexão" }, { status: 503 })
  }
}
