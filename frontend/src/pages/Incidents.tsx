import React, { useEffect, useState } from 'react'
import { apiFetch } from '../utils/fetch'

export default function Incidents(){
  const [list, setList] = useState<any[]>([])
  useEffect(()=>{ apiFetch('/api/incidents').then(setList).catch(()=>setList([])) },[])
  return (
    <div>
      <h1>Einsätze</h1>
      <table>
        <thead><tr><th>Title</th><th>Status</th><th>Report</th></tr></thead>
        <tbody>{list.map(i=> <tr key={i.id}><td>{i.title}</td><td>{i.status}</td><td>{i.reported_by}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
