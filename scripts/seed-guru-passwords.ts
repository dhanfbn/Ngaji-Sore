/**
 * One-time seed: sets a uniform default bcrypt password hash on every Guru
 * row that doesn't have one yet (password_hash IS NULL). Idempotent — safe
 * to re-run, never overwrites a password a teacher has since changed.
 *
 * Run with: GURU_DEFAULT_PASSWORD='...' npx tsx scripts/seed-guru-passwords.ts
 */
import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

async function main() {
  const plain = process.env.GURU_DEFAULT_PASSWORD;
  if (!plain) {
    throw new Error('Set GURU_DEFAULT_PASSWORD before running this script.');
  }

  const hash = await hashPassword(plain);
  const result = await prisma.guru.updateMany({
    where: { password_hash: null },
    data: { password_hash: hash },
  });

  console.log(`Set default password_hash on ${result.count} Guru rows.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
