/**
 * One-time migration: Google Sheets -> Supabase Postgres (Tahap 1).
 *
 * Reuses the existing googleSheetsService (including the additive getAllX
 * helpers) for reads, and the existing parseFlexibleDate() for date parsing,
 * so this script never duplicates the mixed-date-format handling already
 * proven correct against the live sheet.
 *
 * Idempotent: every insert is an upsert on the row's primary key, so this is
 * safe to re-run after fixing bad source data.
 *
 * Run with: npx tsx scripts/migrate-to-postgres.ts
 */
import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { googleSheetsService } from '@/services/googleSheets.service';
import { parseFlexibleDate } from '@/lib/date';

type Failure = { id: string; error: string };
type TableReport = { table: string; attempted: number; succeeded: number; failures: Failure[] };

const reports: TableReport[] = [];

/** Reanchor a parseFlexibleDate() result (built from local Y/M/D) to UTC
 * midnight, so the calendar date stored in Postgres matches the source
 * string regardless of the machine's local timezone. */
function toUtcDate(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

/** Parse a required date field. Throws (caught per-row by the caller) if unparseable. */
function reqDate(raw: string, field: string): Date {
  const parsed = parseFlexibleDate(raw);
  if (!parsed) throw new Error(`unparseable ${field}: "${raw}"`);
  return toUtcDate(parsed);
}

/** Parse an optional date field. Returns undefined for empty/unparseable values
 * (never throws, since the field is optional). */
function optDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const parsed = parseFlexibleDate(raw);
  return parsed ? toUtcDate(parsed) : undefined;
}

function optDateTime(raw: string | undefined): Date | undefined {
  return optDate(raw);
}

/**
 * fetchAndValidateSheetData maps a missing/blank cell to "" (empty string),
 * never undefined — see googleSheets.service.ts's `row[index] || ''` fallback.
 * For the handful of OPTIONAL foreign-key columns (Ziyadah.id_surah,
 * Kelas/CatatanAnak.id_guru, Santri.id_kelas) that "" would otherwise be
 * written to Postgres as a literal empty-string value instead of NULL, and
 * fail the FK constraint against every row that legitimately has no
 * reference. Only apply this to FK columns — required text fields (e.g.
 * TugasRumah.deskripsi_tugas) are frequently blank in the live sheet too,
 * and must stay "" there exactly as Sheets/Zod already tolerated, not be
 * turned into a missing-argument error.
 */
function orUndef(v: string | undefined): string | undefined {
  return v === '' ? undefined : v;
}

async function runTable<Row>(
  table: string,
  rows: Row[],
  idOf: (r: Row) => string,
  upsert: (r: Row) => Promise<unknown>,
  concurrency = 50
): Promise<void> {
  const failures: Failure[] = [];
  let succeeded = 0;

  for (let i = 0; i < rows.length; i += concurrency) {
    const batch = rows.slice(i, i + concurrency);
    const results = await Promise.allSettled(batch.map((r) => upsert(r)));
    results.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        succeeded++;
      } else {
        failures.push({ id: idOf(batch[idx]), error: String(res.reason?.message ?? res.reason) });
      }
    });
  }

  reports.push({ table, attempted: rows.length, succeeded, failures });
  console.log(`  ${table}: ${succeeded}/${rows.length} ok${failures.length ? `, ${failures.length} FAILED` : ''}`);
}

