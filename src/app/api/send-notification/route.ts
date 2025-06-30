import webpush from 'web-push';
import { prisma } from '../../../lib/prisma';

webpush.setVapidDetails(
  'https://proyecto-2-giacomodonato-kreczmer.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { title, body } = await req.json();
  const payload = JSON.stringify({ title, body });

  // Obtén las suscripciones desde la base de datos
  const subscriptions = await prisma.pushSubscription.findMany();

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keysAuth,
          p256dh: sub.keysP256dh,
        }
      }, payload);
      // Guardar la notificación en la base de datos
      await prisma.notification.create({
        data: {
          title,
          body,
          subscriptionId: sub.id,
        },
      });
    } catch (err: any) {
      if (err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        console.log('Suscripción eliminada por estar expirada:', sub.endpoint);
      } else {
        console.error('Error enviando notificación:', err);
      }
    }
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
