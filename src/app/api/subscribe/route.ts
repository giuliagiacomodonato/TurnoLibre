import { NextResponse } from 'next/server';
import webpush from 'web-push';

let subscriptions: any[] = []; // En producción, guarda en DB

export async function POST(req: Request) {
  const subscription = await req.json();
  // Evita duplicados
  if (!subscriptions.find(sub => JSON.stringify(sub) === JSON.stringify(subscription))) {
    subscriptions.push(subscription);
  }
  return NextResponse.json({ success: true });
}

export async function GET() {
  // Devuelve todas las suscripciones (solo para pruebas)
  return new Response(JSON.stringify(subscriptions), { status: 200 });
}

webpush.setVapidDetails(
  'mailto:tu-email@dominio.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

export async function PUT(req: Request) {
  const { title, body } = await req.json();
  const payload = JSON.stringify({ title, body });
  for (const sub of subscriptions) {
    await webpush.sendNotification(sub, payload);
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

