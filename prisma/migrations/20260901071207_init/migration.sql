-- CreateTable
CREATE TABLE "Santri" (
    "id_santri" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "gender" TEXT,
    "tanggal_lahir" DATE NOT NULL,
    "id_kelas" TEXT,
    "ayah_ibu" TEXT,
    "no_hp" TEXT,
    "foto_url" TEXT,
    "status_santri" TEXT,
    "periode_belajar" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "Santri_pkey" PRIMARY KEY ("id_santri")
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id_kelas" TEXT NOT NULL,
    "nama_kelas" TEXT,
    "id_guru" TEXT,
    "jadwal_kelas" TEXT,
    "jam_masuk" TEXT,
    "jam_pulang" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id_kelas")
);

-- CreateTable
CREATE TABLE "Guru" (
    "id_guru" TEXT NOT NULL,
    "nama_guru" TEXT NOT NULL,
    "no_hp" TEXT,
    "foto_url" TEXT,
    "status_guru" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "Guru_pkey" PRIMARY KEY ("id_guru")
);

-- CreateTable
CREATE TABLE "Master_surah" (
    "id_surah" TEXT NOT NULL,
    "nama_surah" TEXT NOT NULL,
    "jumlah_ayat" INTEGER NOT NULL,

    CONSTRAINT "Master_surah_pkey" PRIMARY KEY ("id_surah")
);

-- CreateTable
CREATE TABLE "Kehadiran" (
    "id_kehadiran" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "catatan" TEXT,
    "created_by" TEXT,
    "key_minggu" TEXT,
    "jam_masuk" TEXT,
    "jam_pulang" TEXT,

    CONSTRAINT "Kehadiran_pkey" PRIMARY KEY ("id_kehadiran")
);

-- CreateTable
CREATE TABLE "Ziyadah" (
    "id_ziyadah" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "surat" TEXT NOT NULL,
    "id_surah" TEXT,
    "ayat_dari" INTEGER NOT NULL,
    "ayat_sampai" INTEGER NOT NULL,
    "progres_ayat" TEXT,
    "target_ayat" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "catatan_guru" TEXT,
    "created_by" TEXT,
    "key_minggu" TEXT,

    CONSTRAINT "Ziyadah_pkey" PRIMARY KEY ("id_ziyadah")
);

-- CreateTable
CREATE TABLE "Murojaah" (
    "id_murojaah" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "surat_diulang" TEXT NOT NULL,
    "status_kelancaran" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "catatan_guru" TEXT,
    "created_by" TEXT,
    "key_minggu" TEXT,

    CONSTRAINT "Murojaah_pkey" PRIMARY KEY ("id_murojaah")
);

-- CreateTable
CREATE TABLE "Tibyan" (
    "id_tibyan" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "materi_huruf" TEXT,
    "progres" INTEGER NOT NULL,
    "target" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "catatan_guru" TEXT,
    "created_by" TEXT,
    "key_minggu" TEXT,

    CONSTRAINT "Tibyan_pkey" PRIMARY KEY ("id_tibyan")
);

-- CreateTable
CREATE TABLE "Tarbiyyah" (
    "id_tarbiyyah" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "tema" TEXT,
    "status_capaian" TEXT,
    "tanggal" DATE NOT NULL,
    "catatan_guru" TEXT,
    "created_by" TEXT,
    "key_minggu" TEXT,

    CONSTRAINT "Tarbiyyah_pkey" PRIMARY KEY ("id_tarbiyyah")
);

-- CreateTable
CREATE TABLE "Adab_Harian" (
    "id_adab" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,
    "catatan_guru" TEXT,
    "tanggal" DATE NOT NULL,
    "created_by" TEXT,
    "key_minggu" TEXT,

    CONSTRAINT "Adab_Harian_pkey" PRIMARY KEY ("id_adab")
);

