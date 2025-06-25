 'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../ui/CartContext';
import { useSearchParams } from 'next/navigation';

export default function SuccessPageContent() {
  const { items, clear } = useCart();
  const searchParams = useSearchParams();

  // Convert local date and time to UTC for database storage
  const formatDateTimeToUTC = (dateStr: string, timeStr: string) => {
    // Create Date object from local date and time
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Create local date object
    const localDate = new Date(year, month - 1, day, hours, minutes);
    
    // Convert to UTC ISO string
    return localDate.toISOString();
  };

  useEffect(() => {
    const payment_id = searchParams.get('payment_id');
    if (payment_id && items.length > 0) {
      // Prepare items with proper UTC date/time format
      const processedItems = items.map(item => {
        // Create a copy of the item with date properly formatted for UTC
        return {
          ...item,
          // Store the original values
          localDate: item.date,
          localTime: item.time,
          // Add UTC formatted startTime
          startTimeUTC: formatDateTimeToUTC(item.date, item.time)
        };
      });

      console.log('Sending checkout with UTC times:', processedItems);

      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payment_id, 
          items: processedItems, 
          estado: 'success' 
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) clear();
        })
        .catch(err => {
          console.error("Error processing checkout:", err);
        });
    }
  }, [searchParams, items, clear]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">¡Pago realizado con éxito!</h1>
      <p className="mb-8 text-lg text-green-800">Tu reserva ha sido confirmada. ¡Gracias por tu compra!</p>
      <div className="flex space-x-4">
        <Link href="/">
          <span className="bg-green-700 text-white px-6 py-2 rounded shadow hover:bg-green-800 transition">Volver al inicio</span>
        </Link>
        <Link href="/reservas">
          <span className="bg-gray-200 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-300 transition">Ver mis reservas</span>
        </Link>
      </div>
    </div>
  );
}