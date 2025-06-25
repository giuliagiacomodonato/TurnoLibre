

self.addEventListener('push', function(event) {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/logo.ico',
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Puedes agregar lógica para abrir una URL si lo deseas
});
