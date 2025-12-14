import React, { useEffect, useState } from 'react'
import { apiFetch } from '../utils/fetch'

export default function AdminRoles(){
  const [roles, setRoles] = useState<any[]>([])
  const [perms, setPerms] = useState<any[]>([])
  const [rolePerms, setRolePerms] = useState<Record<number, string[]>>({})
  const [newPerm, setNewPerm] = useState('')

  async function load(){
    const [r, p] = await Promise.all([apiFetch('/api/roles'), apiFetch('/api/permissions')])
    setRoles(r)
    setPerms(p)
    const map:Record<number,string[]> = {}
    await Promise.all(r.map(async (role:any)=>{
      const rp = await apiFetch(`/api/roles/${role.id}/permissions`)
      map[role.id] = rp.map((x:any)=>x.name)
    }))
    setRolePerms(map)
  }

  useEffect(()=>{ load().catch(()=>{}) }, [])

  async function createPerm(){
    if(!newPerm) return
    await apiFetch('/api/permissions', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: newPerm }) })
    setNewPerm('')
    await load()
  }

  async function toggle(role:any, perm:string, enabled:boolean){
    try{
      if(enabled) await apiFetch('/api/roles/assign_permission', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ role_name: role.name, permission_name: perm }) })
      else await apiFetch('/api/roles/remove_permission', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ role_name: role.name, permission_name: perm }) })
      await load()
    }catch(err){ alert(String(err)) }
  }

  return (
    <div>
      <h3>Rollen & Berechtigungen</h3>
      <div style={{marginBottom:12}}>
        <input placeholder="Neue Berechtigung" value={newPerm} onChange={e=>setNewPerm(e.target.value)} />
        <button onClick={createPerm}>Erstellen</button>
      </div>
      <div style={{display:'flex',gap:20}}>
        <div style={{minWidth:240}}>
          <h4>Rollen</h4>
          <ul>
            {roles.map(r=> <li key={r.id}>{r.name} — {r.description}</li>)}
          </ul>
        </div>
        <div style={{flex:1}}>
          <h4>Zuweisungen</h4>
          <table>
            <thead><tr><th>Rolle</th>{perms.map(p=> <th key={p.name}>{p.name}</th>)}</tr></thead>
            <tbody>
              {roles.map(role=> (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  {perms.map((p:any)=>{
                    const enabled = (rolePerms[role.id] || []).includes(p.name)
                    return <td key={p.name}><input type="checkbox" checked={enabled} onChange={e=>toggle(role, p.name, e.target.checked)} /></td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
