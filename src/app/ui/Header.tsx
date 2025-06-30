"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LoginModal } from './LoginModal';
import { useSession, signOut } from 'next-auth/react';
import { SessionProvider } from "next-auth/react";
import { CartProvider } from './CartContext';
import { PushSubscribeButton } from './PushSubscribeButton';
import { Toast } from './Toast';

let BellIcon: any = (props: any) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
);
try {
  // @ts-ignore
  BellIcon = require('@heroicons/react/24/outline').BellIcon;
} catch {}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="w-6 h-6 border-4 border-[#f2c57c] border-t-[#426a5a] rounded-full animate-spin"></div>
    </div>
  );
}

export function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'error' }>({ open: false, message: '' });
  const { data: session } = useSession();

  useEffect(() => {
    if (!notifOpen || !session?.user?.id) return;
    setNotifLoading(true);
    setNotifError(null);
    fetch(`/api/subscribe?userId=${session.user.id}`)
      .then(res => res.json())
      .then(subs => {
        if (Array.isArray(subs) && subs.length > 0) {
          setIsSubscribed(true);
          fetch(`/api/notificaciones?userId=${session.user.id}`)
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(() => setNotifError("No se pudieron cargar las notificaciones"));
        } else {
          setIsSubscribed(false);
          setNotifications([]);
        }
      })
      .catch(() => setNotifError("No se pudo verificar la suscripción"))
      .finally(() => setNotifLoading(false));
  }, [notifOpen, session]);

  const handleUnsubscribe = async () => {
    setNotifError(null);
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/subscribe?userId=${session?.user?.id}`, { method: "DELETE" });
      if (res.ok) {
        setIsSubscribed(false);
        setNotifications([]);
        setToast({ open: true, message: 'Desuscripto con éxito', type: 'success' });
      } else {
        setNotifError("No se pudo desuscribir");
      }
    } catch {
      setNotifError("No se pudo desuscribir");
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <header className="bg-[#426a5a]/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
            <img src="/logo.ico" alt="Logo" className="h-8 w-8 rounded-full" />
            TurnoLibre
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-4 items-center">
            <Link href="/inicio" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Ver Disponibles
            </Link>
            <Link href="/reservas" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Mis Reservas
            </Link>
            <Link href="/carrito" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              Carrito
            </Link>
            <Link href="/FAQ" className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
              FAQ
            </Link>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="text-[#f2c57c] hover:text-[#ddae7e] transition-colors flex items-center" title="Notificaciones">
                <BellIcon className="h-6 w-6 mr-1" />
              </button>
              {notifOpen && (
                <div className="fixed top-16 left-0 w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg z-50 p-4 border border-[#7fb685] md:absolute md:right-0 md:top-auto md:left-auto md:w-80">
                  <h2 className="text-lg font-bold mb-2 text-[#426a5a]">Notificaciones</h2>
                  {notifLoading ? (
                    <Spinner />
                  ) : !session ? (
                    <div className="text-center py-4">Debes iniciar sesión para ver tus notificaciones.</div>
                  ) : !isSubscribed ? (
                    <div>
                      <p className="mb-2">¿Quieres recibir notificaciones push?</p>
                      <PushSubscribeButton
                        userId={session.user.id}
                        onSuccess={() => setToast({ open: true, message: 'Suscripto con éxito', type: 'success' })}
                        buttonClass="px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors"
                      />
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleUnsubscribe}
                        className="mb-4 px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors"
                      >
                        Desuscribirse
                      </button>
                      <h3 className="text-base font-semibold mb-2">Tus notificaciones:</h3>
                      {notifications.length === 0 ? (
                        <p>No tienes notificaciones previas.</p>
                      ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {notifications.map((n, i) => (
                            <li key={i} className="bg-gray-50 rounded p-2 border-l-4 border-[#426a5a]">
                              <div className="font-bold">{n.title}</div>
                              <div>{n.body}</div>
                              <div className="text-xs text-gray-500 mt-1">{new Date(n.sentAt).toLocaleString()}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {notifError && <div className="text-red-600 mt-2">{notifError}</div>}
                </div>
              )}
            </div>
            {session ? (
              <div className="flex items-center space-x-2">
                {session.user?.image && (
                  <img src={session.user.image} alt="avatar" className="h-8 w-8 rounded-full border border-[#7fb685]" />
                )}
                <span className="text-[#f2c57c] font-semibold">{session.user?.name || session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#ddae7e] transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-4 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#ddae7e] transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center ">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#f2c57c] focus:outline-none"
              aria-label="Abrir menú"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-0 right-0 w-64 h-full flex flex-col justify-start items-stretch p-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end mb-2 text-[#426a5a]"
                aria-label="Cerrar menú"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="flex flex-col gap-2">
                <Link href="/inicio" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  Ver Disponibles
                </Link>
                <Link href="/reservas" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  Mis Reservas
                </Link>
                <Link href="/carrito" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  Carrito
                </Link>
                <Link href="/FAQ" className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors" onClick={() => setMenuOpen(false)}>
                  FAQ
                </Link>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="text-[#426a5a] text-lg font-semibold hover:text-[#7fb685] transition-colors flex items-center"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  <BellIcon className="h-6 w-6 mr-1" /> Notificaciones
                </button>
                {notifOpen && (
                  <div className="fixed top-16 left-0 w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg z-50 p-4 border border-[#7fb685] md:absolute md:right-0 md:top-auto md:left-auto md:w-80">
                    <h2 className="text-lg font-bold mb-2 text-[#426a5a]">Notificaciones</h2>
                    {notifLoading ? (
                      <Spinner />
                    ) : !session ? (
                      <div className="text-center py-4">Debes iniciar sesión para ver tus notificaciones.</div>
                    ) : !isSubscribed ? (
                      <div>
                        <p className="mb-2">¿Quieres recibir notificaciones push?</p>
                        <PushSubscribeButton
                          userId={session.user.id}
                          onSuccess={() => setToast({ open: true, message: 'Suscripto con éxito', type: 'success' })}
                          buttonClass="px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={handleUnsubscribe}
                          className="mb-4 px-4 py-2 rounded-full bg-[#426a5a] text-[#f2c57c] font-semibold hover:bg-[#2d473a] transition-colors"
                        >
                          Desuscribirse
                        </button>
                        <h3 className="text-base font-semibold mb-2">Tus notificaciones:</h3>
                        {notifications.length === 0 ? (
                          <p>No tienes notificaciones previas.</p>
                        ) : (
                          <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {notifications.map((n, i) => (
                              <li key={i} className="bg-gray-50 rounded p-2 border-l-4 border-[#426a5a]">
                                <div className="font-bold">{n.title}</div>
                                <div>{n.body}</div>
                                <div className="text-xs text-gray-500 mt-1">{new Date(n.sentAt).toLocaleString()}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {notifError && <div className="text-red-600 mt-2">{notifError}</div>}
                  </div>
                )}
                {session && session.user ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {session.user.image && (
                      <img src={session.user.image} alt="avatar" className="h-10 w-10 rounded-full border border-[#7fb685] self-start" />
                    )}
                    <span className="text-[#426a5a] font-semibold">{session.user.name || session.user.email}</span>
                    <button
                      onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="mt-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#7fb685] hover:text-white transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMenuOpen(false); setShowLogin(true); }}
                    className="mt-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#7fb685] hover:text-white transition-colors"
                  >
                    Iniciar sesión
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </header>
  );
}

export function AdminHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <header className="bg-[#426a5a]/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold text-[#f2c57c] hover:text-[#ddae7e] transition-colors">
            <img src="/logo.ico" alt="Logo" className="h-8 w-8 rounded-full" />
            Admin
          </Link>
          <div className="relative flex items-center space-x-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f2c57c] text-[#426a5a] rounded-lg font-semibold hover:bg-[#ddae7e] transition-colors"
            >
              {session.user?.image && (
                <img src={session.user.image} alt="avatar" className="h-8 w-8 rounded-full border border-[#7fb685]" />
              )}
              <span>{session.user?.name || session.user?.email}</span>
              <svg className={`ml-2 w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {menuOpen && (
              <div className="fixed right-8 top-20 w-56 bg-white rounded-lg shadow-lg z-50 py-2 border border-[#7fb685] max-h-72 overflow-y-auto">
                <Link href="/admin/editar-disponibilidad" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Editar Disponibilidad</Link>
                <Link href="/admin/ver-reservas" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Ver Reservas</Link>
                <Link href="/admin/cancha-horarios" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Editar Canchas y Horarios</Link>
                <Link href="/admin/editar-complejo" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">Editar Complejo</Link>
                <Link href="/admin/FAQ" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40">FAQ</Link>
                <div className="border-t my-2" />
                <Link href="/admin" className="block px-4 py-2 text-[#426a5a] hover:bg-[#f2c57c]/40 font-semibold">Volver al menú de admin</Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 font-semibold"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}