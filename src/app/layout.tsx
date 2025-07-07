'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from './ui/CartContext';
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <title>TurnoLibre</title>
        <meta name="description" content="TurnoLibre: Reserva canchas e instalaciones deportivas de manera rápida, sencilla y segura. Encuentra y gestiona turnos en tiempo real en tu zona." />
        <meta name="keywords" content="deportes, reservas, canchas, turnos, fútbol, tenis, pádel, voley, clubes, complejo deportivo, alquiler, online, Argentina" />
        <meta property="og:title" content="TurnoLibre - Reservá tu cancha online" />
        <meta property="og:description" content="Plataforma para reservar canchas e instalaciones deportivas en tu zona. Pago seguro, gestión en tiempo real y clubes de calidad." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TurnoLibre" />
        <meta property="og:locale" content="es_AR" />
        <meta name="twitter:title" content="TurnoLibre - Reservá tu cancha online" />
        <meta name="twitter:description" content="Reservá canchas y turnos deportivos de forma fácil y segura en TurnoLibre." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/logo.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
