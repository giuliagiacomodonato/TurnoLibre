import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        facilities: {
          include: {
            sport: true,
          },
        },
        schedules: true,
        images: true,
      },
    });
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Error al obtener las sedes' },
      { status: 500 }
    );
  }
} 