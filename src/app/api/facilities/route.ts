import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    const where: any = {};
    if (locationId) {
      where.locationId = locationId;
    }

    const facilities = await prisma.facility.findMany({
      where,
      include: {
        sport: true,
        location: { include: { schedules: true } },
        schedules: true,
        availability: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error al obtener instalaciones:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener las instalaciones' },
      { status: 500 }
    );
  }
}

// POST: Crear nueva cancha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, sportName, description, locationId, reglas } = body;

    if (!name || !price || !sportName || !locationId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (name, price, sportName, locationId)' },
        { status: 400 }
      );
    }

    // Buscar el deporte por nombre
    const sport = await prisma.sport.findFirst({ where: { name: sportName } });
    if (!sport) {
      return NextResponse.json({ error: 'Deporte no encontrado' }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        price,
        description,
        sportId: sport.id,
        locationId,
      },
      include: {
        sport: true,
        location: true,
        schedules: true,
      },
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error al crear instalación:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear la instalación' },
      { status: 500 }
    );
  }
}