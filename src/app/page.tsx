import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      {/* Header */}
      <header className="bg-[#426a5a]/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#f2c57c]">TurnoLibre</h1>
            <nav className="flex space-x-4">
              <a href="#" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">Inicio</a>
              <a href="#" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">Mi Reserva</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#426a5a] mb-2">Bienvenido a TurnoLibre</h2>
              <p className="text-[#426a5a]/80">Inicia sesión para continuar</p>
            </div>

            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#426a5a]">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-lg border-[#7fb685] shadow-sm focus:border-[#426a5a] focus:ring-[#426a5a] px-4 py-2 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#426a5a]">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 block w-full rounded-lg border-[#7fb685] shadow-sm focus:border-[#426a5a] focus:ring-[#426a5a] px-4 py-2 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#ef6f6c] text-white py-3 px-4 rounded-lg shadow-sm hover:bg-[#ef6f6c]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef6f6c] transition-all duration-300 transform hover:scale-[1.02]"
              >
                Iniciar sesión
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="#" className="text-sm text-[#426a5a] hover:text-[#7fb685] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#426a5a]/90 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
        </div>
      </footer>
    </div>
  );
}
