"use client";
import { subscribeUser } from "@/lib/push";
import { useState } from "react";

export function PushSubscribeButton({ userId, onSuccess, buttonClass }: { userId?: string, onSuccess?: () => void, buttonClass?: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setError(null);
    try {
      await subscribeUser(userId);
      setSubscribed(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Error al suscribirse a notificaciones");
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleSubscribe}
        disabled={subscribed || !userId}
        className={buttonClass || "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"}
      >
        {subscribed ? "¡Suscrito!" : "Suscribirse a notificaciones push"}
      </button>
      {!userId && <div className="text-red-600 mt-2">Debes iniciar sesión para suscribirte</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
