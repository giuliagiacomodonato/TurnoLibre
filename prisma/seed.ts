import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear roles de usuario
  const adminPassword = await hash('admin123', 10);
  const userPassword = await hash('user123', 10);

  // Crear usuarios de ejemplo
  const admin = await prisma.user.create({
    data: {
      email: 'admin@complejo.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'usuario@ejemplo.com',
      name: 'Usuario Ejemplo',
      password: userPassword,
      role: 'USER',
    },
  });

  // Crear deportes
  const deportes = await Promise.all([
    prisma.sport.create({
      data: {
        name: 'Fútbol 5',
        description: 'Fútbol en cancha reducida de 5 jugadores por equipo',
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Fútbol 7',
        description: 'Fútbol en cancha reducida de 7 jugadores por equipo',
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Tenis',
        description: 'Deporte de raqueta individual o dobles',
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Pádel',
        description: 'Deporte de raqueta en cancha cerrada',
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Basket',
        description: 'Baloncesto en cancha completa',
      },
    }),
    prisma.sport.create({
      data: {
        name: 'Voley',
        description: 'Voleibol en cancha completa',
      },
    }),
  ]);

  // Crear sedes
  const sede1 = await prisma.location.create({
    data: {
      name: 'Complejo Deportivo Central',
      address: 'Av. Rivadavia 1234, Rosario',
      phone: '341-1234567',
      description: 'Sede principal del complejo deportivo',
      services: ['Wi-Fi', 'Vestuarios', 'Estacionamiento', 'Bar', 'Quincho'],
      schedules: {
        create: [
          {
            dayOfWeek: 1, // Lunes
            isOpen: true,
            openingTime: new Date('2024-01-01T08:00:00Z'),
            closingTime: new Date('2024-01-01T23:00:00Z'),
          },
          {
            dayOfWeek: 2, // Martes
            isOpen: true,
            openingTime: new Date('2024-01-01T08:00:00Z'),
            closingTime: new Date('2024-01-01T23:00:00Z'),
          },
          // ... Agregar más días según necesidad
        ],
      },
    },
  });

  // Crear canchas para la sede
  const canchas = await Promise.all([
    prisma.facility.create({
      data: {
        name: 'Cancha 1 - Fútbol 5',
        description: 'Cancha techada de fútbol 5 con césped sintético',
        price: 8000,
        sportId: deportes[0].id, // Fútbol 5
        locationId: sede1.id,
        schedules: {
          create: [
            {
              dayOfWeek: null, // Todos los días
              openingTime: new Date('2024-01-01T08:00:00Z'),
              closingTime: new Date('2024-01-01T23:00:00Z'),
            },
          ],
        },
      },
    }),
    prisma.facility.create({
      data: {
        name: 'Cancha 2 - Tenis',
        description: 'Cancha de tenis con superficie rápida',
        price: 6500,
        sportId: deportes[2].id, // Tenis
        locationId: sede1.id,
        schedules: {
          create: [
            {
              dayOfWeek: 1, // Lunes
              openingTime: new Date('2024-01-01T09:00:00Z'),
              closingTime: new Date('2024-01-01T22:00:00Z'),
            },
          ],
        },
      },
    }),
  ]);

  // Crear algunas reservas de ejemplo
  await prisma.reservation.create({
    data: {
      userId: user.id,
      facilityId: canchas[0].id,
      date: new Date('2024-03-20'),
      startTime: new Date('2024-03-20T18:00:00Z'),
      endTime: new Date('2024-03-20T19:00:00Z'),
      status: 'CONFIRMED',
      payment: {
        create: {
          amount: 8000,
          status: 'PAID',
        },
      },
    },
  });

  console.log('Base de datos poblada con datos de ejemplo');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });