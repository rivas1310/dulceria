import OrderSidebar from '@/components/order/OrderSidebar'
import OrderSumary from '@/components/order/OrderSumary'
import ToastNotification from '@/components/ui/ToastNotification'
import MobileOrderButton from "@/components/products/MobileOrderButton";
import MobileCategoryButton from "@/components/products/MobileCategoryButton";


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      {/* Navegación móvil - siempre visible en móvil */}
      

      <div className="min-h-screen flex">
        {/* Sidebar izquierdo fijo */}
        <aside className="hidden md:block fixed left-0 top-0 h-screen w-70 bg-customBlue ">
          <OrderSidebar />
        </aside>

        {/* Contenido principal con margen para los sidebars */}
        <main className="flex-1 md:ml-64 md:mr-96 p-5 overflow-y-auto min-h-screen">
          {children}
        </main>

        {/* Sidebar derecho fijo */}
        <aside className="hidden md:block fixed overflow-y-auto right-0 top-0 h-screen w-86 bg-customBlue">
          <OrderSumary />
        </aside>

        {/* Componentes móviles */}
        <MobileCategoryButton />
        <ToastNotification />
        <MobileOrderButton />
      </div>
    </div>
  );
}