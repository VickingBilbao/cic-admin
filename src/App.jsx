import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage   from './pages/LoginPage.jsx'
import DashPage    from './pages/DashPage.jsx'
import OrgsPage    from './pages/OrgsPage.jsx'
import OrgDetail   from './pages/OrgDetail.jsx'
import PlansPage   from './pages/PlansPage.jsx'
import Layout      from './components/Layout.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('cic_admin_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashPage />} />
          <Route path="orgs"         element={<OrgsPage />} />
          <Route path="orgs/:id"     element={<OrgDetail />} />
          <Route path="plans"        element={<PlansPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
