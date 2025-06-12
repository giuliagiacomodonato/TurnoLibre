import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';

// Helper function to validate date format and value
function validateDate(dateStr: string, fieldName: string) {
  // Validate date format (YYYY-MM-DD or ISO string)
  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(dateStr)) {
    throw new Error(`Formato de ${fieldName} inválido. Use YYYY-MM-DD o formato ISO`);
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} inválido`);
  }

  return parsedDate;
}

export async function POST(req: Request) {
  try {
    const { facilityId, date, startTime, endTime, isBlocked } = await req.json();

    // Validate required fields
    if (!facilityId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos (facilityId, date, startTime, endTime)' },
        { status: 400 }
      );
    }

    // Validate dates
    const parsedDate = validateDate(date, 'fecha');
    const parsedStartTime = validateDate(startTime, 'hora de inicio');
    const parsedEndTime = validateDate(endTime, 'hora de fin');

    // Validate that endTime is after startTime
    if (parsedEndTime <= parsedStartTime) {
      return NextResponse.json(
        { error: 'La hora de fin debe ser posterior a la hora de inicio' },
        { status: 400 }
      );
    }

    // Si isBlocked es true, creamos un bloque
    if (isBlocked) {
      const reservation = await prisma.reservation.create({
        data: {
          facilityId,
          date: parsedDate,
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          status: ReservationStatus.BLOCKED,
          userId: '38807be5-5ea6-47b5-b5ac-e852ac4b9a0b', // ID real del admin
        },
      });
      return NextResponse.json(reservation);
    } else {
      // Si isBlocked es false, eliminamos el bloque existente
      const existingBlock = await prisma.reservation.findFirst({
        where: {
          facilityId,
          date: parsedDate,
          startTime: parsedStartTime,
          endTime: parsedEndTime,
          status: ReservationStatus.BLOCKED,
        },
      });

      if (existingBlock) {
        await prisma.reservation.delete({
          where: { id: existingBlock.id },
        });
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error al manejar bloque de disponibilidad:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: error instanceof Error && error.message.includes('inválido') ? 400 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar bloque de disponibilidad:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}