"use client";
import { useState, useEffect, Fragment } from "react";
import { Toast } from "./Toast";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdminHeader } from "./Header";
import { CloudinaryUpload } from "./CloudinaryUpload";
import type { Location, LocationSchedule } from '@/lib/types';
import { DAYS_OF_WEEK } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function EditarComplejoClient({ locations: initialLocations }: { locations: Location[] }) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocations[0] || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    services: [] as string[],
    schedules: DAYS_OF_WEEK.map((_, i) => ({
      id: `new-${i}`,
      dayOfWeek: i,
      isOpen: false,
      openingTime: new Date(new Date().setHours(8,0,0,0)).toISOString(),
      closingTime: new Date(new Date().setHours(20,0,0,0)).toISOString(),
    })),
    images: [] as { id: string; link: string }[],
  });
  const [newService, setNewService] = useState('');
  const [newServiceCreate, setNewServiceCreate] = useState('');
  const [newHourInputs, setNewHourInputs] = useState<{ [key: string]: { open: string; close: string } }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({ open: false, message: "" });
  const [editingSchedules, setEditingSchedules] = useState<LocationSchedule[]>(selectedLocation?.schedules ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: selectedLocation?.name || "",
    address: selectedLocation?.address || "",
    phone: selectedLocation?.phone || "",
    description: selectedLocation?.description || ""
  });
  const [hourInputs, setHourInputs] = useState<{ [key: string]: { open: string; close: string } }>({});
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<{ link: string }[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (selectedLocation) {
      setEditingSchedules(selectedLocation.schedules ?? []);
      setEditedInfo({
        name: selectedLocation.name,
        address: selectedLocation.address,
        phone: selectedLocation.phone,
        description: selectedLocation.description || ""
      });
    }
  }, [selectedLocation]);

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

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleLocationChange = (locationId: string) => {
    if (locationId === 'create') {
      setIsCreating(true);
      setSelectedLocation(null);
      setNewLocation({
        name: '',
        address: '',
        phone: '',
        description: '',
        services: [],
        schedules: DAYS_OF_WEEK.map((_, i) => ({
          id: `new-${i}`,
          dayOfWeek: i,
          isOpen: false,
          openingTime: new Date(new Date().setHours(8,0,0,0)).toISOString(),
          closingTime: new Date(new Date().setHours(20,0,0,0)).toISOString(),
        })),
        images: [],
      });
      setNewHourInputs({});
    } else {
      setIsCreating(false);
      const location = locations.find(loc => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
        setEditingSchedules(location.schedules ?? []);
        setEditedInfo({
          name: location.name,
          address: location.address,
          phone: location.phone,
          description: location.description || ""
        });
        setIsEditing(false);
      }
    }
  };

  const handleAddService = () => {
    if (!selectedLocation || !newService.trim()) return;
    const updatedServices = [...(selectedLocation.services ?? []), newService.trim()];
    setSelectedLocation({ ...selectedLocation, services: updatedServices });
    setNewService("");
  };

  const handleRemoveService = (serviceToRemove: string) => {
    if (!selectedLocation) return;
    const updatedServices = (selectedLocation.services ?? []).filter(service => service !== serviceToRemove);
    setSelectedLocation({ ...selectedLocation, services: updatedServices });
  };

  const handleDeleteImage = async (imageId: string) => {
    setImageToDelete(imageId);
    setShowDeleteModal(true);
  };

  const confirmDeleteImage = async () => {
    if (!selectedLocation || !imageToDelete) return;
    try {
      const response = await fetch(`/api/images?id=${imageToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la imagen');
      }
      const updatedImages = (selectedLocation.images ?? []).filter(img => img.id !== imageToDelete);
      setSelectedLocation({ ...selectedLocation, images: updatedImages });
      setToast({ open: true, message: 'Imagen eliminada exitosamente' });
    } catch (error) {
      setToast({ open: true, message: error instanceof Error ? error.message : 'Error al eliminar la imagen' });
    } finally {
      setShowDeleteModal(false);
      setImageToDelete(null);
    }
  };

  const cancelDeleteImage = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
  };

  const handleSaveInfo = async () => {
    if (!selectedLocation) return;
    try {
      const response = await fetch(`/api/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editedInfo.name,
          address: editedInfo.address,
          phone: editedInfo.phone,
          description: editedInfo.description,
        }),
      });
      if (!response.ok) throw new Error('Error al guardar la información general');
      const updatedLocation = await response.json();
      setLocations(locations.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
      setSelectedLocation(updatedLocation);
      setToast({ open: true, message: 'Información general guardada' });
    } catch (err) {
      setToast({ open: true, message: err instanceof Error ? err.message : 'Error al guardar' });
    }
  };

  const handleSaveServices = async () => {
    if (!selectedLocation) return;
    try {
      const response = await fetch(`/api/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: selectedLocation.services }),
      });
      if (!response.ok) throw new Error('Error al guardar los servicios');
      const updatedLocation = await response.json();
      setLocations(locations.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
      setSelectedLocation(updatedLocation);
      setToast({ open: true, message: 'Servicios guardados' });
    } catch (err) {
      setToast({ open: true, message: err instanceof Error ? err.message : 'Error al guardar' });
    }
  };

  const handleSaveSchedules = async () => {
    if (!selectedLocation) return;
    try {
      const invalidSchedules = editingSchedules.filter(schedule => {
        if (!schedule.isOpen) return false;
        const opening = new Date(schedule.openingTime);
        const closing = new Date(schedule.closingTime);
        return opening >= closing;
      });
      if (invalidSchedules.length > 0) {
        setToast({ open: true, message: 'Los horarios de cierre deben ser posteriores a los de apertura' });
        return;
      }
      const response = await fetch(`/api/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedules: editingSchedules.map(schedule => ({
            dayOfWeek: schedule.dayOfWeek,
            isOpen: schedule.isOpen,
            openingTime: schedule.openingTime,
            closingTime: schedule.closingTime
          }))
        }),
      });
      if (!response.ok) throw new Error('Error al guardar los horarios');
      const updatedLocation = await response.json();
      setLocations(locations.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
      setSelectedLocation(updatedLocation);
      setEditingSchedules(updatedLocation.schedules ?? []);
      setToast({ open: true, message: 'Horarios guardados' });
    } catch (err) {
      setToast({ open: true, message: err instanceof Error ? err.message : 'Error al guardar' });
    }
  };

  const handleAddServiceCreate = () => {
    if (!newServiceCreate.trim()) return;
    setNewLocation({ ...newLocation, services: [...newLocation.services, newServiceCreate.trim()] });
    setNewServiceCreate('');
  };

  const handleRemoveServiceCreate = (serviceToRemove: string) => {
    setNewLocation({ ...newLocation, services: newLocation.services.filter(service => service !== serviceToRemove) });
  };

  const handleSaveNewLocation = async () => {
    try {
      const invalidSchedules = newLocation.schedules.filter(schedule => {
        if (!schedule.isOpen) return false;
        const opening = new Date(schedule.openingTime);
        const closing = new Date(schedule.closingTime);
        return opening >= closing;
      });
      if (invalidSchedules.length > 0) {
        setToast({ open: true, message: "Los horarios de cierre deben ser posteriores a los de apertura" });
        return;
      }
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocation.name,
          address: newLocation.address,
          phone: newLocation.phone,
          description: newLocation.description,
          services: newLocation.services,
          schedules: newLocation.schedules.map(s => ({
            dayOfWeek: s.dayOfWeek,
            isOpen: s.isOpen,
            openingTime: s.openingTime,
            closingTime: s.closingTime
          })),
        }),
      });
      if (!response.ok) throw new Error('Error al crear la sede');
      const created = await response.json();
      setLocations([...locations, created]);
      setSelectedLocation(created);
      setIsCreating(false);
      setToast({ open: true, message: 'Sede creada exitosamente' });
    } catch (err) {
      setToast({ open: true, message: err instanceof Error ? err.message : 'Error al crear la sede' });
    }
  };

  const handleSaveImage = async (imgLink: string) => {
    if (!selectedLocation?.id) return;
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: imgLink, locationId: selectedLocation.id }),
      });
      if (!res.ok) throw new Error('Error al guardar la imagen');
      setPendingImages(imgs => imgs.filter(img => img.link !== imgLink));
      setToast({ open: true, message: 'Imagen guardada correctamente' });
      router.refresh();

      // Fetch location actualizado
      const updatedRes = await fetch(`/api/locations/${selectedLocation.id}`);
      if (updatedRes.ok) {
        const updatedLocation = await updatedRes.json();
        setSelectedLocation(updatedLocation);
        setLocations(locs =>
          locs.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc)
        );
      }
    } catch (err) {
      setToast({ open: true, message: err instanceof Error ? err.message : 'Error al guardar la imagen' });
    }
  };

  // Renderizado
  return (
    <Fragment>
      <AdminHeader />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-[#426a5a]">Editar Complejo</h1>
        {/* Selector de complejo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar complejo</label>
          <select
            value={selectedLocation?.id || ''}
            onChange={e => handleLocationChange(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        {/* Accordion: Información general */}
        <div className="mb-4 border rounded-lg">
          <button className="w-full text-left px-4 py-3 font-semibold text-[#426a5a] bg-[#f5f5f5] rounded-t-lg focus:outline-none" onClick={() => setOpenSection(openSection === 'info' ? null : 'info')}>
            Información general
          </button>
          {openSection === 'info' && (
            <div className="p-4 bg-white rounded-b-lg">
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
                    <p className="font-medium">{selectedLocation?.name}</p>
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
                    <p className="font-medium">{selectedLocation?.address}</p>
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
                    <p className="font-medium">{selectedLocation?.phone}</p>
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
                    <p className="font-medium">{selectedLocation?.description || "Sin descripción"}</p>
                  )}
                </div>
              </div>
              <button onClick={handleSaveInfo} className="mt-4 px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors">Guardar cambios</button>
            </div>
          )}
        </div>
        {/* Accordion: Servicios */}
        <div className="mb-4 border rounded-lg">
          <button className="w-full text-left px-4 py-3 font-semibold text-[#426a5a] bg-[#f5f5f5] rounded-t-lg focus:outline-none" onClick={() => setOpenSection(openSection === 'servicios' ? null : 'servicios')}>
            Servicios
          </button>
          {openSection === 'servicios' && (
            <div className="p-4 bg-white rounded-b-lg">
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
                {(selectedLocation?.services ?? []).map((service, index) => (
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
              <button onClick={handleSaveServices} className="mt-4 px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors">Guardar cambios</button>
            </div>
          )}
        </div>
        {/* Accordion: Horarios */}
        <div className="mb-4 border rounded-lg">
          <button className="w-full text-left px-4 py-3 font-semibold text-[#426a5a] bg-[#f5f5f5] rounded-t-lg focus:outline-none" onClick={() => setOpenSection(openSection === 'horarios' ? null : 'horarios')}>
            Horarios
          </button>
          {openSection === 'horarios' && (
            <div className="p-4 bg-white rounded-b-lg">
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
              <button onClick={handleSaveSchedules} className="mt-4 px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors">Guardar cambios</button>
            </div>
          )}
        </div>
        {/* Accordion: Imágenes */}
        <div className="mb-4 border rounded-lg">
          <button className="w-full text-left px-4 py-3 font-semibold text-[#426a5a] bg-[#f5f5f5] rounded-t-lg focus:outline-none" onClick={() => setOpenSection(openSection === 'imagenes' ? null : 'imagenes')}>
            Imágenes
          </button>
          {openSection === 'imagenes' && (
            <div className="p-4 bg-white rounded-b-lg">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Subir Nueva Imagen</h3>
                <CloudinaryUpload
                  locationId={selectedLocation?.id || ""}
                  onUploadSuccess={(link) => {
                    setPendingImages(imgs => [...imgs, { link }]);
                  }}
                  onUploadError={msg =>
                    setToast({ open: true, message: msg || 'Error al subir la imagen' })
                  }
                />
              </div>
              {pendingImages.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-md font-medium text-gray-700">Imágenes pendientes de guardar</h3>
                  {pendingImages.map((img, i) => (
                    <div key={i} className="flex items-center gap-4 bg-yellow-50 p-2 rounded">
                      <img src={img.link} alt="Pendiente" className="h-20 w-32 object-cover rounded" />
                      <button
                        onClick={() => handleSaveImage(img.link)}
                        className="px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors"
                      >
                        Guardar imagen
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {selectedLocation && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-700">Imágenes Actuales</h3>
                  {(selectedLocation.images && selectedLocation.images.length > 0) ? (
                    selectedLocation.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.link}
                          alt={`Imagen de ${selectedLocation.name}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Eliminar imagen"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic py-8 text-center">No hay imágenes disponibles</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ ...toast, open: false })} />
      {/* Modal de confirmación para eliminar imagen */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">¿Eliminar imagen?</h2>
            <p className="mb-6 text-gray-600">¿Estás seguro que deseas eliminar esta imagen? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDeleteImage}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteImage}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
} 