import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toZonedTime } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

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

    if (page < 1) {
      return NextResponse.json(
        { error: 'El número de página debe ser mayor a 0' },
        { status: 400 }
      );
    }

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

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/checkout')) {
    try {
      const { items, userEmail } = await request.json();
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'No hay items para pagar' }, { status: 400 });
      }
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: items.map((item: any) => ({
            id: item.id,
            title: item.name,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: item.price,
            description: `${item.court} - ${item.date} - ${item.time}`,
            picture_url: item.image || undefined,
          })),
          payer: userEmail ? { email: userEmail } : undefined,
          back_urls: {
            success: process.env.NEXT_PUBLIC_MP_SUCCESS_URL || 'http://localhost:3000/inicio/carrito?status=success',
            failure: process.env.NEXT_PUBLIC_MP_FAILURE_URL || 'http://localhost:3000/inicio/carrito?status=failure',
            pending: process.env.NEXT_PUBLIC_MP_PENDING_URL || 'http://localhost:3000/inicio/carrito?status=pending',
          },
          auto_return: 'approved',
        }
      });
      return NextResponse.json({ init_point: result.init_point });
    } catch (error: any) {
      console.error('Error MercadoPago:', error);
      return NextResponse.json({ error: error?.message || 'Error al crear preferencia de pago', details: error?.response?.data || error }, { status: 500 });
    }
  }
  // ... existing code ...
} 