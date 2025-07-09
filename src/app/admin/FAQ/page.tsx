"use client";
import { useState } from "react";
import Link from "next/link";
import { AdminHeader } from "../../ui/Header";

const adminFaqs = [
  {
    q: '¿Cómo funciona el acceso de administrador?',
    a: 'El acceso de administrador se otorga a los responsables del club o complejo. Desde el panel pueden gestionar canchas, horarios, reservas y reglas.'
  },
 
  {
    q: '¿Cuántos usuarios administradores puedo tener?',
    a: 'Puedes tener varios administradores por club. Cada uno puede acceder con su cuenta y gestionar las reservas y la información del complejo.'
  },
  {
    q: '¿Puedo cargar reservas internas o turnos fijos?',
    a: 'Sí, desde el panel puedes cargar reservas manualmente para turnos fijos, eventos o bloqueos de horario.'
  },
  {
    q: '¿Se pueden configurar precios especiales por día y horario?',
    a: 'Puedes definir reglas de horarios y precios para cada cancha según el día de la semana y la franja horaria, desde la sección de administración.'
  },
  {
    q: '¿Qué soporte ofrecen para administradores?',
    a: 'Ofrecemos soporte por email y, si es necesario, reuniones virtuales para explicar el uso del sistema y resolver dudas.'
  },
  {
    q: '¿Cómo veo y gestiono las reservas de los usuarios?',
    a: 'En la sección “Ver reservas” puedes ver todas las reservas activas, pasadas y canceladas, y filtrar por fecha, cancha o usuario.'
  },
  {
    q: '¿Cómo creo o edito las reglas de horarios de una cancha?',
    a: 'Desde el panel de administración, selecciona la cancha y utiliza la sección “Reglas de horarios”. Puedes agregar, editar o eliminar reglas para definir los días, horarios de apertura/cierre y duración de los turnos. Recuerda guardar los cambios para que se apliquen.'
  },
  {
    q: '¿Cómo hago para que un día figure como cerrado?',
    a: 'Para indicar que una cancha está cerrada un día, agrega una regla para ese día con el mismo horario de apertura y cierre (por ejemplo, apertura 08:00 y cierre 08:00). Así, los usuarios no podrán reservar en ese día.'
  },
  {
    q: '¿Qué pasa si elimino una regla de horario?',
    a: 'Si eliminas una regla, ese día u horario quedará sin disponibilidad para reservas, a menos que agregues una nueva regla para ese día. Es recomendable siempre agregar una nueva regla si eliminas otra.'
  },
  {
    q: '¿Cuándo entran en vigencia los cambios en las reglas?',
    a: 'Los cambios en las reglas de horarios (creación, edición o eliminación) entran en vigencia a los 7 días de realizados. Esto permite avisar a los usuarios y evitar conflictos con reservas ya tomadas.'
  }
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