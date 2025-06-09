"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#426a5a] mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/editar-disponibilidad" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Editar Disponibilidad</h2>
          <p className="text-gray-600">Gestionar la disponibilidad de las canchas y sus horarios</p>
        </Link>

        <Link href="/admin/ver-reservas" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Ver Reservas</h2>
          <p className="text-gray-600">Ver y gestionar todas las reservas del sistema</p>
        </Link>

        <Link href="/admin/cancha-horarios" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Editar Canchas y Horarios</h2>
          <p className="text-gray-600">Configurar canchas, deportes y horarios disponibles</p>
        </Link>

        <Link href="/admin/editar-complejo" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Editar Complejo</h2>
          <p className="text-gray-600">Modificar información general del complejo deportivo</p>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Gestionar Usuarios</h2>
          <p className="text-gray-600">Administrar usuarios y sus permisos</p>
        </div>
      </div>
    </div>
  );
} 