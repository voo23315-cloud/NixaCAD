import prisma from '../src/prisma'
import bcrypt from 'bcrypt'

async function main(){
  const hash = await bcrypt.hash('changeme', 10)
  const u = await prisma.user.updateMany({ where: { email: 'admin@nixacad.local' }, data: { password: hash } })
  console.log('updated', u)
  await prisma.$disconnect()
}

main().catch(e=>{ console.error(e); process.exit(1) })
