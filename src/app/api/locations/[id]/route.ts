import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ScheduleInput {
  dayOfWeek: number;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, address, phone, description, services, schedules } = await request.json();
    const locationId = params.id;

    console.log('Received data:', { name, address, phone, description, services, schedules });

    // Validar que los horarios sean válidos
    const validSchedules = schedules.map((schedule: ScheduleInput) => {
      const openingTime = new Date(schedule.openingTime);
      const closingTime = new Date(schedule.closingTime);

      // Asegurarse de que las fechas sean válidas
      if (isNaN(openingTime.getTime()) || isNaN(closingTime.getTime())) {
        throw new Error('Horarios inválidos');
      }

      return {
        dayOfWeek: schedule.dayOfWeek,
        isOpen: schedule.isOpen,
        openingTime,
        closingTime
      };
    });

    // Actualizar información general y servicios
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        name,
        address,
        phone,
        description,
        services,
        schedules: {
          deleteMany: {}, // Eliminar todos los horarios existentes
          create: validSchedules.map((schedule: { dayOfWeek: number; isOpen: boolean; openingTime: Date; closingTime: Date }) => ({
            dayOfWeek: schedule.dayOfWeek,
            isOpen: schedule.isOpen,
            openingTime: schedule.openingTime,
            closingTime: schedule.closingTime,
          })),
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