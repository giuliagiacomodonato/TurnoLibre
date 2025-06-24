'use client';
import { useState } from 'react';
import React from "react";
import { Header } from '../ui/Header';

const faqs = [
  {
    q: '¿Cómo me registro para sacar un turno?',
    a: 'Selecciona tu zona, horario y deporte al que deseas jugar en la plataforma. La plataforma te mostrará una lista con los clubes disponibles en tu zona según los filtros que hayas aplicado. Una vez que elijas el complejo deportivo en el que deseas jugar, la página te solicitará que inicies sesión en tu cuenta. Ingresa tu dirección de correo electrónico, a la cual se te enviará un email con un enlace. Abre tu correo electrónico y haz clic en el enlace proporcionado para iniciar sesión. Una vez logueado podrás proceder con la reserva del turno.'
  },

  {
    q: '¿Cómo reservar un turno?',
    a: 'En el buscador de la página principal, selecciona tu zona, el horario y el deporte que desees. La plataforma te mostrará una lista con los clubes disponibles en tu zona según los filtros que hayas aplicado. Una vez que elijas el complejo deportivo en el que deseas jugar, la página te solicitará que inicies sesión en tu cuenta. Verifica que los datos que seleccionaste estén correctos (Día, horario, deporte). En el caso de que el complejo deportivo exija un adelanto del cobro del turno deberás cargar los datos de tu tarjeta. Selecciona el botón "Confirmar reserva" y ¡Listo! A continuación te llegará un email de confirmación con los datos de la reserva. ¡Asegúrate de que sean correctos! Si no encuentras el email en tu bandeja de entrada, te recomendamos que revises la bandeja de spam o correo no deseado.'
  },
  {
    q: '¿La reserva es instantánea o necesito una confirmación del club?',
    a: 'Una vez que has realizado la reserva, ésta quedará confirmada. Es importante destacar que los clubes tienen la responsabilidad de mantener actualizada su disponibilidad, ya que de esta manera, a través de la plataforma, podemos ofrecer reservas en tiempo real.'
  },
  {
    q: '¿Cómo sé si mi reserva está confirmada?',
    a: 'Deberías haber recibido un correo electrónico de confirmación de tu reserva. Te sugerimos que revises tu carpeta de spam o correo no deseado por si acaso. Si no encuentras el correo electrónico de confirmación, también puedes acceder a la sección "Mis reservas" de tu cuenta en la página web. En caso de que el turno esté confirmado lo verás reflejado en tus reservas activas.'
  },
  {
    q: '¿Cuánto tiempo tengo para dar de baja una reserva?',
    a: 'El período de cancelación variará según la política establecida por el complejo deportivo. Al efectuar la reserva y elegir el método de pago, podrás ver un mensaje que detalla la modalidad de funcionamiento del complejo y su política de cancelación. En caso de dar de baja una reserva en incumplimiento de dicha política, se aplicará el cargo correspondiente al adelanto. Si ya has realizado la reserva y no has notado esta información, puedes revisar en la sección "Mis reservas", disponible en tu cuenta, donde encontrarás la información detallada de cada una de las reservas pasadas y activas.'
  },
  {
    q: '¿Qué pasa si no voy a jugar?',
    a: 'Si al realizar la reserva proporcionaste un método de pago y luego no te presentas a jugar, se realizará un cobro del monto establecido por el complejo. Este cargo puede representar un porcentaje del valor del turno o su totalidad (podrás ver esta información en los detalles de la reserva). En caso de no haber agregado ningún método de pago, se aplicará una penalización por incumplimiento, lo que resultará en la imposibilidad de generar una próxima reserva durante la semana siguiente. En la plataforma, fomentamos el respeto y las buenas intenciones. La responsabilidad de los jugadores con el club es crucial para permitir que otros ocupen esos espacios. Anular una reserva con anticipación también brinda la oportunidad a otras personas de disfrutar de un partido.'
  },
  {
    q: '¿Cómo doy de baja una reserva?',
    a: 'Para dar de baja una reserva, puedes ingresar directamente a tu cuenta desde nuestra página, dirigirte a la sección "Mis Reservas" y seleccionar la reserva que deseas cancelar. También puedes acceder al correo de confirmación y hacer clic en el botón "Cancelar", que te llevará a la sección "Mis Reservas". Allí podrás anular la reserva deseada.'
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