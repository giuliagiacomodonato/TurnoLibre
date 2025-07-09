'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../ui/CartContext';
import { useSearchParams } from 'next/navigation';

export default function FailurePageContent() {
  const { items, isHydrated } = useCart();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log failure but don't clear cart to allow retry
    const payment_id = searchParams.get('payment_id');
    if (payment_id) {
      console.log('Payment failed:', payment_id);
    }
  }, [searchParams]);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Pago no completado</h1>
      <p className="mb-8 text-lg text-red-800">Hubo un problema al procesar tu pago. No se ha realizado ningún cargo.</p>
      <div className="flex space-x-4">
        <Link href="/">
          <span className="bg-red-700 text-white px-6 py-2 rounded shadow hover:bg-red-800 transition">Volver al inicio</span>
        </Link>
        <Link href="/cart">
          <span className="bg-gray-200 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-300 transition">Reintentar pago</span>
        </Link>
      </div>
    </div>
  );
}