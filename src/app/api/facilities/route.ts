import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        sport: true,
      },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error al obtener instalaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 