import Link from 'next/link';

export default function SuccessPage() {
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