import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import Civilians from './Civilians'
import Login from './Login'
import { getToken, clearToken } from '../utils/fetch'

export default function App(){
  const [dark, setDark] = useState(false)
  const [authed, setAuthed] = useState(!!getToken())
  const nav = useNavigate()
  useEffect(()=>{
    const stored = localStorage.getItem('nixacad:dark')
    if(stored) setDark(stored === '1')
  },[])
  useEffect(()=> localStorage.setItem('nixacad:dark', dark ? '1' : '0'),[dark])
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
          {authed ? <button onClick={()=>{ clearToken(); setAuthed(false); nav('/'); }}>Logout</button> : <Link to="/login">Login</Link>}
        </div>
      </aside>
      <main className="main">
        <header className="topbar">NixaCAD — Dashboard</header>
        <section className="content">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/civilians" element={<Civilians/>} />
            <Route path="/login" element={<Login onLogin={()=>setAuthed(true)} />} />
          </Routes>
        </section>
      </main>
    </div>
  )
}
