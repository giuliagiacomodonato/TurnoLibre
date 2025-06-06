"use client";
import { useState } from "react";

const deportes = ["Fútbol 5", "Fútbol 7", "Tenis", "Pádel", "Basket", "Voley"];

function ReglasHorarios({ reglas, setReglas }: { reglas: any[]; setReglas: (r: any[]) => void }) {
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const [nueva, setNueva] = useState({ dia: "Todos", apertura: "08:00", cierre: "23:00" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNueva({ ...nueva, [e.target.name]: e.target.value });
  };
  const agregarRegla = () => {
    setReglas([...reglas, { ...nueva, id: Date.now() }]);
    setNueva({ dia: "Todos", apertura: "08:00", cierre: "23:00" });
  };
  const eliminarRegla = (id: number) => {
    setReglas(reglas.filter(r => r.id !== id));
  };
  return (
    <div className="bg-white/90 rounded-2xl shadow-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-[#426a5a] mb-4">Reglas de horarios</h2>
      <table className="w-full mb-4">
        <thead>
          <tr className="text-[#426a5a] text-left">
            <th>Día de semana</th>
            <th>Apertura</th>
            <th>Cierre</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reglas.map(regla => (
            <tr key={regla.id} className="border-b last:border-b-0">
              <td className="py-2">{regla.dia}</td>
              <td>{regla.apertura}</td>
              <td>{regla.cierre}</td>
              <td>
                <button onClick={() => eliminarRegla(regla.id)} className="text-red-500 hover:underline ml-2">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Día</label>
          <select name="dia" value={nueva.dia} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2">
            <option value="Todos">Todos</option>
            {diasSemana.map(dia => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Apertura</label>
          <input type="time" name="apertura" value={nueva.apertura} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2" />
        </div>
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Cierre</label>
          <input type="time" name="cierre" value={nueva.cierre} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2" />
        </div>
        <button onClick={agregarRegla} className="bg-[#426a5a] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors">Agregar regla</button>
      </div>
    </div>
  );
}

export default function CanchaHorariosAdmin() {
  const [canchas, setCanchas] = useState([
    { id: 1, nombre: "Cancha 1", precio: 8000, deporte: "Fútbol 5", descripcion: "Cancha techada", reglas: [{ id: 1, dia: "Todos", apertura: "08:00", cierre: "23:00" }] },
    { id: 2, nombre: "Cancha 2", precio: 6500, deporte: "Tenis", descripcion: "Superficie rápida", reglas: [{ id: 2, dia: "Lunes", apertura: "09:00", cierre: "22:00" }] },
  ]);
  const [selected, setSelected] = useState<number|null>(null);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: 0, deporte: deportes[0], descripcion: "", reglas: [] });

  // Edición de cancha seleccionada
  const cancha = canchas.find(c => c.id === selected);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!cancha) return;
    setCanchas(canchas.map(c => c.id === cancha.id ? { ...c, [e.target.name]: e.target.value } : c));
  };
  // Reglas de horarios para la cancha seleccionada
  const setReglas = (reglas: any[]) => {
    if (!cancha) return;
    setCanchas(canchas.map(c => c.id === cancha.id ? { ...c, reglas } : c));
  };
  // Agregar/eliminar cancha
  const agregarCancha = () => {
    setCanchas([...canchas, { ...nuevo, id: Date.now(), reglas: [] }]);
    setNuevo({ nombre: "", precio: 0, deporte: deportes[0], descripcion: "", reglas: [] });
  };
  const eliminarCancha = (id: number) => {
    setCanchas(canchas.filter(c => c.id !== id));
    if (selected === id) setSelected(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-[#426a5a] mb-8">Gestión de canchas</h1>
      <div className="flex gap-8">
        {/* Panel izquierdo: lista de canchas */}
        <div className="w-1/3 bg-white/90 rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-[#426a5a] mb-4">Canchas del complejo</h2>
          <ul className="mb-4">
            {canchas.map(c => (
              <li key={c.id} className={`flex items-center justify-between mb-2 ${selected === c.id ? 'bg-[#f2c57c]/40' : ''} rounded-lg px-2 py-1`}>
                <button onClick={() => setSelected(c.id)} className="text-left flex-1 text-[#426a5a] font-semibold">{c.nombre}</button>
                <button onClick={() => eliminarCancha(c.id)} className="ml-2 text-red-500 hover:underline">Eliminar</button>
              </li>
            ))}
          </ul>
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-bold text-[#426a5a] mb-2">Agregar nueva cancha</h3>
            <input type="text" name="nombre" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2" />
            <input type="number" name="precio" placeholder="Precio" value={nuevo.precio} onChange={e => setNuevo({ ...nuevo, precio: Number(e.target.value) })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2" />
            <select name="deporte" value={nuevo.deporte} onChange={e => setNuevo({ ...nuevo, deporte: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2">
              {deportes.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
            <textarea name="descripcion" placeholder="Descripción" value={nuevo.descripcion} onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2" />
            <button onClick={agregarCancha} className="w-full bg-[#426a5a] text-white font-bold py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors">Agregar cancha</button>
          </div>
        </div>
        {/* Panel derecho: edición de cancha */}
        <div className="w-2/3">
          {cancha ? (
            <div className="bg-white/90 rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-[#426a5a] mb-4">Editar cancha</h2>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#426a5a] font-semibold mb-1">Nombre</label>
                  <input type="text" name="nombre" value={cancha.nombre} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2" />
                </div>
                <div>
                  <label className="block text-[#426a5a] font-semibold mb-1">Precio</label>
                  <input type="number" name="precio" value={cancha.precio} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2" />
                </div>
                <div>
                  <label className="block text-[#426a5a] font-semibold mb-1">Deporte</label>
                  <select name="deporte" value={cancha.deporte} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2">
                    {deportes.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[#426a5a] font-semibold mb-1">Descripción</label>
                  <textarea name="descripcion" value={cancha.descripcion} onChange={handleChange} className="w-full rounded-lg border-[#7fb685] px-3 py-2" />
                </div>
              </div>
              <ReglasHorarios reglas={cancha.reglas} setReglas={setReglas} />
            </div>
          ) : (
            <div className="text-[#426a5a] text-lg">Selecciona una cancha para editar sus datos y reglas de horarios.</div>
          )}
        </div>
      </div>
    </div>
  );
} 