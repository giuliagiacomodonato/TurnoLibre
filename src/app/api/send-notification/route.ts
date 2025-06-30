import webpush from 'web-push';

webpush.setVapidDetails(
  'https://proyecto-2-giacomodonato-kreczmer.vercel.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { title, body } = await req.json();
  const payload = JSON.stringify({ title, body });

  // Obtén las suscripciones desde el endpoint de suscripción
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/subscribe', { method: 'GET' });
  const subscriptions = await res.json();

  for (const sub of subscriptions) {
    await webpush.sendNotification({
      endpoint: sub.endpoint,
      keys: {
        auth: sub.keysAuth,
        p256dh: sub.keysP256dh,
      }
    }, payload);
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
