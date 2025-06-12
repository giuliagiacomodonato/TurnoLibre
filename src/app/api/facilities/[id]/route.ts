import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();
    const { name, price, sportName, description, reglas } = body;

    if (!name || !price || !sportName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (name, price, sportName)' },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar la instalación' },
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
    await prisma.facility.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar instalación:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar la instalación' },
      { status: 500 }
    );
  }
}
