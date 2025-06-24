"use client";
import Link from 'next/link';
import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { useSession, signOut } from 'next-auth/react';
import { SessionProvider } from "next-auth/react";
import { CartProvider } from './CartContext';

export function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="bg-[#426a5a]/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
            <img src="/logo.ico" alt="Logo" className="h-8 w-8 rounded-full" />
            TurnoLibre
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-4 items-center">
            <Link href="/inicio" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Ver Disponibles
            </Link>
            <Link href="/reservas" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Mis Reservas
            </Link>
            <Link href="/inicio/carrito" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Carrito
            </Link>
            <Link href="/FAQ" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              FAQ
            </Link>
            {session ? (
              <div className="flex items-center space-x-2">
                {session.user?.image && (
                  <img src={session.user.image} alt="avatar" className="h-8 w-8 rounded-full border border-[#7fb685]" />
                )}
                <span className="text-[#f2c57c] font-semibold">{session.user?.name || session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#ddae7e] transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-4 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#ddae7e] transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center ">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#f2c57c] focus:outline-none"
              aria-label="Abrir menú"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-0 right-0 w-64 h-full flex flex-col justify-start items-stretch p-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end mb-2 text-[#426a5a]"
                aria-label="Cerrar menú"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="flex flex-col gap-2">
                <Link href="/inicio" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  Ver Disponibles
                </Link>
                <Link href="/reservas" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  Mis Reservas
                </Link>
                <Link href="/inicio/carrito" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  Carrito
                </Link>
                <Link href="/FAQ" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  FAQ
                </Link>
                {session && session.user ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {session.user.image && (
                      <img src={session.user.image} alt="avatar" className="h-10 w-10 rounded-full border border-[#7fb685] self-start" />
                    )}
                    <span className="text-[#426a5a] font-semibold">{session.user.name || session.user.email}</span>
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="mt-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#7fb685] hover:text-white transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMenuOpen(false); setShowLogin(true); }}
                    className="mt-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#7fb685] hover:text-white transition-colors"
                  >
                    Iniciar sesión
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}

export function AdminHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <header className="bg-[#426a5a]/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
            <img src="/logo.ico" alt="Logo" className="h-8 w-8 rounded-full" />
            Admin
          </Link>
          <div className="relative flex items-center space-x-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#ddae7e] transition-colors"
            >
              {session.user?.image && (
                <img src={session.user.image} alt="avatar" className="h-8 w-8 rounded-full border border-[#7fb685]" />
              )}
              <span>{session.user?.name || session.user?.email}</span>
              <svg className={`ml-2 w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {menuOpen && (
              <div className="fixed right-8 top-20 w-56 bg-white rounded-lg shadow-lg z-50 py-2 border border-[#7fb685] max-h-72 overflow-y-auto">
                <Link href="/admin/editar-disponibilidad" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Editar Disponibilidad</Link>
                <Link href="/admin/ver-reservas" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Ver Reservas</Link>
                <Link href="/admin/cancha-horarios" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Editar Canchas y Horarios</Link>
                <Link href="/admin/editar-complejo" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Editar Complejo</Link>
                <Link href="/admin/FAQ" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">FAQ</Link>
                <div className="border-t my-2" />
                <Link href="/admin" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40 font-semibold">Volver al menú de admin</Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 font-semibold"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}