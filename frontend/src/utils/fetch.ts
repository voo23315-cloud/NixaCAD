export function getToken(){
  return localStorage.getItem('nixacad:token')
}
export function setToken(t:string){
  localStorage.setItem('nixacad:token', t)
}
export function clearToken(){
  localStorage.removeItem('nixacad:token')
}

export async function apiFetch(path:string, opts: RequestInit = {}){
  const headers = opts.headers ? new Headers(opts.headers as any) : new Headers();
  const token = getToken();
  if(token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(path, { ...opts, headers });
  if(res.status === 401) throw new Error('Unauthorized');
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(email:string, password:string){
  const res = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
  if(!res.ok) throw new Error('Login failed');
  const j = await res.json();
  if(!j.token) throw new Error('No token');
  setToken(j.token);
  return j;
}
