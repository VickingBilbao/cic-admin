import { useStats } from '../hooks/useAdmin.js'

const S = {
  title:  { fontSize: 24, fontWeight: 700, marginBottom: 6 },
  sub:    { fontSize: 14, color: 'rgba(148,163,184,0.6)', marginBottom: 32 },
  grid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 },
  card:   {
    padding: '20px 22px', borderRadius: 12,
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(100,116,139,0.15)',
  },
  kpiLabel: { fontSize: 12, color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  kpiVal:   { fontSize: 30, fontWeight: 700 },
  kpiSub:   { fontSize: 12, color: 'rgba(148,163,184,0.5)', marginTop: 4 },
  section:  { marginBottom: 32 },
  sTitle:   { fontSize: 16, fontWeight: 600, marginBottom: 14, color: 'rgba(255,255,255,0.8)' },
  plansGrid:{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  planCard: {
    padding: '16px 18px', borderRadius: 10,
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(100,116,139,0.12)',
  },
  planName: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  planPrice:{ fontSize: 22, fontWeight: 700, color: '#06b6d4' },
  planSub:  { fontSize: 12, color: 'rgba(148,163,184,0.5)' },
}

function fmt(n) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 }).format(n||0)
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={S.card}>
      <div style={S.kpiLabel}>{label}</div>
      <div style={{ ...S.kpiVal, color: color || '#fff' }}>{value}</div>
      {sub && <div style={S.kpiSub}>{sub}</div>}
    </div>
  )
}

export default function DashPage() {
  const { data, loading, error } = useStats()

  if (loading) return <p style={{ color: 'rgba(148,163,184,0.6)' }}>Carregando...</p>
  if (error)   return <p style={{ color: '#ef4444' }}>{error}</p>

  return (
    <div>
      <h1 style={S.title}>Dashboard</h1>
      <p style={S.sub}>Visão geral da plataforma CIC</p>

      <div style={S.grid}>
        <KPI label="Marketeiros"         value={data.total}          color="#06b6d4" />
        <KPI label="Ativos"              value={data.active}         color="#22c55e" />
        <KPI label="Trial"               value={data.trial}          color="#f59e0b" />
        <KPI label="MRR"                 value={fmt(data.mrr)}       color="#a78bfa" sub="mensal" />
        <KPI label="ARR"                 value={fmt(data.arr)}       color="#a78bfa" sub="anual" />
        <KPI label="Total membros"       value={data.total_members}  />
        <KPI label="Total cadeiras"      value={data.total_seats}    />
      </div>

      {data.plans?.length > 0 && (
        <div style={S.section}>
          <div style={S.sTitle}>Planos de Manutenção</div>
          <div style={S.plansGrid}>
            {data.plans.map(p => (
              <div key={p.id} style={S.planCard}>
                <div style={S.planName}>{p.name}</div>
                <div style={S.planPrice}>{fmt(p.price_monthly)}</div>
                <div style={S.planSub}>/mês · Setup {fmt(p.price_setup)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
