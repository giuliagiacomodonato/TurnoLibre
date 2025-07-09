"use client";
import { useState } from 'react';
import { Cart } from './Cart';
import { Header } from './Header';
import { useCart } from './CartContext';
import { LoginModal } from './LoginModal';
import { useSession } from "next-auth/react";
import { Toast } from './Toast';

export default function CarritoClient() {
  const { data: session } = useSession();
  const { items, removeItem, isHydrated } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'error' }>({ open: false, message: '' });

  // Filtrar items cuya fecha y hora ya pasaron
  const filteredItems = items.filter(item => {
    if (!item.date || !item.time) return true;
    const [year, month, day] = item.date.split('-').map(Number);
    const [hours, minutes] = item.time.split(':').map(Number);
    const itemDate = new Date(year, month - 1, day, hours, minutes);
    return itemDate.getTime() > Date.now();
  });

  const handleCheckout = async () => {
    if (!session) {
      setShowLogin(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'create_preference',
          items: filteredItems.map((item, idx) => ({
            id: item.id?.toString() || `item-${idx}`,
            title: item.name,
            quantity: 1,
            unit_price: item.price,
          })),
          userEmail: session?.user?.email,
        }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setToast({ open: true, message: 'Error al iniciar el pago.', type: 'error' });
      }
    } catch (e) {
      setToast({ open: true, message: 'Error al conectar con MercadoPago.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <Header />
      <main>
        {!isHydrated ? (
          null
        ) : (
          <>
           <Cart items={filteredItems} onRemove={removeItem} onCheckout={handleCheckout} loading={loading} />
          </>
        )}
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} callbackUrl="/inicio/carrito" />
        <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
      </main>
    </div>
  );
} 