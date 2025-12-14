import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './prisma';
import { z } from 'zod';
import authRouter, { authMiddleware, requireCivilian } from './auth';
import { requireRole } from './rbac';
import { logAction } from './audit';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);

const port = process.env.PORT || 4000;

// Simple health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Civilians listing (example)
app.get('/api/civilians', async (req, res) => {
  const q = String(req.query.q || '');
  const civilians = await prisma.civilian.findMany({
    where: q
      ? {
          OR: [
            { vorname: { contains: q, mode: 'insensitive' } },
            { nachname: { contains: q, mode: 'insensitive' } }
          ]
        }
      : undefined,
    take: 100
  });
  res.json(civilians);
});

app.get('/api/departments', async (_req, res) => {
  const deps = await prisma.department.findMany({ where: { aktiv: true } });
  res.json(deps);
});

// Create a civilian (enforces required fields)
const createCivilianSchema = z.object({
  userId: z.string().uuid(),
  vorname: z.string().min(1),
  nachname: z.string().min(1),
  geburtsdatum: z.string().optional(),
  geschlecht: z.enum(['männlich', 'weiblich', 'divers']).optional(),
  adresse: z.string().optional(),
  telefonnummer: z.string().optional()
});

app.post('/api/civilians', async (req, res) => {
  const parsed = createCivilianSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const data = parsed.data;
  const civilian = await prisma.civilian.create({ data: {
    user_id: data.userId,
    vorname: data.vorname,
    nachname: data.nachname,
    geburtsdatum: data.geburtsdatum ? new Date(data.geburtsdatum) : null,
    geschlecht: data.geschlecht as any,
    adresse: data.adresse,
    telefonnummer: data.telefonnummer
  }});
  res.status(201).json(civilian);
});

// Example protected route: apply to department requires logged-in user and civilian
app.post('/api/apply/:departmentId', authMiddleware, requireCivilian, async (req: any, res) => {
  const departmentId = req.params.departmentId;
  const civilian = req.civilian;
  const existing = await prisma.application.findFirst({ where: { civilian_id: civilian.id, department_id: departmentId } });
  if (existing) return res.status(400).json({ error: 'Already applied' });
  const appRec = await prisma.application.create({ data: { civilian_id: civilian.id, department_id: departmentId } });
  await logAction(req.user?.id, 'apply_department', `application:${appRec.id}`, { departmentId });
  res.status(201).json(appRec);
});

// Medical record create (only officers / medical staff)
app.post('/api/medical/:civilianId', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const civilianId = req.params.civilianId;
  const { blutgruppe, allergien, vorkrankheiten, notizen } = req.body;
  const rec = await prisma.medicalRecord.upsert({
    where: { civilian_id: civilianId },
    update: { blutgruppe, allergien, vorkrankheiten, notizen },
    create: { civilian_id: civilianId, blutgruppe, allergien, vorkrankheiten, notizen }
  });
  await logAction(req.user?.id, 'update_medical', `civilian:${civilianId}`, { id: rec.id });
  res.json(rec);
});

// Criminal record create (officer)
app.post('/api/criminal', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const { civilian_id, straftat, beschreibung, datum, ort, beamter_id } = req.body;
  const rec = await prisma.criminalRecord.create({ data: { civilian_id, straftat, beschreibung, datum: new Date(datum), ort, beamter_id } });
  await logAction(req.user?.id, 'create_criminal', `criminal:${rec.id}`, { civilian_id });
  res.status(201).json(rec);
});

// Criminals: view for officer or owner
app.get('/api/criminal/:civilianId', authMiddleware, async (req: any, res) => {
  const { civilianId } = req.params;
  const userId = req.user?.id;
  const own = await prisma.civilian.findFirst({ where: { user_id: userId } });
  const isOwner = own?.id === civilianId;
  const isOfficer = !!(await prisma.roleAssignment.findFirst({ where: { civilian_id: own?.id }, include: { role: true } ,})) && (await prisma.role.findUnique({ where: { name: 'Officer' } })) ? (await prisma.roleAssignment.findFirst({ where: { civilian_id: own?.id, role: { name: 'Officer' } } })) : null;
  if (!isOwner && !isOfficer) return res.status(403).json({ error: 'Not allowed' });
  const list = await prisma.criminalRecord.findMany({ where: { civilian_id: civilianId }, take: 100 });
  res.json(list);
});

