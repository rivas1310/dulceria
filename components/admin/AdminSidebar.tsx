"use client"
import { text } from "stream/consumers";
import Logo from "../ui/Logo"
import AdminRoute from "./AdminRoute"

interface AdminSidebarProps {
  onLogout?: () => void
}

const adminNavigation = [
  { url: "/admin/orders", text: "Ordenes", blank: false },
  { url: "/admin/products", text: "Productos", blank: false },
  { url: "/admin/categories", text: "Categorías", blank: false },
  { url: "/admin/subcategories", text: "Subcategorías", blank: false },
  { url: "/order/cafe", text: "Ver Quiosco", blank: true },
  { url: "/admin/facturacion", text: "Facturación", blank: true },
  {
    url: "/admin/estadistica",
    text: "Estadísticas",
    blank: false,
  },
]

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  return (
    <>
      <Logo />
      <div className="space-y-3 ">
        <p className="mt-10 uppercase font-bold text-sm text-gray-600 text-center">Navegación</p>
        <nav className="flex flex-col">
          {adminNavigation.map((link) => (
            <AdminRoute key={link.url} link={link} />
          ))}
        </nav>
        {onLogout && (
          <button onClick={onLogout} className="w-full mt-4 px-4 py-2 text-sm text-red-600 hover:bg-red-100 rounded">
            Cerrar Sesión
          </button>
        )}
      </div>
    </>
  )
}