import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { ReservationStatus } from '@prisma/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        facility: {
          include: {
            sport: true,
            location: true,
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Solo el usuario que hizo la reserva o un admin puede verla
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.id !== reservation.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener la reserva' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { status, reason } = await request.json();

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    // Solo el usuario que hizo la reserva o un admin puede cancelarla
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.id !== reservation.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Solo permitir actualizar a CANCELLED con un motivo
    if (status === ReservationStatus.CANCELLED && !reason) {
      return NextResponse.json({ error: 'Se requiere un motivo para cancelar' }, { status: 400 });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        reason: status === ReservationStatus.CANCELLED ? reason : reservation.reason,
      },
      include: {
        facility: {
          include: {
            sport: true,
          },
        },
        payment: true,
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar la reserva' },
      { status: 500 }
    );
  }
}
