import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Créer les rôles
  const roles = ['PUBLIC', 'USER', 'BENEVOLE', 'ORGANISATEUR', 'SUPER_ORGANISATEUR', 'ADMIN'];
  
  for (const type of roles) {
    await prisma.role.upsert({ // upsert évite les doublons
      where: { type }, 
      update: {},
      create: { type },
    });
    console.log(`Role "${type}" created`);
  }

  // Créer un utilisateur ADMIN supreme par défaut
  const adminRole = await prisma.role.findUnique({ where: { type: 'ADMIN' } });
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@festival.com' },
    update: {},
    create: {
      email: 'admin@festival.com',
      passwordHash: hashedPassword,
      nom: 'Admin',
      prenom: 'Supreme',
      valide: true, // deja valide 
      roleId: adminRole!.id,
    },
  });
  console.log('---- Admin user created TADA ----');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('!!!! Seed error: !!!!', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
