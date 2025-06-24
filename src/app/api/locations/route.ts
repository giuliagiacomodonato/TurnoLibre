import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
      { error: error instanceof Error ? error.message : 'Error al obtener las sedes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, address, phone, description, services, schedules } = await request.json();

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (name, address, phone)' },
        { status: 400 }
      );
    }

    // Validar y transformar horarios
    const validSchedules = (schedules || []).map((schedule: any) => {
      const openingTime = new Date(schedule.openingTime);
      const closingTime = new Date(schedule.closingTime);
      if (isNaN(openingTime.getTime()) || isNaN(closingTime.getTime())) {
        throw new Error(`Error en horario para día ${schedule.dayOfWeek}: Horarios inválidos`);
      }
      if (closingTime <= openingTime) {
        throw new Error(`Error en horario para día ${schedule.dayOfWeek}: La hora de cierre debe ser posterior a la hora de apertura`);
      }
      return {
        dayOfWeek: schedule.dayOfWeek,
        isOpen: schedule.isOpen,
        openingTime,
        closingTime,
      };
    });

    const createdLocation = await prisma.location.create({
      data: {
        name,
        address,
        phone,
        description,
        services: services || [],
        schedules: {
          create: validSchedules,
        },
      },
      include: {
        schedules: true,
        images: true,
      },
    });

    return NextResponse.json(createdLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    const message = error instanceof Error ? error.message : 'Error al crear la sede';
    const status = message.includes('Horario') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
} 