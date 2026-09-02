/**
 * Cutover verification (Tahap 1, plan §6) — dumps dashboard.service.ts output
 * to a JSON file so it can be diffed between the Sheets-backed and
 * Postgres-backed runs.
 *
 * dashboard.service.ts always imports a single hardcoded backend (whichever
 * one is currently wired at src/services/dashboard.service.ts:1), so this
 * script cannot compare both backends in one process — run it twice instead:
 *
 *   1. npx tsx scripts/verify-parity.ts sheets     (current import: googleSheets.service)
 *   2. Temporarily edit dashboard.service.ts's import to './db.service'
 *   3. npx tsx scripts/verify-parity.ts postgres
 *   4. npx tsx scripts/diff-parity.ts
 *   5. Revert step 2 if the diff isn't clean yet, or keep it if it is (that
 *      IS the real cutover — see plan §6).
 *
 * Not part of the final state — throwaway verification tooling.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {
  getHeaderInfo,
  getDashboardData,
  getKehadiranDetail,
  getZiyadahDetail,
  getMurojaahDetail,
} from '@/services/dashboard.service';

const REFERENCE_SANTRI = process.env.VERIFY_SANTRI_ID || 'STD0001';

const label = process.argv[2];
if (label !== 'sheets' && label !== 'postgres') {
  console.error('Usage: npx tsx scripts/verify-parity.ts <sheets|postgres>');
  process.exit(1);
}

async function main() {
  console.log(`Running against reference santri ${REFERENCE_SANTRI}, backend label "${label}"...`);

  const [header, dashboard, kehadiran, ziyadah, murojaah] = await Promise.all([
    getHeaderInfo(REFERENCE_SANTRI),
    getDashboardData(REFERENCE_SANTRI),
    getKehadiranDetail(REFERENCE_SANTRI),
    getZiyadahDetail(REFERENCE_SANTRI),
    getMurojaahDetail(REFERENCE_SANTRI),
  ]);

  const out = { header, dashboard, kehadiran, ziyadah, murojaah };
  const outPath = path.join(process.cwd(), `.verify-parity.${label}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error('verify-parity crashed:', err);
  process.exit(1);
});
