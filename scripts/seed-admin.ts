/**
 * One-time seed: creates (or updates the password of) the first Admin account.
 * Run with: ADMIN_ID='...' ADMIN_NAMA='...' ADMIN_PASSWORD='...' npx tsx scripts/seed-admin.ts
 */
import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

async function main() {
  const id_admin = process.env.ADMIN_ID;
  const nama = process.env.ADMIN_NAMA;
  const plain = process.env.ADMIN_PASSWORD;
  if (!id_admin || !nama || !plain) {
    throw new Error('Set ADMIN_ID, ADMIN_NAMA, and ADMIN_PASSWORD before running this script.');
  }

  const password_hash = await hashPassword(plain);
  await prisma.admin.upsert({
    where: { id_admin },
    update: { nama, password_hash },
    create: { id_admin, nama, password_hash },
  });

  console.log(`Admin ${id_admin} (${nama}) is ready.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
