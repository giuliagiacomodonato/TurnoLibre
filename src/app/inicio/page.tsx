'use client';

import { useState, useMemo, useEffect } from 'react';
import { VenueInfo } from '../ui/VenueInfo';
import { Header } from '../ui/Header';
import { ReservationDetailsPopup } from '../ui/ReservationDetailsPopup';
import { LoginModal } from '../ui/LoginModal';
import { useCart } from '../ui/CartContext';

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

export default function Home() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ facilityId: string; time: string; } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem } = useCart();
  const [availability, setAvailability] = useState<Availability>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Function to fetch initial data (sports and location)
  const fetchInitialData = async () => {
    try {
      const [sportsRes, locationRes] = await Promise.all([
        fetch('/api/sports'),
        fetch('/api/location')
      ]);

      const sportsData = await sportsRes.json();
      const locationData = await locationRes.json();

      const sportsWithFacilities = sportsData.filter((sport: Sport) => sport.facilities.length > 0);
      setSports(sportsWithFacilities);
      setLocation(locationData);

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

  // Function to fetch latest sports data and generate availability
  const updateAvailability = async () => {
    try {
      const sportsRes = await fetch('/api/sports');
      const sportsData = await sportsRes.json();
      const sportsWithFacilities: Sport[] = sportsData.filter((sport: Sport) => sport.facilities.length > 0);
      setSports(sportsWithFacilities);

      const newAvailability: Availability = {};
      const timeSlots = Array.from({ length: 11 }, (_, i) => {
        const hour = i + 13;
        return `${hour.toString().padStart(2, '0')}:00`;
      });

      for (let i = 0; i < 7; i++) {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        newAvailability[dateString] = {};

        const sport = sportsWithFacilities.find((s: Sport) => s.id === selectedSport);
        if (sport) {
          for (const facility of sport.facilities) {
            // Consultar slots bloqueados desde la API
            const blocksRes = await fetch(`/api/availability/blocks?date=${dateString}&facilityId=${facility.id}`);
            const blocks = await blocksRes.json();

            newAvailability[dateString][facility.id] = timeSlots.map(time => {
              // Convertir block.startTime a horario local antes de comparar
              const isBlocked = blocks.some((block: any) => {
                const blockStart = new Date(block.startTime);
                // Convertir a horario local
                const localHour = blockStart.getHours().toString().padStart(2, '0');
                const localMinute = blockStart.getMinutes().toString().padStart(2, '0');
                const localTimeStr = `${localHour}:${localMinute}`;
                return localTimeStr === time;
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
    if (!selectedDate) return; // Add this check
    const currentDate = new Date(selectedDate);
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const previousDateString = previousDate.toISOString().split('T')[0];
    
    if (previousDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(previousDateString);
    }
  };

  const handleNextDay = () => {
    if (!selectedDate) return; // Add this check
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

  const filteredFacilities = useMemo(() => {
    const sport = sports.find(s => s.id === selectedSport);
    return sport?.facilities || [];
  }, [selectedSport, sports]);

  const weekDates = useMemo(() => {
    if (!selectedDate) return [];
    const start = new Date(selectedDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
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

            {/* Venue Info */}
            <VenueInfo
              name={location.name}
              description={location.description || ''}
              address={location.address}
              phone={location.phone}
              sports={sports.map(s => s.name)}
              services={location.services}
              images={['/canchas1.jpg', '/canchas2.jpg', '/canchas3.jpg']}
              hours={location.schedules.map(schedule => ({
                day: schedule.dayOfWeek === 7 || schedule.dayOfWeek === undefined
                  ? 'Feriados'
                  : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][schedule.dayOfWeek],
                open: new Date(schedule.openingTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                close: new Date(schedule.closingTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              }))}
            />
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
          duration={60}
          price={selectedFacilityDetails.price}
          onReserve={handleReserve}
          onClose={handleClosePopup}
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
