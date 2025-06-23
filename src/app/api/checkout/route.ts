import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
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
    const reservas = await Promise.all(items.map(async (item: any, index: number) => {
      try {
        // item debe tener: id, name, date, time, court, price, facilityId, startTimeUTC
        console.log(`Procesando item ${index}:`, item);
        
        if (!item.facilityId) {
          console.error(`Item ${index} no tiene facilityId:`, item);
          return null;
        }
        
        if (!item.date) {
          console.error(`Item ${index} no tiene date:`, item);
          return null;
        }
        
        if (!item.time) {
          console.error(`Item ${index} no tiene time:`, item);
          return null;
        }
        
        // Obtener la información de la facility para calcular el slotDuration
        const facility = await prisma.facility.findUnique({
          where: { id: item.facilityId },
          include: {
            availability: true,
          },
        });
        
        if (!facility) {
          console.error(`Facility ${item.facilityId} no encontrada`);
          return null;
        }
        
        // Calcular el día de la semana para obtener el slotDuration correcto
        const [year, month, day] = item.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();
        
        // Buscar la availability para ese día de la semana
        const availability = facility.availability.find(a => a.dayOfWeek === dayOfWeek);
        const slotDuration = availability?.slotDuration || 60; // Default 60 minutos si no se encuentra
        
        // Usar startTimeUTC si está disponible, o calcular a partir de date y time
        let startTime;
        let endTime;
        
        if (item.startTimeUTC) {
          // Si se envió el tiempo en UTC, usarlo directamente
          startTime = new Date(item.startTimeUTC);
          // Calcular endTime basado en slotDuration
          endTime = new Date(startTime.getTime() + slotDuration * 60 * 1000);
        } else {
          // Calcular startTime y endTime (compatibilidad con versiones anteriores)
          startTime = new Date(`${item.date}T${item.time}`);
          // Calcular endTime basado en slotDuration
          endTime = new Date(startTime.getTime() + slotDuration * 60 * 1000);
        }
        
        console.log(`Creando reserva para facilityId=${item.facilityId}, startTime=${startTime.toISOString()}, endTime=${endTime.toISOString()}, slotDuration=${slotDuration} minutos`);
        
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
        console.log('Reserva creada con éxito:', reserva);
        return reserva;
      } catch (error) {
        console.error(`Error creando reserva para item ${index}:`, error);
        return null;
      }
    }));

    // Filtrar reservas nulas y contar cuántas se crearon con éxito
    const reservasCreadas = reservas.filter(r => r !== null);
    console.log(`Creadas ${reservasCreadas.length} reservas de ${items.length} items`);

    return NextResponse.json({ success: true, pago, reservas: reservasCreadas });
  } catch (error) {
    console.error('Error en checkout:', error);
    return NextResponse.json({ error: 'Error procesando checkout' }, { status: 500 });
  }
}