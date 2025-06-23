'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../ui/CartContext';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const { items, clear } = useCart();
  const searchParams = useSearchParams();

  useEffect(() => {
    const payment_id = searchParams.get('payment_id');
    if (payment_id && items.length > 0) {
      // Enviar datos al backend
      fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id, items: items.map(i => ({ ...i })), estado: 'success' }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) clear();
        });
        console.log('useEffect success', { items, payment_id })
    }
  }, [searchParams, items, clear]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">¡Pago realizado con éxito!</h1>
      <p className="mb-8 text-lg text-green-800">Gracias por tu compra. Tu pago fue aprobado.</p>
      <Link href="/">
        <span className="bg-green-700 text-white px-6 py-2 rounded shadow hover:bg-green-800 transition">Volver al inicio</span>
      </Link>
    </div>
  );
} 