import React, { useEffect, useState } from 'react'

type Civilian = { id: string; vorname: string; nachname: string }

export default function Civilians(){
  const [list, setList] = useState<Civilian[]>([])
  useEffect(()=>{
    fetch('/api/civilians')
      .then(r=>r.json())
      .then(setList)
      .catch(()=>setList([]))
  },[])
  return (
    <div>
      <h1>Zivilisten</h1>
      <input placeholder="Suche" />
      <table>
        <thead><tr><th>Vorname</th><th>Nachname</th></tr></thead>
        <tbody>
          {list.map(c=> <tr key={c.id}><td>{c.vorname}</td><td>{c.nachname}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}
