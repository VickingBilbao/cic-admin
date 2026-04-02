import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, saveToken } from '../api/client.js'

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.08) 0%, transparent 60%), #0a0f1e',
  },
  card: {
    width: 380, padding: '40px 36px',
    background: 'rgba(15,23,42,0.95)',
    border: '1px solid rgba(6,182,212,0.2)',
    borderRadius: 16,
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  logo: { textAlign: 'center', marginBottom: 32 },
  badge: {
    display: 'inline-block', padding: '4px 12px',
    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: 20, fontSize: 11, color: '#06b6d4',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
  },
  title: { fontSize: 26, fontWeight: 700, color: '#fff' },
  sub: { fontSize: 13, color: 'rgba(148,163,184,0.6)', marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { fontSize: 12, color: 'rgba(148,163,184,0.7)', marginBottom: 4, display: 'block' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.2)',
    color: '#fff', fontSize: 14, outline: 'none',
    transition: 'border-color 0.15s',
  },
  btn: {
    padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    color: '#fff', fontSize: 15, fontWeight: 600,
    transition: 'opacity 0.15s', marginTop: 4,
  },
  error: {
    padding: '10px 14px', borderRadius: 8,
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5', fontSize: 13,
  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.login(email, password)
      if (!res.is_super_admin) throw new Error('Acesso restrito a super administradores.')
      saveToken(res.token)
      navigate('/dashboard')
    } catch(err) {
      setError(err.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.badge}>Super Admin</div>
          <div style={S.title}>CIC Admin</div>
          <div style={S.sub}>Acesso restrito a Victor & Marcos</div>
        </div>
        <form style={S.form} onSubmit={handleSubmit}>
          {error && <div style={S.error}>{error}</div>}
          <div>
            <label style={S.label}>E-mail</label>
            <input
              type="email"
              style={S.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>
          <div>
            <label style={S.label}>Senha</label>
            <input
              type="password"
              style={S.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
