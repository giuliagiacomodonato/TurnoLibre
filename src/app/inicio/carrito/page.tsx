"use client"
import { useState } from 'react';
import { Cart } from '../../ui/Cart';
import { Header } from '../../ui/Header';
import { useCart } from '../../ui/CartContext';
import { LoginModal } from '../../ui/LoginModal';
import { useSession } from 'next-auth/react';

export default function CarritoPage() {
  const { items, removeItem, isHydrated } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

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
          items: items.map((item, idx) => ({
            id: item.id?.toString() || `item-${idx}`,
            title: item.name,
            quantity: 1,
            unit_price: item.price,
          })),
          userEmail: session.user?.email,
        }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert('Error al iniciar el pago.');
      }
    } catch (e) {
      alert('Error al conectar con MercadoPago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <Header />
      <main>
        {!isHydrated ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <span className="text-[#426a5a] text-xl font-semibold animate-pulse">Cargando carrito...</span>
          </div>
        ) : (
          <>
           <Cart items={items} onRemove={removeItem} onCheckout={handleCheckout} loading={loading} />
          </>
        )}
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} callbackUrl="/inicio/carrito" />
      </main>
    </div>
  );
}
