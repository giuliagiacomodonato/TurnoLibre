'use client';

import { useState, useMemo, useEffect } from 'react';
import { VenueInfo } from '../ui/VenueInfo';
import { Header } from '../ui/Header';
import { ReservationDetailsPopup } from '../ui/ReservationDetailsPopup';
import { LoginModal } from '../ui/LoginModal';
import { useCart } from '../ui/CartContext';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

type Sport = {
  id: string;
  name: string;
  description: string | null;
  facilities: Facility[];
};

type Facility = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sportId: string;
  locationId: string;
  location: Location;
  reservations: Reservation[];
  availability: AvailabilitySlot[];
};

type Location = {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  services: string[];
  schedules: LocationSchedule[];
};

type LocationSchedule = {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
};

type Reservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
};

type Availability = {
  [date: string]: {
    [facilityId: string]: {
      time: string;
      available: boolean;
    }[];
  };
};

type AvailabilitySlot = {
  time: string;
  available: boolean;
  slotDuration: number;
};

export default function Home() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ facilityId: string; time: string; } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem } = useCart();
  const [availability, setAvailability] = useState<Availability>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Function to fetch initial data (sports and locations)
  const fetchInitialData = async () => {
    try {
      const [sportsRes, locationsRes] = await Promise.all([
        fetch('/api/sports'),
        fetch('/api/locations')
      ]);

      const sportsData = await sportsRes.json();
      const locationsData = await locationsRes.json();

      setLocations(locationsData);
      // Seleccionar la primera sede por defecto
      const initialLocation = locationsData[0] || null;
      setLocation(initialLocation);
      setSelectedLocationId(initialLocation?.id || '');

      // Filtrar deportes por la sede seleccionada
      const sportsWithFacilities = sportsData.filter((sport: Sport) =>
        sport.facilities.some((f: Facility) => f.locationId === initialLocation?.id)
      );
      setSports(sportsWithFacilities);

      // Inicializar selectedDate si no está seteado
      if (!selectedDate) {
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }
      if (sportsWithFacilities.length > 0) {
        setSelectedSport(sportsWithFacilities[0].id);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // Cuando cambia la sede seleccionada, actualizar deportes y location
  useEffect(() => {
    if (!selectedLocationId || locations.length === 0) return;
    const newLocation = locations.find(l => l.id === selectedLocationId) || null;
    setLocation(newLocation);
    fetch('/api/sports').then(res => res.json()).then(sportsData => {
      const sportsWithFacilities = sportsData.filter((sport: Sport) =>
        sport.facilities.some((f: Facility) => f.locationId === selectedLocationId)
      );
      setSports(sportsWithFacilities);
      if (sportsWithFacilities.length > 0) {
        setSelectedSport(sportsWithFacilities[0].id);
      } else {
        setSelectedSport('');
      }
    });
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

  // Function to fetch latest sports data and generate availability
  const updateAvailability = async () => {
    try {
      const sportsRes = await fetch('/api/sports');
      const sportsData = await sportsRes.json();
      const sportsWithFacilities: Sport[] = sportsData.filter((sport: Sport) =>
        sport.facilities.some((f: Facility) => f.locationId === selectedLocationId)
      );
      setSports(sportsWithFacilities);

      const newAvailability: Availability = {};
      const timeSlots = Array.from({ length: 11 }, (_, i) => {
        const hour = i + 13;
        return `${hour.toString().padStart(2, '0')}:00`;
      });

      // Siempre crear la base localmente, nunca con string
      const base = selectedDate
        ? (() => {
            const [year, month, day] = selectedDate.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0); // 12:00 para evitar problemas de horario de verano
          })()
        : new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(base);
        date.setDate(base.getDate() + i);
        const dateString = getLocalDateString(date);
        newAvailability[dateString] = {};

        const sport = sportsWithFacilities.find((s: Sport) => s.id === selectedSport);
        if (sport) {
          for (const facility of sport.facilities.filter(f => f.locationId === selectedLocationId)) {
            // Consultar slots bloqueados desde la API
            const blocksRes = await fetch(`/api/availability/blocks?date=${dateString}&facilityId=${facility.id}`);
            const blocks = await blocksRes.json();

            newAvailability[dateString][facility.id] = timeSlots.map(time => {
              const slotMinutes = getMinutesFromTimeString(time);
              const isBlocked = blocks.some((block: any) => {
                const blockStart = new Date(block.startTime);
                // Convertir a local
                const blockHour = blockStart.getHours();
                const blockMinute = blockStart.getMinutes();
                const blockMinutes = blockHour * 60 + blockMinute;
                return blockMinutes === slotMinutes;
              });
              return {
                time,
                available: !isBlocked
              };
            });
          }
        }
      }
      setAvailability(newAvailability);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Forzar updateAvailability cuando selectedSport o selectedDate cambian y ambos están seteados
  useEffect(() => {
    if (selectedSport && selectedDate) {
      updateAvailability();
    }
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
    // ¡OJO! El mes es base 0 en JS
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const filteredFacilities = useMemo(() => {
    const sport = sports.find(s => s.id === selectedSport);
    return sport?.facilities.filter(f => f.locationId === selectedLocationId) || [];
  }, [selectedSport, sports, selectedLocationId]);

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
        price: selectedFacilityDetails.price,
        image: '/canchas1.jpg', // You might want to add images to your facilities
      });
      handleClosePopup();
      // Re-fetch data to update availability after a reservation
      updateAvailability(); // Call the new update function
    }
  };

  const selectedFacilityDetails = selectedSlot
    ? filteredFacilities.find(facility => facility.id === selectedSlot.facilityId)
    : null;

  // Encuentra el slotDuration real para el turno seleccionado
  const getSlotDurationForSelected = () => {
    if (!selectedSlot || !selectedFacilityDetails) return 60;
    // Buscar en availability del facility el slotDuration correspondiente al día y hora
    // Suponemos que availability es un array de objetos con dayOfWeek, openingTime, closingTime, slotDuration
    const facilityAvailabilities = selectedFacilityDetails.availability;
    if (!facilityAvailabilities || facilityAvailabilities.length === 0) return 60;
    // Obtener el día de la semana del selectedDate (0=Domingo, 1=Lunes...)
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();
    // Buscar la availability que coincida con el día
    const found = facilityAvailabilities.find((a: any) => a.dayOfWeek === dayOfWeek);
    return found?.slotDuration || facilityAvailabilities[0].slotDuration || 60;
  };

  if (!location) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#426a5a]">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
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
                    <div className="col-span-1 font-bold text-[#426a5a]">Cancha</div>
                    {Array.from({ length: 11 }, (_, i) => {
                      const hour = i + 13;
                      return (
                        <div key={hour} className="font-bold text-[#426a5a]">
                          {`${hour.toString().padStart(2, '0')}:00`}
                        </div>
                      );
                    })}
                  </div>

                  {/* Facility Rows */}
                  {filteredFacilities.map(facility => (
                    <div key={facility.id} className="grid grid-cols-[200px_repeat(11,1fr)] gap-1 items-center mb-4">
                      <div className="text-sm font-semibold text-[#426a5a] pr-2">
                        {facility.name}
                      </div>
                      {availability[selectedDate]?.[facility.id]?.map(slot => (
                        <div
                          key={slot.time}
                          className={`h-8 rounded ${
                            slot.available 
                              ? 'bg-[#7fb685] hover:bg-[#426a5a] cursor-pointer' 
                              : 'bg-gray-300 cursor-not-allowed'
                          } transition-colors`}
                          title={`${slot.time} - ${slot.available ? 'Disponible' : 'No disponible'}`}
                          onClick={() => handleSlotClick(facility.id, slot.time, slot.available)}
                        />
                      ))}
                    </div>
                  ))}
                  {filteredFacilities.length === 0 && (
                    <div className="col-span-full text-center text-gray-600 mt-8">
                      No hay canchas disponibles para este deporte.
                    </div>
                  )}
                </div>
              </div>
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
                services={location.services}
                images={['/canchas1.jpg', '/canchas2.jpg', '/canchas3.jpg']}
                hours={location.schedules.map(schedule => {
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
          price={selectedFacilityDetails.price}
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
        <div className={`fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${showToast ? 'opacity-100' : 'opacity-0'}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
