import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deporteId = searchParams.get('deporte');
    const usuarioId = searchParams.get('usuario');
    const fecha = searchParams.get('fecha');
    const hora = searchParams.get('hora');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    const timeZone = 'America/Argentina/Buenos_Aires';

    if (deporteId) {
      where.facility = {
        sportId: deporteId
      };
    }

    if (usuarioId) {
      where.userId = usuarioId;
    }

    if (fecha && fecha !== '') {
      try {
        // Parse the date string first
        const dateObj = parseISO(fecha);
        const startOfDayUTC = toZonedTime(dateObj, timeZone);
        const endOfDayUTC = toZonedTime(new Date(dateObj.setHours(23, 59, 59, 999)), timeZone);
        
        where.date = {
          gte: startOfDayUTC,
          lte: endOfDayUTC,
        };
      } catch (error) {
        return NextResponse.json(
          { error: 'Formato de fecha inválido' },
          { status: 400 }
        );
      }
    }

    if (hora && hora !== '') {
      try {
        // Parse the date and time together
        const baseDate = fecha || new Date().toISOString().split('T')[0];
        const [hours] = hora.split(':');
        const dateTimeStr = `${baseDate}T${hours}:00:00`;
        const dateTimeObj = parseISO(dateTimeStr);
        
        const startTimeUTC = toZonedTime(dateTimeObj, timeZone);
        const endTimeUTC = toZonedTime(new Date(dateTimeObj.setHours(Number(hours) + 1)), timeZone);
        
        where.startTime = {
          gte: startTimeUTC,
          lt: endTimeUTC,
        };
      } catch (error) {
        return NextResponse.json(
          { error: 'Formato de hora inválido' },
          { status: 400 }
        );
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.reservation.count({ where });

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        facility: {
          select: {
            name: true,
            sport: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      reservations,
      pagination: {
        total: totalCount,
        pageSize,
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener las reservas' },
      { status: 500 }
    );
  }
} 