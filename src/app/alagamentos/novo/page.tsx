"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, CheckCircle, AlertCircle, LogIn, RefreshCw } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { Header } from "@/app/components/header"
import type { AlagamentoRequest } from "@/app/types"

// Tipos específicos para o formulário
interface FormData {
  descricao: string
  dataOcorrencia: string
  logradouro: string
  bairro: string
  cep: string
  tipoSolo: string
  altitudeRua: string
  tipoConstrucao: string
  bairroRisco: string
  proximoCorrego: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function NovoAlagamentoPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, getValidToken, logout } = useAuth()

  const [formData, setFormData] = useState<FormData>({
    descricao: "",
    dataOcorrencia: new Date().toISOString().slice(0, 16),
    logradouro: "",
    bairro: "",
    cep: "",
    tipoSolo: "",
    altitudeRua: "",
    tipoConstrucao: "",
    bairroRisco: "",
    proximoCorrego: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Limpar erro quando usuário digita
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }

    // Limpar erro da API quando usuário faz alterações
    if (apiError) {
      setApiError(null)
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.logradouro.trim()) newErrors.logradouro = "Logradouro é obrigatório"
    if (!formData.bairro.trim()) newErrors.bairro = "Bairro é obrigatório"
    if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório"
    if (!formData.tipoSolo) newErrors.tipoSolo = "Tipo de solo é obrigatório"
    if (!formData.altitudeRua) newErrors.altitudeRua = "Altitude da rua é obrigatória"
    if (!formData.tipoConstrucao) newErrors.tipoConstrucao = "Tipo de construção é obrigatório"
    if (!formData.bairroRisco) newErrors.bairroRisco = "Nível de risco é obrigatório"
    if (!formData.dataOcorrencia) newErrors.dataOcorrencia = "Data é obrigatória"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setApiError(null)
    setShowLoginPrompt(false)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Verificar se temos um token válido
      const token = await getValidToken()
      if (!token) {
        setApiError("Sua sessão expirou. Faça login novamente.")
        setShowLoginPrompt(true)
        setIsLoading(false)
        return
      }

      // Formatar o payload conforme esperado pelo backend
      const payload: AlagamentoRequest = {
        descricao: formData.descricao.trim() || null,
        dataOcorrencia: formData.dataOcorrencia,
        endereco: {
          logradouro: formData.logradouro.trim(),
          bairro: formData.bairro.trim(),
          cep: formData.cep.replace(/\D/g, ""),
          tipoSolo: formData.tipoSolo,
          altitudeRua: formData.altitudeRua,
          tipoConstrucao: formData.tipoConstrucao,
          bairroRisco: formData.bairroRisco,
          proximoCorrego: formData.proximoCorrego,
        },
      }

      console.log("Enviando payload:", payload)
      console.log("Usando token:", token.substring(0, 20) + "...")

      const response = await fetch("/api/alagamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("Status da resposta:", response.status)
      console.log("Headers da resposta:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("Dados da resposta:", data)
        setSuccess(true)
        setRetryCount(0) // Reset retry count on success
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        let errorData
        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json()
          } else {
            const textResponse = await response.text()
            console.log("Resposta em texto:", textResponse)
            errorData = { message: textResponse || `Erro ${response.status}` }
          }
        } catch (parseError) {
          console.error("Erro ao parsear resposta:", parseError)
          errorData = { message: `Erro ${response.status} - Resposta inválida do servidor` }
        }

        console.error("Erro detalhado:", errorData)

        if (response.status === 401) {
          setApiError("Token de autenticação inválido ou expirado. Faça login novamente.")
          setShowLoginPrompt(true)
        } else if (response.status === 400) {
          setApiError(errorData.message || "Dados inválidos. Verifique os campos obrigatórios.")
        } else if (response.status === 403) {
          setApiError("Acesso negado. Verifique suas permissões.")
        } else if (response.status === 404) {
          setApiError("Endpoint não encontrado. Verifique se a API está configurada corretamente.")
        } else if (response.status === 500) {
          setApiError("Erro interno do servidor. Tente novamente em alguns minutos.")
        } else if (response.status === 503) {
          setApiError("Servidor indisponível. Verifique se a API Java está rodando em http://localhost:8080")
        } else {
          setApiError(errorData.message || `Erro ${response.status} - Tente novamente.`)
        }
      }
    } catch (error) {
      console.error("Erro completo:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setApiError("Erro de conexão. Verifique se a API Java está rodando em http://localhost:8080")
      } else {
        setApiError("Erro inesperado. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginRedirect = () => {
    logout()
    router.push("/login")
  }

  const handleRetry = () => {
    setRetryCount(retryCount + 1)
    setApiError(null)
    // Criar um evento sintético para o retry
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>
    handleSubmit(syntheticEvent)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sucesso!</h2>
            <p className="text-gray-600 mb-6">Alagamento registrado com sucesso.</p>
            <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Alagamento</h1>
        <p className="text-gray-600 mb-8">Preencha as informações sobre o alagamento</p>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{apiError}</span>
                <div className="mt-3 flex gap-2">
                  {showLoginPrompt ? (
                    <button
                      onClick={handleLoginRedirect}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 inline-flex items-center text-sm"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Fazer Login Novamente
                    </button>
                  ) : (
                    <button
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center text-sm disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Alagamento</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label>
                <input
                  type="datetime-local"
                  name="dataOcorrencia"
                  value={formData.dataOcorrencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.dataOcorrencia && <p className="text-red-600 text-sm mt-1">{errors.dataOcorrencia}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva o alagamento..."
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Endereço</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
                <input
                  type="text"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Rua, Avenida..."
                />
                {errors.logradouro && <p className="text-red-600 text-sm mt-1">{errors.logradouro}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.bairro && <p className="text-red-600 text-sm mt-1">{errors.bairro}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="00000-000"
                />
                {errors.cep && <p className="text-red-600 text-sm mt-1">{errors.cep}</p>}
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Características do Local</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solo *</label>
                <select
                  name="tipoSolo"
                  value={formData.tipoSolo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="VEGETACAO">Vegetação</option>
                  <option value="TERRA">Terra</option>
                  <option value="ASFALTO">Asfalto</option>
                </select>
                {errors.tipoSolo && <p className="text-red-600 text-sm mt-1">{errors.tipoSolo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altitude da Rua *</label>
                <select
                  name="altitudeRua"
                  value={formData.altitudeRua}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="NIVEL">Nível</option>
                  <option value="ABAIXO">Abaixo do nível</option>
                  <option value="ACIMA">Acima do nível</option>
                </select>
                {errors.altitudeRua && <p className="text-red-600 text-sm mt-1">{errors.altitudeRua}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Construção *</label>
                <select
                  name="tipoConstrucao"
                  value={formData.tipoConstrucao}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="MADEIRA">Madeira</option>
                  <option value="ALVENARIA">Alvenaria</option>
                  <option value="MISTA">Mista</option>
                </select>
                {errors.tipoConstrucao && <p className="text-red-600 text-sm mt-1">{errors.tipoConstrucao}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Risco *</label>
                <select
                  name="bairroRisco"
                  value={formData.bairroRisco}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="BAIXO">Baixo</option>
                  <option value="MEDIO">Médio</option>
                  <option value="ALTO">Alto</option>
                </select>
                {errors.bairroRisco && <p className="text-red-600 text-sm mt-1">{errors.bairroRisco}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="proximoCorrego"
                    checked={formData.proximoCorrego}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Próximo a córrego ou rio</span>
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 text-center"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
