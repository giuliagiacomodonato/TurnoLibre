import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const facilityId = searchParams.get('facilityId');

    if (!date || !facilityId) {
      return NextResponse.json(
        { error: 'Parámetros requeridos (date, facilityId)' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Create date object and validate it's a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Fecha inválida' },
        { status: 400 }
      );
    }

    const blocks = await prisma.reservation.findMany({
      where: {
        facilityId,
        date: parsedDate,
        status: 'BLOCKED',
      },
      include: {
        facility: {
          include: {
            sport: true,
          },
        },
      },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error al obtener bloques de disponibilidad:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: error instanceof Error && error.message.includes('inválido') ? 400 : 500 }
    );
  }
} 