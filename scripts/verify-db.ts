import { prisma } from "../src/lib/prisma";

async function main() {
  const [userCount, pesertaCount, kegiatanCount, pendaftaranCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.peserta.count(),
      prisma.kegiatan.count(),
      prisma.pendaftaran.count(),
    ]);
  console.log(
    JSON.stringify(
      { userCount, pesertaCount, kegiatanCount, pendaftaranCount },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
