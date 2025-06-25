"use client";
import { useState } from 'react';
import { format, parseISO, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

interface Reservation {
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
}

export default function ReservasCliente({ reservas }: { reservas: Reservation[] }) {
  const [activeTab, setActiveTab] = useState<'activas' | 'pasadas' | 'canceladas'>('activas');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const now = new Date();
  const filteredReservations = reservas.filter(reservation => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna Izquierda: Lista de Reservas */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'activas' ? 'border-b-2 border-[#426a5a] text-[#426a5a]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('activas'); setSelectedReservation(null); }}
          >
            ACTIVAS
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'pasadas' ? 'border-b-2 border-[#426a5a] text-[#426a5a]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('pasadas'); setSelectedReservation(null); }}
          >
            PASADAS
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'canceladas' ? 'border-b-2 border-[#426a5a] text-[#426a5a]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveTab('canceladas'); setSelectedReservation(null); }}
          >
            CANCELADAS
          </button>
        </div>
        {filteredReservations.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            <p className="mt-2">No tienes reservas {activeTab === 'activas' ? 'activas' : activeTab}.</p>
            <p className="mt-1 text-sm">Cuando realices una reserva, vas a poder revisarla aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReservations.map(reservation => {
              const localStartTime = toZonedTime(parseISO(reservation.startTime), Intl.DateTimeFormat().resolvedOptions().timeZone);
              const localDate = toZonedTime(parseISO(reservation.date), Intl.DateTimeFormat().resolvedOptions().timeZone);
              const isSelected = selectedReservation?.id === reservation.id;
              return (
                <div
                  key={reservation.id}
                  onClick={() => setSelectedReservation(reservation)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#426a5a]/10 border-[#426a5a]'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium text-[#426a5a]">{reservation.facility.name}</div>
                    <div className="text-gray-500 text-sm">{format(localStartTime, 'HH:mm')}hs</div>
                  </div>
                  <div className="text-sm text-gray-600">{reservation.date?.slice(0, 10) || '-'}</div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs font-medium bg-[#7fb685]/20 text-[#426a5a] px-2 py-1 rounded">{reservation.facility.sport.name}</div>
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
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 self-start">
        <h2 className="text-xl font-bold text-[#426a5a] mb-4">Detalle de reserva</h2>
        {selectedReservation ? (
          activeTab === 'pasadas' ? (
            <div className="space-y-2">
              <div className="font-bold text-lg text-[#426a5a]">{selectedReservation.facility.name}</div>
              <div className="text-[#426a5a]">{selectedReservation.facility.sport.name}</div>
              <div className="text-sm text-gray-500">Fecha</div>
              <div className="font-medium">
                {selectedReservation.date?.slice(0, 10) || '-'}
              </div>
              <div className="text-sm text-gray-500">Horario</div>
              <div className="font-medium">
                {format(toZonedTime(parseISO(selectedReservation.startTime), Intl.DateTimeFormat().resolvedOptions().timeZone), 'HH:mm')} - {format(toZonedTime(parseISO(selectedReservation.endTime), Intl.DateTimeFormat().resolvedOptions().timeZone), 'HH:mm')}hs
              </div>
              <div className="text-sm text-gray-500">Estado</div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                selectedReservation.status === 'CONFIRMED'
                  ? 'bg-green-100 text-green-800'
                  : selectedReservation.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatusLabel(selectedReservation.status)}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-bold text-lg text-[#426a5a]">{selectedReservation.facility.name}</div>
              <div className="text-[#426a5a]">{selectedReservation.facility.sport.name}</div>
              <div className="text-sm text-gray-500">Fecha</div>
              <div className="font-medium">
                {selectedReservation.date?.slice(0, 10) || '-'}
              </div>
              <div className="text-sm text-gray-500">Horario</div>
              <div className="font-medium">
                {format(toZonedTime(parseISO(selectedReservation.startTime), Intl.DateTimeFormat().resolvedOptions().timeZone), 'HH:mm')} - {format(toZonedTime(parseISO(selectedReservation.endTime), Intl.DateTimeFormat().resolvedOptions().timeZone), 'HH:mm')}hs
              </div>
              <div className="text-sm text-gray-500">Estado</div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                selectedReservation.status === 'CONFIRMED'
                  ? 'bg-green-100 text-green-800'
                  : selectedReservation.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatusLabel(selectedReservation.status)}
              </div>
              <div className="text-sm text-gray-500">Precio</div>
              <div className="font-medium">
                ${selectedReservation.payment?.amount.toFixed(2) || 'No disponible'}
              </div>
              <div className="text-sm text-gray-500">Estado del pago</div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                selectedReservation.payment?.status === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : selectedReservation.payment?.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {getPaymentStatusLabel(selectedReservation.payment?.status)}
              </div>
              {activeTab === 'activas' && (
                <button
                  className="w-full mt-4 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
                  // onClick={() => handleCancelReservation(selectedReservation.id)}
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          )
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
  );
} 