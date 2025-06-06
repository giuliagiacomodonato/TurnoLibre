"use client";
import { useState } from "react";
import { Toast } from "../../ui/Toast";

const serviciosList = [
  "Wi-Fi", "Vestuarios", "Gimnasio", "Estacionamiento", "Ayuda Médica", "Torneos", "Cumpleaños", "Parrilla", "Escuelita deportiva", "Colegios", "Bar / Restaurante", "Quincho"
];

export default function EditarComplejo() {
  const [complejo, setComplejo] = useState({
    nombre: "Complejo Prueba",
    direccion: "Buenos Aires 1350",
    telefono: "3416787881",
    online: true,
    servicios: ["Wi-Fi", "Vestuarios", "Estacionamiento"]
  });

  const [horarios, setHorarios] = useState([
    { dia: "Domingo", abierto: true, apertura: "10:00", cierre: "01:00" },
    { dia: "Lunes", abierto: true, apertura: "10:00", cierre: "01:00" },
    { dia: "Martes", abierto: true, apertura: "10:00", cierre: "01:00" },
    { dia: "Miércoles", abierto: true, apertura: "10:00", cierre: "01:00" },
    { dia: "Jueves", abierto: true, apertura: "10:00", cierre: "01:00" },
    { dia: "Viernes", abierto: true, apertura: "10:00", cierre: "01:00" },
    { dia: "Sábado", abierto: true, apertura: "10:00", cierre: "01:00" },
  ]);

  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const showToast = (message: string) => setToast({ open: true, message });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "online") {
      setComplejo({ ...complejo, online: checked });
    } else if (type === "checkbox") {
      setComplejo({
        ...complejo,
        servicios: checked
          ? [...complejo.servicios, value]
          : complejo.servicios.filter(s => s !== value)
      });
    } else {
      setComplejo({ ...complejo, [name]: value });
    }
  };

  const handleHorarioChange = (idx: number, field: string, value: any) => {
    setHorarios(horarios => horarios.map((h, i) =>
      i === idx ? { ...h, [field]: value } : h
    ));
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-2">
      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
      <h1 className="text-3xl font-bold text-[#426a5a] mb-10 text-center">Editar datos del complejo</h1>
      <div className="flex flex-col gap-10 md:gap-12">
        {/* Datos Básicos */}
        <section className="bg-white/90 rounded-2xl shadow-xl p-8 flex-1">
          <h2 className="text-2xl font-bold text-[#426a5a] mb-6 border-b border-[#f2c57c] pb-2">Datos Básicos</h2>
          <div className="mb-6">
            <label className="block text-[#426a5a] font-semibold mb-1">Nombre</label>
            <input type="text" name="nombre" value={complejo.nombre} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2" />
          </div>
          <div className="mb-6">
            <label className="block text-[#426a5a] font-semibold mb-1">Dirección</label>
            <input type="text" name="direccion" value={complejo.direccion} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2" />
          </div>
          <div className="mb-6">
            <label className="block text-[#426a5a] font-semibold mb-1">Teléfono</label>
            <input type="text" name="telefono" value={complejo.telefono} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2" />
          </div>
          <div className="mb-6 flex items-center gap-2">
            <input type="checkbox" name="online" checked={complejo.online} onChange={handleChange} className="accent-[#426a5a]" />
            <label className="text-[#426a5a] font-semibold">Estado del complejo: Online</label>
          </div>
          <button className="mt-2 bg-[#426a5a] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#7fb685] transition-colors"
            onClick={() => showToast("Datos básicos guardados correctamente")}
          >Guardar</button>
        </section>

        {/* Horarios del complejo */}
        <section className="bg-white/90 rounded-2xl shadow-xl p-8 flex-1">
          <h2 className="text-2xl font-bold text-[#426a5a] mb-6 border-b border-[#f2c57c] pb-2">Horarios del complejo</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[#426a5a]">
              <thead>
                <tr>
                  <th className="text-left">Día</th>
                  <th>Abierto</th>
                  <th>Hora Apertura</th>
                  <th>Hora Cierre</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h, idx) => (
                  <tr key={h.dia}>
                    <td className="py-2 font-semibold">{h.dia}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={h.abierto}
                        onChange={e => handleHorarioChange(idx, 'abierto', e.target.checked)}
                        className="accent-[#426a5a]"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={h.apertura}
                        disabled={!h.abierto}
                        onChange={e => handleHorarioChange(idx, 'apertura', e.target.value)}
                        className="rounded-lg border-[#7fb685] px-2 py-1"
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        value={h.cierre}
                        disabled={!h.abierto}
                        onChange={e => handleHorarioChange(idx, 'cierre', e.target.value)}
                        className="rounded-lg border-[#7fb685] px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-6 bg-[#426a5a] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#7fb685] transition-colors"
            onClick={() => showToast("Horarios guardados correctamente")}
          >Guardar horarios</button>
        </section>

        {/* Servicios */}
        <section className="bg-white/90 rounded-2xl shadow-xl p-8 flex-1">
          <h2 className="text-2xl font-bold text-[#426a5a] mb-6 border-b border-[#f2c57c] pb-2">Servicios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviciosList.map(servicio => (
              <label key={servicio} className="flex items-center gap-2 text-[#426a5a]">
                <input
                  type="checkbox"
                  name="servicios"
                  value={servicio}
                  checked={complejo.servicios.includes(servicio)}
                  onChange={handleChange}
                  className="accent-[#7fb685]"
                />
                {servicio}
              </label>
            ))}
          </div>
          <button className="mt-6 bg-[#426a5a] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#7fb685] transition-colors"
            onClick={() => showToast("Servicios guardados correctamente")}
          >Guardar servicios</button>
        </section>
      </div>
    </div>
  );
} 