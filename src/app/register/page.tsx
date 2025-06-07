"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Lock,
  Home,
  TreePine,
} from "lucide-react"

import { Header } from "@/app/components/header"

interface FormData {
  nome: string
  email: string
  telefone: string
  senha: string
  confirmSenha: string
  endereco: {
    logradouro: string
    bairro: string
    cep: string
    tipoSolo: string
    altitudeRua: string
    tipoConstrucao: string
    bairroRisco: string
    proximoCorrego: boolean
  }
}

interface FormErrors {
  nome?: string
  email?: string
  telefone?: string
  senha?: string
  confirmSenha?: string
  endereco?: {
    logradouro?: string
    bairro?: string
    cep?: string
    tipoSolo?: string
    altitudeRua?: string
    tipoConstrucao?: string
    bairroRisco?: string
  }
  general?: string
}

const TIPO_SOLO_OPTIONS = [
  { value: "", label: "Selecione o tipo de solo" },
  { value: "vegetacao", label: "Vegetação" },
  { value: "terra", label: "Terra" },
  { value: "asfalto", label: "Asfalto" },
]

const ALTITUDE_RUA_OPTIONS = [
  { value: "", label: "Selecione a altitude da rua" },
  { value: "nivel", label: "Nível" },
  { value: "abaixo", label: "Abaixo do nível" },
  { value: "acima", label: "Acima do nível" },
]

const TIPO_CONSTRUCAO_OPTIONS = [
  { value: "", label: "Selecione o tipo de construção" },
  { value: "madeira", label: "Madeira" },
  { value: "alvernaria", label: "Alvenaria" },
  { value: "mista", label: "Mista" },
]

