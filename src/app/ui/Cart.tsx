import React from 'react';

export type CartItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  court: string;
  price: number;
  image?: string;
  facilityId: string; // Add the facilityId to the CartItem type
};

export function Cart({ items, onRemove, onCheckout, loading }: {
  items: CartItem[];
  onRemove: (id: string) => void;
  onCheckout?: () => void;
  loading?: boolean;
}) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-[#426a5a] mb-6">Tu Carrito</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lista de items */}
        <div className="md:col-span-2 space-y-6">
          {items.length === 0 ? (
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 text-center text-[#426a5a]">
              No hay turnos en tu carrito.
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex bg-white/90 rounded-2xl shadow-xl p-4 items-center gap-4">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg border border-[#7fb685]/30" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-lg text-[#426a5a]">{item.name}</div>
                  <div className="text-[#426a5a] text-sm">{item.court} - {item.date} - {item.time}</div>
                  <div className="text-[#426a5a] font-semibold mt-2">$ {item.price.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        {/* Resumen del pedido */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-[#426a5a] mb-4">Resumen del pedido</h2>
          <div className="flex justify-between text-[#426a5a] mb-2">
            <span>Turnos</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between text-[#426a5a] mb-2">
            <span>Total</span>
            <span className="font-bold">$ {total.toLocaleString()}</span>
          </div>
          <button className="w-full mt-6 bg-[#426a5a] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7fb685] transition-colors duration-300"
            onClick={onCheckout}
            disabled={items.length === 0 || loading}
          >
            {loading ? 'Redirigiendo a MercadoPago...' : 'Ir a pagar'}
          </button>
        </div>
      </div>
    </div>
  );
}