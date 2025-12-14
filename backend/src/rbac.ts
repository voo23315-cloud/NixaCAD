import prisma from './prisma';

export function requireRole(roleName: string) {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const civilian = await prisma.civilian.findFirst({ where: { user_id: userId } });
    if (!civilian) return res.status(403).json({ error: 'Create a civilian character first' });
    const assignments = await prisma.roleAssignment.findMany({ where: { civilian_id: civilian.id }, include: { role: true } });
    const has = assignments.some(a => a.role.name === roleName);
    if (!has) return res.status(403).json({ error: 'Insufficient role' });
    req.civilian = civilian;
    next();
  };
}
