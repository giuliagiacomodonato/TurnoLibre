import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ScheduleInput {
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const id = params.id;
    const { name, address, phone, description, services, schedules } = await request.json();

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (name, address, phone)' },
        { status: 400 }
      );
    }

    const validSchedules = schedules.map((schedule: ScheduleInput) => {
      try {
        const openingTime = new Date(schedule.openingTime);
        const closingTime = new Date(schedule.closingTime);

        if (isNaN(openingTime.getTime()) || isNaN(closingTime.getTime())) {
          throw new Error('Horarios inválidos');
        }

        if (closingTime <= openingTime) {
          throw new Error('La hora de cierre debe ser posterior a la hora de apertura');
        }

        return {
          dayOfWeek: schedule.dayOfWeek,
          isOpen: schedule.isOpen,
          openingTime,
          closingTime,
        };
      } catch (error) {
        throw new Error(`Error en horario para día ${schedule.dayOfWeek}: ${error instanceof Error ? error.message : 'Horario inválido'}`);
      }
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

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar la sede' },
      { status: error instanceof Error && error.message.includes('inválido') ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const id = params.id;
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar sede:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar la sede' },
      { status: 500 }
    );
  }
}
