import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@um.ac.id" },
    update: {},
    create: {
      email: "admin@um.ac.id",
      passwordHash: adminPasswordHash,
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

  const pesertaPasswordHash = await bcrypt.hash("Peserta123!", 10);
  const pesertaRecords = [];
  for (const p of pesertaSeed) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: pesertaPasswordHash,
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
