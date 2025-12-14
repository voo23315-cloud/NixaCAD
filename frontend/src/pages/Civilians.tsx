import React, { useEffect, useState } from 'react'
import { apiFetch } from '../utils/fetch'

type Civilian = { id: string; vorname: string; nachname: string }

export default function Civilians(){
  const [list, setList] = useState<Civilian[]>([])
  const [q, setQ] = useState('')
  useEffect(()=>{
    apiFetch('/api/civilians' + (q ? `?q=${encodeURIComponent(q)}` : ''))
      .then(setList)
      .catch(()=>setList([]))
  },[q])
  return (
    <div>
      <h1>Zivilisten</h1>
      <input placeholder="Suche" value={q} onChange={e=>setQ(e.target.value)} />
      <table>
        <thead><tr><th>Vorname</th><th>Nachname</th></tr></thead>
        <tbody>
          {list.map(c=> <tr key={c.id}><td>{c.vorname}</td><td>{c.nachname}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
