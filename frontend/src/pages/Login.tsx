import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/fetch'

export default function Login({ onLogin }: { onLogin?: ()=>void }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const nav = useNavigate()
  async function submit(e:any){
    e.preventDefault()
    setErr(null)
    try{
      await login(email, password)
      onLogin && onLogin()
      nav('/')
    }catch(e:any){ setErr(e.message || 'Login failed') }
  }
  return (
    <div style={{maxWidth:380}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><label>Email<br/><input value={email} onChange={e=>setEmail(e.target.value)} /></label></div>
        <div><label>Passwort<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label></div>
        <div style={{marginTop:8}}><button type="submit">Login</button></div>
        {err && <div style={{color:'red'}}>{err}</div>}
      </form>
    </div>
  )
}
