'use client';
import React, { useState } from 'react';

async function handleSendNotification() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification('¡Notificación enviada!', {
        body: 'Este es un mensaje push de prueba.',
        icon: '/logo.ico', // o el icono que prefieras
      });
    } else {
      alert('Permiso de notificación denegado.');
    }
  } else {
    alert('Las notificaciones push no son compatibles en este navegador.');
  }
}
