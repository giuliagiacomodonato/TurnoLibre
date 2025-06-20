"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "@/app/ui/Toast";
import { useSession } from "next-auth/react";
import { AdminHeader } from "../../ui/Header";

type Facility = {
  id: string;
  name: string;
  sport: {
    name: string;
  };
  availability?: {
    dayOfWeek: number;
    openingTime: string;
    closingTime: string;
    slotDuration: number;
  }[];
};

type Reservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  facility: Facility;
};

type Availability = {
  [date: string]: {
    [facilityId: string]: {
      time: string;
      available: boolean;
      reason?: string;
    }[];
  };
};

// Auxiliar para obtener fecha local YYYY-MM-DD
function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Auxiliar para obtener minutos desde medianoche local
function getMinutesFromTimeString(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Utilidad para convertir string UTC a Date local
function utcToLocal(dateString: string) {
  const utcDate = new Date(dateString);
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  );
}

export default function EditarDisponibilidad() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availability, setAvailability] = useState<Availability>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    facilityId: string;
    time: string;
    isCurrentlyBlocked: boolean;
    reason: string;
  }>({ open: false, facilityId: "", time: "", isCurrentlyBlocked: false, reason: "" });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "ADMIN") {
      router.replace("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!session || (session.user as any).role !== "ADMIN") return;
    
    const fetchFacilities = async () => {
      try {
        const res = await fetch('/api/facilities');
        const data = await res.json();
        setFacilities(data);
        if (data.length > 0) {
          setSelectedFacility(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
      }
    };

    fetchFacilities();
  }, [session]);

  useEffect(() => {
    if (!session || (session.user as any).role !== "ADMIN" || !selectedFacility) return;
    
    setSelectedDate(getLocalDateString(new Date()));
    generateAvailability();
  }, [selectedFacility, session]);

  useEffect(() => {
    if (!session || (session.user as any).role !== "ADMIN" || !selectedFacility || !selectedDate) return;
    
    generateAvailability();
  }, [selectedFacility, selectedDate, session]);

  // Early return after all hooks
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }

  const generateAvailability = async () => {
    const newAvailability: Availability = {};
    // Buscar la cancha seleccionada
    const facility = facilities.find(f => f.id === selectedFacility);
    if (!facility || !facility.availability) return;

    // Usar selectedDate como base local a las 12:00 para evitar desfases
    const [year, month, day] = selectedDate.split('-').map(Number);
    const base = new Date(year, month - 1, day, 12, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      const dateString = getLocalDateString(date);
      newAvailability[dateString] = {};

      // Obtener availability para ese día
      const dayOfWeek = date.getDay();
      const avail = (facility.availability || []).find((a) => a.dayOfWeek === dayOfWeek);
      if (!avail) {
        newAvailability[dateString][selectedFacility] = [];
        continue;
      }
      const opening = utcToLocal(avail.openingTime);
      const closing = utcToLocal(avail.closingTime);
      const slotDuration = avail.slotDuration;
      // Generar slots dinámicamente
      const timeSlots: string[] = [];
      let current = new Date(opening.getTime());
      while (current < closing) {
        timeSlots.push(current.toTimeString().slice(0,5));
        current = new Date(current.getTime() + slotDuration * 60000);
      }

      try {
        const res = await fetch(`/api/availability/blocks?date=${dateString}&facilityId=${selectedFacility}`);
        let blocks = await res.json();
        if (!Array.isArray(blocks)) blocks = [];
        // DEBUG: Log de bloques y slots
        console.log('Bloques recibidos para', dateString, selectedFacility, (blocks as Reservation[]).map((b: Reservation) => ({startTime: b.startTime, status: b.status})));
        console.log('Slots generados para', dateString, timeSlots);

        newAvailability[dateString][selectedFacility] = timeSlots.map(slot => {
          const slotMinutes = getMinutesFromTimeString(slot);
          const blockedReservation = blocks.find((block: any) => {
            // Solo considerar bloqueos con status BLOCKED
            if (block.status !== "BLOCKED") return false;
            const blockStart = new Date(block.startTime);
            const blockHour = blockStart.getHours();
            const blockMinute = blockStart.getMinutes();
            const blockMinutes = blockHour * 60 + blockMinute;
            return blockMinutes === slotMinutes;
          });
          
          return { 
            time: slot,
            available: !blockedReservation,
            reason: blockedReservation?.reason || undefined
          };
        });
      } catch (error) {
        console.error('Error fetching blocks:', error);
        newAvailability[dateString][selectedFacility] = timeSlots.map(time => ({
          time,
          available: true
        }));
      }
    }

    setAvailability(newAvailability);
  };

  const handlePreviousDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() - 1);
    const previousDateString = getLocalDateString(currentDate);
    if (previousDateString >= getLocalDateString(new Date())) {
      setSelectedDate(previousDateString);
    }
  };

  const handleNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day, 12, 0, 0, 0);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateString = getLocalDateString(currentDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (nextDateString <= getLocalDateString(maxDate)) {
      setSelectedDate(nextDateString);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const handleSlotClick = (facilityId: string, time: string, isCurrentlyBlocked: boolean) => {
    setConfirmModal({ open: true, facilityId, time, isCurrentlyBlocked, reason: "" });
  };

  const handleConfirm = async () => {
    const { facilityId, time, isCurrentlyBlocked, reason } = confirmModal;
    const action = isCurrentlyBlocked ? 'desbloquear' : 'bloquear';
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(hours + 1, minutes, 0, 0);

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facilityId,
          date: selectedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isBlocked: !isCurrentlyBlocked,
          reason: !isCurrentlyBlocked ? reason : undefined, // Only send reason when blocking
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la disponibilidad');
      }

      await generateAvailability();
      setToastMessage(`Horario ${time} ${action === 'bloquear' ? 'bloqueado' : 'desbloqueado'} con éxito.`);
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al actualizar la disponibilidad.');
      setShowToast(true);
    } finally {
      setConfirmModal({ open: false, facilityId: "", time: "", isCurrentlyBlocked: false, reason: "" });
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-[#426a5a]">
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h1 className="text-2xl font-bold text-[#426a5a] mb-6">Editar Disponibilidad</h1>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#426a5a] mb-2">
                Cancha
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#426a5a] focus:border-transparent"
              >
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.sport.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selector */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={handlePreviousDay}
                className="p-2 rounded-lg hover:bg-[#7fb685]/20 transition-colors"
                title="Día anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#426a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-xl font-bold text-[#426a5a] capitalize">
                {formatDate(selectedDate)}
              </h2>

              <button
                onClick={handleNextDay}
                className="p-2 rounded-lg hover:bg-[#7fb685]/20 transition-colors"
                title="Día siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#426a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Timeline Grid */}
            <div className="overflow-x-auto">
              <div className="w-full min-w-[800px]">
                {/* Time Headers dinámicos */}
                <div className="grid grid-cols-[200px_repeat(36,minmax(4rem,1fr))] gap-1 text-center mb-4">
                  <div className="col-span-1 font-bold text-[#426a5a]">Horario</div>
                  {(() => {
                    const facility = facilities.find(f => f.id === selectedFacility);
                    if (!facility || !facility.availability) return null;
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    const dayOfWeek = dateObj.getDay();
                    const avail = (facility.availability || []).find((a) => a.dayOfWeek === dayOfWeek);
                    if (!avail) return null;
                    const opening = utcToLocal(avail.openingTime);
                    const closing = utcToLocal(avail.closingTime);
                    const slotDuration = avail.slotDuration;
                    const headers = [];
                    let current = new Date(opening.getTime());
                    while (current < closing) {
                      headers.push(current.toTimeString().slice(0,5));
                      current = new Date(current.getTime() + slotDuration * 60000);
                    }
                    return headers.map(time => (
                      <div key={time} className="font-bold text-[#426a5a] w-full">
                        {time}
                      </div>
                    ));
                  })()}
                </div>
                {/* Time Slots dinámicos */}
                <div className="grid grid-cols-[200px_repeat(36,minmax(4rem,1fr))] gap-1 items-center">
                  <div className="text-sm font-semibold text-[#426a5a] pr-2">
                    {facilities.find(f => f.id === selectedFacility)?.name}
                  </div>
                  {(() => {
                    const facility = facilities.find(f => f.id === selectedFacility);
                    if (!facility || !facility.availability) return null;
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    const dayOfWeek = dateObj.getDay();
                    const avail = (facility.availability || []).find((a) => a.dayOfWeek === dayOfWeek);
                    if (!avail) return null;
                    const opening = utcToLocal(avail.openingTime);
                    const closing = utcToLocal(avail.closingTime);
                    const slotDuration = avail.slotDuration;
                    const slots = [];
                    let current = new Date(opening.getTime());
                    while (current < closing) {
                      slots.push(current.toTimeString().slice(0,5));
                      current = new Date(current.getTime() + slotDuration * 60000);
                    }
                    return slots.map(time => {
                      const slotObj = availability[selectedDate]?.[selectedFacility]?.find(s => s.time === time);
                      const tooltipText = slotObj?.available 
                        ? `${time} - Disponible`
                        : slotObj?.reason 
                          ? `${time} - Bloqueado\nMotivo: ${slotObj.reason}`
                          : `${time} - Bloqueado`;
                      
                      return (
                        <div
                          key={time}
                          className={`h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors \
                            ${slotObj?.available 
                              ? 'bg-[#7fb685] hover:bg-[#426a5a] cursor-pointer text-[#426a5a] hover:text-white' 
                              : 'bg-gray-300 hover:bg-red-400 cursor-pointer text-gray-400'}
                          `}
                          style={{ minWidth: '4rem' }}
                          title={tooltipText}
                          onClick={() => handleSlotClick(selectedFacility, time, !(slotObj?.available))}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Modal de confirmación */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
              <h3 className="text-lg font-bold text-[#426a5a] mb-4 text-center">Confirmar acción</h3>
              <p className="mb-6 text-[#426a5a] text-center">
                ¿Estás seguro de que quieres {confirmModal.isCurrentlyBlocked ? 'desbloquear' : 'bloquear'} el horario <b>{confirmModal.time}</b>?
              </p>
              
              {/* Campo de motivo solo cuando se está bloqueando */}
              {!confirmModal.isCurrentlyBlocked && (
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-[#426a5a] mb-2">
                    Motivo del bloqueo
                  </label>
                  <input
                    type="text"
                    value={confirmModal.reason}
                    onChange={(e) => setConfirmModal({...confirmModal, reason: e.target.value})}
                    placeholder="Ej: Mantenimiento, Evento especial..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#426a5a] focus:border-transparent"
                  />
                </div>
              )}
              
              <div className="flex justify-center gap-2 w-full">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-[#426a5a] hover:bg-gray-300"
                  onClick={() => setConfirmModal({ open: false, facilityId: "", time: "", isCurrentlyBlocked: false, reason: "" })}
                >
                  Cancelar
                </button>
                <button
                  className={`px-4 py-2 rounded font-bold ${
                    confirmModal.isCurrentlyBlocked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-[#7fb685] text-white hover:bg-[#426a5a]'
                  }`}
                  onClick={handleConfirm}
                  disabled={!confirmModal.isCurrentlyBlocked && !confirmModal.reason.trim()}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Toast de confirmación */}
        <Toast open={showToast} message={toastMessage || ""} onClose={() => setShowToast(false)} />
      </div>
    </>
  );
}