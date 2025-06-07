"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, Bell, Calendar, MapPin, RefreshCw } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { Header } from "@/app/components/header"

// Tipo simples para os alertas
interface Alerta {
  id: number
  titulo: string
  descricao: string
  nivelAlerta: string
  bairrosAfetados: string
  dataInicio: string
  ativo: boolean
}

export default function AlertasPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Estados simples
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [filtroNivel, setFiltroNivel] = useState("todos")
  const [apenasAtivos, setApenasAtivos] = useState(true)

  // Função para buscar alertas (usando useCallback para evitar warning)
  const buscarAlertas = useCallback(async () => {
    try {
      setCarregando(true)
      setErro("")

      // Montar URL com filtros
      let url = "/api/alertas"

      if (apenasAtivos) {
        url += "?ativos=true"
      }

      if (filtroNivel !== "todos") {
        const separador = url.includes("?") ? "&" : "?"
        url += `${separador}nivel=${filtroNivel}`
      }

      console.log("Buscando alertas em:", url)

      // Fazer requisição simples
      const resposta = await fetch(url)

      if (resposta.ok) {
        const dados = await resposta.json()
        setAlertas(dados || [])
      } else {
        setErro("Erro ao carregar alertas")
      }
    } catch (error) {
      console.error("Erro:", error)
      setErro("Erro de conexão")
    } finally {
      setCarregando(false)
    }
  }, [filtroNivel, apenasAtivos]) // Dependências do useCallback

  // Verificar se usuário está logado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Carregar alertas quando página carrega ou filtros mudam
  useEffect(() => {
    if (isAuthenticated) {
      buscarAlertas()
    }
  }, [isAuthenticated, buscarAlertas]) // Agora buscarAlertas está nas dependências

  // Função para formatar data
  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleString("pt-BR")
    } catch {
      return data
    }
  }

  // Função para cor do nível
  const corDoNivel = (nivel: string) => {
    if (nivel === "ALTO") return "border-red-500 bg-red-50"
    if (nivel === "MEDIO") return "border-yellow-500 bg-yellow-50"
    if (nivel === "BAIXO") return "border-green-500 bg-green-50"
    return "border-gray-500 bg-gray-50"
  }

  // Função para cor do badge
  const corDoBadge = (nivel: string) => {
    if (nivel === "ALTO") return "bg-red-100 text-red-800"
    if (nivel === "MEDIO") return "bg-yellow-100 text-yellow-800"
    if (nivel === "BAIXO") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  // Se ainda está carregando a autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está logado, não mostra nada (vai redirecionar)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Título da página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertas da Defesa Civil</h1>
          <p className="text-gray-600">Acompanhe os alertas de emergência da sua região</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            <button
              onClick={buscarAlertas}
              disabled={carregando}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${carregando ? "animate-spin" : ""}`} />
              Atualizar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por nível */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Alerta</label>
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="todos">Todos os níveis</option>
                <option value="baixo">Baixo</option>
                <option value="medio">Médio</option>
                <option value="alto">Alto</option>
              </select>
            </div>

            {/* Filtro por status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={apenasAtivos}
                    onChange={() => setApenasAtivos(true)}
                    className="mr-2"
                  />
                  <span className="text-sm">Apenas ativos</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={!apenasAtivos}
                    onChange={() => setApenasAtivos(false)}
                    className="mr-2"
                  />
                  <span className="text-sm">Todos</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <strong>{alertas.length}</strong> alerta{alertas.length !== 1 ? "s" : ""} encontrado
            {alertas.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Mostrar erro se houver */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{erro}</span>
            </div>
          </div>
        )}

        {/* Mostrar loading */}
        {carregando ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando alertas...</p>
          </div>
        ) : alertas.length === 0 ? (
          /* Nenhum alerta encontrado */
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta encontrado</h3>
            <p className="text-gray-600">Não há alertas que correspondam aos filtros selecionados.</p>
          </div>
        ) : (
          /* Lista de alertas */
          <div className="space-y-6">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${corDoNivel(alerta.nivelAlerta)}`}
              >
                {/* Cabeçalho do alerta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="text-xl font-semibold text-gray-900">{alerta.titulo}</h3>
                      <span
                        className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${corDoBadge(alerta.nivelAlerta)}`}
                      >
                        {alerta.nivelAlerta?.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Status do alerta */}
                  <div className="ml-4">
                    {alerta.ativo ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Ativo</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Inativo</span>
                    )}
                  </div>
                </div>

                {/* Descrição */}
                {alerta.descricao && <p className="text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">{alerta.descricao}</p>}

                {/* Informações do alerta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatarData(alerta.dataInicio)}</span>
                  </div>

                  {alerta.bairrosAfetados && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Bairros: {alerta.bairrosAfetados}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão para voltar */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Informações sobre os níveis */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Sobre os Níveis de Alerta</h3>
          <div className="space-y-2 text-blue-800">
            <p>
              <strong>🔴 Alto:</strong> Emergência! Siga as orientações imediatamente.
            </p>
            <p>
              <strong>🟡 Médio:</strong> Atenção! Prepare-se e mantenha-se informado.
            </p>
            <p>
              <strong>🟢 Baixo:</strong> Monitoramento. Fique atento às atualizações.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
