const API = process.env.API || 'http://localhost:4000'

async function main(){
  console.log('Health:')
  console.log(await (await fetch(API + '/api/health')).json())

  // Use seeded admin to perform privileged operations
  const adminLogin = await fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@nixacad.local', password: 'changeme' }) })
  const adminJ = await adminLogin.json();
  if (!adminJ.token) { console.error('Admin login failed'); return }
  const token = adminJ.token
  console.log('Admin token ok')

  // Create an incident
  const inc = await fetch(API + '/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: 'E2E Test Incident', description: 'Smoke' }) })
  console.log('Create incident', inc.status)
  console.log('List incidents count', (await (await fetch(API + '/api/incidents', { headers: { Authorization: `Bearer ${token}` } })).json()).length)
  console.log('Audit logs count', (await (await fetch(API + '/api/audit', { headers: { Authorization: `Bearer ${token}` } })).json()).length)
  // Permissions smoke
  const pRes = await fetch(API + '/api/permissions', { headers: { Authorization: `Bearer ${token}` } })
  console.log('Permissions list status', pRes.status)
  const perms = await pRes.json()
  console.log('Permissions count', perms.length)
  // create a test permission
  const createP = await fetch(API + '/api/permissions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'manage_test' }) })
  console.log('Create permission status', createP.status)
  // assign to Officer
  const assign = await fetch(API + '/api/roles/assign_permission', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role_name: 'Officer', permission_name: 'manage_test' }) })
  console.log('Assign permission status', assign.status)
  const roles = await (await fetch(API + '/api/roles', { headers: { Authorization: `Bearer ${token}` } })).json()
  const officer = roles.find(r => r.name === 'Officer')
  const rp = await (await fetch(API + `/api/roles/${officer.id}/permissions`, { headers: { Authorization: `Bearer ${token}` } })).json()
  console.log('Officer perm count', rp.length)
}

main().catch(e=>{ console.error(e); process.exit(1) })
