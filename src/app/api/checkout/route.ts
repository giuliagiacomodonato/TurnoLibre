import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { PaymentStatus, ReservationStatus } from '@prisma/client';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, items, estado } = body;
    if (!payment_id || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Obtener usuario autenticado
    const session = await getServerSession(authOptions) as { user?: { email?: string } } | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Consultar estado real del pago en MercadoPago
    let status: PaymentStatus = PaymentStatus.PENDING;
    let amount = 0;
    try {
      const payment = new Payment(client);
      const result = await payment.get({ id: payment_id });
      amount = result.transaction_amount || 0;
      if (result.status === 'approved') status = PaymentStatus.PAID;
      else if (result.status === 'pending') status = PaymentStatus.PENDING;
      else if (result.status === 'rejected') status = PaymentStatus.FAILED;
    } catch (e) {
      // Si falla la consulta, usar el estado pasado
      if (estado === 'success') status = PaymentStatus.PAID;
      else if (estado === 'pending') status = PaymentStatus.PENDING;
    }

    console.log('Antes de crear pago', { amount, status });
    // Crear pago en la base de datos
    const pago = await prisma.payment.create({
      data: {
        amount,
        status,
      },
    });
    console.log('Pago creado', pago);

    // Crear reservas por cada item
    const reservas = await Promise.all(items.map(async (item: any) => {
      // item debe tener: id, name, date, time, court, price, facilityId
      if (!item.facilityId || !item.date || !item.time) return null;
      // Calcular startTime y endTime
      const startTime = new Date(`${item.date}T${item.time}`);
      // Suponemos duración 1 hora
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      const reserva = await prisma.reservation.create({
        data: {
          userId: user.id,
          facilityId: item.facilityId,
          paymentId: pago.id,
          date: new Date(item.date),
          startTime,
          endTime,
          status: ReservationStatus.CONFIRMED,
          reason: '',
        },
      });
      console.log('Reserva creada', reserva);
      return reserva;
    }));

    return NextResponse.json({ success: true, pago, reservas });
  } catch (error) {
    console.error('Error en checkout:', error);
    return NextResponse.json({ error: 'Error procesando checkout' }, { status: 500 });
  }
} 