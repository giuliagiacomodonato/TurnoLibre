'use client';

import { useState } from 'react';

interface VenueHoursProps {
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export function VenueHours({ hours }: VenueHoursProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Agrupar horarios por tipo (todos los días iguales)
  const isAllDaysSame = hours.every(h => h.open === hours[0].open && h.close === hours[0].close);
  const schedule = isAllDaysSame 
    ? `Lunes a Domingo: ${hours[0].open} - ${hours[0].close}`
    : 'Ver horarios';

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-[#426a5a]"
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xl font-bold">Horarios</span>
        </div>
        <span>{schedule}</span>
      </button>

      {isOpen && !isAllDaysSame && (
        <div className="mt-4 space-y-2">
          {hours.map((schedule, index) => (
            <div key={index} className="flex justify-between items-center text-[#426a5a]">
              <span className="font-medium">{schedule.day}</span>
              <span>{schedule.open} - {schedule.close}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}