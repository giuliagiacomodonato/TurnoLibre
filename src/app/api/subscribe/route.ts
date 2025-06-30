import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  const { subscription, userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId requerido' }, { status: 400 });
  }
  // Desestructurar los datos de la suscripción
  const { endpoint, keys } = subscription;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    return NextResponse.json({ success: false, error: 'Suscripción inválida' }, { status: 400 });
  }
  // Evitar duplicados por endpoint
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      keysAuth: keys.auth,
      keysP256dh: keys.p256dh,
      userId,
    },
    create: {
      endpoint,
      keysAuth: keys.auth,
      keysP256dh: keys.p256dh,
      userId,
    },
  });
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (userId) {
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    return new Response(JSON.stringify(subs), { status: 200 });
  }
  const subs = await prisma.pushSubscription.findMany();
  return new Response(JSON.stringify(subs), { status: 200 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return new Response(JSON.stringify({ error: 'userId requerido' }), { status: 400 });
  await prisma.pushSubscription.deleteMany({ where: { userId } });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

webpush.setVapidDetails(
  'https://proyecto-2-giacomodonato-kreczmer.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

export async function PUT(req: Request) {
  const { title, body } = await req.json();
  const subs = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ title, body });
  for (const sub of subs) {
    await webpush.sendNotification({
      endpoint: sub.endpoint,
      keys: {
        auth: sub.keysAuth,
        p256dh: sub.keysP256dh,
      },
    }, payload);
    // Guardar la notificación en la base de datos
    await prisma.notification.create({
      data: {
        title,
        body,
        subscriptionId: sub.id,
      },
    });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

