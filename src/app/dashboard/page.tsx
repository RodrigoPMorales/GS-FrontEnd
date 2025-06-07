"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  User,
  MapPin,
  AlertTriangle,
  Bell,
  Settings,
  Activity,
  Plus,
  Trash2,
  Calendar,
  Mountain,
  RefreshCw,
  Edit,
} from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { Header } from "@/app/components/header"

interface Alagamento {
  id: number
  usuarioId: number
  descricao: string
  dataOcorrencia: string
  endereco: {
    logradouro: string
    bairro: string
    cep: string
    bairroRisco: string
    tipoSolo?: string
    altitudeRua?: string
    tipoConstrucao?: string
    proximoCorrego?: boolean
  }
}

interface Deslizamento {
  id: number
  usuarioId: number
  descricao: string
  dataOcorrencia: string
  endereco: {
    logradouro: string
    bairro: string
    cep: string
    bairroRisco: string
    tipoSolo?: string
    altitudeRua?: string
    tipoConstrucao?: string
    proximoCorrego?: boolean
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, getValidToken } = useAuth()
  const [meusAlagamentos, setMeusAlagamentos] = useState<Alagamento[]>([])
  const [meusDeslizamentos, setMeusDeslizamentos] = useState<Deslizamento[]>([])
  const [alertasAtivos, setAlertasAtivos] = useState(0)
  const [loadingAlagamentos, setLoadingAlagamentos] = useState(true)
  const [loadingDeslizamentos, setLoadingDeslizamentos] = useState(true)
  const [loadingAlertas, setLoadingAlertas] = useState(true)
  const [errorAlagamentos, setErrorAlagamentos] = useState<string | null>(null)
  const [errorDeslizamentos, setErrorDeslizamentos] = useState<string | null>(null)

  // Função para carregar alertas ativos (usando useCallback)
  const loadAlertasAtivos = useCallback(async () => {
    try {
      setLoadingAlertas(true)

      const resposta = await fetch("/api/alertas?ativos=true")

      if (resposta.ok) {
        const dados = await resposta.json()
        setAlertasAtivos(dados.length || 0)
      }
    } catch (error) {
      console.error("Erro ao carregar alertas:", error)
    } finally {
      setLoadingAlertas(false)
    }
  }, [])

