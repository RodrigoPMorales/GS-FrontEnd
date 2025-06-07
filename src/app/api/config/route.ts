import { NextResponse } from "next/server"

// Rota para verificar as configurações da API
export async function GET() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL
    const NODE_ENV = process.env.NODE_ENV

    console.log("=== VERIFICAÇÃO DE CONFIGURAÇÃO ===")
    console.log("NODE_ENV:", NODE_ENV)
    console.log("API_BASE_URL:", API_BASE_URL)
    console.log(
      "Todas as variáveis de ambiente que começam com API_:",
      Object.keys(process.env).filter((key) => key.startsWith("API_")),
    )

    return NextResponse.json({
      status: "ok",
      environment: NODE_ENV,
      apiBaseUrl: API_BASE_URL || "NÃO CONFIGURADA",
      hasApiBaseUrl: !!API_BASE_URL,
      allEnvVars: Object.keys(process.env).filter((key) => key.startsWith("API_")),
      message: API_BASE_URL ? "Configuração da API encontrada com sucesso" : "ERRO: API_BASE_URL não está configurada",
    })
  } catch (error) {
    console.error("Erro ao verificar configuração:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar configuração",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