async function main() {
  console.log('Fetching all sheets...');
  const [
    guru,
    kelas,
    santri,
    masterSurah,
    kehadiran,
    ziyadah,
    murojaah,
    tibyan,
    tarbiyyah,
    adabHarian,
    lessonPlan,
    catatanAnak,
    tugasRumah,
    progresMingguan,
  ] = await Promise.all([
    googleSheetsService.getAllGuru(),
    googleSheetsService.getAllKelas(),
    googleSheetsService.getAllSantri(),
    googleSheetsService.getMasterSurah(),
    googleSheetsService.getAllKehadiran(),
    googleSheetsService.getAllZiyadah(),
    googleSheetsService.getAllMurojaah(),
    googleSheetsService.getAllTibyan(),
    googleSheetsService.getAllTarbiyyah(),
    googleSheetsService.getAllAdabHarian(),
    googleSheetsService.getAllLessonPlan(),
    googleSheetsService.getAllCatatanAnak(),
    googleSheetsService.getAllTugasRumah(),
    googleSheetsService.getAllProgresMingguan(),
  ]);

  if (guru.length === 0) {
    console.warn('  WARNING: no rows found in the Guru sheet. Continuing — Kelas.id_guru / Guru rows are optional.');
  }

  console.log('\nParent tables (sequential, dependency order)...');

  await runTable('Guru', guru, (r) => r.id_guru, async (r) =>
    prisma.guru.upsert({
      where: { id_guru: r.id_guru },
      update: { nama_guru: r.nama_guru, no_hp: r.no_hp, foto_url: r.foto_url, status_guru: r.status_guru },
      create: {
        id_guru: r.id_guru,
        nama_guru: r.nama_guru,
        no_hp: r.no_hp,
        foto_url: r.foto_url,
        status_guru: r.status_guru,
        created_at: optDateTime(r.created_at),
      },
    })
  );

  await runTable('Kelas', kelas, (r) => r.id_kelas, async (r) =>
    prisma.kelas.upsert({
      where: { id_kelas: r.id_kelas },
      update: {
        nama_kelas: r.nama_kelas,
        id_guru: orUndef(r.id_guru),
        jadwal_kelas: r.jadwal_kelas,
        jam_masuk: r.jam_masuk,
        jam_pulang: r.jam_pulang,
      },
      create: {
        id_kelas: r.id_kelas,
        nama_kelas: r.nama_kelas,
        id_guru: orUndef(r.id_guru),
        jadwal_kelas: r.jadwal_kelas,
        jam_masuk: r.jam_masuk,
        jam_pulang: r.jam_pulang,
        created_at: optDateTime(r.created_at),
      },
    })
  );

  await runTable('Santri', santri, (r) => r.id_santri, async (r) =>
    prisma.santri.upsert({
      where: { id_santri: r.id_santri },
      update: {
        nama: r.nama,
        gender: r.gender,
        tanggal_lahir: reqDate(r.tanggal_lahir, 'tanggal_lahir'),
        id_kelas: orUndef(r.id_kelas),
        ayah_ibu: r.ayah_ibu,
        no_hp: r.no_hp,
        foto_url: r.foto_url,
        status_santri: r.status_santri,
        periode_belajar: r.periode_belajar,
      },
      create: {
        id_santri: r.id_santri,
        nama: r.nama,
        gender: r.gender,
        tanggal_lahir: reqDate(r.tanggal_lahir, 'tanggal_lahir'),
        id_kelas: orUndef(r.id_kelas),
        ayah_ibu: r.ayah_ibu,
        no_hp: r.no_hp,
        foto_url: r.foto_url,
        status_santri: r.status_santri,
        periode_belajar: r.periode_belajar,
        created_at: optDateTime(r.created_at),
      },
    })
  );

  await runTable('MasterSurah', masterSurah, (r) => r.id_surah, async (r) =>
    prisma.masterSurah.upsert({
      where: { id_surah: r.id_surah },
      update: { nama_surah: r.nama_surah, jumlah_ayat: r.jumlah_ayat },
      create: { id_surah: r.id_surah, nama_surah: r.nama_surah, jumlah_ayat: r.jumlah_ayat },
    })
  );

  console.log('\nChild tables (batched)...');

  await runTable('Kehadiran', kehadiran, (r) => r.id_kehadiran, async (r) =>
    prisma.kehadiran.upsert({
      where: { id_kehadiran: r.id_kehadiran },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        status: r.status,
        catatan: r.catatan,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
        jam_masuk: r.jam_masuk,
        jam_pulang: r.jam_pulang,
      },
      create: {
        id_kehadiran: r.id_kehadiran,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        status: r.status,
        catatan: r.catatan,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
        jam_masuk: r.jam_masuk,
        jam_pulang: r.jam_pulang,
      },
    })
  );

  await runTable('Ziyadah', ziyadah, (r) => r.id_ziyadah, async (r) =>
    prisma.ziyadah.upsert({
      where: { id_ziyadah: r.id_ziyadah },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        surat: r.surat,
        id_surah: orUndef(r.id_surah),
        ayat_dari: r.ayat_dari,
        ayat_sampai: r.ayat_sampai,
        progres_ayat: r.progres_ayat,
        target_ayat: r.target_ayat,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
      create: {
        id_ziyadah: r.id_ziyadah,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        surat: r.surat,
        id_surah: orUndef(r.id_surah),
        ayat_dari: r.ayat_dari,
        ayat_sampai: r.ayat_sampai,
        progres_ayat: r.progres_ayat,
        target_ayat: r.target_ayat,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
    })
  );

  await runTable('Murojaah', murojaah, (r) => r.id_murojaah, async (r) =>
    prisma.murojaah.upsert({
      where: { id_murojaah: r.id_murojaah },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        surat_diulang: r.surat_diulang,
        status_kelancaran: r.status_kelancaran,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
      create: {
        id_murojaah: r.id_murojaah,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        surat_diulang: r.surat_diulang,
        status_kelancaran: r.status_kelancaran,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
    })
  );

  await runTable('Tibyan', tibyan, (r) => r.id_tibyan, async (r) =>
    prisma.tibyan.upsert({
      where: { id_tibyan: r.id_tibyan },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        materi_huruf: r.materi_huruf,
        progres: r.progres,
        target: r.target,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
      create: {
        id_tibyan: r.id_tibyan,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        materi_huruf: r.materi_huruf,
        progres: r.progres,
        target: r.target,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
    })
  );

  await runTable('Tarbiyyah', tarbiyyah, (r) => r.id_tarbiyyah, async (r) =>
    prisma.tarbiyyah.upsert({
      where: { id_tarbiyyah: r.id_tarbiyyah },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        tema: r.tema,
        status_capaian: r.status_capaian,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
      create: {
        id_tarbiyyah: r.id_tarbiyyah,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        tema: r.tema,
        status_capaian: r.status_capaian,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        catatan_guru: r.catatan_guru,
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
    })
  );

  await runTable('AdabHarian', adabHarian, (r) => r.id_adab, async (r) =>
    prisma.adabHarian.upsert({
      where: { id_adab: r.id_adab },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        kategori: r.kategori,
        nilai: r.nilai,
        catatan_guru: r.catatan_guru,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
      create: {
        id_adab: r.id_adab,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        kategori: r.kategori,
        nilai: r.nilai,
        catatan_guru: r.catatan_guru,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
    })
  );

  // id_lesson_plan is NOT a reliable per-row key in the source sheet (older
  // weeks reuse the same id across all 5 daily rows, newer weeks leave it
  // blank entirely) so upsert-by-id silently overwrites unrelated rows down
  // to a handful surviving. Full-table replace instead: still idempotent
  // (same end state every run), just not upsert-based like the other tables.
  {
    const lpData: {
      id_lesson_plan: string | undefined;
      id_kelas: string;
      key_minggu: string;
      tanggal_mulai: Date;
      tanggal_selesai: Date;
      tema_minggu: string | undefined;
      hari: string;
      kategori: string;
      materi: string | undefined;
      created_by: string | undefined;
    }[] = [];
    const lpFailures: Failure[] = [];
    for (const r of lessonPlan) {
      try {
        lpData.push({
          id_lesson_plan: orUndef(r.id_lesson_plan),
          id_kelas: r.id_kelas,
          key_minggu: r.key_minggu,
          tanggal_mulai: reqDate(r.tanggal_mulai, 'tanggal_mulai'),
          tanggal_selesai: reqDate(r.tanggal_selesai, 'tanggal_selesai'),
          tema_minggu: r.tema_minggu,
          hari: r.hari,
          kategori: r.kategori,
          materi: r.materi,
          created_by: r.created_by,
        });
      } catch (e) {
        lpFailures.push({ id: `${r.id_kelas}/${r.key_minggu}/${r.hari}`, error: String(e) });
      }
    }
    await prisma.lessonPlanMingguan.deleteMany({});
    if (lpData.length > 0) {
      await prisma.lessonPlanMingguan.createMany({ data: lpData });
    }
    reports.push({
      table: 'LessonPlanMingguan',
      attempted: lessonPlan.length,
      succeeded: lpData.length,
      failures: lpFailures,
    });
    console.log(
      `  LessonPlanMingguan: ${lpData.length}/${lessonPlan.length} ok${lpFailures.length ? `, ${lpFailures.length} FAILED` : ''}`
    );
  }

  await runTable('CatatanAnak', catatanAnak, (r) => r.id_catatan, async (r) =>
    prisma.catatanAnak.upsert({
      where: { id_catatan: r.id_catatan },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        id_guru: orUndef(r.id_guru),
        tanggal: reqDate(r.tanggal, 'tanggal'),
        isi_catatan: r.isi_catatan,
        created_by: r.created_by,
        minggu_ke: r.minggu_ke,
      },
      create: {
        id_catatan: r.id_catatan,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        id_guru: orUndef(r.id_guru),
        tanggal: reqDate(r.tanggal, 'tanggal'),
        isi_catatan: r.isi_catatan,
        created_by: r.created_by,
        minggu_ke: r.minggu_ke,
      },
    })
  );

  await runTable('TugasRumah', tugasRumah, (r) => r.id_tugas, async (r) =>
    prisma.tugasRumah.upsert({
      where: { id_tugas: r.id_tugas },
      update: {
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        deskripsi_tugas: r.deskripsi_tugas,
        status: r.status,
        tanggal_dibuat: optDate(r.tanggal_dibuat),
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
      create: {
        id_tugas: r.id_tugas,
        id_santri: r.id_santri,
        id_kelas: r.id_kelas,
        deskripsi_tugas: r.deskripsi_tugas,
        status: r.status,
        tanggal_dibuat: optDate(r.tanggal_dibuat),
        created_by: r.created_by,
        key_minggu: r.key_minggu,
      },
    })
  );

  await runTable('ProgresMingguan', progresMingguan, (r) => r.id_progres, async (r) =>
    prisma.progresMingguan.upsert({
      where: { id_progres: r.id_progres },
      update: {
        id_santri: r.id_santri,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        kehadiran_pct: r.kehadiran_pct,
        ziyadah_pct: r.ziyadah_pct,
        murojaah_pct: r.murojaah_pct,
        tibyan_pct: r.tibyan_pct,
        tarbiyyah_pct: r.tarbiyyah_pct,
        adab_pct: r.adab_pct,
        key_minggu: r.key_minggu,
      },
      create: {
        id_progres: r.id_progres,
        id_santri: r.id_santri,
        tanggal: reqDate(r.tanggal, 'tanggal'),
        kehadiran_pct: r.kehadiran_pct,
        ziyadah_pct: r.ziyadah_pct,
        murojaah_pct: r.murojaah_pct,
        tibyan_pct: r.tibyan_pct,
        tarbiyyah_pct: r.tarbiyyah_pct,
        adab_pct: r.adab_pct,
        key_minggu: r.key_minggu,
      },
    })
  );

  console.log('\n=== Summary ===');
  let totalFailures = 0;
  for (const r of reports) {
    console.log(`${r.table}: ${r.succeeded}/${r.attempted}`);
    if (r.failures.length) {
      totalFailures += r.failures.length;
      for (const f of r.failures) console.log(`  FAILED [${f.id}]: ${f.error}`);
    }
  }
  console.log(totalFailures === 0 ? '\nAll rows migrated successfully.' : `\n${totalFailures} row(s) failed — review above before treating Sheets as frozen.`);

  await prisma.$disconnect();
  process.exit(totalFailures === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error('Migration script crashed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
