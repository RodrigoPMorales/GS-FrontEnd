import Link from "next/link"
import { Shield, Users, AlertTriangle, ArrowRight } from "lucide-react"
import { Header } from "./components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Sistema de Gestão de
            <span className="text-blue-600"> Riscos Climáticos</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Monitore, previna e responda a eventos climáticos extremos com nossa plataforma integrada de gestão de
            riscos.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Cadastre-se Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Alertas em Tempo Real</h3>
              </div>
              <p className="mt-2 text-base text-gray-500">
                Receba notificações instantâneas sobre condições climáticas adversas em sua região.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Rede Colaborativa</h3>
              </div>
              <p className="mt-2 text-base text-gray-500">
                Conecte-se com outros usuários e autoridades para compartilhar informações importantes.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-500" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Proteção Avançada</h3>
              </div>
              <p className="mt-2 text-base text-gray-500">
                Utilize dados meteorológicos precisos para tomar decisões informadas sobre segurança.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-lg shadow-xl">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Pronto para se proteger dos riscos climáticos?</h2>
              <p className="mt-4 text-lg text-blue-100">
                Junte-se à nossa comunidade e tenha acesso a ferramentas avançadas de monitoramento.
              </p>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 ClimateRisks. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
