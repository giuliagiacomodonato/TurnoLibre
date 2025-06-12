"use client";

import dynamic from 'next/dynamic';

const ReservationsTable = dynamic(() => import('./ReservationsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Cargando reservas...</div>
    </div>
  ),
});

export default function ClientWrapper() {
  return <ReservationsTable />;
} 