'use client';
import { useState } from 'react';
import React from "react";
import { Header } from '../ui/Header';

const faqs = [
  {
    q: '¿Cómo me registro en la plataforma?',
    a: 'Haz clic en “Iniciar sesión” e ingresa tu correo electrónico de Gmail (no necesitas contraseña). Una vez dentro, ya puedes reservar turnos.'
  },
  {
    q: '¿Cómo reservo un turno?',
    a: 'Busca por zona, deporte y horario. Elige el club y la cancha que prefieras. Si el club requiere pago anticipado, deberás abonar online (MercadoPago). Si no, solo confirma la reserva. Recibirás un email de confirmación y podrás ver tu reserva en la sección “Mis reservas”.'
  },
  {
    q: '¿La reserva es instantánea o necesita confirmación del club?',
    a: 'La reserva es instantánea y queda confirmada al finalizar el proceso (y pagar si corresponde). No necesitas esperar confirmación del club.'
  },
  {
    q: '¿Cómo sé si mi reserva está confirmada?',
    a: 'Recibirás un email de confirmación. También puedes ver todas tus reservas activas y pasadas en la sección “Mis reservas” de la web. Si no ves el email, revisa tu carpeta de spam.'
  },
  {
    q: '¿Puedo cancelar una reserva? ¿Hasta cuándo?',
    a: 'Sí, puedes cancelar desde la sección “Mis reservas”. Al cancelar se pierde totalmente el pago.'
  },
  {
    q: '¿Qué pasa si no me presento a jugar?',
    a: 'No asistir equivale a la cancelación de la reserva, se pierde totalmente el pago.'
  },
  {
    q: '¿Cómo cancelo una reserva?',
    a: 'Ingresa a “Mis reservas”, selecciona la reserva y haz clic en “Cancelar”. Si tienes dudas, también puedes contactarnos vía email a libreturno@gmail.com.'
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center text-[#426a5a] mb-8">Preguntas frecuentes</h1>
        <div className="bg-white rounded-2xl shadow-xl divide-y border border-[#7fb685]/40">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex justify-between items-center py-5 px-6 text-lg font-semibold text-[#426a5a] focus:outline-none"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <span className="text-[#7fb685] text-2xl">{open === i ? '▲' : '▼'}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-[#426a5a] text-base animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 