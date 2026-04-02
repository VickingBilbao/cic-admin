import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrg } from '../hooks/useAdmin.js'
import { api } from '../api/client.js'

const S = {
  back:     { color:'rgba(148,163,184,0.6)', cursor:'pointer', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:6 },
  header:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 },
  title:    { fontSize: 24, fontWeight: 700 },
  subline:  { fontSize: 13, color:'rgba(148,163,184,0.5)', marginTop:4 },
  grid:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 },
  card:     { padding:'22px 24px', borderRadius:12, background:'rgba(15,23,42,0.7)', border:'1px solid rgba(100,116,139,0.12)' },
  cardTitle:{ fontSize:12, fontWeight:600, color:'rgba(148,163,184,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14 },
  row:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  rowLabel: { fontSize:13, color:'rgba(148,163,184,0.6)' },
  rowVal:   { fontSize:13, fontWeight:500 },
  editInput:{ padding:'6px 10px', borderRadius:6, background:'rgba(30,41,59,0.8)', border:'1px solid rgba(100,116,139,0.2)', color:'#fff', fontSize:13, outline:'none', width:160 },
  editSel:  { padding:'6px 10px', borderRadius:6, background:'rgba(30,41,59,0.8)', border:'1px solid rgba(100,116,139,0.2)', color:'#fff', fontSize:13, outline:'none' },
  btnGroup: { display:'flex', gap:8 },
  btn:      (col) => ({
    padding:'8px 16px', borderRadius:8, border:`1px solid ${col}40`,
    background:`${col}12`, color:col, fontSize:13, fontWeight:600, cursor:'pointer',
  }),
  danger:   { padding:'8px 16px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#ef4444', fontSize:13, cursor:'pointer' },
  membersTable: { width:'100%', borderCollapse:'separate', borderSpacing:'0 4px' },
  th:   { textAlign:'left', fontSize:11, color:'rgba(148,163,184,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', padding:'6px 10px' },
  tdR:  { padding:'10px', fontSize:13 },
  badge:(col) => ({ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:11, background:`${col}20`, color:col, border:`1px solid ${col}40` }),
  impBox:{ marginTop:14, padding:'12px 14px', borderRadius:8, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', fontSize:13 },
  impLink:{ color:'#06b6d4', wordBreak:'break-all' },
}

const STATUS_COLORS = { active:'#22c55e', trial:'#f59e0b', suspended:'#ef4444', churned:'#6b7280' }

export default function OrgDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: org, members: membersData, loading, refetch } = useOrg(id)

  const [editingPlan,    setEditingPlan]    = useState(false)
  const [editingSeats,   setEditingSeats]   = useState(false)
  const [newPlanStatus,  setNewPlanStatus]  = useState('')
  const [newMonthly,     setNewMonthly]     = useState('')
  const [newSeats,       setNewSeats]       = useState('')
  const [savingPlan,     setSavingPlan]     = useState(false)
  const [savingSeats,    setSavingSeats]    = useState(false)
  const [impersonating,  setImpersonating]  = useState(false)
  const [impResult,      setImpResult]      = useState(null)
  const [addingMember,   setAddingMember]   = useState(false)
  const [newMember,      setNewMember]      = useState({ name:'', email:'', password:'', role:'member' })
  const [savingMember,   setSavingMember]   = useState(false)
  const [memberError,    setMemberError]    = useState(null)

  if (loading) return <p style={{ color:'rgba(148,163,184,0.5)' }}>Carregando...</p>
  if (!org)    return <p style={{ color:'#ef4444' }}>Organização não encontrada</p>

  const fmt = n => n ? new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(n) : '—'

  async function savePlan() {
    setSavingPlan(true)
    try {
      await api.updateOrg(id, {
        plan_status:   newPlanStatus  || org.plan_status,
        monthly_value: newMonthly !== '' ? Number(newMonthly) : org.monthly_value,
      })
      setEditingPlan(false)
      refetch()
    } catch(e) { alert(e.message) }
    finally { setSavingPlan(false) }
  }

  async function saveSeats() {
    setSavingSeats(true)
    try {
      await api.updateSeats(id, Number(newSeats))
      setEditingSeats(false)
      refetch()
    } catch(e) { alert(e.message) }
    finally { setSavingSeats(false) }
  }

  async function doImpersonate() {
    if (!confirm(`Acessar a conta de ${org.product_name} como administrador?`)) return
    setImpersonating(true)
    try {
      const res = await api.impersonate(id)
      setImpResult(res)
    } catch(e) { alert(e.message) }
    finally { setImpersonating(false) }
  }

  async function addMember(e) {
    e.preventDefault()
    setSavingMember(true)
    setMemberError(null)
    try {
      await api.addMember(id, newMember)
      setAddingMember(false)
      setNewMember({ name:'', email:'', password:'', role:'member' })
      refetch()
    } catch(err) {
      setMemberError(err.data?.error || err.message)
    } finally { setSavingMember(false) }
  }

  async function removeMember(uid, email) {
    if (!confirm(`Remover ${email} desta organização?`)) return
    try {
      await api.removeMember(id, uid)
      refetch()
    } catch(e) { alert(e.message) }
  }

  const members = membersData?.members || []

  return (
    <div>
      <div style={S.back} onClick={() => navigate('/orgs')}>← Voltar</div>

      <div style={S.header}>
        <div>
          <h1 style={S.title}>{org.product_name}</h1>
          <p style={S.subline}>{org.owner_name || 'Sem responsável'} · org_id: {org.org_id?.slice(0,8)}...</p>
        </div>
        <div style={S.btnGroup}>
          <button style={S.btn('#f59e0b')} onClick={doImpersonate} disabled={impersonating}>
            {impersonating ? 'Gerando link...' : '🔑 Impersonar'}
          </button>
        </div>
      </div>

      {impResult && (
        <div style={S.impBox}>
          <strong style={{ color:'#f59e0b' }}>⚠ Link de impersonação gerado</strong>
          <p style={{ marginTop:6, marginBottom:8, color:'rgba(148,163,184,0.7)' }}>
            Válido por {impResult.expires_in}. Abre como {impResult.impersonating?.email}
          </p>
          <a href={impResult.magic_link} target="_blank" rel="noreferrer" style={S.impLink}>
            {impResult.magic_link}
          </a>
          <button onClick={() => setImpResult(null)} style={{ marginLeft:14, background:'transparent', border:'none', color:'rgba(148,163,184,0.5)', cursor:'pointer', fontSize:12 }}>
            fechar
          </button>
        </div>
      )}

      <div style={S.grid}>
        {/* Plan Card */}
        <div style={S.card}>
          <div style={S.cardTitle}>Plano & Faturamento</div>
          <div style={S.row}>
            <span style={S.rowLabel}>Status</span>
            {editingPlan
              ? <select style={S.editSel} value={newPlanStatus || org.plan_status} onChange={e=>setNewPlanStatus(e.target.value)}>
                  {['trial','active','suspended','churned'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              : <span style={{ ...S.rowVal, color: STATUS_COLORS[org.plan_status]||'#6b7280' }}>{org.plan_status}</span>
            }
          </div>
          <div style={S.row}>
            <span style={S.rowLabel}>MRR</span>
            {editingPlan
              ? <input style={S.editInput} type="number" value={newMonthly !== '' ? newMonthly : org.monthly_value||''} onChange={e=>setNewMonthly(e.target.value)} placeholder="10000" />
              : <span style={{ ...S.rowVal, color:'#a78bfa', fontWeight:700 }}>{fmt(org.monthly_value)}</span>
            }
          </div>
          <div style={S.row}>
            <span style={S.rowLabel}>Setup pago</span>
            <span style={S.rowVal}>{org.setup_paid ? '✓ Sim' : '— Não'}</span>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {editingPlan
              ? <>
                  <button style={S.btn('#22c55e')} onClick={savePlan} disabled={savingPlan}>
                    {savingPlan ? 'Salvando...' : '✓ Salvar'}
                  </button>
                  <button style={S.btn('#6b7280')} onClick={()=>setEditingPlan(false)}>Cancelar</button>
                </>
              : <button style={S.btn('#06b6d4')} onClick={()=>{setEditingPlan(true);setNewPlanStatus(org.plan_status);setNewMonthly(org.monthly_value||'')}}>
                  Editar plano
                </button>
            }
          </div>
        </div>

        {/* Cadeiras Card */}
        <div style={S.card}>
          <div style={S.cardTitle}>Cadeiras (Seats)</div>
          <div style={S.row}>
            <span style={S.rowLabel}>Limite de cadeiras</span>
            {editingSeats
              ? <input style={{ ...S.editInput, width:80 }} type="number" min={1} value={newSeats !== '' ? newSeats : org.seats_limit||1} onChange={e=>setNewSeats(e.target.value)} />
              : <span style={S.rowVal}>{org.seats_limit || 1}</span>
            }
          </div>
          <div style={S.row}>
            <span style={S.rowLabel}>Membros ativos</span>
            <span style={S.rowVal}>{members.length}</span>
          </div>
          <div style={S.row}>
            <span style={S.rowLabel}>Candidatos máx.</span>
            <span style={S.rowVal}>{org.max_candidates}</span>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {editingSeats
              ? <>
                  <button style={S.btn('#22c55e')} onClick={saveSeats} disabled={savingSeats}>
                    {savingSeats ? 'Salvando...' : '✓ Salvar'}
                  </button>
                  <button style={S.btn('#6b7280')} onClick={()=>setEditingSeats(false)}>Cancelar</button>
                </>
              : <button style={S.btn('#06b6d4')} onClick={()=>{setEditingSeats(true);setNewSeats(org.seats_limit||1)}}>
                  Editar cadeiras
                </button>
            }
          </div>
        </div>
      </div>

      {/* Members */}
      <div style={S.card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={S.cardTitle}>Membros da equipe</div>
          <button style={S.btn('#06b6d4')} onClick={()=>setAddingMember(v=>!v)}>
            {addingMember ? 'Cancelar' : '+ Adicionar membro'}
          </button>
        </div>

        {addingMember && (
          <form onSubmit={addMember} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:10, marginBottom:16, padding:'14px', background:'rgba(6,182,212,0.05)', borderRadius:8, border:'1px solid rgba(6,182,212,0.15)' }}>
            {memberError && <p style={{ gridColumn:'1/-1', color:'#ef4444', fontSize:12, marginBottom:4 }}>{memberError}</p>}
            <input style={S.editInput} placeholder="Nome" value={newMember.name} onChange={e=>setNewMember(m=>({...m,name:e.target.value}))} required />
            <input style={S.editInput} type="email" placeholder="E-mail" value={newMember.email} onChange={e=>setNewMember(m=>({...m,email:e.target.value}))} required />
            <input style={S.editInput} type="password" placeholder="Senha (opcional)" value={newMember.password} onChange={e=>setNewMember(m=>({...m,password:e.target.value}))} />
            <button type="submit" style={{ ...S.btn('#22c55e'), padding:'7px 14px' }} disabled={savingMember}>
              {savingMember ? '...' : 'Criar'}
            </button>
          </form>
        )}

        <table style={S.membersTable}>
          <thead>
            <tr>
              {['Nome','E-mail','Papel','Desde',''].map(h=><th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td style={S.tdR}><strong>{m.name}</strong></td>
                <td style={{ ...S.tdR, color:'rgba(148,163,184,0.6)' }}>{m.email}</td>
                <td style={S.tdR}>
                  <span style={S.badge(m.role==='admin'?'#06b6d4':'#6b7280')}>{m.role}</span>
                </td>
                <td style={{ ...S.tdR, color:'rgba(148,163,184,0.5)', fontSize:12 }}>
                  {new Date(m.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style={S.tdR}>
                  {m.role !== 'admin' && (
                    <button
                      style={{ background:'transparent', border:'none', color:'rgba(239,68,68,0.6)', cursor:'pointer', fontSize:12 }}
                      onClick={() => removeMember(m.id, m.email)}
                    >
                      remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modules */}
      <div style={{ ...S.card, marginTop:20 }}>
        <div style={S.cardTitle}>Módulos habilitados</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {(org.modules_enabled||[]).map(m => (
            <span key={m} style={{ padding:'4px 10px', borderRadius:16, fontSize:12, background:'rgba(6,182,212,0.1)', color:'#06b6d4', border:'1px solid rgba(6,182,212,0.2)' }}>
              {m}
            </span>
          ))}
        </div>
        {org.notes && (
          <div style={{ marginTop:16, padding:'10px 12px', borderRadius:8, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', fontSize:13, color:'rgba(148,163,184,0.7)' }}>
            <strong style={{ color:'#f59e0b' }}>Notas:</strong> {org.notes}
          </div>
        )}
      </div>
    </div>
  )
}
