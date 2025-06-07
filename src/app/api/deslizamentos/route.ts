import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
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

    console.log("Tentando buscar deslizamentos da API:", `${API_BASE_URL}/deslizamentos`)

    try {
      const response = await fetch(`${API_BASE_URL}/deslizamentos`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 segundos de timeout
      })

      console.log("Status da resposta:", response.status)

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      } else {
        console.log("API retornou erro:", response.status)
        return NextResponse.json([], { status: response.status })
      }
    } catch (fetchError) {
      console.error("Erro específico na requisição fetch:", fetchError)


      // Verificar se é um erro de conexão
      if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
        console.error("Erro de conexão com a API externa:", fetchError.message)
        return NextResponse.json(
          { message: `Não foi possível conectar com a API em ${API_BASE_URL}. Verifique se a API está rodando.` },
          { status: 503 },
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error("Erro geral na API de deslizamentos:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}

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
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ message: "Token necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    console.log("Enviando dados para API:", JSON.stringify(body, null, 2))
    console.log("URL da API:", `${API_BASE_URL}/deslizamentos`)

    try {
      // Verificar se o payload está formatado corretamente
      if (!body.endereco) {
        return NextResponse.json(
          { message: "Endereço é obrigatório", errors: ["endereco não pode ser nulo"] },
          { status: 400 },
        )
      }

      if (!body.endereco.logradouro) {
        return NextResponse.json(
          { message: "Logradouro é obrigatório", errors: ["logradouro não pode ser vazio"] },
          { status: 400 },
        )
      }

      if (!body.endereco.bairro) {
        return NextResponse.json(
          { message: "Bairro é obrigatório", errors: ["bairro não pode ser vazio"] },
          { status: 400 },
        )
      }

      const response = await fetch(`${API_BASE_URL}/deslizamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      console.log("Status da resposta:", response.status)

      // Tentar obter o corpo da resposta
      let data
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          const text = await response.text()
          data = { message: text || "Resposta não-JSON recebida" }
        }
      } catch (parseError) {
        console.error("Erro ao parsear resposta:", parseError)
        data = { message: "Erro ao processar resposta do servidor" }
      }

      console.log("Dados da resposta:", data)

      // Se a resposta for bem-sucedida, retornar os dados
      if (response.ok) {
        return NextResponse.json(data, { status: response.status })
      }

      // Se a resposta não for bem-sucedida, retornar o erro
      return NextResponse.json(data || { message: "Erro ao registrar deslizamento" }, { status: response.status })
    } catch (fetchError) {
      console.error("Erro na requisição fetch:", fetchError)
      return NextResponse.json(
        {
          message: `Erro de conexão com o servidor em ${API_BASE_URL}. Verifique se a API está rodando.`,
          error: fetchError instanceof Error ? fetchError.message : "Erro desconhecido",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Erro na API de deslizamentos:", error)
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
