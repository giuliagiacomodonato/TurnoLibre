import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const location = await prisma.location.findFirst({
      include: {
        facilities: {
          include: {
            sport: true,
          },
        },
        schedules: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'No se encontró ninguna sede' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error al obtener sede:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener la sede' },
      { status: 500 }
    );
  }
} 