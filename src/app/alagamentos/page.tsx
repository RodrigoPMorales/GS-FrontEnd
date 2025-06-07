"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, Calendar, AlertTriangle } from "lucide-react"
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
  }
}

export default function AlagamentosPage() {
  const [alagamentos, setAlagamentos] = useState<Alagamento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAlagamentos()
  }, [])

  const loadAlagamentos = async () => {
    try {
      const response = await fetch("/api/alagamentos")
      if (response.ok) {
        const data = await response.json()
        setAlagamentos(data)
      }
    } catch (error) {
      console.error("Erro ao carregar alagamentos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alagamentos Registrados</h1>
          <p className="text-gray-600">Visualize todos os registros de alagamentos da região</p>
        </div>

        {/* Lista de Alagamentos */}
        {alagamentos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
            <p className="text-gray-600">Não há registros de alagamentos no momento.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {alagamentos.map((alagamento) => (
              <div key={alagamento.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{alagamento.endereco?.logradouro}</h3>
                </div>

                <p className="text-gray-600 mb-2">{alagamento.endereco?.bairro}</p>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(alagamento.dataOcorrencia)}
                </div>

                {alagamento.descricao && (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded mb-3">{alagamento.descricao}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>CEP: {alagamento.endereco?.cep}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      alagamento.endereco?.bairroRisco === "ALTO"
                        ? "bg-red-100 text-red-800"
                        : alagamento.endereco?.bairroRisco === "MEDIO"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    Risco {alagamento.endereco?.bairroRisco?.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action para usuários não logados */}
        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quer contribuir com a comunidade?</h3>
          <p className="text-gray-600 mb-6">
            Faça login para registrar alagamentos em sua região e ajudar outros moradores a se prepararem melhor.
          </p>
          <div className="space-x-4">
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block">
              Fazer Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 inline-block"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
