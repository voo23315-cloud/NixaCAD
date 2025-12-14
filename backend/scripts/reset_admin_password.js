const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

;(async ()=>{
  const hash = await bcrypt.hash('changeme', 10)
  const u = await prisma.user.updateMany({ where: { email: 'admin@nixacad.local' }, data: { password: hash } })
  console.log('updated', u)
  await prisma.$disconnect()
})().catch(e=>{ console.error(e); process.exit(1) })
