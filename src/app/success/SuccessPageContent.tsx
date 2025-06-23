'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../ui/CartContext';
import { useSearchParams } from 'next/navigation';

export default function SuccessPageContent() {
  const { items, clear } = useCart();
  const searchParams = useSearchParams();

  useEffect(() => {
    const payment_id = searchParams.get('payment_id');
    if (payment_id && items.length > 0) {
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id, items: items.map(i => ({ ...i })), estado: 'success' }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) clear();
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