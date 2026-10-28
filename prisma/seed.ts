import {
  PrismaClient,
  Role,
  TicketStatus,
  TicketPriority,
  AuditAction,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding initial data...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      email: 'admin@helpdesk.com',
      name: 'System Admin',
      role: Role.ADMIN,
      password: passwordHash,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@helpdesk.com' },
    update: {},
    create: {
      email: 'agent@helpdesk.com',
      name: 'Support Agent',
      role: Role.AGENT,
      password: passwordHash,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@helpdesk.com' },
    update: {},
    create: {
      email: 'customer@helpdesk.com',
      name: 'John Customer',
      role: Role.CUSTOMER,
      password: passwordHash,
    },
  });

  console.log('Users seeded:', {
    admin: admin.email,
    agent: agent.email,
    customer: customer.email,
  });

  const existingTicket = await prisma.ticket.findFirst({
    where: { title: 'Problema al acceder al panel' },
  });

  if (!existingTicket) {
    const ticket = await prisma.ticket.create({
      data: {
        title: 'Problema al acceder al panel',
        description:
          'Cuando intento ingresar con mis credenciales la pantalla queda cargando.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
        creatorId: customer.id,
        assignedToId: agent.id,
        auditLogs: {
          create: [
            {
              userId: customer.id,
              action: AuditAction.CREATED,
              details: 'Ticket creado por el cliente',
            },
            {
              userId: agent.id,
              action: AuditAction.ASSIGNED,
              details: `Asignado al agente ${agent.name}`,
            },
          ],
        },
        comments: {
          create: [
            {
              authorId: agent.id,
              content:
                'Hola John, estamos revisando la sesión de tu usuario. Te avisamos en breve.',
            },
          ],
        },
      },
    });

    console.log('Sample ticket seeded with comments and audit logs:', ticket.id);
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
