"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7faf7] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center border border-[#7fb685]/40">
        <h1 className="text-6xl font-bold text-[#426a5a] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#426a5a] mb-2">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">La página que buscas no existe o fue movida. Por favor, verifica la URL o vuelve al inicio.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-[#426a5a] text-white rounded-lg font-semibold hover:bg-[#7fb685] transition-colors">Volver al inicio</Link>
      </div>
    </div>
  );
} 