-- CreateTable
CREATE TABLE "LessonPlanMingguan" (
    "id_lesson_plan" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "key_minggu" TEXT NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "tema_minggu" TEXT,
    "hari" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "materi" TEXT,
    "created_by" TEXT,

    CONSTRAINT "LessonPlanMingguan_pkey" PRIMARY KEY ("id_lesson_plan")
);

-- CreateTable
CREATE TABLE "CatatanAnak" (
    "id_catatan" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "id_guru" TEXT,
    "tanggal" DATE NOT NULL,
    "isi_catatan" TEXT NOT NULL,
    "created_by" TEXT,
    "minggu_ke" TEXT,

    CONSTRAINT "CatatanAnak_pkey" PRIMARY KEY ("id_catatan")
);

-- CreateTable
CREATE TABLE "TugasRumah" (
    "id_tugas" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "id_kelas" TEXT NOT NULL,
    "deskripsi_tugas" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tanggal_dibuat" DATE,
    "created_by" TEXT,
    "key_minggu" TEXT,

    CONSTRAINT "TugasRumah_pkey" PRIMARY KEY ("id_tugas")
);

-- CreateTable
CREATE TABLE "ProgresMingguan" (
    "id_progres" TEXT NOT NULL,
    "id_santri" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "kehadiran_pct" DOUBLE PRECISION NOT NULL,
    "ziyadah_pct" DOUBLE PRECISION NOT NULL,
    "murojaah_pct" DOUBLE PRECISION NOT NULL,
    "tibyan_pct" DOUBLE PRECISION NOT NULL,
    "tarbiyyah_pct" DOUBLE PRECISION NOT NULL,
    "adab_pct" DOUBLE PRECISION NOT NULL,
    "key_minggu" TEXT,

    CONSTRAINT "ProgresMingguan_pkey" PRIMARY KEY ("id_progres")
);

-- CreateIndex
CREATE INDEX "Santri_id_kelas_idx" ON "Santri"("id_kelas");

-- CreateIndex
CREATE INDEX "Kelas_id_guru_idx" ON "Kelas"("id_guru");

-- CreateIndex
CREATE INDEX "Kehadiran_id_santri_idx" ON "Kehadiran"("id_santri");

-- CreateIndex
CREATE INDEX "Kehadiran_id_kelas_idx" ON "Kehadiran"("id_kelas");

-- CreateIndex
CREATE INDEX "Kehadiran_key_minggu_idx" ON "Kehadiran"("key_minggu");

-- CreateIndex
CREATE INDEX "Ziyadah_id_santri_idx" ON "Ziyadah"("id_santri");

-- CreateIndex
CREATE INDEX "Ziyadah_id_kelas_idx" ON "Ziyadah"("id_kelas");

-- CreateIndex
CREATE INDEX "Ziyadah_id_surah_idx" ON "Ziyadah"("id_surah");

-- CreateIndex
CREATE INDEX "Ziyadah_key_minggu_idx" ON "Ziyadah"("key_minggu");

-- CreateIndex
CREATE INDEX "Murojaah_id_santri_idx" ON "Murojaah"("id_santri");

-- CreateIndex
CREATE INDEX "Murojaah_id_kelas_idx" ON "Murojaah"("id_kelas");

-- CreateIndex
CREATE INDEX "Murojaah_key_minggu_idx" ON "Murojaah"("key_minggu");

-- CreateIndex
CREATE INDEX "Tibyan_id_santri_idx" ON "Tibyan"("id_santri");

-- CreateIndex
CREATE INDEX "Tibyan_id_kelas_idx" ON "Tibyan"("id_kelas");

-- CreateIndex
CREATE INDEX "Tibyan_key_minggu_idx" ON "Tibyan"("key_minggu");

-- CreateIndex
CREATE INDEX "Tarbiyyah_id_santri_idx" ON "Tarbiyyah"("id_santri");

-- CreateIndex
CREATE INDEX "Tarbiyyah_id_kelas_idx" ON "Tarbiyyah"("id_kelas");

