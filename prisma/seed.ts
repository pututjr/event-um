import { prisma } from "../src/lib/prisma";
import { createAdminClient } from "../src/lib/supabase/admin";

const supabase = createAdminClient();

async function findAuthUserByEmail(email: string) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
}

async function ensureAuthUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!error && data.user) return data.user;

  const existing = await findAuthUserByEmail(email);
  if (existing) return existing;

  throw error ?? new Error(`Gagal membuat/menemukan akun ${email}`);
}

async function main() {
  const adminAuthUser = await ensureAuthUser("admin@um.ac.id", "Admin123!");
  await prisma.user.upsert({
    where: { email: "admin@um.ac.id" },
    update: { id: adminAuthUser.id },
    create: {
      id: adminAuthUser.id,
      email: "admin@um.ac.id",
      role: "ADMIN",
    },
  });

  const pesertaSeed = [
    {
      email: "budi.santoso@um.ac.id",
      namaLengkap: "Budi Santoso",
      noHp: "081234567890",
      instansi: "Universitas Negeri Malang",
      unitProdi: "Fakultas Teknik",
      jenisPeserta: "DOSEN" as const,
    },
    {
      email: "siti.rahma@student.um.ac.id",
      namaLengkap: "Siti Rahma",
      noHp: "081298765432",
      instansi: "Universitas Negeri Malang",
      unitProdi: "S1 Pendidikan Teknik Informatika",
      jenisPeserta: "MAHASISWA" as const,
    },
  ];

  const pesertaRecords = [];
  for (const p of pesertaSeed) {
    const authUser = await ensureAuthUser(p.email, "Peserta123!");

    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { id: authUser.id },
      create: {
        id: authUser.id,
        email: p.email,
        role: "PESERTA",
      },
    });

    const peserta = await prisma.peserta.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        namaLengkap: p.namaLengkap,
        noHp: p.noHp,
        instansi: p.instansi,
        unitProdi: p.unitProdi,
        jenisPeserta: p.jenisPeserta,
      },
    });
    pesertaRecords.push(peserta);
  }

  const now = new Date();
  const kegiatanSeed = [
    {
      judul: "Pelatihan Digitalisasi Layanan Akademik",
      deskripsi: "Pelatihan pemanfaatan sistem digital untuk layanan akademik.",
      lokasi: "Gedung D19 UM",
      tanggalMulai: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      tanggalSelesai: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      kuota: 100,
      status: "AKTIF" as const,
    },
    {
      judul: "Workshop Penulisan Karya Ilmiah",
      deskripsi: "Workshop penulisan dan publikasi karya ilmiah bereputasi.",
      lokasi: "Aula A3 UM",
      tanggalMulai: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      tanggalSelesai: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      kuota: 60,
      status: "SELESAI" as const,
    },
  ];

  const kegiatanRecords = [];
  for (const k of kegiatanSeed) {
    const existing = await prisma.kegiatan.findFirst({ where: { judul: k.judul } });
    const kegiatan = existing ?? (await prisma.kegiatan.create({ data: k }));
    kegiatanRecords.push(kegiatan);
  }

  await prisma.pendaftaran.upsert({
    where: {
      pesertaId_kegiatanId: {
        pesertaId: pesertaRecords[0].id,
        kegiatanId: kegiatanRecords[1].id,
      },
    },
    update: {},
    create: {
      pesertaId: pesertaRecords[0].id,
      kegiatanId: kegiatanRecords[1].id,
      status: "SERTIFIKAT_TERBIT",
      tanggalHadir: kegiatanRecords[1].tanggalMulai,
    },
  });

  await prisma.pendaftaran.upsert({
    where: {
      pesertaId_kegiatanId: {
        pesertaId: pesertaRecords[1].id,
        kegiatanId: kegiatanRecords[1].id,
      },
    },
    update: {},
    create: {
      pesertaId: pesertaRecords[1].id,
      kegiatanId: kegiatanRecords[1].id,
      status: "HADIR",
      tanggalHadir: kegiatanRecords[1].tanggalMulai,
    },
  });

  await prisma.pendaftaran.upsert({
    where: {
      pesertaId_kegiatanId: {
        pesertaId: pesertaRecords[1].id,
        kegiatanId: kegiatanRecords[0].id,
      },
    },
    update: {},
    create: {
      pesertaId: pesertaRecords[1].id,
      kegiatanId: kegiatanRecords[0].id,
      status: "TERDAFTAR",
    },
  });

  console.log("Seed selesai.");
  console.log("Login admin  : admin@um.ac.id / Admin123!");
  console.log("Login peserta: budi.santoso@um.ac.id / Peserta123!");
  console.log("Login peserta: siti.rahma@student.um.ac.id / Peserta123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
