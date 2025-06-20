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
  const { data: session } = useSession();

  const handleCheckout = () => {
    if (!session) {
      setShowLogin(true);
      return;
    }
    alert('¡Listo para pagar!');
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
          <Cart items={items} onRemove={removeItem} onCheckout={handleCheckout} />
        )}
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </main>
    </div>
  );
}
