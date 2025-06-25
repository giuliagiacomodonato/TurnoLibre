"use client";
import { useState, useEffect } from "react";
import { Toast } from "./Toast";
import { AdminHeader } from "./Header";
import type { Facility, Reservation, Availability } from "@/lib/types";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMinutesFromTimeString(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

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

export default function EditarDisponibilidadClient({ facilities: initialFacilities }: { facilities: Facility[] }) {
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [selectedFacility, setSelectedFacility] = useState<string>(initialFacilities[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
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
  const [cancelReservationModal, setCancelReservationModal] = useState<{
    open: boolean;
    reservationId: string;
    time: string;
    userName: string;
  }>({ open: false, reservationId: "", time: "", userName: "" });

  useEffect(() => {
    if (!selectedFacility) return;
    setSelectedDate(getLocalDateString(new Date()));
    generateAvailability();
    // eslint-disable-next-line
  }, [selectedFacility]);

  useEffect(() => {
    if (!selectedFacility || !selectedDate) return;
    generateAvailability();
    // eslint-disable-next-line
  }, [selectedFacility, selectedDate]);

  const generateAvailability = async () => {
    const newAvailability: Availability = {};
    const facility = facilities.find(f => f.id === selectedFacility);
    if (!facility || !facility.availability) return;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const base = new Date(year, month - 1, day, 12, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      const dateString = getLocalDateString(date);
      newAvailability[dateString] = {};
      const dayOfWeek = date.getDay();
      const avail = (facility.availability || []).find((a) => a.dayOfWeek === dayOfWeek);
      if (!avail) {
        newAvailability[dateString][selectedFacility] = [];
        continue;
      }
      const opening = utcToLocal(avail.openingTime);
      const closing = utcToLocal(avail.closingTime);
      const slotDuration = avail.slotDuration;
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
        newAvailability[dateString][selectedFacility] = timeSlots.map(slot => {
          const slotMinutes = getMinutesFromTimeString(slot);
          const blockedReservation = blocks.find((block: any) => {
            if (block.status !== "BLOCKED" && block.status !== "CONFIRMED" && block.status !== "PENDING") return false;
            const blockStart = new Date(block.startTime);
            const blockHour = blockStart.getHours();
            const blockMinute = blockStart.getMinutes();
            const blockMinutes = blockHour * 60 + blockMinute;
            return blockMinutes === slotMinutes;
          });
          const isReservation = blockedReservation && (blockedReservation.status === "CONFIRMED" || blockedReservation.status === "PENDING");
          const isConfirmedReservation = blockedReservation && blockedReservation.status === "CONFIRMED";
          return { 
            time: slot,
            available: !blockedReservation,
            reason: blockedReservation?.reason || (isReservation ? "Reservado" : undefined),
            isReservation: isReservation,
            isConfirmedReservation: isConfirmedReservation,
            reservationId: blockedReservation?.id,
            user: blockedReservation?.user
          };
        });
      } catch (error) {
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

  const handleSlotClick = (facilityId: string, time: string, isCurrentlyBlocked: boolean, slotObj?: any) => {
    // Si es una reserva confirmada, abrir modal de cancelación
    if (slotObj?.isConfirmedReservation && slotObj?.reservationId) {
      setCancelReservationModal({
        open: true,
        reservationId: slotObj.reservationId,
        time: time,
        userName: slotObj.user?.name || 'Usuario'
      });
    } else {
      // Si no es reserva confirmada, usar el modal de bloqueo normal
      setConfirmModal({ open: true, facilityId, time, isCurrentlyBlocked, reason: "" });
    }
  };

  const handleCancelReservation = async () => {
    const { reservationId, time } = cancelReservationModal;
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          reason: 'Cancelado por administrador'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al cancelar la reserva');
      }
      
      await generateAvailability();
      setToastMessage(`Reserva del horario ${time} cancelada con éxito.`);
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error al cancelar la reserva.');
      setShowToast(true);
    } finally {
      setCancelReservationModal({ open: false, reservationId: "", time: "", userName: "" });
      setTimeout(() => setShowToast(false), 3000);
    }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          date: selectedDate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isBlocked: !isCurrentlyBlocked,
          reason: !isCurrentlyBlocked ? reason : undefined,
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
                    {facility.name} - {facility.sport?.name ?? ""}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="overflow-x-auto">
              <div className="w-full min-w-[800px]">
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
                        : slotObj?.isConfirmedReservation && slotObj?.user
                          ? `${time} - Reservado (CONFIRMED)\nUsuario: ${slotObj.user.name}\nHaz clic para cancelar`
                          : slotObj?.isReservation && slotObj?.user
                            ? `${time} - Reservado (PENDING)\nUsuario: ${slotObj.user.name}`
                            : slotObj?.reason 
                              ? `${time} - Bloqueado\nMotivo: ${slotObj.reason}`
                              : `${time} - Bloqueado`;
                      return (
                        <div
                          key={time}
                          className={`h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors \
                            ${slotObj?.available 
                              ? 'bg-[#7fb685] hover:bg-[#426a5a] cursor-pointer text-[#426a5a] hover:text-white' 
                              : slotObj?.isConfirmedReservation
                                ? 'bg-blue-200 hover:bg-red-200 cursor-pointer text-blue-800 hover:text-red-800' // Confirmed reservation - clickable to cancel
                                : slotObj?.isReservation
                                  ? 'bg-blue-200 text-blue-800 cursor-not-allowed' // Pending reservation - not clickable
                                  : 'bg-gray-300 hover:bg-red-400 cursor-pointer text-gray-400' // Blocked style
                            }`}
                          style={{ minWidth: '4rem' }}
                          title={tooltipText}
                          onClick={() => handleSlotClick(selectedFacility, time, !(slotObj?.available), slotObj)}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Modal de confirmación para bloquear/desbloquear */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
              <h3 className="text-lg font-bold text-[#426a5a] mb-4 text-center">Confirmar acción</h3>
              <p className="mb-6 text-[#426a5a] text-center">
                ¿Estás seguro de que quieres {confirmModal.isCurrentlyBlocked ? 'desbloquear' : 'bloquear'} el horario <b>{confirmModal.time}</b>?
              </p>
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

        {/* Modal de confirmación para cancelar reserva */}
        {cancelReservationModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
              <h3 className="text-lg font-bold text-red-600 mb-4 text-center">Cancelar Reserva</h3>
              <p className="mb-6 text-gray-700 text-center">
                ¿Estás seguro de que quieres cancelar la reserva del horario <b>{cancelReservationModal.time}</b>?
              </p>
              <p className="mb-6 text-sm text-gray-600 text-center">
                Usuario: <b>{cancelReservationModal.userName}</b>
              </p>
              <p className="mb-6 text-xs text-gray-500 text-center">
                Al cancelar, el horario quedará disponible nuevamente.
              </p>
              <div className="flex justify-center gap-2 w-full">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setCancelReservationModal({ open: false, reservationId: "", time: "", userName: "" })}
                >
                  No cancelar
                </button>
                <button
                  className="px-4 py-2 rounded font-bold bg-red-500 text-white hover:bg-red-600"
                  onClick={handleCancelReservation}
                >
                  Cancelar Reserva
                </button>
              </div>
            </div>
          </div>
        )}
        
        <Toast open={showToast} message={toastMessage || ""} onClose={() => setShowToast(false)} />
      </div>
    </>
  );
} 