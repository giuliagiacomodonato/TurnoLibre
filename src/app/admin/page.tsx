"use client";
import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <div className="bg-white/90 rounded-2xl shadow-xl p-10 flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold text-[#426a5a] mb-4">Panel de Administración</h1>
        <div className="flex flex-col gap-4 w-64">
          <Link
            href="/admin/editar-complejo"
            className="w-full bg-[#426a5a] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7fb685] transition-colors duration-300 text-center"
          >
            Editar complejo
          </Link>
          <Link
            href="/admin/cancha-horarios"
            className="w-full bg-[#426a5a] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7fb685] transition-colors duration-300 text-center"
          >
            Editar horarios de canchas
          </Link>
          <Link
            href="/admin/editar-disponibilidad"
            className="w-full bg-[#426a5a] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7fb685] transition-colors duration-300 text-center"
          >
            Editar Disponibilidad
          </Link>
          <Link
            href="#"
            tabIndex={-1}
            aria-disabled="true"
            className="w-full bg-[#7fb685] text-white font-bold py-3 px-4 rounded-lg shadow-md opacity-60 cursor-not-allowed text-center pointer-events-none"
          >
            Ver reservas (próximamente)
          </Link>
          <Link
            href="#"
            tabIndex={-1}
            aria-disabled="true"
            className="w-full bg-[#f2c57c] text-[#426a5a] font-bold py-3 px-4 rounded-lg shadow-md opacity-60 cursor-not-allowed text-center pointer-events-none"
          >
            Estadísticas (próximamente)
          </Link>
        </div>
      </div>
    </div>
  );
} 