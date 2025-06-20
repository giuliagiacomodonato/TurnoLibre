import Link from 'next/link';

export default function FailurePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Pago rechazado o fallido</h1>
      <p className="mb-8 text-lg text-red-800">Tu pago no pudo ser procesado. Por favor, intenta nuevamente o usa otro método de pago.</p>
      <Link href="/inicio/carrito">
        <span className="bg-red-700 text-white px-6 py-2 rounded shadow hover:bg-red-800 transition">Volver al carrito</span>
      </Link>
    </div>
  );
} 