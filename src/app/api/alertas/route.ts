import { type NextRequest, NextResponse } from "next/server"

// Função simples para buscar alertas
export async function GET(request: NextRequest) {
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

    // Pegar parâmetros da URL
    const { searchParams } = new URL(request.url)
    const nivel = searchParams.get("nivel")
    const ativos = searchParams.get("ativos")

    // Decidir qual endpoint chamar
    let url = `${API_BASE_URL}/alertas`

    if (ativos === "true") {
      url += "/ativos"
    } else if (nivel) {
      url += `/nivel/${nivel}`
    }

    console.log("Buscando alertas em:", url)

    try {
      // Fazer requisição para API Java com timeout
      const resposta = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000), // 10 segundos de timeout
      })

      console.log("Status da resposta:", resposta.status)

      // Se deu certo
      if (resposta.ok) {
        const dados = await resposta.json()
        return NextResponse.json(dados || [])
      }
      // Se não encontrou
      else if (resposta.status === 404) {
        return NextResponse.json([])
      }
      // Se deu erro
      else {
        console.error("Erro na API Java:", resposta.status)
        return NextResponse.json([], { status: 200 }) // Retornar array vazio para não quebrar a UI
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
    console.error("Erro na requisição:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
