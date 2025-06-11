"use client";
import { useState, useEffect } from "react";
import { Toast } from "../../ui/Toast";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface LocationSchedule {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  services: string[];
  schedules: LocationSchedule[];
  images: { id: string; link: string }[];
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];

export default function EditarComplejo() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [newService, setNewService] = useState("");
  const [editingSchedules, setEditingSchedules] = useState<LocationSchedule[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: "",
    address: "",
    phone: "",
    description: ""
  });
  const [hourInputs, setHourInputs] = useState<{ [key: string]: { open: string; close: string } }>({});

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const initial: { [key: string]: { open: string; close: string } } = {};
    [...DAYS_OF_WEEK, 'Feriado'].forEach((_, i) => {
      const s = editingSchedules.find(sch => sch.dayOfWeek === i);
      initial[i] = {
        open: s && s.openingTime ? format(parseISO(s.openingTime), 'HH:mm') : '08:00',
        close: s && s.closingTime ? format(parseISO(s.closingTime), 'HH:mm') : '20:00',
      };
    });
    setHourInputs(initial);
  }, [editingSchedules]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      if (!response.ok) throw new Error('Error al cargar las sedes');
      const data = await response.json();
      setLocations(data);
      if (data.length > 0) {
        const firstLocation = data[0];
        setSelectedLocation(firstLocation);
        setEditingSchedules(firstLocation.schedules);
        setEditedInfo({
          name: firstLocation.name,
          address: firstLocation.address,
          phone: firstLocation.phone,
          description: firstLocation.description || ""
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
      setEditingSchedules(location.schedules);
      setEditedInfo({
        name: location.name,
        address: location.address,
        phone: location.phone,
        description: location.description || ""
      });
      setIsEditing(false);
    }
  };

  const handleAddService = () => {
    if (!selectedLocation || !newService.trim()) return;
    
    const updatedServices = [...selectedLocation.services, newService.trim()];
    setSelectedLocation({ ...selectedLocation, services: updatedServices });
    setNewService("");
  };

  const handleRemoveService = (serviceToRemove: string) => {
    if (!selectedLocation) return;
    
    const updatedServices = selectedLocation.services.filter(service => service !== serviceToRemove);
    setSelectedLocation({ ...selectedLocation, services: updatedServices });
  };

  const handleScheduleChange = (index: number, field: keyof LocationSchedule, value: any) => {
    const updatedSchedules = [...editingSchedules];
    if (field === 'openingTime' || field === 'closingTime') {
      // Asegurarse de que la fecha se maneje correctamente
      const date = new Date();
      const [hours, minutes] = value.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      updatedSchedules[index] = { ...updatedSchedules[index], [field]: date.toISOString() };
    } else {
      updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    }
    setEditingSchedules(updatedSchedules);
  };

  const handleAddSchedule = () => {
    const now = new Date();
    const newSchedule: LocationSchedule = {
      id: `temp-${Date.now()}`,
      dayOfWeek: 0,
      isOpen: true,
      openingTime: new Date(now.setHours(8, 0, 0, 0)).toISOString(),
      closingTime: new Date(now.setHours(20, 0, 0, 0)).toISOString()
    };
    setEditingSchedules([...editingSchedules, newSchedule]);
  };

  const handleRemoveSchedule = (index: number) => {
    const updatedSchedules = editingSchedules.filter((_, i) => i !== index);
    setEditingSchedules(updatedSchedules);
  };

  const handleSave = async () => {
    if (!selectedLocation) return;

    try {
      // Validar que los horarios sean válidos
      const invalidSchedules = editingSchedules.filter(schedule => {
        if (!schedule.isOpen) return false;
        const opening = new Date(schedule.openingTime);
        const closing = new Date(schedule.closingTime);
        return opening >= closing;
      });

      if (invalidSchedules.length > 0) {
        setToast({
          open: true,
          message: "Los horarios de cierre deben ser posteriores a los de apertura"
        });
        return;
      }

      // Preparar los datos para enviar
      const updateData = {
        name: editedInfo.name,
        address: editedInfo.address,
        phone: editedInfo.phone,
        description: editedInfo.description,
        services: selectedLocation.services,
        schedules: editingSchedules.map(schedule => ({
          dayOfWeek: schedule.dayOfWeek,
          isOpen: schedule.isOpen,
          openingTime: schedule.openingTime,
          closingTime: schedule.closingTime
        }))
      };

      console.log('Enviando datos:', updateData); // Para debugging

      const response = await fetch(`/api/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar los cambios');
      }

      const updatedLocation = await response.json();
      setLocations(locations.map(loc => 
        loc.id === updatedLocation.id ? updatedLocation : loc
      ));
      setSelectedLocation(updatedLocation);
      setEditingSchedules(updatedLocation.schedules);
      setIsEditing(false);
      
      setToast({
        open: true,
        message: "Cambios guardados exitosamente"
      });
    } catch (err) {
      console.error('Error al guardar:', err);
      setToast({
        open: true,
        message: err instanceof Error ? err.message : "Error al guardar los cambios"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando sedes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-[#426a5a]">Editar Complejo</h1>

      {/* Selector de Sede */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Sede
        </label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedLocation?.id || ""}
          onChange={(e) => handleLocationChange(e.target.value)}
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {selectedLocation && (
        <div className="space-y-6">
          {/* Información General */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#426a5a]">Información General</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#426a5a] text-white rounded-md hover:bg-[#2d4a3e]"
              >
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedInfo.name}
                    onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                ) : (
                  <p className="font-medium">{selectedLocation.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedInfo.address}
                    onChange={(e) => setEditedInfo({ ...editedInfo, address: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                ) : (
                  <p className="font-medium">{selectedLocation.address}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedInfo.phone}
                    onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                ) : (
                  <p className="font-medium">{selectedLocation.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                {isEditing ? (
                  <textarea
                    value={editedInfo.description}
                    onChange={(e) => setEditedInfo({ ...editedInfo, description: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                ) : (
                  <p className="font-medium">{selectedLocation.description || "Sin descripción"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Servicios */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[#426a5a]">Servicios</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Nuevo servicio"
                  className="flex-1 p-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                />
                <button
                  onClick={handleAddService}
                  className="px-4 py-2 bg-[#426a5a] text-white rounded-md hover:bg-[#2d4a3e]"
                >
                  Agregar
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLocation.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{service}</span>
                  <button
                    onClick={() => handleRemoveService(service)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-[#426a5a]">Horarios</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Día</th>
                    <th className="p-2 border">Abierto</th>
                    <th className="p-2 border">Hora Apertura</th>
                    <th className="p-2 border">Hora Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS_OF_WEEK.map((day, i) => {
                    const schedule = editingSchedules.find(s => s.dayOfWeek === i) || {
                      id: `temp-${i}`,
                      dayOfWeek: i,
                      isOpen: false,
                      openingTime: new Date(new Date().setHours(8,0,0,0)).toISOString(),
                      closingTime: new Date(new Date().setHours(20,0,0,0)).toISOString()
                    };
                    return (
                      <tr key={i}>
                        <td className="p-2 border font-medium">{day}</td>
                        <td className="p-2 border">
                          <input
                            type="checkbox"
                            checked={schedule.isOpen}
                            onChange={e => {
                              const updated = [...editingSchedules];
                              const idx = updated.findIndex(s => s.dayOfWeek === i);
                              if (idx !== -1) {
                                updated[idx].isOpen = e.target.checked;
                              } else {
                                updated.push({ ...schedule, isOpen: e.target.checked });
                              }
                              setEditingSchedules(updated);
                            }}
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={hourInputs[i]?.open || ''}
                            disabled={!schedule.isOpen}
                            onChange={e => {
                              setHourInputs({ ...hourInputs, [i]: { ...hourInputs[i], open: e.target.value } });
                            }}
                            onBlur={e => {
                              const value = e.target.value;
                              if (/^\d{2}:\d{2}$/.test(value)) {
                                const updated = [...editingSchedules];
                                const idx = updated.findIndex(s => s.dayOfWeek === i);
                                if (idx !== -1) {
                                  const date = new Date(schedule.openingTime || new Date());
                                  const [h, m] = value.split(':');
                                  date.setHours(parseInt(h), parseInt(m));
                                  updated[idx].openingTime = date.toISOString();
                                } else {
                                  const now = new Date();
                                  const [h, m] = value.split(':');
                                  now.setHours(parseInt(h), parseInt(m));
                                  updated.push({ ...schedule, openingTime: now.toISOString() });
                                }
                                setEditingSchedules(updated);
                              }
                            }}
                            placeholder="HH:mm"
                            maxLength={5}
                            className="w-20 p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={hourInputs[i]?.close || ''}
                            disabled={!schedule.isOpen}
                            onChange={e => {
                              setHourInputs({ ...hourInputs, [i]: { ...hourInputs[i], close: e.target.value } });
                            }}
                            onBlur={e => {
                              const value = e.target.value;
                              if (/^\d{2}:\d{2}$/.test(value)) {
                                const updated = [...editingSchedules];
                                const idx = updated.findIndex(s => s.dayOfWeek === i);
                                if (idx !== -1) {
                                  const date = new Date(schedule.closingTime || new Date());
                                  const [h, m] = value.split(':');
                                  date.setHours(parseInt(h), parseInt(m));
                                  updated[idx].closingTime = date.toISOString();
                                } else {
                                  const now = new Date();
                                  const [h, m] = value.split(':');
                                  now.setHours(parseInt(h), parseInt(m));
                                  updated.push({ ...schedule, closingTime: now.toISOString() });
                                }
                                setEditingSchedules(updated);
                              }
                            }}
                            placeholder="HH:mm"
                            maxLength={5}
                            className="w-20 p-1 border rounded text-center"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {/* Feriado */}
                  <tr>
                    <td className="p-2 border font-medium">Feriado</td>
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={!!editingSchedules.find(s => s.dayOfWeek === 7)?.isOpen}
                        onChange={e => {
                          const updated = [...editingSchedules];
                          const idx = updated.findIndex(s => s.dayOfWeek === 7);
                          if (idx !== -1) {
                            updated[idx].isOpen = e.target.checked;
                          } else {
                            updated.push({ id: 'temp-7', dayOfWeek: 7, isOpen: e.target.checked, openingTime: new Date().toISOString(), closingTime: new Date().toISOString() });
                          }
                          setEditingSchedules(updated);
                        }}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={hourInputs[7]?.open || ''}
                        disabled={!editingSchedules.find(s => s.dayOfWeek === 7)?.isOpen}
                        onChange={e => {
                          setHourInputs({ ...hourInputs, 7: { ...hourInputs[7], open: e.target.value } });
                        }}
                        onBlur={e => {
                          const value = e.target.value;
                          if (/^\d{2}:\d{2}$/.test(value)) {
                            const updated = [...editingSchedules];
                            const idx = updated.findIndex(s => s.dayOfWeek === 7);
                            if (idx !== -1) {
                              const date = new Date(editingSchedules[idx].openingTime || new Date());
                              const [h, m] = value.split(':');
                              date.setHours(parseInt(h), parseInt(m));
                              updated[idx].openingTime = date.toISOString();
                            } else {
                              const now = new Date();
                              const [h, m] = value.split(':');
                              now.setHours(parseInt(h), parseInt(m));
                              updated.push({ id: 'temp-7', dayOfWeek: 7, isOpen: true, openingTime: now.toISOString(), closingTime: now.toISOString() });
                            }
                            setEditingSchedules(updated);
                          }
                        }}
                        placeholder="HH:mm"
                        maxLength={5}
                        className="w-20 p-1 border rounded text-center"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={hourInputs[7]?.close || ''}
                        disabled={!editingSchedules.find(s => s.dayOfWeek === 7)?.isOpen}
                        onChange={e => {
                          setHourInputs({ ...hourInputs, 7: { ...hourInputs[7], close: e.target.value } });
                        }}
                        onBlur={e => {
                          const value = e.target.value;
                          if (/^\d{2}:\d{2}$/.test(value)) {
                            const updated = [...editingSchedules];
                            const idx = updated.findIndex(s => s.dayOfWeek === 7);
                            if (idx !== -1) {
                              const date = new Date(editingSchedules[idx].closingTime || new Date());
                              const [h, m] = value.split(':');
                              date.setHours(parseInt(h), parseInt(m));
                              updated[idx].closingTime = date.toISOString();
                            } else {
                              const now = new Date();
                              const [h, m] = value.split(':');
                              now.setHours(parseInt(h), parseInt(m));
                              updated.push({ id: 'temp-7', dayOfWeek: 7, isOpen: true, openingTime: now.toISOString(), closingTime: now.toISOString() });
                            }
                            setEditingSchedules(updated);
                          }
                        }}
                        placeholder="HH:mm"
                        maxLength={5}
                        className="w-20 p-1 border rounded text-center"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#426a5a] text-white rounded-md hover:bg-[#2d4a3e]"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      )}

      <Toast 
        open={toast.open} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, open: false })} 
      />
    </div>
  );
} 