"use client"

import { useState, useEffect } from "react"
import { Header } from "@/app/components/header"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Globe, Server } from "lucide-react"

interface ConfigData {
  status: string
  environment: string
  apiBaseUrl: string
  hasApiBaseUrl: boolean
  allEnvVars: string[]
  message: string
}

interface TestResult {
  name: string
  url: string
  status: string | number
  ok: boolean
  statusText?: string
  error?: string
  data?: any
}

interface ConnectionTest {
  status: string
  apiBaseUrl: string
  summary: {
    total: number
    success: number
    failed: number
    successRate: string
  }
  results: TestResult[]
  message: string
}

export default function DebugPage() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [loadingConnection, setLoadingConnection] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConfig()
  }, [])

  const checkConfig = async () => {
    try {
      setLoadingConfig(true)
      setError(null)

      const response = await fetch("/api/config")
      const data = await response.json()

      setConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoadingConfig(false)
    }
  }

  const testConnection = async () => {
    try {
      setLoadingConnection(true)
      setError(null)

      const response = await fetch("/api/test-connection")
      const data = await response.json()

      setConnectionTest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao testar conexão")
    } finally {
      setLoadingConnection(false)
    }
  }

  const getStatusIcon = (ok: boolean, status: string | number) => {
    if (status === "ERROR") return <XCircle className="h-5 w-5 text-red-500" />
    if (ok) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />
  }

  const getStatusColor = (ok: boolean, status: string | number) => {
    if (status === "ERROR") return "bg-red-50 border-red-200"
    if (ok) return "bg-green-50 border-green-200"
    return "bg-yellow-50 border-yellow-200"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug - Configuração e Conexão da API</h1>

        {/* Configuração */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Server className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Configuração da API</h2>
            </div>
            <button
              onClick={checkConfig}
              disabled={loadingConfig}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingConfig ? "animate-spin" : ""}`} />
              {loadingConfig ? "Verificando..." : "Verificar"}
            </button>
          </div>

          {loadingConfig && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando configuração...</p>
            </div>
          )}

          {config && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg ${config.hasApiBaseUrl ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
              >
                <h3 className={`font-semibold ${config.hasApiBaseUrl ? "text-green-800" : "text-red-800"}`}>
                  {config.hasApiBaseUrl ? "✅ Configuração OK" : "❌ Configuração com Problema"}
                </h3>
                <p className={config.hasApiBaseUrl ? "text-green-700" : "text-red-700"}>{config.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Ambiente</h4>
                  <p className="text-gray-700">{config.environment}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">API Base URL</h4>
                  <p className="text-gray-700 break-all font-mono text-sm">{config.apiBaseUrl}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teste de Conexão */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Globe className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">Teste de Conexão</h2>
            </div>
            <button
              onClick={testConnection}
              disabled={loadingConnection || !config?.hasApiBaseUrl}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingConnection ? "animate-spin" : ""}`} />
              {loadingConnection ? "Testando..." : "Testar Conexão"}
            </button>
          </div>

          {!config?.hasApiBaseUrl && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              Configure a API_BASE_URL primeiro antes de testar a conexão.
            </div>
          )}

          {loadingConnection && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Testando conexão com a API...</p>
            </div>
          )}

          {connectionTest && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Resumo dos Testes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total:</span>
                    <span className="font-medium ml-1">{connectionTest.summary.total}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Sucesso:</span>
                    <span className="font-medium ml-1">{connectionTest.summary.success}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Falhou:</span>
                    <span className="font-medium ml-1">{connectionTest.summary.failed}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Taxa:</span>
                    <span className="font-medium ml-1">{connectionTest.summary.successRate}</span>
                  </div>
                </div>
                <p className="text-blue-800 mt-2">{connectionTest.message}</p>
              </div>

              {/* Resultados detalhados */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Resultados Detalhados:</h4>
                {connectionTest.results.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.ok, result.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(result.ok, result.status)}
                        <h5 className="font-medium ml-2">{result.name}</h5>
                      </div>
                      <span className="text-sm font-mono">
                        {result.status} {result.statusText}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 break-all mb-2">{result.url}</p>
                    {result.error && <p className="text-sm text-red-600">Erro: {result.error}</p>}
                    {result.data && (
                      <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded mt-2">
                        <strong>Resposta:</strong>{" "}
                        {typeof result.data === "string" ? result.data : JSON.stringify(result.data)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Erro geral */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Configuração Atual</h3>
          <div className="space-y-3 text-blue-800">
            <p>
              <strong>API URL:</strong>{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">https://climatic-ricks-api.onrender.com/api</code>
            </p>
            <p>
              <strong>Arquivo de configuração:</strong>{" "}
              <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>
            </p>
            <div>
              <p>
                <strong>Conteúdo esperado do .env.local:</strong>
              </p>
              <code className="block bg-blue-100 p-2 rounded mt-2">
                API_BASE_URL=https://climatic-ricks-api.onrender.com/api
              </code>
            </div>
            <p className="text-sm">
              💡 <strong>Dica:</strong> Se você fez alterações no .env.local, reinicie o servidor com{" "}
              <code className="bg-blue-100 px-1 rounded">npm run dev</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
