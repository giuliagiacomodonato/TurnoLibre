import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, price, sportName, description, reglas } = body;

    // Buscar el deporte por nombre
    const sport = await prisma.sport.findFirst({ where: { name: sportName } });
    if (!sport) {
      return NextResponse.json({ error: 'Deporte no encontrado' }, { status: 400 });
    }

    const updated = await prisma.facility.update({
      where: { id },
      data: {
        name,
        price,
        description,
        sportId: sport.id,
        // Si quieres guardar reglas, deberías tener un campo o tabla asociada
      },
      include: {
        sport: true,
        location: true,
        schedules: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar instalación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.facility.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar instalación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
