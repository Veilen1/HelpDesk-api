import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();
  
  // Verificar si ya existe
  const existing = await prisma.user.findUnique({
    where: { email: "admin@test.com" },
  });
  
  if (existing) {
    console.log("Admin user already exists");
    return;
  }
  
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const user = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: hashedPassword,
      name: "Admin Test",
      role: "ADMIN",
    },
  });
  
  console.log("Admin user created:", user);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());