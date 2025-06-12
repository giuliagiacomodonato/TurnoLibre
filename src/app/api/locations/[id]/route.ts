import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ScheduleInput {
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID no encontrado en la URL' }, { status: 400 });
    }

    const { name, address, phone, description, services, schedules } = await request.json();

    console.log('Received data:', { name, address, phone, description, services, schedules });

    const validSchedules = schedules.map((schedule: ScheduleInput) => {
      const openingTime = new Date(schedule.openingTime);
      const closingTime = new Date(schedule.closingTime);

      if (isNaN(openingTime.getTime()) || isNaN(closingTime.getTime())) {
        throw new Error('Horarios inválidos');
      }

      return {
        dayOfWeek: schedule.dayOfWeek,
        isOpen: schedule.isOpen,
        openingTime,
        closingTime,
      };
    });

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        description,
        services,
        schedules: {
          deleteMany: {},
          create: validSchedules,
        },
      },
      include: {
        schedules: true,
      },
    });

    console.log('Updated location:', updatedLocation);

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar la sede' },
      { status: 500 }
    );
  }
}
