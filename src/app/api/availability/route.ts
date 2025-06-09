import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { facilityId, date, startTime, endTime, isBlocked } = await req.json();

    // Si isBlocked es true, creamos un bloque
    if (isBlocked) {
      const reservation = await prisma.reservation.create({
        data: {
          facilityId,
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
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
          date: new Date(date),
          startTime: new Date(startTime),
          endTime: new Date(endTime),
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
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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