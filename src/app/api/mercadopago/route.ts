import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// Webhook para notificaciones de MercadoPago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Aquí puedes manejar eventos de MercadoPago (payment, merchant_order, etc)
    // Por ejemplo, guardar el estado del pago en tu base de datos
    console.log('Webhook MercadoPago:', body);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en webhook de MercadoPago:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}

// Endpoint para consultar el estado de un pago
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