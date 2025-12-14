import prisma from '../src/prisma';

async function main() {
  console.log('Seeding database...');

  const user = await prisma.user.upsert({
    where: { email: 'admin@nixacad.local' },
    update: {},
    create: { email: 'admin@nixacad.local', password: await import('bcrypt').then(m=>m.hash('changeme',10)) }
  });

  const department = await prisma.department.upsert({
    where: { name: 'Polizei' },
    update: {},
    create: { name: 'Polizei', beschreibung: 'Polizeibehörde' }
  });

  const role = await prisma.role.upsert({
    where: { name: 'Officer' },
    update: {},
    create: { name: 'Officer', description: 'Standard Dienstrolle' }
  });

  const civilian = await prisma.civilian.create({
    data: {
      user_id: user.id,
      vorname: 'Max',
      nachname: 'Mustermann',
      adresse: 'Musterstraße 1',
      telefonnummer: '+49123456789'
    }
  });

  await prisma.medicalRecord.create({
    data: {
      civilian_id: civilian.id,
      blutgruppe: 'A+',
      allergien: 'Keine',
      notizen: 'Test-Patient'
    }
  });

  await prisma.license.create({
    data: {
      civilian_id: civilian.id,
      typ: 'FUEHRERSCHEIN',
      klasse: 'B',
      status: 'GUELTIG'
    }
  });

  await prisma.vehicle.create({
    data: {
      civilian_id: civilian.id,
      kennzeichen: 'NIXA-001',
      fahrzeugtyp: 'PKW',
      farbe: 'Schwarz'
    }
  });

  await prisma.application.create({
    data: {
      civilian_id: civilian.id,
      department_id: department.id,
      status: 'OFFEN'
    }
  });

  await prisma.roleAssignment.create({
    data: {
      civilian_id: civilian.id,
      role_id: role.id,
      dienststatus: 'AUSSER_DIENST'
    }
  });

  await prisma.criminalRecord.create({
    data: {
      civilian_id: civilian.id,
      straftat: 'Tunichtgut',
      beschreibung: 'Beispielhaft',
      datum: new Date(),
      status: 'OFFEN'
    }
  });

  console.log('Seeding finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
