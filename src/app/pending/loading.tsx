import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white/80">
      <Image src="/logo.ico" alt="Logo" width={64} height={64} className="mb-4 rounded-full" />
      <div className="mb-2 text-xl font-semibold text-[#426a5a]">Procesando pago pendiente...</div>
      <div className="w-12 h-12 border-4 border-[#426a5a] border-t-transparent rounded-full animate-spin" />
    </div>
  );
} 