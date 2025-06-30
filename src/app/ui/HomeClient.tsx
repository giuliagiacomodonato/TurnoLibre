"use client";
import React, { useState, useMemo, useEffect, Fragment } from 'react';
import { VenueInfo } from './VenueInfo';
import { Header } from './Header';
import { ReservationDetailsPopup } from './ReservationDetailsPopup';
import { LoginModal } from './LoginModal';
import { useCart } from './CartContext';
import { toZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import type { Sport, Facility, FacilityAvailability, Location, LocationSchedule, Reservation, Availability, AvailabilitySlot } from '@/lib/types';

export default function HomeClient({ sports: initialSports, locations: initialLocations, facilities: initialFacilities }: { sports: Sport[]; locations: Location[]; facilities: Facility[] }) {
  const [sports, setSports] = useState<Sport[]>(initialSports);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [location, setLocation] = useState<Location | null>(initialLocations[1] || initialLocations[0] || null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialLocations[1]?.id || initialLocations[0]?.id || '');
  const [selectedSport, setSelectedSport] = useState<string>(initialSports[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<{ facilityId: string; time: string; } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem } = useCart();
  const [availability, setAvailability] = useState<Availability>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Cuando cambia la sede seleccionada, actualizar location y mantener todos los deportes
  useEffect(() => {
    if (!selectedLocationId || locations.length === 0) return;
    const newLocation = locations.find(l => l.id === selectedLocationId) || null;
    setLocation(newLocation);
    // Mantener todos los deportes sin filtrar por sede
    setSports(prevSports => {
      return prevSports.map(sport => ({
        ...sport,
        facilities: initialFacilities.filter((f: Facility) => f.sportId === sport.id)
      })).filter((sport: Sport) => sport.facilities.length > 0);
    });
    if (sports.length > 0 && !selectedSport) {
      setSelectedSport(sports[0].id);
    }
  }, [selectedLocationId, locations]);

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
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds());
  }

  // Function to fetch latest sports data and generate availability
  const updateAvailability = async () => {
    setIsLoadingAvailability(true);
    try {
      // Agrupar facilities por deporte
      const groupedFacilities: { [sportId: string]: Facility[] } = {};
      initialFacilities.forEach((f: Facility) => {
        if (!f.sportId) return;
        if (!groupedFacilities[f.sportId]) groupedFacilities[f.sportId] = [];
        groupedFacilities[f.sportId].push(f);
      });
      // Actualizar sports con facilities
      setSports(prevSports => prevSports.map(s => ({
        ...s,
        facilities: groupedFacilities[s.id] || []
      })));
      const newAvailability: Availability = {};
      // Para cada día de la semana
      for (let i = 0; i < 7; i++) {
        const base = selectedDate
          ? (() => {
              const [year, month, day] = selectedDate.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            })()
          : new Date();
        const date = new Date(base);
        date.setDate(base.getDate() + i);
        const dateString = getLocalDateString(date);
        newAvailability[dateString] = {};
        const dayOfWeek = date.getDay();
        // Para cada facility - mostrar todas las canchas sin filtrar por sede
        for (const facility of initialFacilities) {
          // Buscar availability para ese día
          const avail = (facility.availability || []).find((a: any) => a.dayOfWeek === dayOfWeek);
          if (!avail) continue;
          // Generar slots según openingTime, closingTime y slotDuration
          const opening = utcToLocal(avail.openingTime);
          const closing = utcToLocal(avail.closingTime);
          const slotDuration = avail.slotDuration;
          const slots = [];
          let current = new Date(opening.getTime());
          while (current < closing) {
            const time = current.toTimeString().slice(0,5);
            slots.push({ time, available: true, slotDuration });
            current = new Date(current.getTime() + slotDuration * 60000);
          }
          // Consultar slots bloqueados desde la API
          try {
            const res = await fetch(`/api/availability/blocks?date=${dateString}&facilityId=${facility.id}`);
            let blocks = await res.json();
            if (!Array.isArray(blocks)) blocks = [];
            newAvailability[dateString][facility.id] = slots.map(slot => {
              const slotMinutes = getMinutesFromTimeString(slot.time);
              const blockedReservation = blocks.find((block: any) => {
                if (block.status !== "BLOCKED" && block.status !== "CONFIRMED" && block.status !== "PENDING") return false;
                const blockStart = new Date(block.startTime);
                const blockHour = blockStart.getHours();
                const blockMinute = blockStart.getMinutes();
                const blockMinutes = blockHour * 60 + blockMinute;
                return blockMinutes === slotMinutes;
              });
              return { ...slot, available: !blockedReservation };
            });
          } catch (error) {
            // Si hay error, dejar todos los slots como disponibles
            newAvailability[dateString][facility.id] = slots;
          }
        }
      }
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    updateAvailability();
    // eslint-disable-next-line
  }, []);

  // Forzar updateAvailability cuando selectedSport o selectedDate cambian y ambos están seteados
  useEffect(() => {
    if (selectedSport && selectedDate) {
      updateAvailability();
    }
    // eslint-disable-next-line
  }, [selectedSport, selectedDate]);

  const handlePreviousDay = () => {
    if (!selectedDate) return;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() - 1);
    const previousDateString = getLocalDateString(currentDate);
    const today = getLocalDateString(new Date());
    if (previousDateString >= today) {
      setSelectedDate(previousDateString);
    }
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDateString = getLocalDateString(currentDate);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateString = getLocalDateString(maxDate);
    if (nextDateString <= maxDateString) {
      setSelectedDate(nextDateString);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const filteredFacilities = useMemo(() => {
    const sport = sports.find(s => s.id === selectedSport);
    return sport?.facilities || [];
  }, [selectedSport, sports]);

  const weekDates = useMemo(() => {
    if (!selectedDate) return [];
    const [year, month, day] = selectedDate.split('-').map(Number);
    const start = new Date(year, month - 1, day, 12, 0, 0, 0);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(getLocalDateString(date));
    }
    return dates;
  }, [selectedDate]);

  const handleSlotClick = (facilityId: string, time: string, available: boolean) => {
    if (available) {
      setSelectedSlot({ facilityId, time });
    }
  };

  const handleClosePopup = () => {
    setSelectedSlot(null);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleReserve = () => {
    if (selectedSlot && selectedFacilityDetails) {
      addItem({
        id: `${selectedFacilityDetails.id}-${selectedDate}-${selectedSlot.time}`,
        name: `Reserva ${selectedFacilityDetails.name}`,
        date: selectedDate,
        time: selectedSlot.time,
        court: selectedFacilityDetails.name,
        price: selectedFacilityDetails.price ?? 0,
        image: '/canchas1.jpg',
        facilityId: selectedFacilityDetails.id,
      });
      handleClosePopup();
      setToastMessage('Turno agregado al carrito exitosamente');
      setShowToast(true);
      updateAvailability();
    }
  };

  const selectedFacilityDetails = selectedSlot
    ? filteredFacilities.find(facility => facility.id === selectedSlot.facilityId)
    : null;

  const getSlotDurationForSelected = () => {
    if (!selectedSlot || !selectedFacilityDetails) return 60;
    const facilityAvailabilities = selectedFacilityDetails.availability;
    if (!facilityAvailabilities || facilityAvailabilities.length === 0) return 60;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    const found = facilityAvailabilities.find((a: any) => a.dayOfWeek === dayOfWeek);
    return found?.slotDuration || facilityAvailabilities[0].slotDuration || 60;
  };

  const groupedFacilitiesBySlot = useMemo(() => {
    const sport = sports.find(s => s.id === selectedSport);
    if (!sport) return {};
    const groups: { [slotDuration: number]: Facility[] } = {};
    for (const facility of sport.facilities) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      const avail = (facility.availability || []).find((a: any) => a.dayOfWeek === dayOfWeek);
      const slotDuration = avail?.slotDuration || 60;
      if (!groups[slotDuration]) groups[slotDuration] = [];
      groups[slotDuration].push(facility);
    }
    return groups;
  }, [selectedSport, sports, selectedDate]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (!location) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#426a5a]">
      <Header />
      <main className="container mx-auto px-0 sm:px-2 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
          {/* Sidebar (drawer en mobile) */}
          <div className="block lg:hidden px-4 mb-4">
            <button
              className="w-full bg-[#f2c57c] text-[#426a5a] font-bold py-2 px-4 rounded-lg shadow-md flex items-center justify-center gap-2"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Deportes
            </button>
          </div>
          {/* Drawer lateral para mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSidebarOpen(false)}>
              <div className="fixed right-0 top-0 w-1/2 h-full bg-white shadow-2xl flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <button className="self-end mb-4 text-[#426a5a]" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-[#426a5a] mb-4">Deportes</h2>
                <div className="flex flex-col gap-4 w-full">
                  {sports.map(sport => (
                    <button
                      key={sport.id}
                      onClick={() => { setSelectedSport(sport.id); setSidebarOpen(false); }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-lg font-semibold transition-colors ${
                        selectedSport === sport.id
                          ? 'bg-[#426a5a] text-white'
                          : 'text-[#426a5a] hover:bg-[#7fb685]/20'
                      }`}
                    >
                      {sport.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Sidebar normal en desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#426a5a] mb-4">Deportes</h2>
              <div className="space-y-2">
                {sports.map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedSport === sport.id
                        ? 'bg-[#426a5a] text-white'
                        : 'text-[#426a5a] hover:bg-[#7fb685]/20'
                    }`}
                  >
                    {sport.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-10 px-4 md:px-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
              {/* Date Selector */}
              <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
              {isLoadingAvailability ? (
                /* Simpler skeleton loader with just one row */
                <div className="animate-pulse mb-8">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="overflow-x-auto w-full">
                    <div className="min-w-[600px] md:min-w-[900px] lg:min-w-[1100px] w-max">
                      {/* Simulated Time Headers */}
                      <div className="grid grid-cols-[200px_repeat(18,1fr)] md:grid-cols-[300px_repeat(36,1fr)] gap-1 mb-4">
                        <div className="h-6 bg-gray-200 rounded"></div>
                        {Array(18).fill(0).map((_, i) => (
                          <div key={i} className="h-6 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                      {/* Just one simulated Facility Row */}
                      <div className="grid grid-cols-[200px_repeat(18,1fr)] md:grid-cols-[300px_repeat(36,1fr)] gap-1 items-center mb-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        {Array(18).fill(0).map((_, i) => (
                          <div key={i} className="h-10 w-12 md:h-12 md:w-16 bg-gray-200 rounded-lg mx-1 my-1"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                Object.entries(groupedFacilitiesBySlot).map(([slotDuration, facilities]) => (
                  <div key={slotDuration} className="mb-8">
                    <div className="text-lg font-bold text-[#426a5a] mb-2">
                      Turnos de {slotDuration} minutos
                    </div>
                    <div className="overflow-x-auto w-full">
                      <div className="min-w-[600px] md:min-w-[900px] lg:min-w-[1100px] w-max">
                        {/* Time Headers dinámicos */}
                        <div className="grid grid-cols-[200px_repeat(18,1fr)] md:grid-cols-[300px_repeat(36,1fr)] gap-1 text-center mb-4">
                          <div className="col-span-1 font-bold text-[#426a5a]">Cancha / Sede</div>
                          {/* Tomar los headers del primer facility del grupo */}
                          {(() => {
                            const facility = facilities[0];
                            const [year, month, day] = selectedDate.split('-').map(Number);
                            const dateObj = new Date(year, month - 1, day);
                            const dayOfWeek = dateObj.getDay();
                            const avail = (facility.availability || []).find((a: any) => a.dayOfWeek === dayOfWeek);
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
                              <div key={time} className="font-bold text-[#426a5a] text-xs md:text-base">{time}</div>
                            ));
                          })()}
                        </div>
                        {/* Facility Rows */}
                        {facilities.map(facility => (
                          <div key={facility.id} className="grid grid-cols-[200px_repeat(18,1fr)] md:grid-cols-[300px_repeat(36,1fr)] gap-1 items-center mb-4">
                            <div className="text-xs md:text-sm font-semibold text-[#426a5a] pr-2">
                              <div>{facility.name}</div>
                              <div className="text-xs text-gray-500">{facility.location?.name}</div>
                            </div>
                            {availability[selectedDate]?.[facility.id]?.map(slot => (
                              <div
                                key={slot.time}
                                className={`h-10 w-12 md:h-12 md:w-16 rounded-lg mx-1 my-1 flex items-center justify-center text-xs md:text-sm font-semibold transition-colors \
                                  ${slot.available 
                                    ? 'bg-[#7fb685] hover:bg-[#426a5a] cursor-pointer text-[#426a5a] hover:text-white' 
                                    : 'bg-gray-300 cursor-not-allowed text-gray-400'}
                                `}
                                style={{ minWidth: '3rem', minHeight: '2.5rem' }}
                                title={`${slot.time} - ${slot.available ? 'Disponible' : 'No disponible'}`}
                                onClick={() => handleSlotClick(facility.id, slot.time, slot.available)}
                              >
                                {/* Sin hora dentro del slot */}
                              </div>
                            ))}
                          </div>
                        ))}
                        {facilities.length === 0 && (
                          <div className="col-span-full text-center text-gray-600 mt-8">
                            No hay canchas disponibles para este deporte.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Galería e info de sede */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
              {/* Selector de sede arriba de la galería/info */}
              <div className="mb-6">
                <label htmlFor="sede-select" className="block text-[#426a5a] font-bold mb-2">Seleccionar sede:</label>
                <select
                  id="sede-select"
                  value={selectedLocationId}
                  onChange={e => setSelectedLocationId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#7fb685] focus:outline-none focus:ring-2 focus:ring-[#7fb685]"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <VenueInfo
                name={location.name}
                description={location.description || ''}
                address={location.address}
                phone={location.phone}
                sports={sports.map(s => s.name)}
                services={location.services ?? []}
                images={Array.isArray(location.images) && location.images.length > 0 ? location.images.map(i => i.link) : []}
                hours={(location.schedules ?? []).map(schedule => {
                  const localOpening = new Date(schedule.openingTime);
                  const localClosing = new Date(schedule.closingTime);
                  return {
                    day: schedule.dayOfWeek === 7 || schedule.dayOfWeek === undefined
                      ? 'Feriados'
                      : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][schedule.dayOfWeek],
                    open: format(localOpening, 'HH:mm'),
                    close: format(localClosing, 'HH:mm')
                  };
                })}
              />
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-[#426a5a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
        </div>
      </footer>
      {/* Reservation Details Popup */}
      {selectedSlot && selectedFacilityDetails && (
        <ReservationDetailsPopup
          courtName={selectedFacilityDetails.name}
          time={selectedSlot.time}
          duration={getSlotDurationForSelected()}
          price={selectedFacilityDetails.price ?? 0}
          onReserve={handleReserve}
          onClose={handleClosePopup}
          courtDescription={selectedFacilityDetails.description || undefined}
          venueAddress={selectedFacilityDetails.location?.address || undefined}
        />
      )}
      {/* Login Required Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
      />
      {showToast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#7fb685] text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 z-50 ${showToast ? 'opacity-100' : 'opacity-0'}`}>
          {toastMessage}
        </div>
      )}
      {/* Add loading toast message */}
      {isLoadingAvailability && !showToast && (
        <div className="fixed bottom-4 right-4 bg-[#426a5a] text-white px-6 py-3 rounded-lg shadow-lg z-40">
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Cargando disponibilidad...
          </div>
        </div>
      )}
    </div>
  );
}