'use client';

import { useState, useMemo } from 'react';
import { VenueInfo } from '../ui/VenueInfo';
import { Header } from '../ui/Header';
import { ReservationDetailsPopup } from '../ui/ReservationDetailsPopup';
import { LoginModal } from '../ui/LoginModal';
import { useSession } from 'next-auth/react';
import { useCart } from '../ui/CartContext';

// Simulated data for a single venue
const venueData = {
  name: "Complejo Deportivo Bahía Club",
  description: "Complejo deportivo de primer nivel con instalaciones modernas y amplias. Cuenta con canchas de fútbol, tenis, pádel y más. Ideal para practicar deportes en un ambiente agradable y profesional.",
  address: "Av. Alem 1234, Bahía Blanca",
  sports: ["Fútbol 5", "Fútbol 7", "Tenis", "Pádel", "Basket", "Voley"],
  courts: [
    { id: 1, name: "Cancha 1 (Fútbol 5)", sports: ["Fútbol 5"] },
    { id: 2, name: "Cancha 2 (Fútbol 5)", sports: ["Fútbol 5"] },
    { id: 3, name: "Cancha 3 (Fútbol 7)", sports: ["Fútbol 7"] },
    { id: 4, name: "Cancha 4 (Tenis)", sports: ["Tenis"] },
    { id: 5, name: "Cancha 5 (Pádel)", sports: ["Pádel"] },
    { id: 6, name: "Cancha 6 (Basket)", sports: ["Basket"] },
    { id: 7, name: "Cancha 7 (Voley)", sports: ["Voley"] },
  ],
  images: ["/canchas1.jpg", "/canchas2.jpg", "/canchas3.jpg"],
  hours: [
    { day: "Lunes", open: "08:00", close: "23:00" },
    { day: "Martes", open: "08:00", close: "23:00" },
    { day: "Miércoles", open: "08:00", close: "23:00" },
    { day: "Jueves", open: "08:00", close: "23:00" },
    { day: "Viernes", open: "08:00", close: "23:00" },
    { day: "Sábado", open: "08:00", close: "23:00" },
    { day: "Domingo", open: "08:00", close: "23:00" },
  ],
  services: [
    "Estacionamiento",
    "Vestuarios",
    "Duchas",
    "Iluminación",
    "Cafetería",
    "WiFi",
    "Primeros auxilios",
    "Alquiler de equipamiento"
  ]
};

// Simulated availability data for a week
const generateWeeklyAvailability = () => {
  const today = new Date();
  const availability: { [date: string]: { [courtId: number]: { time: string; available: boolean; }[] } } = {};

  // Generate time slots from 13:00 to 23:00 in 1-hour intervals
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 13;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Only generate availability for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    availability[dateString] = {};

    venueData.courts.forEach(court => {
      availability[dateString][court.id] = timeSlots.map(time => ({
        time,
        available: Math.random() > 0.3 // Simulate random availability
      }));
    });
  }
  return availability;
};

const weeklyAvailability = generateWeeklyAvailability();

export default function Home() {
  const { data: session } = useSession();
  const [selectedSport, setSelectedSport] = useState(venueData.sports[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: number; time: string; } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addItem } = useCart();

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const previousDateString = previousDate.toISOString().split('T')[0];
    
    // Only allow going back to today
    if (previousDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(previousDateString);
    }
  };

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    const nextDateString = nextDate.toISOString().split('T')[0];
    
    // Only allow going forward 7 days from today
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (nextDate <= maxDate) {
      setSelectedDate(nextDateString);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const filteredCourts = useMemo(() => {
    return venueData.courts.filter(court =>
      court.sports.includes(selectedSport)
    );
  }, [selectedSport]);

  const weekDates = useMemo(() => {
    const start = new Date(selectedDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, [selectedDate]);

  const handleSlotClick = (courtId: number, time: string, available: boolean) => {
    if (available) {
      setSelectedSlot({ courtId, time });
    } else {
      // Optionally show a message for unavailable slots
      console.log('Slot not available');
    }
  };

  const handleClosePopup = () => {
    setSelectedSlot(null);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleReserve = () => {
    if (selectedSlot && selectedCourtDetails) {
      addItem({
        id: `${selectedCourtDetails.id}-${selectedDate}-${selectedSlot.time}`,
        name: `Reserva ${selectedCourtDetails.name}`,
        date: selectedDate,
        time: selectedSlot.time,
        court: selectedCourtDetails.name,
        price: slotPrice,
        image: venueData.images[0],
      });
      handleClosePopup();
    }
  };

  // Find the details of the selected court and slot for the popup
  const selectedCourtDetails = selectedSlot
    ? venueData.courts.find(court => court.id === selectedSlot.courtId)
    : null;
  
  // Assuming a fixed duration and price for simplicity. 
  // You would likely fetch this based on the court and time.
  const slotDuration = 60; // minutes
  const slotPrice = 10400; // example price

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Selector de Deporte */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24">
              <label htmlFor="sport-select" className="block text-xl font-bold text-[#426a5a] mb-4">Deportes</label>
              <div className="space-y-2">
                {venueData.sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      selectedSport === sport
                        ? 'bg-[#426a5a] text-white'
                        : 'bg-white hover:bg-[#7fb685]/20 text-[#426a5a]'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Central: Timeline */}
          <div className="lg:col-span-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
              {/* Selector de Fecha */}
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
                  {/* Encabezado de horarios */}
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

                  {/* Filas por cancha y slots por hora */}
                  <div className="space-y-1">
                    {filteredCourts.map(court => (
                      <div key={court.id} className="grid grid-cols-[200px_repeat(11,1fr)] gap-1 items-center">
                        {/* Nombre de la cancha */}
                        <div className="text-sm font-semibold text-[#426a5a] pr-2">
                          {court.name}
                        </div>
                        {/* Slots por hora */}
                        {weeklyAvailability[selectedDate]?.[court.id]?.map(slot => (
                          <div
                            key={slot.time}
                            className={`h-8 rounded ${
                              slot.available 
                                ? 'bg-[#7fb685] hover:bg-[#426a5a] cursor-pointer' 
                                : 'bg-gray-300 cursor-not-allowed'
                            } transition-colors`}
                            title={`${slot.time} - ${slot.available ? 'Disponible' : 'No disponible'}`}
                            onClick={() => handleSlotClick(court.id, slot.time, slot.available)}
                          />
                        ))}
                      </div>
                    ))}
                    {/* Mensaje si no hay canchas para el deporte seleccionado */}
                    {filteredCourts.length === 0 && (
                      <div className="col-span-full text-center text-gray-600 mt-8">
                        No hay canchas disponibles para {selectedSport}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Complejo */}
            <VenueInfo {...venueData} sports={venueData.sports} images={venueData.images} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#426a5a]/90 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
        </div>
      </footer>

      {/* Reservation Details Popup */}
      {selectedSlot && selectedCourtDetails && (
        <ReservationDetailsPopup
          courtName={selectedCourtDetails.name}
          time={selectedSlot.time}
          // These should come from your availability data, not hardcoded
          duration={slotDuration} 
          price={slotPrice}
          onReserve={handleReserve}
          onClose={handleClosePopup}
        />
      )}

      {/* Login Required Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
      />
    </div>
  );
}
