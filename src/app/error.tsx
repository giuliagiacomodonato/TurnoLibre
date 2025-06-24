"use client";
import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7faf7] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center border border-[#7fb685]/40">
        <h1 className="text-6xl font-bold text-[#426a5a] mb-4">500</h1>
        <h2 className="text-2xl font-semibold text-[#426a5a] mb-2">Ocurrió un error inesperado</h2>
        <p className="text-gray-600 mb-6">Algo salió mal en el servidor o en la aplicación. Puedes intentar de nuevo o volver al inicio.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#426a5a] text-white rounded-lg font-semibold hover:bg-[#7fb685] transition-colors"
          >
            Reintentar
          </button>
          <Link href="/" className="px-6 py-3 bg-[#426a5a] text-white rounded-lg font-semibold hover:bg-[#7fb685] transition-colors text-center">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
} 