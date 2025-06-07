"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Shield, Eye, EyeOff, CheckCircle, XCircle, Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { Header } from "@/app/components/header"

interface LoginFormData {
  email: string
  senha: string
}

interface LoginErrors {
  email?: string
  senha?: string
  general?: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    senha: "",
  })

  const [errors, setErrors] = useState<LoginErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific error when user starts typing
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})$/.test(formData.email)) {
      newErrors.email = "Email deve ter um formato válido"
    }

    // Validação da senha
    if (!formData.senha.trim()) {
      newErrors.senha = "Senha é obrigatória"
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
        email: formData.email,
        senha: formData.senha,
      }

      console.log("Enviando dados de login:", { email: payload.email, senha: "[HIDDEN]" })

      const response = await fetch("/api/auth/login", {
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
        // Usar o contexto de autenticação para fazer login
        const userData = {
          nome: data.nome || formData.email.split("@")[0], // Usar nome da resposta ou parte do email
          email: formData.email,
        }

        login(userData, data.token, data.refreshToken)

        // Mostrar mensagem de sucesso
        console.log("Login realizado com sucesso!")
      } else {
        if (response.status === 401) {
          setErrors({ general: "Email ou senha incorretos" })
        } else if (response.status === 400 && data.errors) {
          const apiErrors: LoginErrors = {}

          data.errors.forEach((error: string) => {
            const errorLower = error.toLowerCase()
            if (errorLower.includes("email")) {
              apiErrors.email = error
            } else if (errorLower.includes("senha")) {
              apiErrors.senha = error
            } else {
              apiErrors.general = error
            }
          })

          setErrors(apiErrors)
        } else if (response.status === 503) {
          setErrors({
            general:
              "Não foi possível conectar com o servidor. Verifique se a API está rodando em http://localhost:8080",
          })
        } else {
          setErrors({ general: data.message || "Erro ao fazer login" })
        }
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setErrors({
        general: "Erro de conexão. Verifique se a API está rodando e tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Fazer login</h1>
            <p className="text-gray-600">Acesse sua conta na plataforma de gestão de riscos climáticos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              {/* Error Alert */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pl-10 border ${
                        errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="seu@email.com"
                    />
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Senha */}
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pl-10 pr-10 border ${
                        errors.senha ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                      placeholder="Sua senha"
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
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Lembrar de mim
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Esqueceu a senha?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-5 w-5 ml-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Por que usar o ClimateRisks?</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Monitoramento em tempo real de riscos climáticos</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Alertas personalizados para sua região</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-gray-700">Análise de vulnerabilidade da sua propriedade</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
