const { PrismaClient } = require('@prisma/client');
(async function(){
  const prisma = new PrismaClient();
  console.log(Object.keys(prisma).sort());
  await prisma.$disconnect();
})();