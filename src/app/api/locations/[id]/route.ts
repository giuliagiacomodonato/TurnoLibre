import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ScheduleInput {
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const { name, address, phone, description, services, schedules } = await request.json();

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (name, address, phone)' },
        { status: 400 }
      );
    }

    const validSchedules = schedules.map((schedule: ScheduleInput) => {
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
    const message = error instanceof Error ? error.message : 'Error al actualizar la sede';
    const status = message.includes('Horario') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar sede:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar la sede';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
