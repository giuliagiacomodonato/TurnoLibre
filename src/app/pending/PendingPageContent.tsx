'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../ui/CartContext';
import { useSearchParams } from 'next/navigation';

export default function PendingPageContent() {
  const { items, clear } = useCart();
  const searchParams = useSearchParams();

  useEffect(() => {
    const payment_id = searchParams.get('payment_id');
    if (payment_id && items.length > 0) {
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id, items: items.map(i => ({ ...i })), estado: 'pending' }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) clear();
        });
    }
  }, [searchParams, items, clear]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
      <h1 className="text-3xl font-bold text-yellow-700 mb-4">Pago pendiente</h1>
      <p className="mb-8 text-lg text-yellow-800">Tu pago está siendo procesado. Te avisaremos cuando se acredite.</p>
      <Link href="/">
        <span className="bg-yellow-700 text-white px-6 py-2 rounded shadow hover:bg-yellow-800 transition">Volver al inicio</span>
      </Link>
    </div>
  );
} 