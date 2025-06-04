'use client';

import { useState } from 'react';
import { Header } from '../ui/Header';

export default function ReservasPage() {
  const [activeTab, setActiveTab] = useState('activas'); // 'activas', 'pasadas', 'canceladas'

  // TODO: Fetch user reservations based on activeTab
  const reservations = []; // Placeholder for fetched data

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
            {reservations.length === 0 ? (
              <div className="text-center text-gray-600 py-8">
                {/* Placeholder from image */}
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                <p className="mt-2">No tienes reservas {activeTab === 'activas' ? 'activas' : activeTab}.</p>
                <p className="mt-1 text-sm">Cuando realices una reserva, vas a poder revisarla aquí.</p>
              </div>
            ) : (
              // TODO: Map over reservations to display them
              <div>Lista de reservas...</div>
            )}
          </div>

          {/* Columna Derecha: Detalle de Reserva */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#426a5a] mb-4">Detalle de reserva</h2>
            <div className="text-center text-gray-600 py-8">
               {/* Placeholder from image */}
              <div className="mx-auto mb-4 h-12 w-2/3 max-w-[200px] rounded-lg bg-gray-300 flex items-center justify-center">
                 <div className="space-y-2">
                   <div className="h-2 w-16 bg-gray-400 rounded"></div>
                   <div className="h-2 w-10 bg-gray-400 rounded"></div>
                 </div>
              </div>
              <p>Selecciona una reserva para ver el detalle</p>
            </div>
            {/* TODO: Display selected reservation details here */}
          </div>
        </div>
      </main>

      {/* Footer placeholder - You might want to add a real footer component */}
       <footer className="bg-[#426a5a]/90 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
        </div>
      </footer>
    </div>
  );
} 