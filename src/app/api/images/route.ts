import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { link, locationId } = await request.json();

    if (!link || !locationId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (link, locationId)' },
        { status: 400 }
      );
    }

    // Verificar que la location existe
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      return NextResponse.json({ error: 'Sede no encontrada' }, { status: 404 });
    }

    // Crear la imagen en la base de datos
    const image = await prisma.image.create({
      data: {
        link,
        locationId,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error creating image:', error);
    return NextResponse.json(
      { error: 'Error al crear la imagen' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json({ error: 'ID de imagen requerido' }, { status: 400 });
    }

    // Eliminar la imagen de la base de datos
    await prisma.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
} 