"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciais inválidas")
      } else {
        // Refresh session and redirect
        await getSession()
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Ocorreu um erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Sistema de Gerenciamento de Projetos
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Faça login para acessar o sistema
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Use as credenciais de demonstração:<br />
                <strong>Email:</strong> admin@demo.com<br />
                <strong>Senha:</strong> demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}