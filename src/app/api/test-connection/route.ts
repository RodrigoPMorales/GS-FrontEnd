import { NextResponse } from "next/server"

// Rota para testar a conexão com a API externa
export async function GET() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL

    if (!API_BASE_URL) {
      return NextResponse.json(
        {
          status: "error",
          message: "API_BASE_URL não configurada",
        },
        { status: 500 },
      )
    }

    console.log("🔗 Testando conexão com:", API_BASE_URL)

    // Testar diferentes endpoints
    const tests = [
      { name: "Health Check", url: `${API_BASE_URL}/health` },
      { name: "Alagamentos", url: `${API_BASE_URL}/alagamentos` },
      { name: "Deslizamentos", url: `${API_BASE_URL}/deslizamentos` },
      { name: "Alertas", url: `${API_BASE_URL}/alertas` },
    ]

    const results = []

    for (const test of tests) {
      try {
        console.log(`🧪 Testando ${test.name}: ${test.url}`)

        const response = await fetch(test.url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 segundos
        })

        const result = {
          name: test.name,
          url: test.url,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        }

        // Tentar ler o corpo da resposta
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const data = await response.json()
            result.data = Array.isArray(data) ? `Array com ${data.length} itens` : data
          } else {
            const text = await response.text()
            result.data = text.substring(0, 200) + (text.length > 200 ? "..." : "")
          }
        } catch (parseError) {
          result.data = "Erro ao parsear resposta"
        }

        results.push(result)
        console.log(`✅ ${test.name}: ${response.status}`)
      } catch (error) {
        const result = {
          name: test.name,
          url: test.url,
          status: "ERROR",
          ok: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        }
        results.push(result)
        console.log(`❌ ${test.name}: ${error}`)
      }
    }

    // Resumo geral
    const successCount = results.filter((r) => r.ok).length
    const totalCount = results.length

    return NextResponse.json({
      status: "completed",
      apiBaseUrl: API_BASE_URL,
      summary: {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount,
        successRate: `${Math.round((successCount / totalCount) * 100)}%`,
      },
      results,
      message:
        successCount > 0
          ? `✅ ${successCount}/${totalCount} testes passaram`
          : `❌ Todos os testes falharam - verifique se a API está online`,
    })
  } catch (error) {
    console.error("Erro no teste de conexão:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro interno no teste de conexão",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
