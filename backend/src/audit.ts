import prisma from './prisma';

export async function logAction(actorId: string | null, action: string, whereInfo?: string, meta?: any) {
  try {
    await prisma.auditLog.create({ data: { actor_id: actorId || undefined, action, where_info: whereInfo, meta } });
  } catch (e) {
    console.error('Failed to write audit log', e);
  }
}
