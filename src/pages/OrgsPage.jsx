import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrgs } from '../hooks/useAdmin.js'
import { api } from '../api/client.js'

const S = {
  header:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24 },
  title:    { fontSize: 24, fontWeight: 700 },
  addBtn:   {
    padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: 'rgba(6,182,212,0.15)', color: '#06b6d4',
    border: '1px solid rgba(6,182,212,0.3)', fontSize: 14, fontWeight: 600,
  },
  table:    { width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' },
  th:       {
    textAlign: 'left', padding: '8px 14px', fontSize: 11,
    color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  tr:       {
    background: 'rgba(15,23,42,0.6)', cursor: 'pointer',
    transition: 'background 0.15s',
  },
  td:       { padding: '12px 14px', fontSize: 14 },
  badge:    (color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11,
    background: `${color}20`, color: color, border: `1px solid ${color}40`,
  }),
  modal:    {
    position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)', zIndex: 100,
  },
  mCard:    {
    width: 480, background: 'rgba(15,23,42,0.98)',
    border: '1px solid rgba(6,182,212,0.2)', borderRadius: 14, padding: 32,
  },
  mTitle:   { fontSize: 18, fontWeight: 700, marginBottom: 24 },
  form:     { display: 'flex', flexDirection: 'column', gap: 14 },
  row2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label:    { fontSize: 12, color: 'rgba(148,163,184,0.6)', marginBottom: 4, display: 'block' },
  input:    {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.2)',
    color: '#fff', fontSize: 13, outline: 'none',
  },
  select: {
    width: '100%', padding: '9px 12px', borderRadius: 7,
    background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.2)',
    color: '#fff', fontSize: 13, outline: 'none',
  },
  actions:  { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn:{ padding: '9px 18px', borderRadius: 7, border: '1px solid rgba(100,116,139,0.2)', background: 'transparent', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', fontSize: 14 },
  saveBtn:  { padding: '9px 18px', borderRadius: 7, border: 'none', background: '#06b6d4', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}

const STATUS_COLORS = { active: '#22c55e', trial: '#f59e0b', suspended: '#ef4444', churned: '#6b7280' }

const BLANK = {
  product_name: '', owner_name: '', owner_email: '', owner_password: '',
  plan_status: 'trial', monthly_value: '', seats_limit: '1', max_candidates: '1', notes: '',
}

function CreateOrgModal({ onClose, onCreated }) {
  const [form, setForm] = useState(BLANK)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.createOrg({
        ...form,
        monthly_value: form.monthly_value ? Number(form.monthly_value) : null,
        seats_limit:   Number(form.seats_limit) || 1,
        max_candidates: Number(form.max_candidates) || 1,
      })
      onCreated()
    } catch(err) {
      setError(err.data?.error || err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.mCard} onClick={e => e.stopPropagation()}>
        <div style={S.mTitle}>Novo Marketeiro</div>
        {error && <p style={{ color:'#ef4444', marginBottom:14, fontSize:13 }}>{error}</p>}
        <form style={S.form} onSubmit={submit}>
          <div style={S.row2}>
            <div>
              <label style={S.label}>Nome do sistema / white-label</label>
              <input style={S.input} value={form.product_name} onChange={e=>set('product_name',e.target.value)} placeholder="Ex: Politech" required />
            </div>
            <div>
              <label style={S.label}>Nome do responsável</label>
              <input style={S.input} value={form.owner_name} onChange={e=>set('owner_name',e.target.value)} placeholder="João Silva" />
            </div>
          </div>
          <div style={S.row2}>
            <div>
              <label style={S.label}>E-mail de acesso</label>
              <input style={S.input} type="email" value={form.owner_email} onChange={e=>set('owner_email',e.target.value)} required />
            </div>
            <div>
              <label style={S.label}>Senha inicial</label>
              <input style={S.input} type="password" value={form.owner_password} onChange={e=>set('owner_password',e.target.value)} placeholder="CicTemp@2026!" />
            </div>
          </div>
          <div style={S.row2}>
            <div>
              <label style={S.label}>Status do plano</label>
              <select style={S.select} value={form.plan_status} onChange={e=>set('plan_status',e.target.value)}>
                <option value="trial">Trial</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Valor mensal (R$)</label>
              <input style={S.input} type="number" value={form.monthly_value} onChange={e=>set('monthly_value',e.target.value)} placeholder="10000" />
            </div>
          </div>
          <div style={S.row2}>
            <div>
              <label style={S.label}>Cadeiras (seats)</label>
              <input style={S.input} type="number" min={1} value={form.seats_limit} onChange={e=>set('seats_limit',e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Candidatos máx.</label>
              <input style={S.input} type="number" min={1} value={form.max_candidates} onChange={e=>set('max_candidates',e.target.value)} />
            </div>
          </div>
          <div>
            <label style={S.label}>Observações internas</label>
            <input style={S.input} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Contrato, condições especiais..." />
          </div>
          <div style={S.actions}>
            <button type="button" style={S.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" style={{ ...S.saveBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Marketeiro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrgsPage() {
  const { data: orgs, loading, refetch } = useOrgs()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = (orgs || []).filter(o =>
    !search ||
    o.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.owner_name?.toLowerCase().includes(search.toLowerCase())
  )

  function fmt(n) {
    return n ? new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(n) : '—'
  }

  return (
    <div>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Marketeiros</h1>
          <p style={{ fontSize:13, color:'rgba(148,163,184,0.5)', marginTop:4 }}>
            {orgs.length} organização{orgs.length !== 1 ? 'ões' : ''} registrada{orgs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input
            style={{ ...S.input || {}, padding:'8px 12px', borderRadius:8, background:'rgba(15,23,42,0.8)', border:'1px solid rgba(100,116,139,0.2)', color:'#fff', fontSize:13, outline:'none', width:200 }}
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button style={S.addBtn} onClick={() => setShowModal(true)}>+ Novo Marketeiro</button>
        </div>
      </div>

      {loading ? (
        <p style={{ color:'rgba(148,163,184,0.5)' }}>Carregando...</p>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              {['Sistema','Responsável','Status','MRR','Seats','Candidatos','Membros','Campanhas'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(org => (
              <tr key={org.id} style={S.tr} onClick={() => navigate(`/orgs/${org.id}`)}>
                <td style={S.td}><strong>{org.product_name}</strong></td>
                <td style={{ ...S.td, color:'rgba(148,163,184,0.7)' }}>{org.owner_name || '—'}</td>
                <td style={S.td}>
                  <span style={S.badge(STATUS_COLORS[org.plan_status] || '#6b7280')}>
                    {org.plan_status}
                  </span>
                </td>
                <td style={{ ...S.td, color:'#a78bfa', fontWeight:600 }}>{fmt(org.monthly_value)}</td>
                <td style={S.td}>{org.member_count || 0}/{org.seats_limit || 1}</td>
                <td style={S.td}>{org.max_candidates}</td>
                <td style={S.td}>{org.member_count || 0}</td>
                <td style={S.td}>{org.campaign_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <CreateOrgModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); refetch() }}
        />
      )}
    </div>
  )
}
