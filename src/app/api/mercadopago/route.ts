import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Configurás Mercado Pago con tu token de vendedor de prueba
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

// POST: crear preferencia o manejar webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // CREAR PREFERENCIA
    if (body.type === 'create_preference') {
      const preference = new Preference(client);

      const result = await preference.create({
        body: {
          items: body.items,
          back_urls: {
            success: 'https://proyecto-2-giacomodonato-kreczmer.vercel.app/success',
            failure: 'https://proyecto-2-giacomodonato-kreczmer.vercel.app/failure',
            pending: 'https://proyecto-2-giacomodonato-kreczmer.vercel.app/pending',
          },
          auto_return: 'approved',
        },
      });

      return NextResponse.json({ init_point: result.init_point });
    }

    // WEBHOOK: guardar notificación
    console.log('Webhook MercadoPago:', body);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en POST de MercadoPago:', error);
    return NextResponse.json({ error: 'Error procesando POST' }, { status: 500 });
  }
}

// GET: consultar el estado de un pago
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');

  if (!paymentId) {
    return NextResponse.json({ error: 'Falta payment_id' }, { status: 400 });
  }

  try {
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error consultando pago MercadoPago:', error);
    return NextResponse.json({ error: 'Error consultando pago' }, { status: 500 });
  }
}
