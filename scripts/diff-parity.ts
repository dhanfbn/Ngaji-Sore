/**
 * Compares .verify-parity.sheets.json vs .verify-parity.postgres.json
 * (produced by scripts/verify-parity.ts) and reports any differences.
 * Not part of the final state — throwaway verification tooling.
 */
import fs from 'node:fs';
import path from 'node:path';

function readJson(label: string): unknown {
  const p = path.join(process.cwd(), `.verify-parity.${label}.json`);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${p} — run scripts/verify-parity.ts ${label} first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function diff(a: unknown, b: unknown, pathStr = ''): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (
    typeof a !== 'object' || a === null ||
    typeof b !== 'object' || b === null ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    return [`${pathStr || '(root)'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`];
  }
  const diffs: string[] = [];
  const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
  for (const key of keys) {
    diffs.push(...diff((a as any)[key], (b as any)[key], pathStr ? `${pathStr}.${key}` : key));
  }
  return diffs;
}

const sheets = readJson('sheets');
const postgres = readJson('postgres');
const diffs = diff(sheets, postgres);

if (diffs.length === 0) {
  console.log('MATCH — Sheets and Postgres output are identical.');
  process.exit(0);
} else {
  console.log(`${diffs.length} difference(s) found:\n`);
  diffs.forEach((d) => console.log(' - ' + d));
  process.exit(1);
}
