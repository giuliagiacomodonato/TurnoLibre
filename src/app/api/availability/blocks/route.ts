import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const facilityId = searchParams.get('facilityId');

  if (!date || !facilityId) {
    return NextResponse.json(
      { error: 'Faltan parámetros: date y facilityId son requeridos' },
      { status: 400 }
    );
  }

  try {
    const dateObj = new Date(date);

    // Find all reservations for the facility on the given date, including BLOCKED, CONFIRMED and PENDING
    const reservations = await prisma.reservation.findMany({
      where: {
        facilityId,
        date: dateObj,
        status: {
          in: ['BLOCKED', 'CONFIRMED', 'PENDING'],
        },
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error al obtener bloques:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}