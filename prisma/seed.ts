import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PERMISSION_DEFINITIONS } from "../src/lib/permissions";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding permissions...");
  for (const def of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: def.key },
      update: { group: def.group, description: def.description },
      create: def,
    });
  }
  const allPermissions = await prisma.permission.findMany();

  console.log("Seeding roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: { isSystem: true },
    create: { name: "Admin", description: "Full system access", isSystem: true },
  });

  // Admin gets every permission.
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  await prisma.rolePermission.createMany({
    data: allPermissions.map((p) => ({ roleId: adminRole.id, permissionId: p.id })),
    skipDuplicates: true,
  });

  await prisma.role.upsert({
    where: { name: "Employee" },
    update: { isSystem: true },
    create: { name: "Employee", description: "Standard employee access", isSystem: true },
  });

  console.log("Seeding company profile...");
  await prisma.company.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  console.log("Seeding super-admin user + employee record...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env to seed the admin user.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const fullName = `${process.env.SEED_ADMIN_FIRST_NAME ?? "Admin"} ${process.env.SEED_ADMIN_LAST_NAME ?? "User"}`;

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {},
    create: {
      email: adminEmail.toLowerCase(),
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
    },
  });

  const existingEmployee = await prisma.employee.findUnique({ where: { userId: adminUser.id } });
  if (!existingEmployee) {
    await prisma.employee.create({
      data: {
        employeeCode: "EMP-0001",
        fullName,
        workEmail: adminUser.email,
        joiningDate: new Date(),
        employmentStatus: "ACTIVE",
        userId: adminUser.id,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
