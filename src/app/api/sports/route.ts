import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sports = await prisma.sport.findMany({
      include: {
        facilities: {
          include: {
            location: true,
            reservations: {
              where: {
                date: {
                  gte: new Date(),
                },
              },
            },
            availability: true,
          },
        },
      },
    });
    return NextResponse.json(sports);
  } catch (error) {
    console.error('Error fetching sports:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener los deportes' },
      { status: 500 }
    );
  }
} 