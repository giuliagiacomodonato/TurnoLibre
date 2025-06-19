import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const password = await bcrypt.hash('admin123', 10); // Cambia 'admin123' por la contraseña que desees
  await prisma.user.upsert({
    where: { email: 'admin@email.com' },
    update: {},
    create: {
      email: 'admin@email.com',
      name: 'Administrador',
      password,
      role: 'ADMIN',
    },
  });
  console.log('Usuario admin creado o actualizado');
}

main().catch(e => { console.error(e); process.exit(1); }); 