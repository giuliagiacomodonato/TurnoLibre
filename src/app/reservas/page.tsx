'use client';

import { useState, useEffect } from 'react';
import { Header } from '../ui/Header';
import { useSession } from 'next-auth/react';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { LoginModal } from '../ui/LoginModal';

type Reservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  facility: {
    name: string;
    sport: {
      name: string;
    };
  };
  payment: {
    amount: number;
    status: string;
  } | null;
};

export default function ReservasPage() {
  const [activeTab, setActiveTab] = useState('activas'); // 'activas', 'pasadas', 'canceladas'
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data: session, status } = useSession();

  // Fetch user reservations
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || !session.user?.email) {
      setShowLoginModal(true);
      setLoading(false);
      return;
    }
    
    const fetchReservations = async () => {
      try {
        console.log("Fetching reservations for user:", session.user.email);
        // Use email instead of ID since that's what we're guaranteed to have
        const response = await fetch(`/api/reservations?userEmail=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Received reservations:", data.reservations);
          setReservations(data.reservations || []);
        } else {
          console.error('Error fetching reservations:', await response.text());
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, [session, status]);

  // Filter reservations based on active tab
  useEffect(() => {
    if (reservations.length === 0) {
      setFilteredReservations([]);
      return;
    }

    const now = new Date();

    const filtered = reservations.filter(reservation => {
      const startTime = parseISO(reservation.startTime);
      
      if (activeTab === 'activas') {
        return reservation.status === 'CONFIRMED' && !isBefore(startTime, now);
      } else if (activeTab === 'pasadas') {
        return reservation.status === 'CONFIRMED' && isBefore(startTime, now);
      } else if (activeTab === 'canceladas') {
        return reservation.status === 'CANCELLED';
      }
      return false;
    });

    setFilteredReservations(filtered);
    // Clear selected reservation when changing tabs
    setSelectedReservation(null);
  }, [activeTab, reservations]);

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Cancelada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  };

  const getPaymentStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'PAID': return 'Pagado';
      case 'PENDING': return 'Pendiente';
      case 'FAILED': return 'Fallido';
      default: return 'No disponible';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20 flex items-center justify-center">
        <div className="text-[#426a5a] text-xl">Cargando tus reservas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#426a5a] mb-6">Mis Reservas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Lista de Reservas */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'activas' ? 'border-b-2 border-[#426a5a] text-[#426a5a]' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('activas')}
              >
                ACTIVAS
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'pasadas' ? 'border-b-2 border-[#426a5a] text-[#426a5a]' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('pasadas')}
              >
                PASADAS
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'canceladas' ? 'border-b-2 border-[#426a5a] text-[#426a5a]' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('canceladas')}
              >
                CANCELADAS
              </button>
            </div>

            {/* Content based on activeTab */}
            {filteredReservations.length === 0 ? (
              <div className="text-center text-gray-600 py-8">
                {/* Placeholder from image */}
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                <p className="mt-2">No tienes reservas {activeTab === 'activas' ? 'activas' : activeTab}.</p>
                <p className="mt-1 text-sm">Cuando realices una reserva, vas a poder revisarla aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReservations.map(reservation => {
                  const startTime = parseISO(reservation.startTime);
                  const date = parseISO(reservation.date);
                  const isSelected = selectedReservation?.id === reservation.id;
                  
                  return (
                    <div 
                      key={reservation.id}
                      onClick={() => handleReservationClick(reservation)}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        isSelected 
                          ? 'bg-[#426a5a]/10 border-[#426a5a]' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium text-[#426a5a]">{reservation.facility.name}</div>
                        <div className="text-gray-500 text-sm">
                          {format(startTime, 'HH:mm')}hs
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(date, "EEEE d 'de' MMMM", { locale: es })}
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-xs font-medium bg-[#7fb685]/20 text-[#426a5a] px-2 py-1 rounded">
                          {reservation.facility.sport.name}
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded ${
                          reservation.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800' 
                            : reservation.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getStatusLabel(reservation.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalle de Reserva */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#426a5a] mb-4">Detalle de reserva</h2>
            
            {selectedReservation ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg text-[#426a5a]">{selectedReservation.facility.name}</h3>
                  <p className="text-[#426a5a]">{selectedReservation.facility.sport.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">
                      {format(parseISO(selectedReservation.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium">
                      {format(parseISO(selectedReservation.startTime), 'HH:mm')} - 
                      {format(parseISO(selectedReservation.endTime), 'HH:mm')}hs
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      selectedReservation.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedReservation.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusLabel(selectedReservation.status)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="font-medium">
                      ${selectedReservation.payment?.amount.toFixed(2) || 'No disponible'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Estado del pago</p>
                  <p className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedReservation.payment?.status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : selectedReservation.payment?.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getPaymentStatusLabel(selectedReservation.payment?.status)}
                  </p>
                </div>
                
                {/* We could add a button to cancel the reservation if it's active */}
                {activeTab === 'activas' && (
                  <div className="mt-6">
                    <button 
                      className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
                      // onClick={() => handleCancelReservation(selectedReservation.id)}
                    >
                      Cancelar reserva
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                <div className="mx-auto mb-4 h-12 w-2/3 max-w-[200px] rounded-lg bg-gray-300 flex items-center justify-center">
                   <div className="space-y-2">
                     <div className="h-2 w-16 bg-gray-400 rounded"></div>
                     <div className="h-2 w-10 bg-gray-400 rounded"></div>
                   </div>
                </div>
                <p>Selecciona una reserva para ver el detalle</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#426a5a]/90 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}