import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
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
          },
        },
      },
    });
    return NextResponse.json(sports);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching sports' }, { status: 500 });
  }
} 