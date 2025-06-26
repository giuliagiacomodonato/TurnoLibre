import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/authOptions';
import { prisma } from '@/lib/prisma';
import { Header } from '../ui/Header';
import ReservasCliente from '../ui/ReservasCliente';
import ReservaAccesoRestringido from '../ui/ReservaAccesoRestringido';

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  facility: {
    name: string;
    sport: {
      name: string;
    };
  };
  payment: {
    amount: number;
    status: string;
  } | null;
}

export default async function ReservasPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20 flex flex-col">
        <Header />
        <ReservaAccesoRestringido />
        <footer className="bg-[#426a5a]/90 backdrop-blur-sm mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
          </div>
        </footer>
      </div>
    );
  }

  // Buscar el usuario y sus reservas
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  let reservations: Reservation[] = [];
  if (user) {
    const dbReservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      include: {
        facility: { include: { sport: true } },
        payment: true,
      },
      orderBy: { startTime: 'asc' },
    });
    reservations = dbReservations.map(r => ({
      ...r,
      reason: r.reason || undefined,
      date: typeof r.date === 'string' ? r.date : r.date.toISOString(),
      startTime: typeof r.startTime === 'string' ? r.startTime : r.startTime.toISOString(),
      endTime: typeof r.endTime === 'string' ? r.endTime : r.endTime.toISOString(),
    }));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#426a5a] mb-6">Mis Reservas</h1>
        <ReservasCliente reservas={reservations} />
      </main>
      <footer className="bg-[#426a5a]/90 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[#f2c57c]">Giulia Giacomodonato - Tomás Kreczmer</p>
        </div>
      </footer>
    </div>
  );
}