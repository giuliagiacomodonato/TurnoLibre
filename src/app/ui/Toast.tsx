import React, { useEffect } from "react";

export function Toast({ open, message, onClose, type = "success" }: {
  open: boolean;
  message: string;
  onClose: () => void;
  type?: "success" | "error";
}) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all
      ${type === "success" ? "bg-[#4BB543]" : "bg-red-500"}`}
      style={{ minWidth: 220 }}
      role="alert"
    >
      {message}
    </div>
  );
} 