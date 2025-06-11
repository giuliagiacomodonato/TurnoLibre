import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { facilityId, dayOfWeek, openingTime, closingTime, slotDuration } = await request.json();

    // Si el día es "Todos", crear/actualizar para cada día de la semana (0=Domingo ... 6=Sábado)
    const diasSemana = [0, 1, 2, 3, 4, 5, 6];
    const daysToProcess =
      dayOfWeek === null || dayOfWeek === "Todos" || dayOfWeek === undefined
        ? diasSemana
        : [Number(dayOfWeek)];

    const results = [];
    for (const dow of daysToProcess) {
      // Buscar si ya existe una regla para ese facility y dayOfWeek
      const existing = await prisma.facilityAvailability.findFirst({
        where: {
          facilityId,
          dayOfWeek: dow,
        },
      });

      if (existing) {
        // Actualizar
        const updated = await prisma.facilityAvailability.update({
          where: { id: existing.id },
          data: {
            openingTime: new Date(`1970-01-01T${openingTime}:00Z`),
            closingTime: new Date(`1970-01-01T${closingTime}:00Z`),
            slotDuration: Number(slotDuration),
          },
        });
        results.push(updated);
      } else {
        // Crear
        const created = await prisma.facilityAvailability.create({
          data: {
            facilityId,
            dayOfWeek: dow,
            openingTime: new Date(`1970-01-01T${openingTime}:00Z`),
            closingTime: new Date(`1970-01-01T${closingTime}:00Z`),
            slotDuration: Number(slotDuration),
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error al guardar disponibilidad:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
