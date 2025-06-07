"use client"

import Link from "next/link"
import { Shield, User, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/app/contexts/auth-context"
import { useState } from "react"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">ClimateRisks</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Início
            </Link>

            <Link href="/alagamentos" className="text-gray-600 hover:text-gray-900">
              Alagamentos
            </Link>

            <Link href="/deslizamentos" className="text-gray-600 hover:text-gray-900">
              Deslizamentos
            </Link>

            <Link href="/alertas" className="text-gray-600 hover:text-gray-900">
              Alertas
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-gray-100 px-3 py-2 rounded-lg"
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.nome}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{user?.nome}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          logout()
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/register" className="text-gray-600 hover:text-gray-900">
                  Cadastro
                </Link>
                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
