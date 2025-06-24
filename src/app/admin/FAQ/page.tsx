"use client";
import { useState } from "react";
import Link from "next/link";
import { AdminHeader } from "../../ui/Header";

const adminFaqs = [
  {
    q: '¿Cuál es el precio del sistema?',
    a: 'Tenemos distintos planes de acuerdo a la cantidad de canchas y el país donde se encuentre la cancha. Te invitamos a ver los precios en la sección de planes.'
  },
  {
    q: '¿Se pueden cobrar señas a través de la página?',
    a: 'Sí, puedes configurar la modalidad "tarjeta en garantía", donde el usuario deberá cargar los datos de una tarjeta para poder hacer la reserva. Si la persona que hizo la reserva no cumple con la política de cancelación o falta a jugar se debitará el monto de la seña.'
  },
  {
    q: '¿Cuántos usuarios administradores se puede tener?',
    a: 'Puedes tener la cantidad de usuarios que necesites con los diferentes permisos y asignarles un rol según sus funciones. No tiene costo extra por usuario, está todo incluido en el plan.'
  },
  {
    q: '¿Se pueden cargar reservas de manera interna además de recibir reservas online?',
    a: 'Sí, puedes gestionar tu club de manera interna con la posibilidad de cargar turnos fijos, eventos de cumpleaños y torneos.'
  },
  {
    q: '¿Se pueden configurar precios especiales según el día y horario?',
    a: 'Sí, puedes personalizar precios por cada día de la semana y configurar precios por horarios ajustándolo a la dinámica de tu club.'
  },
  {
    q: '¿Se puede agregar los consumos que realice el cliente?',
    a: 'Puedes agregar los productos que consumen tus clientes en sus reservas y tener un detalle al momento de cobrarle.'
  },
  {
    q: '¿Cuentan con capacitación y soporte para el uso del sistema?',
    a: 'Sí, al dar comienzo a tu período de prueba gratuito programamos una reunión virtual con el área de soporte donde podrás ver las diferentes funcionalidades del sistema y comunicarte con el equipo para resolver dudas que vayan surgiendo.'
  },
];

export default function AdminFAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <AdminHeader />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="mb-8">
          <Link href="/admin" className="text-[#426a5a] hover:underline">← Volver al panel de administración</Link>
        </div>
        <h1 className="text-3xl font-bold text-center text-[#426a5a] mb-8">Preguntas frecuentes de administración</h1>
        <div className="bg-white rounded-2xl shadow-xl divide-y border border-[#7fb685]/40">
          {adminFaqs.map((faq, i) => (
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