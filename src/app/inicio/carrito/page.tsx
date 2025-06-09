"use client"
import { useState } from 'react';
import { Cart } from '../../ui/Cart';
import { Header } from '../../ui/Header';
import { useCart } from '../../ui/CartContext';
import { LoginModal } from '../../ui/LoginModal';

export default function CarritoPage() {
  const { items, removeItem } = useCart();
  const [showLogin, setShowLogin] = useState(false);

  const handleCheckout = () => {
    alert('¡Listo para pagar!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2c57c]/20 to-[#7fb685]/20">
      <Header />
      <main>
        <Cart items={items} onRemove={removeItem} onCheckout={handleCheckout} />
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </main>
    </div>
  );
}
