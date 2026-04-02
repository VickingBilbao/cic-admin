import { useState, useEffect } from 'react'
import { api } from '../api/client.js'

const S = {
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card:  {
    padding: '24px', borderRadius: 14,
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(100,116,139,0.15)',
  },
  planName:  { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  planPrice: { fontSize: 30, fontWeight: 700, color: '#06b6d4', marginBottom: 2 },
  planSub:   { fontSize: 12, color: 'rgba(148,163,184,0.5)', marginBottom: 16 },
  features:  { listStyle: 'none', padding: 0 },
  feature:   { fontSize: 13, color: 'rgba(148,163,184,0.7)', padding: '3px 0', display: 'flex', gap: 8 },
  editBtn:   {
    marginTop: 16, width: '100%', padding: '9px', borderRadius: 8, cursor: 'pointer',
    background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.25)',
    fontSize: 13, fontWeight: 600,
  },
  input: {
    width: '100%', padding: '8px 10px', borderRadius: 7,
    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.2)',
    color: '#fff', fontSize: 13, outline: 'none', marginBottom: 8,
  },
  saveBtn: { padding:'8px 16px', borderRadius:7, border:'none', background:'#06b6d4', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, marginRight:8 },
  cancelBtn:{ padding:'8px 16px', borderRadius:7, border:'1px solid rgba(100,116,139,0.2)', background:'transparent', color:'rgba(148,163,184,0.7)', cursor:'pointer', fontSize:13 },
}

function fmt(n) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(n||0)
}

function PlanCard({ plan, onUpdated }) {
  const [editing, setEditing]  = useState(false)
  const [form, setForm]         = useState({ price_monthly: plan.price_monthly, price_setup: plan.price_setup })
  const [saving, setSaving]     = useState(false)

  async function save() {
    setSaving(true)
    try {
      await api.updatePlan(plan.id, { price_monthly: Number(form.price_monthly), price_setup: Number(form.price_setup) })
      setEditing(false)
      onUpdated()
    } catch(e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={S.card}>
      <div style={S.planName}>{plan.name}</div>
      {editing ? (
        <>
          <label style={{ fontSize:12, color:'rgba(148,163,184,0.5)' }}>Mensalidade (R$)</label>
          <input style={S.input} type="number" value={form.price_monthly} onChange={e=>setForm(f=>({...f,price_monthly:e.target.value}))} />
          <label style={{ fontSize:12, color:'rgba(148,163,184,0.5)' }}>Setup (R$)</label>
          <input style={S.input} type="number" value={form.price_setup} onChange={e=>setForm(f=>({...f,price_setup:e.target.value}))} />
          <div>
            <button style={S.saveBtn} onClick={save} disabled={saving}>{saving ? '...' : 'Salvar'}</button>
            <button style={S.cancelBtn} onClick={()=>setEditing(false)}>Cancelar</button>
          </div>
        </>
      ) : (
        <>
          <div style={S.planPrice}>{fmt(plan.price_monthly)}</div>
          <div style={S.planSub}>/mês · Setup {fmt(plan.price_setup)}</div>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginBottom:10 }}>{plan.description}</p>
          <ul style={S.features}>
            {(plan.features||[]).map((f,i) => (
              <li key={i} style={S.feature}><span>✓</span>{f}</li>
            ))}
          </ul>
          <button style={S.editBtn} onClick={()=>setEditing(true)}>Editar preços</button>
        </>
      )}
    </div>
  )
}

export default function PlansPage() {
  const [plans, setPlans]   = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setPlans(await api.plans()) } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h1 style={S.title}>Planos de Manutenção</h1>
      {loading ? (
        <p style={{ color:'rgba(148,163,184,0.5)' }}>Carregando...</p>
      ) : (
        <div style={S.grid}>
          {plans.map(p => <PlanCard key={p.id} plan={p} onUpdated={load} />)}
        </div>
      )}
    </div>
  )
}
