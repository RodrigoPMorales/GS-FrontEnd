import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    console.log("Enviando dados para API:", JSON.stringify(body, null, 2))
    console.log("URL da API:", `${API_BASE_URL}/register`)

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Status da resposta:", response.status)
    console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()))

    let data
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      const textResponse = await response.text()
      console.log("Resposta não-JSON:", textResponse)

      if (response.ok) {
        data = { message: "Usuário cadastrado com sucesso" }
      } else {
        data = { message: textResponse || "Erro ao cadastrar usuário" }
      }
    }

    console.log("Dados da resposta:", data)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Erro na API de registro:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      const API_BASE_URL = process.env.API_BASE_URL || "URL não configurada"
      return NextResponse.json(
        {
          message: `Erro de conexão com o servidor em ${API_BASE_URL}. Verifique se a API está rodando.`,
          error: error.message,
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
