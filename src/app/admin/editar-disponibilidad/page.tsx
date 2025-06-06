"use client";
import { useState } from "react";
import { Toast } from "../../ui/Toast";

const canchas = [
  { id: 1, nombre: "Cancha 1 (Fútbol 5)" },
  { id: 2, nombre: "Cancha 2 (Tenis)" },
];

const horas = Array.from({ length: 11 }, (_, i) => `${(i + 13).toString().padStart(2, "0")}:00`);
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export default function EditarDisponibilidadAdmin() {
  const [selectedCancha, setSelectedCancha] = useState(canchas[0].id);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  // Simular disponibilidad: canchaId -> date -> hora -> disponible
  const [disponibilidad, setDisponibilidad] = useState(() => {
    const obj: Record<number, Record<string, Record<string, { disponible: boolean; motivo?: string }>>> = {};
    for (const cancha of canchas) {
      obj[cancha.id] = {};
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        const iso = date.toISOString().split("T")[0];
        obj[cancha.id][iso] = {};
        for (const hora of horas) {
          obj[cancha.id][iso][hora] = { disponible: Math.random() > 0.2 };
        }
      }
    }
    return obj;
  });

  // Estado para popup
  const [popup, setPopup] = useState<null | { hora: string; motivo: string; disponible: boolean }>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const handleSlotClick = (hora: string) => {
    const slot = disponibilidad[selectedCancha][selectedDate][hora];
    setPopup({ hora, motivo: slot.motivo || "", disponible: slot.disponible });
  };

  const handlePopupSave = () => {
    if (!popup) return;
    setDisponibilidad(prev => ({
      ...prev,
      [selectedCancha]: {
        ...prev[selectedCancha],
        [selectedDate]: {
          ...prev[selectedCancha][selectedDate],
          [popup.hora]: { disponible: false, motivo: popup.motivo.trim() || undefined },
        },
      },
    }));
    setPopup(null);
    setToast({ open: true, message: "Turno bloqueado" });
  };

  const handlePopupHabilitar = () => {
    if (!popup) return;
    setDisponibilidad(prev => ({
      ...prev,
      [selectedCancha]: {
        ...prev[selectedCancha],
        [selectedDate]: {
          ...prev[selectedCancha][selectedDate],
          [popup.hora]: { disponible: true },
        },
      },
    }));
    setPopup(null);
    setToast({ open: true, message: "Turno habilitado" });
  };

  // Navegación de días
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };
  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-2">
      <h1 className="text-3xl font-bold text-[#426a5a] mb-8 text-center">Editar Disponibilidad de Canchas</h1>
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <label className="block text-[#426a5a] font-semibold mb-2">Cancha</label>
          <select
            value={selectedCancha}
            onChange={e => setSelectedCancha(Number(e.target.value))}
            className="w-full rounded-lg border-[#7fb685] px-3 py-2"
          >
            {canchas.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[#426a5a] font-semibold mb-2">Día</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border-[#7fb685] px-3 py-2"
          />
        </div>
      </div>
      <div className="bg-white/90 rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-[#426a5a] mb-4">Disponibilidad para {canchas.find(c => c.id === selectedCancha)?.nombre} el {new Date(selectedDate).toLocaleDateString()}</h2>
        <div className="grid grid-cols-[120px_repeat(11,1fr)] gap-1 text-center mb-4">
          <div className="col-span-1 font-bold text-[#426a5a]">Hora</div>
          {horas.map(hora => (
            <div key={hora} className="font-bold text-[#426a5a]">{hora}</div>
          ))}
        </div>
        <div className="grid grid-cols-[120px_repeat(11,1fr)] gap-1 items-center">
          <div className="text-sm font-semibold text-[#426a5a] pr-2">{canchas.find(c => c.id === selectedCancha)?.nombre}</div>
          {horas.map(hora => {
            const slot = disponibilidad[selectedCancha][selectedDate][hora];
            return (
              <button
                key={hora}
                className={`h-8 rounded transition-colors border ${slot.disponible ? "bg-[#7fb685] border-[#7fb685] hover:bg-[#426a5a]" : "bg-gray-300 border-gray-300 hover:bg-gray-400"}`}
                title={slot.disponible ? "Disponible (click para bloquear)" : slot.motivo ? slot.motivo : "No disponible (click para habilitar)"}
                onClick={() => handleSlotClick(hora)}
              >
                {!slot.disponible && slot.motivo && (
                  <span className="text-xs text-[#426a5a]">🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* Popup para bloquear/habilitar turno */}
      {popup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs relative">
            <button onClick={() => setPopup(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold text-[#426a5a] mb-4">{popup.disponible ? "Bloquear turno" : "Turno bloqueado"}</h3>
            <div className="mb-4">
              <label className="block text-[#426a5a] font-semibold mb-1">Hora</label>
              <div className="text-[#426a5a] font-bold">{popup.hora}</div>
            </div>
            {popup.disponible ? (
              <>
                <label className="block text-[#426a5a] font-semibold mb-1">Motivo (opcional)</label>
                <input
                  type="text"
                  value={popup.motivo}
                  onChange={e => setPopup({ ...popup, motivo: e.target.value })}
                  className="w-full rounded-lg border-[#7fb685] px-3 py-2 mb-4"
                  placeholder="Ej: Mantenimiento, Torneo..."
                />
                <button
                  className="w-full bg-[#426a5a] text-white font-bold py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors"
                  onClick={handlePopupSave}
                >Bloquear turno</button>
              </>
            ) : (
              <>
                {popup.motivo && (
                  <div className="mb-4">
                    <label className="block text-[#426a5a] font-semibold mb-1">Motivo</label>
                    <div className="text-[#426a5a]">{popup.motivo}</div>
                  </div>
                )}
                <button
                  className="w-full bg-[#7fb685] text-white font-bold py-2 rounded-lg shadow hover:bg-[#426a5a] transition-colors"
                  onClick={handlePopupHabilitar}
                >Habilitar turno</button>
              </>
            )}
          </div>
        </div>
      )}
      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
} 