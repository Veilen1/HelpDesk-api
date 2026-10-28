import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding initial users...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = [
    {
      email: 'admin@helpdesk.com',
      name: 'System Admin',
      role: Role.ADMIN,
      password: passwordHash,
    },
    {
      email: 'agent@helpdesk.com',
      name: 'Support Agent',
      role: Role.AGENT,
      password: passwordHash,
    },
    {
      email: 'customer@helpdesk.com',
      name: 'John Customer',
      role: Role.CUSTOMER,
      password: passwordHash,
    },
  ];

  for (const user of users) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Upserted user: ${upserted.email} with role ${upserted.role}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e: unknown) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
