"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  nome: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User, token: string, refreshToken?: string) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
  getValidToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  const getValidToken = async (): Promise<string | null> => {
    const token = localStorage.getItem("authToken")
    const savedUser = localStorage.getItem("user")

    if (!token || !savedUser) {
      console.log("Token ou usuário não encontrado no localStorage")
      return null
    }

    try {
      // Verificar se os dados do usuário são válidos
      const userData = JSON.parse(savedUser)
      if (!userData.nome || !userData.email) {
        console.log("Dados do usuário inválidos")
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
        localStorage.removeItem("refreshToken")
        setUser(null)
        return null
      }

      // Por enquanto, vamos confiar no token local
      // A verificação real será feita na requisição para a API Java
      return token
    } catch (parseError) {
      console.error("Erro ao parsear dados do usuário:", parseError)
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      return null
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem("authToken")
    const savedUser = localStorage.getItem("user")

    if (!token || !savedUser) {
      return false
    }

    try {
      const userData = JSON.parse(savedUser)

      // Verificar se os dados são válidos
      if (!userData.nome || !userData.email) {
        console.log("Dados do usuário incompletos")
        localStorage.removeItem("user")
        localStorage.removeItem("authToken")
        localStorage.removeItem("refreshToken")
        return false
      }

      setUser(userData)
      return true
    } catch (parseError) {
      console.error("Erro ao parsear dados do usuário:", parseError)
      localStorage.removeItem("user")
      localStorage.removeItem("authToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      return false
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (userData: User, token: string, refreshToken?: string) => {
    console.log("Fazendo login com:", { nome: userData.nome, email: userData.email })
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("authToken", token)
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken)
    }

    // Redirecionar para dashboard
    router.push("/dashboard")
  }

  const logout = () => {
    console.log("Fazendo logout")
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    localStorage.removeItem("refreshToken")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        getValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
