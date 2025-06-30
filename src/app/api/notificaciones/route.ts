import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return new Response(JSON.stringify([]), { status: 200 });
  // Buscar todas las suscripciones del usuario
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const subIds = subs.map(s => s.id);
  if (subIds.length === 0) return new Response(JSON.stringify([]), { status: 200 });
  // Buscar notificaciones asociadas
  const notificaciones = await prisma.notification.findMany({
    where: { subscriptionId: { in: subIds } },
    orderBy: { sentAt: 'desc' },
  });
  return new Response(JSON.stringify(notificaciones), { status: 200 });
} 