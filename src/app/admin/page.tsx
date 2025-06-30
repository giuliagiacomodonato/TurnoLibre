"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminLoginModal } from "../ui/LoginModal";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setShowLogin(true);
    } else if ((session.user as any).role !== "ADMIN") {
      router.replace("/");
    } else {
      setShowLogin(false);
    }
  }, [session, status, router]);

  const handleAdminLogin = async (email: string, password: string) => {
    setLoginError(undefined);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) {
      setLoginError("Credenciales incorrectas o no tienes permisos de administrador.");
    } else {
      setShowLogin(false);
    }
  };

  const handleSendNotification = async () => {
    // Implementa la lógica para enviar una notificación
  };

  if (!session) {
    return <AdminLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleAdminLogin} error={loginError} />;
  }
  if ((session.user as any).role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#426a5a] mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/editar-disponibilidad" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Editar Disponibilidad</h2>
          <p className="text-gray-600">Gestionar la disponibilidad de las canchas y sus horarios</p>
        </Link>

        <Link href="/admin/ver-reservas" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Ver Reservas</h2>
          <p className="text-gray-600">Ver y gestionar todas las reservas del sistema</p>
        </Link>

        <Link href="/admin/cancha-horarios" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Editar Canchas y Horarios</h2>
          <p className="text-gray-600">Configurar canchas, deportes y horarios disponibles</p>
        </Link>

        <Link href="/admin/editar-complejo" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Editar Complejo</h2>
          <p className="text-gray-600">Modificar información general del complejo deportivo</p>
        </Link>

        <Link href="/admin/FAQ" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">FAQ</h2>
          <p className="text-gray-600">Preguntas frecuentes sobre la administración</p>
        </Link>

        <Link href="/admin/enviar-notificacion" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-bold text-[#426a5a] mb-2">Enviar Notificación</h2>
          <p className="text-gray-600">Envía una notificación push a los usuarios suscritos</p>
        </Link>
      </div>
    </div>
  );
} 