'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoginModal } from './LoginModal';

export default function ReservaAccesoRestringido() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <main className="flex-grow py-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center">
            <h1 className="text-2xl font-bold text-[#426a5a] mb-4">Acceso Restringido</h1>
            <p className="mb-6 text-gray-600">Debes iniciar sesión para ver tus reservas.</p>
            <p className="text-sm text-gray-500 mb-4">Puedes iniciar sesión o volver al inicio</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="px-6 py-2 border border-[#426a5a] text-[#426a5a] rounded-lg font-semibold hover:bg-[#426a5a]/10 transition-colors">
                Volver al inicio
              </Link>
              <button 
                onClick={() => setShowLogin(true)}
                className="px-6 py-2 bg-[#426a5a] text-white rounded-lg font-semibold hover:bg-[#7fb685] transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </main>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} callbackUrl="/reservas" />
    </>
  );
}
