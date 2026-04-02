import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { clearToken } from '../api/client.js'

const NAV = [
  { to: '/dashboard', icon: '◎', label: 'Dashboard' },
  { to: '/orgs',      icon: '🏢', label: 'Marketeiros' },
  { to: '/plans',     icon: '📦', label: 'Planos' },
]

const S = {
  shell: { display:'flex', height:'100vh', overflow:'hidden' },
  sidebar: {
    width: 220, flexShrink: 0,
    background: 'rgba(10,15,30,0.98)',
    borderRight: '1px solid rgba(100,116,139,0.12)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 0',
  },
  logo: {
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(100,116,139,0.1)',
    marginBottom: 12,
  },
  logoTitle: { fontSize: 18, fontWeight: 700, color: '#06b6d4', letterSpacing: '-0.5px' },
  logoSub: { fontSize: 11, color: 'rgba(148,163,184,0.6)', marginTop: 2 },
  nav: { flex: 1, padding: '0 10px' },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 8, marginBottom: 2,
    color: active ? '#fff' : 'rgba(148,163,184,0.7)',
    background: active ? 'rgba(6,182,212,0.12)' : 'transparent',
    borderLeft: active ? '2px solid #06b6d4' : '2px solid transparent',
    textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400,
    transition: 'all 0.15s',
  }),
  navIcon: { fontSize: 15, width: 20, textAlign: 'center' },
  footer: {
    padding: '12px 10px 0',
    borderTop: '1px solid rgba(100,116,139,0.1)',
  },
  logoutBtn: {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'rgba(148,163,184,0.6)', fontSize: 13,
    display: 'flex', alignItems: 'center', gap: 10,
    transition: 'color 0.15s',
  },
  main: { flex: 1, overflow: 'auto', padding: '28px 32px' },
}

export default function Layout() {
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTitle}>CIC Admin</div>
          <div style={S.logoSub}>Painel Super Administrador</div>
        </div>
        <nav style={S.nav}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => S.navLink(isActive)}>
              <span style={S.navIcon}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={S.footer}>
          <button style={S.logoutBtn} onClick={logout}>
            <span style={S.navIcon}>⎋</span> Sair
          </button>
        </div>
      </aside>
      <main style={S.main}>
        <Outlet />
      </main>
    </div>
  )
}
