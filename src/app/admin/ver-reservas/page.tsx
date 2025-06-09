"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Toast } from "../../ui/Toast";

// Simular datos
const deportes = [
  { id: 1, nombre: "Fútbol" },
  { id: 2, nombre: "Tenis" },
  { id: 3, nombre: "Pádel" },
];

const canchas = [
  { id: 1, nombre: "Cancha 1", deporteId: 1 },
  { id: 2, nombre: "Cancha 2", deporteId: 1 },
  { id: 3, nombre: "Cancha 3", deporteId: 2 },
  { id: 4, nombre: "Cancha 4", deporteId: 3 },
];

const usuarios = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "María García" },
  { id: 3, nombre: "Carlos López" },
];

const horas = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
];

// Simular reservas
const reservasMock = [
  {
    id: 1,
    canchaId: 1,
    usuarioId: 1,
    fecha: "2024-03-20",
    hora: "10:00",
    estado: "confirmada",
  },
  {
    id: 2,
    canchaId: 2,
    usuarioId: 2,
    fecha: "2024-03-20",
    hora: "11:00",
    estado: "pendiente",
  },
  {
    id: 3,
    canchaId: 3,
    usuarioId: 3,
    fecha: "2024-03-20",
    hora: "12:00",
    estado: "cancelada",
  },
];

export default function VerReservas() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<typeof usuarios>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Obtener filtros de la URL
  const deporteId = searchParams.get("deporte") ? parseInt(searchParams.get("deporte")!) : undefined;
  const usuarioId = searchParams.get("usuario") ? parseInt(searchParams.get("usuario")!) : undefined;
  const fecha = searchParams.get("fecha") || new Date().toISOString().split("T")[0];
  const hora = searchParams.get("hora") || "";

  // Filtrar reservas
  const reservasFiltradas = reservasMock.filter(reserva => {
    const cancha = canchas.find(c => c.id === reserva.canchaId);
    if (deporteId && cancha?.deporteId !== deporteId) return false;
    if (usuarioId && reserva.usuarioId !== usuarioId) return false;
    if (fecha && reserva.fecha !== fecha) return false;
    if (hora && reserva.hora !== hora) return false;
    return true;
  });

  const handleFiltroChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/ver-reservas?${params.toString()}`);
  };

  const handleBusquedaUsuario = (value: string) => {
    setBusquedaUsuario(value);
    if (value.trim()) {
      const filtrados = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setUsuariosFiltrados(filtrados);
      setMostrarSugerencias(true);
    } else {
      setUsuariosFiltrados([]);
      setMostrarSugerencias(false);
    }
  };

  const handleSeleccionarUsuario = (usuario: typeof usuarios[0]) => {
    setBusquedaUsuario(usuario.nombre);
    handleFiltroChange("usuario", usuario.id.toString());
    setMostrarSugerencias(false);
  };

  const handleCancelarReserva = (reservaId: number) => {
    // Simular cancelación
    setToast({ open: true, message: "Reserva cancelada" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#426a5a] mb-8">Ver Reservas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-[#426a5a] mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[#426a5a] font-semibold mb-1">Deporte</label>
            <select
              value={deporteId?.toString() || ""}
              onChange={(e) => handleFiltroChange("deporte", e.target.value)}
              className="w-full rounded-lg border-[#7fb685] px-3 py-2"
            >
              <option value="">Todos</option>
              {deportes.map(deporte => (
                <option key={deporte.id} value={deporte.id}>{deporte.nombre}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-[#426a5a] font-semibold mb-1">Usuario</label>
            <input
              type="text"
              value={busquedaUsuario}
              onChange={(e) => handleBusquedaUsuario(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full rounded-lg border-[#7fb685] px-3 py-2"
            />
            {mostrarSugerencias && usuariosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#7fb685] rounded-lg shadow-lg">
                {usuariosFiltrados.map(usuario => (
                  <button
                    key={usuario.id}
                    onClick={() => handleSeleccionarUsuario(usuario)}
                    className="w-full text-left px-4 py-2 hover:bg-[#7fb685]/10 text-[#426a5a]"
                  >
                    {usuario.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#426a5a] font-semibold mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => handleFiltroChange("fecha", e.target.value)}
              className="w-full rounded-lg border-[#7fb685] px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-[#426a5a] font-semibold mb-1">Hora</label>
            <select
              value={hora}
              onChange={(e) => handleFiltroChange("hora", e.target.value)}
              className="w-full rounded-lg border-[#7fb685] px-3 py-2"
            >
              <option value="">Todas</option>
              {horas.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-[#426a5a] mb-4">Reservas</h2>
        {reservasFiltradas.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay reservas que coincidan con los filtros</p>
        ) : (
          <div className="space-y-4">
            {reservasFiltradas.map(reserva => {
              const cancha = canchas.find(c => c.id === reserva.canchaId);
              const usuario = usuarios.find(u => u.id === reserva.usuarioId);
              const deporte = deportes.find(d => d.id === cancha?.deporteId);

              return (
                <div key={reserva.id} className="border border-[#7fb685] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#426a5a]">{cancha?.nombre}</h3>
                      <p className="text-gray-600">{deporte?.nombre}</p>
                      <p className="text-gray-600">{usuario?.nombre}</p>
                      <p className="text-gray-600">{reserva.fecha} - {reserva.hora}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        reserva.estado === "confirmada" ? "bg-green-100 text-green-800" :
                        reserva.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                      </span>
                      {reserva.estado !== "cancelada" && (
                        <button
                          onClick={() => handleCancelarReserva(reserva.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
} 