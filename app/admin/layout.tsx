"use client"
import { useState, useEffect } from "react"
import ToastNotification from "@/components/ui/ToastNotification"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("isAdminAuthenticated")
    setIsAuthenticated(!!auth)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "admin123") {
      localStorage.setItem("isAdminAuthenticated", "true")
      setIsAuthenticated(true)
    } else {
      setError("Contraseña incorrecta")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-customBlue">
        <div className="bg-white p-8 rounded-lg shadow-md w-[350px]">
          <h1 className="text-2xl text-center mb-6">Administración</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Ingrese la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="md:flex">
        <aside className="md:w-72 md:h-screen bg-white">
          <AdminSidebar onLogout={() => {
            localStorage.removeItem("isAdminAuthenticated")
            setIsAuthenticated(false)
          }} />
        </aside>

        <main className="md:flex-1 md:h-screen md:overflow-y-scroll bg-customBlue p-5">
          {children}
        </main>
      </div>
      <ToastNotification />
    </>
  )
}
