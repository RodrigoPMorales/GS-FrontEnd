import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Debug das variáveis de ambiente
    console.log("=== DEBUG LOGIN API ===")
    console.log("NODE_ENV:", process.env.NODE_ENV)
    console.log("API_BASE_URL:", process.env.API_BASE_URL)
    console.log(
      "Todas as env vars que começam com API_:",
      Object.keys(process.env).filter((key) => key.startsWith("API_")),
    )

    // Verificar se a API_BASE_URL está configurada
    const API_BASE_URL = process.env.API_BASE_URL

    if (!API_BASE_URL) {
      console.error("❌ API_BASE_URL não está configurada no arquivo .env")
      console.error("Verifique se o arquivo .env.local existe na raiz do projeto")
      console.error("E se contém a linha: API_BASE_URL=http://localhost:8080/api")

      return NextResponse.json(
        {
          message:
            "Configuração da API não encontrada. Verifique se o arquivo .env.local existe e contém API_BASE_URL=http://localhost:8080/api",
          debug: {
            nodeEnv: process.env.NODE_ENV,
            hasApiBaseUrl: false,
            envVarsWithApi: Object.keys(process.env).filter((key) => key.startsWith("API_")),
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ API_BASE_URL encontrada:", API_BASE_URL)

    const body = await request.json()

    console.log("Enviando dados de login para API:", { email: body.email, senha: "[HIDDEN]" })
    console.log("URL da API:", `${API_BASE_URL}/auth/login`)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        data = {
          message: "Login realizado com sucesso",
          token: "mock-token", // Para desenvolvimento
          nome: body.email.split("@")[0], // Nome baseado no email
        }
      } else {
        data = { message: textResponse || "Erro ao fazer login" }
      }
    }

    console.log("Dados da resposta:", data)

    // Se a resposta não incluir o nome do usuário, vamos buscar do email
    if (response.ok && !data.nome) {
      data.nome = body.email.split("@")[0]
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Erro na API de login:", error)

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
