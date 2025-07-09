"use client";
import React, { useState, useEffect } from "react";
import { Toast } from "../ui/Toast";
import { AdminHeader } from "../ui/Header";
import type { CanchaHorariosAdminClientProps, Facility, Location, LocationSchedule } from '@/lib/types';
import { DAYS_OF_WEEK, DIAS_ORDEN } from '@/lib/utils';

function ReglasHorarios({ reglas, setReglas, location }: { reglas: any[]; setReglas: (r: any[]) => void, location: any }) {
  const [nueva, setNueva] = useState({ dia: "Todos", apertura: "08:00", cierre: "23:00", duracion: "60" });

  // --- LIMPIEZA AUTOMÁTICA DE REGLAS VIEJAS ---
  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const reglasConVigencia = reglas.map(regla => {
      const fechaCreacion = regla.updatedAt ? new Date(regla.updatedAt) : null;
      const fechaVigencia = fechaCreacion ? new Date(fechaCreacion.getTime() + 8 * 24 * 60 * 60 * 1000) : null;
      return { ...regla, fechaVigencia };
    });
    const hayVigenteHoy = reglasConVigencia.some(r => r.fechaVigencia && r.fechaVigencia.toDateString() === hoy.toDateString());
    if (hayVigenteHoy) {
      const nuevasReglas = reglasConVigencia.filter(r => !r.fechaVigencia || r.fechaVigencia >= hoy);
      if (nuevasReglas.length !== reglas.length) {
        setReglas(nuevasReglas.map(({fechaVigencia, ...rest}) => rest));
      }
    }
  }, [reglas, setReglas]);

  // Agrupar reglas por fecha de vigencia (string)
  const reglasConVigencia = reglas.map(regla => {
    const fechaCreacion = regla.updatedAt ? new Date(regla.updatedAt) : null;
    const fechaVigencia = fechaCreacion ? new Date(fechaCreacion.getTime() + 8 * 24 * 60 * 60 * 1000) : null;
    return { ...regla, fechaCreacion, fechaVigencia };
  });
  const reglasAgrupadas = reglasConVigencia.reduce((acc: Record<string, any[]>, regla) => {
    const key = regla.fechaVigencia ? regla.fechaVigencia.toLocaleDateString() : '-';
    if (!acc[key]) acc[key] = [];
    acc[key].push(regla);
    return acc;
  }, {});

  // Variables y funciones para el formulario
  const getScheduleForDay = (dia: string) => {
    if (!location || !location.schedules) return null;
    if (dia === "Todos") return null;
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const idx = dias.indexOf(dia);
    return location.schedules.find((s: any) => s.dayOfWeek === idx);
  };
  const schedule = getScheduleForDay(nueva.dia);
  const isClosed = schedule && !schedule.isOpen;
  const minApertura = schedule ? schedule.openingTime.slice(0,5) : "08:00";
  const maxCierre = schedule ? schedule.closingTime.slice(0,5) : "23:00";
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNueva({ ...nueva, [e.target.name]: e.target.value });
  };
  const agregarRegla = () => {
    setReglas([...reglas, { ...nueva, duracion: nueva.duracion.toString(), id: Date.now() }]);
    setNueva({ dia: "Todos", apertura: "08:00", cierre: "23:00", duracion: "60" });
  };

  // --- DESKTOP & MOBILE ---
  return (
    <div className="bg-white/90 rounded-2xl shadow-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-[#426a5a] mb-4">Reglas de horarios</h2>
      <div className="mb-4">
        <div className="hidden md:block">
          {Object.entries(reglasAgrupadas).map(([vigencia, grupo]) => (
            <div key={vigencia} className="mb-8 border rounded-lg p-4 bg-gray-50 overflow-x-auto relative">
              <div className="font-semibold text-[#426a5a] mb-2">Vigencia desde: {vigencia}</div>
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-[#426a5a] text-left">
                    <th style={{minWidth:'120px'}} className="px-2">Día de semana</th>
                    <th style={{minWidth:'90px'}} className="px-2">Apertura</th>
                    <th style={{minWidth:'90px'}} className="px-2">Cierre</th>
                    <th style={{minWidth:'110px'}} className="px-2">Duración (min)</th>
                    <th style={{minWidth:'120px'}} className="px-2">Fecha de creación</th>
                    <th style={{minWidth:'16px'}} className="px-0 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-4">No hay reglas para esta cancha</td>
                    </tr>
                  ) : (
                    grupo.map((regla, idx) => (
                      <tr key={regla.id || idx} className="border-b last:border-b-0">
                        <td className="py-2 px-2">{regla.dia}</td>
                        <td className="px-2">{regla.apertura}</td>
                        <td className="px-2">{regla.cierre}</td>
                        <td className="px-2">{regla.duracion.toString()}</td>
                        <td className="px-2">{regla.fechaCreacion ? regla.fechaCreacion.toLocaleDateString() : '-'}</td>
                        <td className="px-0 text-center">
                          <button onClick={() => setReglas(reglas.filter(r => r.id !== regla.id))} className="text-red-500 hover:underline p-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        {/* --- MOBILE --- */}
        <div className="md:hidden flex flex-col gap-4">
          {Object.entries(reglasAgrupadas).map(([vigencia, grupo]) => (
            <div key={vigencia} className="mb-4 border rounded-lg p-3 bg-gray-50">
              <div className="font-semibold text-[#426a5a] mb-2">Vigencia desde: {vigencia}</div>
              {grupo.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No hay reglas para esta cancha</div>
              ) : (
                grupo.map((regla, idx) => (
                  <div key={regla.id || idx} className="flex flex-col gap-1 border-b last:border-b-0 pb-2 mb-2">
                    <div><span className="font-semibold text-[#426a5a]">Día:</span> {regla.dia}</div>
                    <div><span className="font-semibold text-[#426a5a]">Apertura:</span> {regla.apertura}</div>
                    <div><span className="font-semibold text-[#426a5a]">Cierre:</span> {regla.cierre}</div>
                    <div><span className="font-semibold text-[#426a5a]">Duración:</span> {regla.duracion} min</div>
                    <div><span className="font-semibold text-[#426a5a]">Fecha de creación:</span> {regla.fechaCreacion ? regla.fechaCreacion.toLocaleDateString() : '-'}</div>
                    <button onClick={() => setReglas(reglas.filter(r => r.id !== regla.id))} className="text-red-500 hover:underline p-0 mt-1 self-end">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Formulario para agregar/editar reglas */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Día</label>
          <select name="dia" value={nueva.dia} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2">
            <option value="Todos">Todos</option>
            {DIAS_ORDEN.map(dia => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Apertura</label>
          <input type="time" name="apertura" value={nueva.apertura} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2" min={minApertura} max={maxCierre} disabled={isClosed} />
        </div>
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Cierre</label>
          <input type="time" name="cierre" value={nueva.cierre} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2" min={minApertura} max={maxCierre} disabled={isClosed} />
        </div>
        <div>
          <label className="block text-[#426a5a] font-semibold mb-1">Duración</label>
          <select name="duracion" value={nueva.duracion} onChange={handleChange} className="rounded-lg border-[#7fb685] px-3 py-2 w-24" disabled={isClosed}>
            <option value="60">60 min</option>
            <option value="90">90 min</option>
          </select>
        </div>
        <button onClick={agregarRegla} className="bg-[#426a5a] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors" disabled={isClosed}>Agregar regla</button>
      </div>
      {isClosed && (
        <div className="mt-2 text-red-600 font-semibold">El complejo está cerrado ese día.</div>
      )}
    </div>
  );
}

export default function CanchaHorariosAdminClient({ sedes: initialSedes = [], canchas: initialCanchas = [], sports: initialSports = [] }: CanchaHorariosAdminClientProps) {
  const [sedes, setSedes] = useState<any[]>(initialSedes);
  const [selectedSede, setSelectedSede] = useState<string>(initialSedes[0]?.id || "");
  const [canchas, setCanchas] = useState<any[]>(initialCanchas);
  const [selected, setSelected] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", deporte: "", descripcion: "", reglas: [] });
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [sports, setSports] = useState<any[]>(initialSports);

  // 1. Estado para el modal de confirmación
  const [modalEliminar, setModalEliminar] = useState<{ open: boolean; canchaId: string | null }>({ open: false, canchaId: null });

  // Cargar sedes al inicio
  useEffect(() => {
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => {
        setSedes(data);
        if (data.length > 0) setSelectedSede(data[0].id);
      });
  }, []);

  // Cargar canchas de la sede seleccionada
  useEffect(() => {
    if (!selectedSede) return;
    fetch(`/api/facilities?locationId=${selectedSede}`)
      .then(res => res.json())
      .then(data => {
        setCanchas(
          data.map((c: any) => ({
            ...c,
            nombre: c.name || "",
            precio: c.price || 0,
            deporte: c.sport?.name || "",
            descripcion: c.description || "",
            reglas: (c.availability || []).map((a: any) => ({
              id: Date.now() + Math.random(),
              dia: a.dayOfWeek === null ? "Todos" : a.dayOfWeek === 7 ? "Feriados" : DIAS_ORDEN[a.dayOfWeek] || "Todos",
              apertura: a.openingTime ? new Date(a.openingTime).toISOString().slice(11, 16) : "08:00",
              cierre: a.closingTime ? new Date(a.closingTime).toISOString().slice(11, 16) : "23:00",
              duracion: a.slotDuration?.toString() || "60",
              updatedAt: a.updatedAt || null,
            })),
          }))
        );
      });
  }, [selectedSede]);

  // Cargar deportes al inicio
  useEffect(() => {
    fetch("/api/sports")
      .then(res => res.json())
      .then(data => setSports(data));
  }, []);

  // Edición de cancha seleccionada
  const cancha = canchas.find(c => c.id === selected);

  // Handlers CRUD
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!cancha) return;
    setCanchas(canchas.map(c => c.id === cancha.id ? { ...c, [e.target.name]: e.target.value } : c));
  };

  const setReglas = (reglas: any[]) => {
    if (!cancha) return;
    setCanchas(canchas.map(c => c.id === cancha.id ? { ...c, reglas } : c));
  };

  // Al crear o editar una cancha, busca el sportId a partir del nombre del deporte seleccionado
  const getSportIdByName = (sports: any[], name: string) => {
    const sport = sports.find(s => s.name === name);
    return sport ? sport.id : null;
  };

  // Validar que las reglas estén dentro del horario de la sede
  interface ReglaHorario {
    dia: string;
    apertura: string;
    cierre: string;
    duracion: string;
  }
  const validarReglasConHorarioDeSede = (reglas: ReglaHorario[], location: Location) => {
    if (!location || !location.schedules) return true;
    for (const regla of reglas) {
      if (regla.dia === "Todos") continue; // Puedes ajustar la lógica para "Todos" si lo deseas
      const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const idx = dias.indexOf(regla.dia);
      const schedule = location.schedules.find((s: LocationSchedule) => s.dayOfWeek === idx);
      if (!schedule || !schedule.isOpen) return false;
      if (regla.apertura < schedule.openingTime.slice(0,5) || regla.cierre > schedule.closingTime.slice(0,5)) {
        return false;
      }
    }
    return true;
  };

  const agregarCancha = async () => {
    const precio = Number(nuevo.precio);
    if (!nuevo.nombre || !nuevo.deporte || !nuevo.precio || precio <= 0 || !selectedSede) {
      setToast({ open: true, message: "Completa todos los campos requeridos (nombre, deporte, precio válido y sede)" });
      return;
    }
    const res = await fetch("/api/facilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nuevo.nombre,
        description: nuevo.descripcion,
        price: precio,
        sportName: nuevo.deporte,
        locationId: selectedSede,
      }),
    });
    if (res.ok) {
      setToast({ open: true, message: "Cancha agregada" });
      const data = await res.json();
      const nuevaCancha = {
        ...data,
        nombre: data.name,
        precio: data.price,
        deporte: data.sport?.name || "",
        descripcion: data.description || "",
        reglas: [],
      };
      setCanchas([...canchas, nuevaCancha]);
      setNuevo({ nombre: "", precio: "", deporte: "", descripcion: "", reglas: [] });
    } else {
      const errorText = await res.text();
      setToast({ open: true, message: `Error al agregar cancha: ${errorText}` });
    }
  };

  const eliminarCancha = async (id: string) => {
    const res = await fetch(`/api/facilities/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCanchas(canchas.filter(c => c.id !== id));
      setSelected(null);
      setToast({ open: true, message: "Cancha eliminada" });
    } else {
      setToast({ open: true, message: "Error al eliminar cancha" });
    }
  };

  const guardarCancha = async () => {
    if (!cancha) return;
    // Validación de reglas con horario de sede
    if (!validarReglasConHorarioDeSede(cancha.reglas, cancha.location)) {
      setToast({ open: true, message: "Hay reglas fuera del horario permitido por el complejo." });
      return;
    }
    const sportId = getSportIdByName(sports, cancha.deporte);
    if (!sportId) {
      setToast({ open: true, message: "Deporte no válido" });
      return;
    }
    const res = await fetch(`/api/facilities/${cancha.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cancha.nombre,
        description: cancha.descripcion,
        price: Number(cancha.precio),
        sportId,
        locationId: selectedSede,
      }),
    });
    if (res.ok) {
      for (const regla of cancha.reglas) {
        let dayOfWeek: number | null = null;
        if (regla.dia === "Todos") dayOfWeek = null;
        else if (regla.dia === "Feriados") dayOfWeek = 7; // Día 7 para feriados
        else dayOfWeek = DIAS_ORDEN.indexOf(regla.dia);
        await fetch("/api/facility-availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilityId: cancha.id,
            dayOfWeek,
            openingTime: regla.apertura,
            closingTime: regla.cierre,
            slotDuration: Number(regla.duracion),
          }),
        });
      }
      setToast({ open: true, message: "Cancha actualizada" });
    } else {
      const errorText = await res.text();
      setToast({ open: true, message: "Error al actualizar cancha" });
    }
  };

  // 1. Agrega la función guardarDatosCancha
  const guardarDatosCancha = async () => {
    if (!cancha) return;
    const sportId = getSportIdByName(sports, cancha.deporte);
    if (!sportId) {
      setToast({ open: true, message: "Deporte no válido" });
      return;
    }
    const res = await fetch(`/api/facilities/${cancha.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cancha.nombre,
        description: cancha.descripcion,
        price: Number(cancha.precio),
        sportId,
        locationId: selectedSede,
      }),
    });
    if (res.ok) {
      setToast({ open: true, message: "Datos de la cancha actualizados" });
    } else {
      const errorText = await res.text();
      setToast({ open: true, message: `Error al actualizar datos: ${errorText}` });
    }
  };

  // 2. Agrega la función guardarReglasCancha
  const guardarReglasCancha = async () => {
    if (!cancha) return;
    if (!validarReglasConHorarioDeSede(cancha.reglas, cancha.location)) {
      setToast({ open: true, message: "Hay reglas fuera del horario permitido por el complejo." });
      return;
    }
    for (const regla of cancha.reglas) {
      let dayOfWeek: number | null = null;
      if (regla.dia === "Todos") dayOfWeek = null;
      else if (regla.dia === "Feriados") dayOfWeek = 7;
      else dayOfWeek = DIAS_ORDEN.indexOf(regla.dia);
      await fetch("/api/facility-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: cancha.id,
          dayOfWeek,
          openingTime: regla.apertura,
          closingTime: regla.cierre,
          slotDuration: Number(regla.duracion),
        }),
      });
    }
    setToast({ open: true, message: "Reglas de horarios actualizadas" });
  };

  return (
    <>
      <AdminHeader />
      <div className="max-w-5xl mx-auto py-10">
        {/* Selector de sede */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#426a5a] mb-2">Seleccionar Sede</label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedSede}
            onChange={e => { setSelectedSede(e.target.value); setSelected(null); }}
          >
            {sedes.map(sede => (
              <option key={sede.id} value={sede.id}>{sede.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Panel izquierdo: lista de canchas */}
          <div className="w-full md:w-1/3 bg-white/90 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#426a5a] mb-4">Canchas del complejo</h2>
            <ul className="mb-4">
              {canchas.map(c => (
                <li key={c.id} className={`flex items-center justify-between mb-2 ${selected === c.id ? 'bg-[#f2c57c]/40' : ''} rounded-lg px-2 py-1`}>
                  <button onClick={() => setSelected(c.id)} className="text-left flex-1 text-[#426a5a] font-semibold">{c.name}</button>
                  <button onClick={() => setModalEliminar({ open: true, canchaId: c.id })} className="ml-2 text-red-500 hover:underline">Eliminar</button>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-bold text-[#426a5a] mb-2">Agregar nueva cancha</h3>
              <input type="text" name="nombre" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2" />
              <input type="number" name="precio" placeholder="Precio" value={nuevo.precio} onChange={e => setNuevo({ ...nuevo, precio: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2" />
              <select name="deporte" value={nuevo.deporte} onChange={e => setNuevo({ ...nuevo, deporte: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2">
                <option value="">Seleccionar deporte</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.name}>{sport.name}</option>
                ))}
              </select>
              <textarea name="descripcion" placeholder="Descripción" value={nuevo.descripcion} onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })} className="mb-2 w-full rounded-lg border-[#7fb685] px-3 py-2" />
              <button onClick={agregarCancha} className="w-full bg-[#426a5a] text-white font-bold py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors">Agregar cancha</button>
            </div>
          </div>
          {/* Panel derecho: edición de cancha */}
          <div className="w-full md:w-2/3 mt-8 md:mt-0">
            {cancha ? (
              <div className="bg-white/90 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-[#426a5a] mb-4">Editar cancha</h2>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#426a5a] font-semibold mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={cancha.nombre ?? ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[#7fb685] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[#426a5a] font-semibold mb-1">Precio</label>
                    <input
                      type="number"
                      name="precio"
                      value={cancha.precio ?? 0}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[#7fb685] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[#426a5a] font-semibold mb-1">Deporte</label>
                    <select
                      name="deporte"
                      value={cancha.deporte ?? ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[#7fb685] px-3 py-2"
                    >
                      <option value="">Seleccionar deporte</option>
                      {sports.map(sport => (
                        <option key={sport.id} value={sport.name}>{sport.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[#426a5a] font-semibold mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={cancha.descripcion ?? ""}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[#7fb685] px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <button onClick={guardarDatosCancha} className="bg-[#426a5a] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors">Guardar datos</button>
                </div>
                <ReglasHorarios reglas={cancha.reglas || []} setReglas={setReglas} location={cancha.location} />
                <div className="flex justify-end mt-4">
                  <button onClick={guardarReglasCancha} className="bg-[#426a5a] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors">Guardar reglas</button>
                </div>
              </div>
            ) : (
              <div className="text-[#426a5a] text-lg">Selecciona una cancha para editar sus datos y reglas de horarios.</div>
            )}
          </div>
        </div>
        {/* Aviso de vigencia de cambios al final */}
        <div className="mt-10 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <strong>Aviso:</strong> Los cambios en las reglas de horarios y la creación o edición de canchas entran en vigencia a partir de los <b>7 días</b> de su modificación.
                Al eliminar reglas por favor siempre agregar una nueva regla con el mismo día.
                Para reflejar si un día está cerrado, por favor agregar una regla con el mismo día y apertura y cierre a la misma hora.
        </div>
        {modalEliminar.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
      <h3 className="text-lg font-bold text-red-600 mb-4 text-center">Confirmar eliminación</h3>
      <p className="mb-6 text-gray-700 text-center">
        ¿Estás seguro de que quieres eliminar esta cancha? Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-center gap-2 w-full">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          onClick={() => setModalEliminar({ open: false, canchaId: null })}
        >
          Cancelar
        </button>
        <button
          className="px-4 py-2 rounded font-bold bg-red-500 text-white hover:bg-red-600"
          onClick={async () => {
            if (modalEliminar.canchaId) {
              await eliminarCancha(modalEliminar.canchaId);
            }
            setModalEliminar({ open: false, canchaId: null });
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}
        <Toast open={toast.open} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
      </div>
    </>
  );
} 