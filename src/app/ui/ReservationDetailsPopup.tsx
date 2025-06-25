'use client';

import { useState } from 'react';
import type { ReservationDetailsPopupProps } from '@/lib/types';

export function ReservationDetailsPopup({
  courtName,
  time,
  duration,
  price,
  onReserve,
  onClose,
  courtDescription,
  venueAddress,
}: ReservationDetailsPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-[#426a5a]">{courtName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {courtDescription && (
          <div className="mb-2 text-[#426a5a] text-sm">{courtDescription}</div>
        )}
        {venueAddress && (
          <div className="mb-2 text-[#426a5a] text-xs flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {venueAddress}
          </div>
        )}
        <div className="flex items-center text-[#426a5a] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{time}</span>
        </div>
        <div className="flex justify-between items-center bg-[#7fb685]/20 rounded-lg p-4 mb-6 border border-[#7fb685]/50">
          <span className="text-[#426a5a] font-semibold">{duration} min</span>
          <span className="text-[#426a5a] font-bold">$ {price.toLocaleString()}</span>
        </div>
        <button
          onClick={onReserve}
          className="w-full bg-[#426a5a] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7fb685] transition-colors duration-300"
        >
          Agregar al carrito  $ {price.toLocaleString()}
        </button>
      </div>
    </div>
  );
} 