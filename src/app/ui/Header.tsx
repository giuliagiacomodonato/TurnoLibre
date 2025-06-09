import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-[#426a5a]/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
            <img src="/logo.ico" alt="Logo" className="h-8 w-8 rounded-full" />
            TurnoLibre
          </Link>
          <nav className="flex space-x-4">
            <Link href="/inicio" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Ver Disponibles
            </Link>
            <Link href="/reservas" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Mis Reservas
            </Link>
            <Link href="/inicio/carrito" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Carrito
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}