  // Função para carregar alagamentos (usando useCallback)
  const loadMeusAlagamentos = useCallback(async () => {
    try {
      setLoadingAlagamentos(true)
      setErrorAlagamentos(null)

      const token = await getValidToken()
      if (!token) {
        setErrorAlagamentos("Token de autenticação não encontrado")
        return
      }

      console.log("Carregando alagamentos do usuário...")

      const response = await fetch("/api/alagamentos/meus", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Status da resposta (alagamentos):", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Alagamentos carregados:", data)
        setMeusAlagamentos(Array.isArray(data) ? data : [])
      } else if (response.status === 401) {
        setErrorAlagamentos("Sessão expirada. Faça login novamente.")
      } else if (response.status === 404) {
        console.log("Endpoint de alagamentos não encontrado")
        setMeusAlagamentos([])
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `Erro ${response.status}` }
        }
        setErrorAlagamentos(errorData.message || "Erro ao carregar alagamentos")
      }
    } catch (error) {
      console.error("Erro ao carregar meus alagamentos:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setErrorAlagamentos("Erro de conexão. Verifique se a API está rodando.")
      } else {
        setErrorAlagamentos("Erro inesperado ao carregar alagamentos")
      }
    } finally {
      setLoadingAlagamentos(false)
    }
  }, [getValidToken])

  // Função para carregar deslizamentos (usando useCallback)
  const loadMeusDeslizamentos = useCallback(async () => {
    try {
      setLoadingDeslizamentos(true)
      setErrorDeslizamentos(null)

      const token = await getValidToken()
      if (!token) {
        setErrorDeslizamentos("Token de autenticação não encontrado")
        return
      }

      console.log("Carregando deslizamentos do usuário...")

      const response = await fetch("/api/deslizamentos/meus", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Status da resposta (deslizamentos):", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Deslizamentos carregados:", data)
        setMeusDeslizamentos(Array.isArray(data) ? data : [])
      } else if (response.status === 401) {
        setErrorDeslizamentos("Sessão expirada. Faça login novamente.")
      } else if (response.status === 404) {
        console.log("Endpoint de deslizamentos não encontrado")
        setMeusDeslizamentos([])
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `Erro ${response.status}` }
        }
        setErrorDeslizamentos(errorData.message || "Erro ao carregar deslizamentos")
      }
    } catch (error) {
      console.error("Erro ao carregar meus deslizamentos:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setErrorDeslizamentos("Erro de conexão. Verifique se a API está rodando.")
      } else {
        setErrorDeslizamentos("Erro inesperado ao carregar deslizamentos")
      }
    } finally {
      setLoadingDeslizamentos(false)
    }
  }, [getValidToken])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Agora as dependências estão corretas
  useEffect(() => {
    if (isAuthenticated) {
      loadMeusAlagamentos()
      loadMeusDeslizamentos()
      loadAlertasAtivos()
    }
  }, [isAuthenticated, loadMeusAlagamentos, loadMeusDeslizamentos, loadAlertasAtivos])

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return

    try {
      const token = await getValidToken()
      if (!token) {
        alert("Token de autenticação não encontrado")
        return
      }

      const response = await fetch(`/api/alagamentos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok || response.status === 204) {
        setMeusAlagamentos(meusAlagamentos.filter((a) => a.id !== id))
        alert("Alagamento excluído com sucesso!")
      } else {
        alert("Erro ao excluir alagamento")
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir alagamento")
    }
  }

  const handleDeleteDeslizamento = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return

    try {
      const token = await getValidToken()
      if (!token) {
        alert("Token de autenticação não encontrado")
        return
      }

      const response = await fetch(`/api/deslizamentos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok || response.status === 204) {
        setMeusDeslizamentos(meusDeslizamentos.filter((d) => d.id !== id))
        alert("Deslizamento excluído com sucesso!")
      } else {
        alert("Erro ao excluir deslizamento")
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir deslizamento")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("pt-BR")
    } catch {
      return dateString
    }
  }

  const getRiskColor = (risco: string) => {
    switch (risco?.toUpperCase()) {
      case "ALTO":
        return "bg-red-100 text-red-800"
      case "MEDIO":
        return "bg-yellow-100 text-yellow-800"
      case "BAIXO":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Dashboard Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo, {user?.nome}!</h1>
            <p className="text-gray-600">Sua central de monitoramento de riscos climáticos</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-4">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status Geral</p>
                  <p className="text-2xl font-bold text-gray-900">Ativo</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mr-4">
                  <AlertTriangle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Meus Alagamentos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingAlagamentos ? "..." : meusAlagamentos.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mr-4">
                  <Mountain className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Meus Deslizamentos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loadingDeslizamentos ? "..." : meusDeslizamentos.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mr-4">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{loadingAlertas ? "..." : alertasAtivos}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Meus Alagamentos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Meus Alagamentos</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={loadMeusAlagamentos}
                      disabled={loadingAlagamentos}
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                      title="Atualizar"
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingAlagamentos ? "animate-spin" : ""}`} />
                    </button>
                    <Link
                      href="/alagamentos/novo"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Registro
                    </Link>
                  </div>
                </div>

                {errorAlagamentos && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>{errorAlagamentos}</span>
                      <button
                        onClick={loadMeusAlagamentos}
                        className="ml-auto text-red-600 hover:text-red-800 p-1 rounded"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {loadingAlagamentos ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando seus registros...</p>
                  </div>
                ) : meusAlagamentos.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
                    <p className="text-gray-600 mb-4">Você ainda não registrou nenhum alagamento.</p>
                    <Link
                      href="/alagamentos/novo"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Primeiro Alagamento
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {meusAlagamentos.map((alagamento) => (
                      <div
                        key={alagamento.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                              <h4 className="font-medium text-gray-900">{alagamento.endereco?.logradouro}</h4>
                            </div>

                            <p className="text-sm text-gray-600 mb-1">{alagamento.endereco?.bairro}</p>

                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(alagamento.dataOcorrencia)}
                            </div>

                            {alagamento.descricao && (
                              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                                {alagamento.descricao}
                              </p>
                            )}

                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              <span>CEP: {alagamento.endereco?.cep}</span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(alagamento.endereco?.bairroRisco)}`}
                              >
                                Risco {alagamento.endereco?.bairroRisco?.toLowerCase()}
                              </span>
                              {alagamento.endereco?.proximoCorrego && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Próximo a córrego
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => router.push(`/alagamentos/editar/${alagamento.id}`)}
                              className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(alagamento.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
                <div className="space-y-4">
                  <Link
                    href="/alagamentos/novo"
                    className="w-full flex items-center p-4 text-left bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Registrar Alagamento</span>
                  </Link>

                  <Link
                    href="/deslizamentos/novo"
                    className="w-full flex items-center p-4 text-left bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                  >
                    <Mountain className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Registrar Deslizamento</span>
                  </Link>

                  <Link
                    href="/alagamentos"
                    className="w-full flex items-center p-4 text-left bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Ver Todos os Alagamentos</span>
                  </Link>

                  <Link
                    href="/deslizamentos"
                    className="w-full flex items-center p-4 text-left bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors"
                  >
                    <Mountain className="h-5 w-5 text-yellow-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Ver Todos os Deslizamentos</span>
                  </Link>

                  <Link
                    href="/alertas"
                    className="w-full flex items-center p-4 text-left bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <Bell className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Ver Alertas da Defesa Civil</span>
                  </Link>

                  <button className="w-full flex items-center p-4 text-left bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <User className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Atualizar Perfil</span>
                  </button>

                  <button className="w-full flex items-center p-4 text-left bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                    <Settings className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Configurações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meus Deslizamentos */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Meus Deslizamentos</h2>
                <div className="flex gap-2">
                  <button
                    onClick={loadMeusDeslizamentos}
                    disabled={loadingDeslizamentos}
                    className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                    title="Atualizar"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingDeslizamentos ? "animate-spin" : ""}`} />
                  </button>
                  <Link
                    href="/deslizamentos/novo"
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Registro
                  </Link>
                </div>
              </div>

              {errorDeslizamentos && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>{errorDeslizamentos}</span>
                    <button
                      onClick={loadMeusDeslizamentos}
                      className="ml-auto text-red-600 hover:text-red-800 p-1 rounded"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {loadingDeslizamentos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando seus registros...</p>
                </div>
              ) : meusDeslizamentos.length === 0 ? (
                <div className="text-center py-8">
                  <Mountain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
                  <p className="text-gray-600 mb-4">Você ainda não registrou nenhum deslizamento.</p>
                  <Link
                    href="/deslizamentos/novo"
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primeiro Deslizamento
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meusDeslizamentos.map((deslizamento) => (
                    <div
                      key={deslizamento.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Mountain className="h-4 w-4 text-orange-600 mr-2" />
                            <h4 className="font-medium text-gray-900">{deslizamento.endereco?.logradouro}</h4>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">{deslizamento.endereco?.bairro}</p>

                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(deslizamento.dataOcorrencia)}
                          </div>

                          {deslizamento.descricao && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mb-2">
                              {deslizamento.descricao}
                            </p>
                          )}

                          <div className="flex items-center space-x-3 text-xs text-gray-600 flex-wrap gap-1">
                            <span>CEP: {deslizamento.endereco?.cep}</span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(deslizamento.endereco?.bairroRisco)}`}
                            >
                              Risco {deslizamento.endereco?.bairroRisco?.toLowerCase()}
                            </span>
                            {deslizamento.endereco?.proximoCorrego && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Próximo a córrego
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => router.push(`/deslizamentos/editar/${deslizamento.id}`)}
                            className="text-orange-600 hover:text-orange-700 p-2 rounded hover:bg-orange-50"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeslizamento(deslizamento.id)}
                            className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
