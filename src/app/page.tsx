import Link from 'next/link';
import { Header } from './ui/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold text-[#426a5a] mb-4">
            TurnoLibre
          </h1>
          
          <p className="text-xl text-[#426a5a] mb-8">
            Tu plataforma para reservar instalaciones deportivas de manera rápida y sencilla. 
            Encuentra y reserva canchas, piscinas y más instalaciones deportivas en tu área.
          </p>

          <div className="space-y-4">
            <p className="text-lg text-[#426a5a]">
              • Reserva en minutos<br />
              • Pago seguro<br />
              • Gestión de turnos en tiempo real<br />
              • Instalaciones de calidad
            </p>
          </div>

          <div className="mt-12">
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
