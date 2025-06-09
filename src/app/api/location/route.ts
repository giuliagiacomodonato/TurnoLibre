import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const location = await prisma.location.findFirst({
      include: {
        facilities: {
          include: {
            sport: true,
          },
        },
        schedules: true,
      },
    });
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching location' }, { status: 500 });
  }
} 