-- CreateIndex
CREATE INDEX "Tarbiyyah_key_minggu_idx" ON "Tarbiyyah"("key_minggu");

-- CreateIndex
CREATE INDEX "Adab_Harian_id_santri_idx" ON "Adab_Harian"("id_santri");

-- CreateIndex
CREATE INDEX "Adab_Harian_id_kelas_idx" ON "Adab_Harian"("id_kelas");

-- CreateIndex
CREATE INDEX "Adab_Harian_key_minggu_idx" ON "Adab_Harian"("key_minggu");

-- CreateIndex
CREATE INDEX "LessonPlanMingguan_id_kelas_idx" ON "LessonPlanMingguan"("id_kelas");

-- CreateIndex
CREATE INDEX "LessonPlanMingguan_key_minggu_idx" ON "LessonPlanMingguan"("key_minggu");

-- CreateIndex
CREATE INDEX "CatatanAnak_id_santri_idx" ON "CatatanAnak"("id_santri");

-- CreateIndex
CREATE INDEX "CatatanAnak_id_kelas_idx" ON "CatatanAnak"("id_kelas");

-- CreateIndex
CREATE INDEX "CatatanAnak_minggu_ke_idx" ON "CatatanAnak"("minggu_ke");

-- CreateIndex
CREATE INDEX "TugasRumah_id_santri_idx" ON "TugasRumah"("id_santri");

-- CreateIndex
CREATE INDEX "TugasRumah_id_kelas_idx" ON "TugasRumah"("id_kelas");

-- CreateIndex
CREATE INDEX "TugasRumah_key_minggu_idx" ON "TugasRumah"("key_minggu");

-- CreateIndex
CREATE INDEX "ProgresMingguan_id_santri_idx" ON "ProgresMingguan"("id_santri");

-- CreateIndex
CREATE INDEX "ProgresMingguan_key_minggu_idx" ON "ProgresMingguan"("key_minggu");

-- AddForeignKey
ALTER TABLE "Santri" ADD CONSTRAINT "Santri_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_id_guru_fkey" FOREIGN KEY ("id_guru") REFERENCES "Guru"("id_guru") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ziyadah" ADD CONSTRAINT "Ziyadah_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ziyadah" ADD CONSTRAINT "Ziyadah_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ziyadah" ADD CONSTRAINT "Ziyadah_id_surah_fkey" FOREIGN KEY ("id_surah") REFERENCES "Master_surah"("id_surah") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Murojaah" ADD CONSTRAINT "Murojaah_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Murojaah" ADD CONSTRAINT "Murojaah_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tibyan" ADD CONSTRAINT "Tibyan_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tibyan" ADD CONSTRAINT "Tibyan_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarbiyyah" ADD CONSTRAINT "Tarbiyyah_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarbiyyah" ADD CONSTRAINT "Tarbiyyah_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adab_Harian" ADD CONSTRAINT "Adab_Harian_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adab_Harian" ADD CONSTRAINT "Adab_Harian_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlanMingguan" ADD CONSTRAINT "LessonPlanMingguan_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatatanAnak" ADD CONSTRAINT "CatatanAnak_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatatanAnak" ADD CONSTRAINT "CatatanAnak_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatatanAnak" ADD CONSTRAINT "CatatanAnak_id_guru_fkey" FOREIGN KEY ("id_guru") REFERENCES "Guru"("id_guru") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TugasRumah" ADD CONSTRAINT "TugasRumah_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TugasRumah" ADD CONSTRAINT "TugasRumah_id_kelas_fkey" FOREIGN KEY ("id_kelas") REFERENCES "Kelas"("id_kelas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgresMingguan" ADD CONSTRAINT "ProgresMingguan_id_santri_fkey" FOREIGN KEY ("id_santri") REFERENCES "Santri"("id_santri") ON DELETE RESTRICT ON UPDATE CASCADE;
