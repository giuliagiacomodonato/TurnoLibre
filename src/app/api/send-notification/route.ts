import { NextResponse } from 'next/server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'https://proyecto-2-giacomodonato-kreczmer.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

let subscriptions: any[] = []; // Usa la misma fuente que arriba

export async function POST(req: Request) {
  const { title, body } = await req.json();
  const payload = JSON.stringify({ title, body });
  // En producción, recorre todas las suscripciones guardadas
  for (const sub of subscriptions) {
    await webpush.sendNotification(sub, payload);
  }
  return NextResponse.json({ success: true });
}
