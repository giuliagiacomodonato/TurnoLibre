"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/ui/Header";
import { Toast } from "@/app/ui/Toast";

type Facility = {
  id: string;
  name: string;
  sport: {
    name: string;
  };
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
    }[];
  };
};

export default function EditarDisponibilidad() {
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
  }>({ open: false, facilityId: "", time: "", isCurrentlyBlocked: false });

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      generateAvailability();
    }
  }, [selectedFacility]);

  const generateAvailability = async () => {
    const newAvailability: Availability = {};
    const timeSlots = Array.from({ length: 11 }, (_, i) => {
      const hour = i + 13;
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      newAvailability[dateString] = {};

      try {
        const res = await fetch(`/api/availability/blocks?date=${dateString}&facilityId=${selectedFacility}`);
        const blocks = await res.json();

        newAvailability[dateString][selectedFacility] = timeSlots.map(time => ({
          time,
          available: !blocks.some((block: Reservation) => {
            const blockStart = new Date(block.startTime);
            // Convertir a horario local
            const localHour = blockStart.getHours().toString().padStart(2, '0');
            const localMinute = blockStart.getMinutes().toString().padStart(2, '0');
            const localTimeStr = `${localHour}:${localMinute}`;
            return localTimeStr === time;
          })
        }));
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    }

    setAvailability(newAvailability);
  };

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const previousDateString = previousDate.toISOString().split('T')[0];
    
    if (previousDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(previousDateString);
    }
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    const nextDateString = nextDate.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (nextDate <= maxDate) {
      setSelectedDate(nextDateString);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const handleSlotClick = (facilityId: string, time: string, isCurrentlyBlocked: boolean) => {
    setConfirmModal({ open: true, facilityId, time, isCurrentlyBlocked });
  };

  const handleConfirm = async () => {
    const { facilityId, time, isCurrentlyBlocked } = confirmModal;
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
      setConfirmModal({ open: false, facilityId: "", time: "", isCurrentlyBlocked: false });
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#426a5a]">
      <Header />
      
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
              {/* Time Headers */}
              <div className="grid grid-cols-[200px_repeat(11,1fr)] gap-1 text-center mb-4">
                <div className="col-span-1 font-bold text-[#426a5a]">Horario</div>
                {Array.from({ length: 11 }, (_, i) => {
                  const hour = i + 13;
                  return (
                    <div key={hour} className="font-bold text-[#426a5a]">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-[200px_repeat(11,1fr)] gap-1 items-center">
                <div className="text-sm font-semibold text-[#426a5a] pr-2">
                  {facilities.find(f => f.id === selectedFacility)?.name}
                </div>
                {availability[selectedDate]?.[selectedFacility]?.map(slot => (
                  <div
                    key={slot.time}
                    className={`h-8 rounded ${
                      slot.available 
                        ? 'bg-[#7fb685] hover:bg-[#426a5a] cursor-pointer' 
                        : 'bg-gray-300 hover:bg-red-400 cursor-pointer'
                    } transition-colors`}
                    title={`${slot.time} - ${slot.available ? 'Disponible' : 'Bloqueado'}`}
                    onClick={() => handleSlotClick(selectedFacility, slot.time, !slot.available)}
                  />
                ))}
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
            <div className="flex justify-center gap-2 w-full">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-[#426a5a] hover:bg-gray-300"
                onClick={() => setConfirmModal({ open: false, facilityId: "", time: "", isCurrentlyBlocked: false })}
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
  );
}