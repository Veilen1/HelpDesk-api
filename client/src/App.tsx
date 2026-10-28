import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TicketDetailPage from './pages/TicketDetailPage'
import AuditPage from './pages/AuditPage'
import { useEffect } from 'react'
import { auth } from './utils/api'

function App() {
  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      auth.me().then(() => {}).catch(() => {
        localStorage.removeItem('token')
      })
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          auth.me().then(() => <DashboardPage />).catch(() => <LoginPage />)
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ticket/:id" element={<TicketDetailPage />} />
        <Route path="/audit/:id" element={<AuditPage />} />
      </Routes>
    </Router>
  )
}

export default App