// License endpoints (owner or officer)
app.get('/api/licenses/:civilianId', authMiddleware, async (req: any, res) => {
  const { civilianId } = req.params;
  const userId = req.user?.id;
  const own = await prisma.civilian.findFirst({ where: { user_id: userId } });
  if (own?.id !== civilianId) {
    const ass = await prisma.roleAssignment.findFirst({ where: { civilian_id: own?.id, role: { name: 'Officer' } } , include:{role:true}});
    if (!ass) return res.status(403).json({ error: 'Not allowed' });
  }
  const list = await prisma.license.findMany({ where: { civilian_id: civilianId } });
  res.json(list);
});

// Vehicles
app.get('/api/vehicles/:civilianId', authMiddleware, async (req: any, res) => {
  const { civilianId } = req.params;
  const userId = req.user?.id;
  const own = await prisma.civilian.findFirst({ where: { user_id: userId } });
  if (own?.id !== civilianId) {
    const ass = await prisma.roleAssignment.findFirst({ where: { civilian_id: own?.id, role: { name: 'Officer' } }, include:{role:true} });
    if (!ass) return res.status(403).json({ error: 'Not allowed' });
  }
  const list = await prisma.vehicle.findMany({ where: { civilian_id: civilianId } });
  res.json(list);
});

// Incidents
app.post('/api/incidents', authMiddleware, async (req: any, res) => {
  const { title, description } = req.body;
  const inc = await prisma.incident.create({ data: { title, description, reported_by: req.user?.id } });
  await logAction(req.user?.id, 'create_incident', `incident:${inc.id}`, { title });
  res.status(201).json(inc);
});

app.get('/api/incidents', authMiddleware, async (_req, res) => {
  const list = await prisma.incident.findMany({ take: 200, orderBy: { created_at: 'desc' } });
  res.json(list);
});

// Roles management (Officer required)
app.get('/api/roles', authMiddleware, requireRole('Officer'), async (_req, res) => {
  const list = await prisma.role.findMany();
  res.json(list);
});

app.post('/api/roles', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const { name, description } = req.body;
  const r = await prisma.role.create({ data: { name, description } });
  res.status(201).json(r);
});

app.post('/api/roles/assign', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const { civilian_id, role_name } = req.body;
  const role = await prisma.role.findUnique({ where: { name: role_name } });
  if (!role) return res.status(404).json({ error: 'Role not found' });
  const ass = await prisma.roleAssignment.create({ data: { civilian_id, role_id: role.id } });
  await logAction(req.user?.id, 'assign_role', `role:${role.name}`, { civilian_id });
  res.status(201).json(ass);
});

app.post('/api/roles/unassign', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const { civilian_id, role_name } = req.body;
  const role = await prisma.role.findUnique({ where: { name: role_name } });
  if (!role) return res.status(404).json({ error: 'Role not found' });
  await prisma.roleAssignment.deleteMany({ where: { civilian_id, role_id: role.id } });
  await logAction(req.user?.id, 'unassign_role', `role:${role.name}`, { civilian_id });
  res.json({ ok: true });
});

// Audit viewer
app.get('/api/audit', authMiddleware, requireRole('Officer'), async (_req, res) => {
  const list = await prisma.auditLog.findMany({ take: 200, orderBy: { when_ts: 'desc' } });
  res.json(list);
});

// Tickets
app.post('/api/tickets', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const { civilian_id, amount, reason } = req.body;
  const t = await prisma.ticket.create({ data: { civilian_id, amount: Number(amount), reason, issued_by: req.user?.id } });
  await logAction(req.user?.id, 'create_ticket', `ticket:${t.id}`, { civilian_id, amount });
  res.status(201).json(t);
});

app.get('/api/tickets/:civilianId', authMiddleware, async (req: any, res) => {
  const list = await prisma.ticket.findMany({ where: { civilian_id: req.params.civilianId } });
  res.json(list);
});

// Warrants
app.post('/api/warrants', authMiddleware, requireRole('Officer'), async (req: any, res) => {
  const { civilian_id, reason, expires_at } = req.body;
  const w = await prisma.warrant.create({ data: { civilian_id, reason, expires_at: expires_at ? new Date(expires_at) : null, issued_by: req.user?.id } });
  await logAction(req.user?.id, 'create_warrant', `warrant:${w.id}`, { civilian_id });
  res.status(201).json(w);
});

app.get('/api/warrants/:civilianId', authMiddleware, async (req: any, res) => {
  const list = await prisma.warrant.findMany({ where: { civilian_id: req.params.civilianId } });
  res.json(list);
});

app.listen(port, async () => {
  console.log(`NixaCAD backend listening on ${port}`);
  try {
    await prisma.$connect();
    console.log('Connected to DB');
  } catch (err) {
    console.error('DB connection error', err);
  }
});
