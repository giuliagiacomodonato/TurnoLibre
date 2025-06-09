import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const facilityId = searchParams.get('facilityId');

    if (!date || !facilityId) {
      return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 });
    }

    const blocks = await prisma.reservation.findMany({
      where: {
        facilityId,
        date: new Date(date),
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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 