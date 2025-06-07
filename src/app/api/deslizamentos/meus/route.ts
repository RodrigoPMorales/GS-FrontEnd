import { type NextRequest, NextResponse } from "next/server"

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

    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Token de autorização necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Endpoint específico para buscar deslizamentos do usuário logado
    const url = `${API_BASE_URL}/deslizamentos/usuario`

    console.log("Buscando deslizamentos do usuário logado:", url)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Status da resposta:", response.status)

      if (response.ok) {
        let data
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            data = await response.json()
            console.log("Deslizamentos do usuário recebidos:", data)
          } else {
            const textData = await response.text()
            console.log("Resposta não-JSON:", textData)
            data = []
          }
        } catch (parseError) {
          console.error("Erro ao parsear resposta:", parseError)
          data = []
        }

        // Garantir que sempre retornamos um array
        const result = Array.isArray(data) ? data : []
        return NextResponse.json(result)
      } else if (response.status === 401) {
        return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 401 })
      } else if (response.status === 404) {
        // Se o endpoint não existir, retornar array vazio
        console.log("Endpoint não encontrado, retornando array vazio")
        return NextResponse.json([])
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `Erro ${response.status}` }
        }
        console.error("Erro da API:", errorData)
        return NextResponse.json(errorData, { status: response.status })
      }
    } catch (fetchError) {
      console.error("Erro de conexão:", fetchError)

      if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
        return NextResponse.json(
          { message: `Erro de conexão com a API em ${API_BASE_URL}. Verifique se está rodando.` },
          { status: 503 },
        )
      }

      return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro geral na API /deslizamentos/meus:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
