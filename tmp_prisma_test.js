const {PrismaClient} = require('@prisma/client');
async function main(){
  const prisma = new PrismaClient();
  console.log(Object.keys(prisma).sort());
  await prisma.$disconnect();
}
main().catch(e=>{ console.error(e); process.exit(1) });