import { NextResponse } from 'next/server';

let subscriptions: any[] = []; // En producción, guarda en DB

export async function POST(req: Request) {
  const subscription = await req.json();
  // Evita duplicados
  if (!subscriptions.find(sub => JSON.stringify(sub) === JSON.stringify(subscription))) {
    subscriptions.push(subscription);
  }
  return NextResponse.json({ success: true });
}

// (Opcional) Exporta las suscripciones para usarlas en send-notification
export { subscriptions };
