"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { Header } from "@/app/components/header"
import type { DeslizamentoRequest } from "@/app/types"

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

export default function NovoDeslizamentoPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setApiError("Token de autenticação não encontrado. Faça login novamente.")
        router.push("/login")
        return
      }

      // Formatar o payload conforme esperado pelo backend
      const payload: DeslizamentoRequest = {
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

      const response = await fetch("/api/deslizamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("Status da resposta:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Dados da resposta:", data)
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          const textResponse = await response.text()
          errorData = { message: textResponse || `Erro ${response.status}` }
        }

        console.error("Erro detalhado:", errorData)

        if (response.status === 401) {
          setApiError("Sessão expirada. Faça login novamente.")
        } else if (response.status === 400) {
          setApiError(errorData.message || "Dados inválidos. Verifique os campos obrigatórios.")
        } else if (response.status === 503) {
          setApiError("Servidor indisponível. Verifique se a API está rodando.")
        } else {
          setApiError(errorData.message || "Erro ao registrar deslizamento. Tente novamente.")
        }
      }
    } catch (error) {
      console.error("Erro completo:", error)
      setApiError("Erro de conexão. Verifique sua internet e se a API está rodando.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
          <Link href="/login" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
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
            <p className="text-gray-600 mb-6">Deslizamento registrado com sucesso.</p>
            <Link href="/dashboard" className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
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
        <Link href="/dashboard" className="text-orange-600 hover:text-orange-700 mb-4 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Deslizamento</h1>
        <p className="text-gray-600 mb-8">Preencha as informações sobre o deslizamento</p>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Deslizamento</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora *</label>
                <input
                  type="datetime-local"
                  name="dataOcorrencia"
                  value={formData.dataOcorrencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Descreva o deslizamento..."
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
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
