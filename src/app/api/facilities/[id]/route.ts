import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, price, sportId, locationId } = await request.json();

    if (!name || !price || !sportId || !locationId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (name, price, sportId, locationId)' },
        { status: 400 }
      );
    }

    const updatedFacility = await prisma.facility.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        sportId,
        locationId,
      },
    });

    return NextResponse.json(updatedFacility);
  } catch (error) {
    console.error('Error updating facility:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar la cancha';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.facility.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cancha:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar la cancha';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
