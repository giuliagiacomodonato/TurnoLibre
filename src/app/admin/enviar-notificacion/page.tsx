'use client';
import React, { useState } from 'react';

export default function EnviarNotificacionPage() {
  const [title, setTitle] = useState('Notificación de TurnoLibre');
  const [body, setBody] = useState('Este es un mensaje de prueba.');
  const [status, setStatus] = useState<string | null>(null);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      if (res.ok) {
        setStatus('Notificación enviada correctamente a los suscriptores.');
      } else {
        setStatus('Error al enviar la notificación.');
      }
    } catch (err) {
      setStatus('Error al enviar la notificación.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white/80 p-8">
      <h1 className="text-2xl font-bold mb-6 text-[#426a5a]">Enviar Notificación Push</h1>
      <form onSubmit={handleSendNotification} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 w-full max-w-md">
        <label className="font-semibold text-[#426a5a]">Título</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <label className="font-semibold text-[#426a5a]">Mensaje</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
        <button type="submit" className="bg-[#426a5a] text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-[#7fb685] transition-colors">Enviar Notificación</button>
        {status && <div className="mt-2 text-center text-sm text-[#426a5a]">{status}</div>}
      </form>
      <p className="mt-8 text-gray-500 text-sm text-center max-w-lg">Para recibir notificaciones, debes aceptar el permiso en tu navegador y tener la PWA instalada o el sitio abierto.</p>
    </div>
  );
} 