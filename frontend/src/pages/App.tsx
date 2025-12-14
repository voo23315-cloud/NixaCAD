import React, { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import Civilians from './Civilians'

export default function App(){
  const [dark, setDark] = useState(false)
  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar">
        <h2>NixaCAD</h2>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/civilians">Zivilisten</Link>
        </nav>
        <div className="bottom">
          <button onClick={()=>setDark(d=>!d)}>{dark ? 'Light' : 'Dark'}</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">NixaCAD — Dashboard</header>
        <section className="content">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/civilians" element={<Civilians/>} />
          </Routes>
        </section>
      </main>
    </div>
  )
}
