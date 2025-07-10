# Plataforma de Reservas Deportivas – Next.js, Prisma, PostgreSQL

## Descripción General

Esta plataforma permite a usuarios reservar canchas deportivas, gestionar pagos en línea mediante MercadoPago, y recibir notificaciones por email y push. Incluye un panel de administración para gestionar canchas, reglas y reservas. El sistema implementa deduplicación de pagos/reservas y flujos robustos para evitar errores comunes en reservas y cobros.

---

## Funcionalidades Principales

### Usuarios
- **Explorar canchas y horarios disponibles**.
- **Agregar reservas al carrito** (pueden ser múltiples reservas en una sola compra).
- **Checkout y pago online** vía MercadoPago (modo sandbox).
- **Recepción de email de confirmación** tras el pago exitoso.
- **Recepción de notificaciones push** (opcional, si el usuario se suscribe).
- **Visualización de reservas realizadas** y estado de pago.
- **Cancelación de reservas** (según reglas del complejo).
- **Inicio de sesión** Uso de OAuth con Google obligatorio para pagar, ver las reservas pasadas y tener la opción de suscribirse a notificaciones.

### Administradores
- **Login seguro obligatorio** Uso de NextAuth.
- **Gestión de canchas**: crear, editar, eliminar canchas.
- **Gestión de reglas**: agregar, editar, eliminar reglas de uso, agrupadas por fecha de vigencia.
- **Visualización y gestión de reservas**: ver todas las reservas, filtrar por estado, cancelar o marcar como completadas.
- **Envío de notificaciones push** a usuarios.
- **Reporte de reservas y pagos**.

---

## Integraciones

- **MercadoPago**: Integración completa para pagos online. El backend verifica el estado del pago antes de confirmar la reserva.
- **Cloudinary**: API de Servicio de almacenamiento en la nube para imágenes de canchas y complejos deportivos. Permite subir, optimizar y servir imágenes de manera eficiente.
- **Webhook de n8n para email generado con IA**: Tras el pago exitoso, se envía un webhook a un endpoint externo (n8n) con los detalles de la reserva, que dispara el envío de email de confirmación al usuario generado con un Agente IA de Open AI ChatModel.
- **Push Notifications**: Los usuarios pueden suscribirse a notificaciones push. Los administradores pueden enviar mensajes a todos los suscriptores desde el panel.

---

## Flujo de Reserva y Pago

1. El usuario selecciona una o más reservas y las agrega al carrito.
2. Al hacer checkout, se muestra un resumen y se inicia el pago con MercadoPago.
3. Tras el pago exitoso:
   - Se crea la reserva en la base de datos.
   - Se envía un webhook con los datos de la reserva para disparar el email.
   - Se limpia el carrito del usuario.
   - Se muestra una página de éxito.
4. Si el pago falla o se cancela, la reserva no se crea y el usuario puede reintentar.

---


## Gestión de Reglas y Canchas (Admin)

- Las reglas se agrupan por fecha de vigencia y pueden editarse o eliminarse individualmente.
- Al eliminar una cancha, se eliminan automáticamente las reglas asociadas.
- Se utiliza un modal de confirmación para evitar eliminaciones accidentales.
- El panel muestra las reglas con columnas de fecha, descripción y acciones.

---

## Posibles mejoras
- Generar los slot de disponibilidad de la proxima semana con un script automático.
- Mejora en el manejo de la eliminación/creación/actualización de las reglas de las canchas.
- Añadir registro de usuarios propio o más prestadores de OAuth
- Gestión real de los dias feriados

## Para probar el uso de Mercado Pago
- Cuenta test-vendedor
Vendedor
TESTUSER1418671037
s0fxOYYWXw
20/06/2025

- Cuenta test-comprador
Comprador
TESTUSER652121358
A5SSbmazNE
20/06/2025

- Tarjetas falsas
Tarjeta	- Número - Código de seguridad - Fecha de caducidad
Mastercard - 5031 7557 3453 0604 - 123 - 11/30
Visa - 4509 9535 6623 3704 - 123 - 11/30
American Express - 3711 803032 57522 - 1234 - 11/30
Mastercard Debito - 5287 3383 1025 3304 - 123 - 11/30
Visa Debito - 4002 7686 9439 5619 - 123 - 11/30

- Estados del pago y la reserva
Estado de pago - Descripción - Documento de identidad
APRO - Pago aprobado - (DNI) 12345678
OTHE - Rechazado por error general - (DNI) 12345678
CONT - Pendiente de pago
CALL - Rechazado con validación para autorizar
FUND - Rechazado por importe insuficiente
SECU - Rechazado por código de seguridad inválido
EXPI - Rechazado debido a un problema de fecha de vencimiento
FORM - Rechazado debido a un error de formulario
- RESERVA CONFIRMADA es pago APROBADO o PENDIENTE
En cualquier otro caso la reserva nunca se crea

---

## Enlace de la aplicación

**TurnoLibre** - Plataforma de reservas deportivas: [https://proyecto-2-giacomodonato-kreczmer.vercel.app/](https://proyecto-2-giacomodonato-kreczmer.vercel.app/)
