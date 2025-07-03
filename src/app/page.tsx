import Link from 'next/link';
import { Header } from './ui/Header';
import { ClockIcon, CreditCardIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold text-[#426a5a] mb-4 animate-fade-in-down">
            TurnoLibre
          </h1>
          
          <p className="text-xl text-[#426a5a] mb-8 animate-fade-in">
            Tu plataforma para reservar instalaciones deportivas de manera rápida y sencilla. 
            Encuentra y reserva canchas y más instalaciones deportivas en tu área.
          </p>

          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3 text-lg text-[#426a5a]">
              <ClockIcon className="h-6 w-6 text-[#7fb685]" />
              <span>Reserva en minutos</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-[#426a5a]">
              <CreditCardIcon className="h-6 w-6 text-[#7fb685]" />
              <span>Pago seguro</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-[#426a5a]">
              <CheckCircleIcon className="h-6 w-6 text-[#7fb685]" />
              <span>Gestión de turnos en tiempo real</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-[#426a5a]">
              <StarIcon className="h-6 w-6 text-[#7fb685]" />
              <span>Instalaciones de calidad</span>
            </div>
          </div>

          <div className="mt-12 animate-bounce-in">
            <Link 
              href="/inicio"
              className="inline-block px-8 py-4 text-lg font-semibold text-white bg-[#426a5a] rounded-lg shadow-lg hover:bg-[#7fb685] transition-colors duration-300 transform hover:scale-105"
            >
              Ver Turnos
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