const BAIRRO_RISCO_OPTIONS = [
  { value: "", label: "Selecione o nível de risco" },
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
]

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmSenha: "",
    endereco: {
      logradouro: "",
      bairro: "",
      cep: "",
      tipoSolo: "",
      altitudeRua: "",
      tipoConstrucao: "",
      bairroRisco: "",
      proximoCorrego: false,
    },
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [success, setSuccess] = useState(false)

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
    }
    return value
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "telefone") {
      const formatted = formatTelefone(value)
      setFormData((prev) => ({ ...prev, [name]: formatted }))
    } else if (name.startsWith("endereco.")) {
      const field = name.split(".")[1]
      let formattedValue: string | boolean = value

      if (field === "cep") {
        formattedValue = formatCEP(value)
      } else if (field === "proximoCorrego") {
        formattedValue = (e.target as HTMLInputElement).checked
      }

      setFormData((prev) => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: formattedValue },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear specific error when user starts typing
    if (name.startsWith("endereco.")) {
      const field = name.split(".")[1]
      if (errors.endereco?.[field as keyof typeof errors.endereco]) {
        setErrors((prev) => ({
          ...prev,
          endereco: { ...prev.endereco, [field]: undefined },
        }))
      }
    } else if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validação do nome
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório"
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = "Nome deve ter pelo menos 2 caracteres"
    } else if (formData.nome.trim().length > 100) {
      newErrors.nome = "Nome deve ter no máximo 100 caracteres"
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.nome)) {
      newErrors.nome = "Nome deve conter apenas letras e espaços"
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (formData.email.length > 100) {
      newErrors.email = "Email deve ter no máximo 100 caracteres"
    } else if (!/^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(formData.email)) {
      newErrors.email = "Email deve ter um formato válido"
    }

    // Validação do telefone
    if (!formData.telefone || !formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório"
    } else if (formData.telefone.length > 20) {
      newErrors.telefone = "Telefone deve ter no máximo 20 caracteres"
    } else {
      const telefoneNumbers = formData.telefone.replace(/\D/g, "")
      if (!/^\d{10,11}$/.test(telefoneNumbers)) {
        newErrors.telefone = "Telefone deve ter um formato válido (ex: (11) 99999-9999)"
      }
    }

    // Validação da senha
    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória"
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter pelo menos 6 caracteres"
    } else if (formData.senha.length > 255) {
      newErrors.senha = "Senha deve ter no máximo 255 caracteres"
    } else if (!/.*[A-Za-z].*/.test(formData.senha)) {
      newErrors.senha = "Senha deve conter pelo menos uma letra"
    } else if (!/.*\d.*/.test(formData.senha)) {
      newErrors.senha = "Senha deve conter pelo menos um número"
    }

    // Validação da confirmação de senha
    if (!formData.confirmSenha) {
      newErrors.confirmSenha = "Confirmação de senha é obrigatória"
    } else if (formData.senha !== formData.confirmSenha) {
      newErrors.confirmSenha = "Senhas não coincidem"
    }

    // Validação do endereço (obrigatório)
    const enderecoErrors: Record<string, string> = {}

    if (!formData.endereco.logradouro.trim()) {
      enderecoErrors.logradouro = "Logradouro é obrigatório"
    } else if (formData.endereco.logradouro.length > 255) {
      enderecoErrors.logradouro = "Logradouro deve ter no máximo 255 caracteres"
    }

    if (!formData.endereco.bairro.trim()) {
      enderecoErrors.bairro = "Bairro é obrigatório"
    } else if (formData.endereco.bairro.length > 100) {
      enderecoErrors.bairro = "Bairro deve ter no máximo 100 caracteres"
    }

    if (!formData.endereco.cep.trim()) {
      enderecoErrors.cep = "CEP é obrigatório"
    } else {
      const cep = formData.endereco.cep.replace(/\D/g, "")
      if (cep.length !== 8) {
        enderecoErrors.cep = "CEP deve ter 8 dígitos"
      }
    }

    if (!formData.endereco.tipoSolo) {
      enderecoErrors.tipoSolo = "Tipo de solo é obrigatório"
    }

    if (!formData.endereco.altitudeRua) {
      enderecoErrors.altitudeRua = "Altitude da rua é obrigatória"
    }

    if (!formData.endereco.tipoConstrucao) {
      enderecoErrors.tipoConstrucao = "Tipo de construção é obrigatória"
    }

    if (!formData.endereco.bairroRisco) {
      enderecoErrors.bairroRisco = "Nível de risco do bairro é obrigatório"
    }

    if (Object.keys(enderecoErrors).length > 0) {
      newErrors.endereco = enderecoErrors
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha,
        endereco: {
          logradouro: formData.endereco.logradouro,
          bairro: formData.endereco.bairro,
          cep: formData.endereco.cep.replace(/\D/g, ""),
          tipoSolo: formData.endereco.tipoSolo.toUpperCase(),
          altitudeRua: formData.endereco.altitudeRua.toUpperCase(),
          tipoConstrucao: formData.endereco.tipoConstrucao.toUpperCase(),
          bairroRisco: formData.endereco.bairroRisco.toUpperCase(),
          proximoCorrego: formData.endereco.proximoCorrego,
        },
      }

      console.log("Enviando payload:", payload)

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Status da resposta:", response.status)

      const data = await response.json()
      console.log("Dados recebidos:", data)

      if (response.ok) {
        setSuccess(true)
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          senha: "",
          confirmSenha: "",
          endereco: {
            logradouro: "",
            bairro: "",
            cep: "",
            tipoSolo: "",
            altitudeRua: "",
            tipoConstrucao: "",
            bairroRisco: "",
            proximoCorrego: false,
          },
        })
      } else {
        if (response.status === 409) {
          setErrors({ email: "Este email já está sendo usado por outro usuário" })
        } else if (response.status === 400 && data.errors) {
          const apiErrors: FormErrors = {}
          const enderecoErrors: Record<string, string> = {}

          data.errors.forEach((error: string) => {
            const errorLower = error.toLowerCase()
            if (errorLower.includes("email")) {
              apiErrors.email = error
            } else if (errorLower.includes("nome")) {
              apiErrors.nome = error
            } else if (errorLower.includes("telefone")) {
              apiErrors.telefone = error
            } else if (errorLower.includes("senha")) {
              apiErrors.senha = error
            } else if (errorLower.includes("logradouro")) {
              enderecoErrors.logradouro = error
            } else if (errorLower.includes("bairro")) {
              enderecoErrors.bairro = error
            } else if (errorLower.includes("cep")) {
              enderecoErrors.cep = error
            } else {
              apiErrors.general = error
            }
          })

          if (Object.keys(enderecoErrors).length > 0) {
            apiErrors.endereco = enderecoErrors
          }

          setErrors(apiErrors)
        } else if (response.status === 503) {
          setErrors({
            general:
              "Não foi possível conectar com o servidor. Verifique se a API está rodando em http://localhost:8080",
          })
        } else {
          setErrors({ general: data.message || "Erro ao cadastrar usuário" })
        }
      }
    } catch (error) {
      console.error("Erro no cadastro:", error)
      setErrors({
        general: "Erro de conexão. Verifique se a API está rodando e tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cadastro realizado com sucesso!</h2>
              <p className="text-gray-600 mb-8">
                Sua conta foi criada e sua avaliação de risco foi registrada. Você já pode fazer login no sistema.
              </p>
              <Link
                href="/"
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      {/* Registration Form - remove the standalone header */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar nova conta</h1>
            <p className="text-gray-600">Junte-se à nossa plataforma de gestão de riscos climáticos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Alert */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dados Pessoais */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <div className="relative">
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      value={formData.nome}
                      onChange={handleInputChange}
                      maxLength={100}
                      className={`w-full px-4 py-3 pl-10 border ${
                        errors.nome ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Seu nome completo"
                    />
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.nome && <p className="mt-2 text-sm text-red-600">{errors.nome}</p>}
                  <p className="mt-1 text-xs text-gray-500">{formData.nome.length}/100 caracteres</p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      maxLength={100}
                      className={`w-full px-4 py-3 pl-10 border ${
                        errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="seu@email.com"
                    />
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  <p className="mt-1 text-xs text-gray-500">{formData.email.length}/100 caracteres</p>
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <div className="relative">
                    <input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      maxLength={20}
                      className={`w-full px-4 py-3 pl-10 border ${
                        errors.telefone ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="(11) 99999-9999"
                    />
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.telefone && <p className="mt-2 text-sm text-red-600">{errors.telefone}</p>}
                  <p className="mt-1 text-xs text-gray-500">{formData.telefone.length}/20 caracteres</p>
                </div>

                {/* Senha */}
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={handleInputChange}
                      maxLength={255}
                      className={`w-full px-4 py-3 pl-10 pr-10 border ${
                        errors.senha ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.senha && <p className="mt-2 text-sm text-red-600">{errors.senha}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    Deve conter pelo menos uma letra e um número - {formData.senha.length}/255 caracteres
                  </p>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label htmlFor="confirmSenha" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar senha *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmSenha"
                      name="confirmSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmSenha}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pl-10 pr-10 border ${
                        errors.confirmSenha
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Digite a senha novamente"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmSenha && <p className="mt-2 text-sm text-red-600">{errors.confirmSenha}</p>}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mr-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logradouro */}
                <div className="md:col-span-2">
                  <label htmlFor="endereco.logradouro" className="block text-sm font-medium text-gray-700 mb-2">
                    Logradouro *
                  </label>
                  <div className="relative">
                    <input
                      id="endereco.logradouro"
                      name="endereco.logradouro"
                      type="text"
                      value={formData.endereco.logradouro}
                      onChange={handleInputChange}
                      maxLength={255}
                      className={`w-full px-4 py-3 pl-10 border ${
                        errors.endereco?.logradouro
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Rua, Avenida, etc."
                    />
                    <Home className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.endereco?.logradouro && (
                    <p className="mt-2 text-sm text-red-600">{errors.endereco.logradouro}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">{formData.endereco.logradouro.length}/255 caracteres</p>
                </div>

                {/* Bairro */}
                <div>
                  <label htmlFor="endereco.bairro" className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    id="endereco.bairro"
                    name="endereco.bairro"
                    type="text"
                    value={formData.endereco.bairro}
                    onChange={handleInputChange}
                    maxLength={100}
                    className={`w-full px-4 py-3 border ${
                      errors.endereco?.bairro
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="Nome do bairro"
                  />
                  {errors.endereco?.bairro && <p className="mt-2 text-sm text-red-600">{errors.endereco.bairro}</p>}
                  <p className="mt-1 text-xs text-gray-500">{formData.endereco.bairro.length}/100 caracteres</p>
                </div>

                {/* CEP */}
                <div>
                  <label htmlFor="endereco.cep" className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <input
                    id="endereco.cep"
                    name="endereco.cep"
                    type="text"
                    value={formData.endereco.cep}
                    onChange={handleInputChange}
                    maxLength={9}
                    className={`w-full px-4 py-3 border ${
                      errors.endereco?.cep ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    placeholder="00000-000"
                  />
                  {errors.endereco?.cep && <p className="mt-2 text-sm text-red-600">{errors.endereco.cep}</p>}
                  <p className="mt-1 text-xs text-gray-500">Formato: 00000-000</p>
                </div>
              </div>
            </div>

            {/* Avaliação de Risco */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mr-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Avaliação de Risco Climático</h2>
                  <p className="text-sm text-gray-600">Informações para análise de vulnerabilidade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de Solo */}
                <div>
                  <label htmlFor="endereco.tipoSolo" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Solo *
                  </label>
                  <div className="relative">
                    <select
                      id="endereco.tipoSolo"
                      name="endereco.tipoSolo"
                      value={formData.endereco.tipoSolo}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pl-10 border ${
                        errors.endereco?.tipoSolo
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } bg-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    >
                      {TIPO_SOLO_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <TreePine className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.endereco?.tipoSolo && <p className="mt-2 text-sm text-red-600">{errors.endereco.tipoSolo}</p>}
                </div>

                {/* Altitude da Rua */}
                <div>
                  <label htmlFor="endereco.altitudeRua" className="block text-sm font-medium text-gray-700 mb-2">
                    Altitude da Rua *
                  </label>
                  <select
                    id="endereco.altitudeRua"
                    name="endereco.altitudeRua"
                    value={formData.endereco.altitudeRua}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.endereco?.altitudeRua
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } bg-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  >
                    {ALTITUDE_RUA_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.endereco?.altitudeRua && (
                    <p className="mt-2 text-sm text-red-600">{errors.endereco.altitudeRua}</p>
                  )}
                </div>

                {/* Tipo de Construção */}
                <div>
                  <label htmlFor="endereco.tipoConstrucao" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Construção *
                  </label>
                  <select
                    id="endereco.tipoConstrucao"
                    name="endereco.tipoConstrucao"
                    value={formData.endereco.tipoConstrucao}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.endereco?.tipoConstrucao
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } bg-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  >
                    {TIPO_CONSTRUCAO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.endereco?.tipoConstrucao && (
                    <p className="mt-2 text-sm text-red-600">{errors.endereco.tipoConstrucao}</p>
                  )}
                </div>

                {/* Risco do Bairro */}
                <div>
                  <label htmlFor="endereco.bairroRisco" className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Risco do Bairro *
                  </label>
                  <select
                    id="endereco.bairroRisco"
                    name="endereco.bairroRisco"
                    value={formData.endereco.bairroRisco}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.endereco?.bairroRisco
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } bg-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                  >
                    {BAIRRO_RISCO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.endereco?.bairroRisco && (
                    <p className="mt-2 text-sm text-red-600">{errors.endereco.bairroRisco}</p>
                  )}
                </div>

                {/* Próximo a Córrego */}
                <div className="md:col-span-2">
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      id="endereco.proximoCorrego"
                      name="endereco.proximoCorrego"
                      type="checkbox"
                      checked={formData.endereco.proximoCorrego}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="endereco.proximoCorrego" className="ml-3 block text-sm font-medium text-gray-700">
                      Localização próxima a córrego, rio ou área alagável
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Criando sua conta...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-3" />
                    Criar conta e registrar avaliação
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
