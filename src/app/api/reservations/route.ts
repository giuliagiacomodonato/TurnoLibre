import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deporteParam = searchParams.get('deporte');
    const deporteId = searchParams.get('deporte');
    const usuarioId = searchParams.get('usuario');
    const userEmail = searchParams.get('userEmail'); // Add support for email lookup
    const fecha = searchParams.get('fecha');
    const hora = searchParams.get('hora');
    const estado = searchParams.get('estado');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    if (page < 1) {
      return NextResponse.json(
        { error: 'El número de página debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const where: any = {};
    const timeZone = 'America/Argentina/Buenos_Aires';

    if (estado) {
      where.status = estado;
    }

    if (deporteParam) {
      if (deporteParam.startsWith('sport_')) {
        where.facility = {
          sportId: deporteParam.replace('sport_', '')
        };
      } else if (deporteParam.startsWith('facility_')) {
        where.facilityId = deporteParam.replace('facility_', '');
      }
    } else if (deporteId) {
      where.facility = {
        sportId: deporteId
      };
    }

    // Handle user filtering - by ID or email
    if (usuarioId) {
      where.userId = usuarioId;
    } else if (userEmail) {
      // Find the user by email first
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      });
      
      if (user) {
        console.log("Found user by email:", user.id);
        where.userId = user.id;
      } else {
        console.log("No user found with email:", userEmail);
        // Return empty results if user not found
        return NextResponse.json({
          reservations: [],
          pagination: {
            total: 0,
            pageSize,
            currentPage: page,
            totalPages: 0
          }
        });
      }
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
          { error: 'Formato de fecha inválido. Use YYYY-MM-DD' },
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
          { error: 'Formato de hora inválido. Use HH:mm' },
          { status: 400 }
        );
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.reservation.count({ where });

    if (totalCount === 0) {
      return NextResponse.json({
        reservations: [],
        pagination: {
          total: 0,
          pageSize,
          currentPage: page,
          totalPages: 0
        }
      });
    }

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
            availability: {
              select: {
                slotDuration: true,
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
    console.error('Error al obtener reservas:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener las reservas' },
      { status: error instanceof Error && error.message.includes('inválido') ? 400 : 500 }
    );
  }
}