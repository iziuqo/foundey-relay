import { Routes, Route, Navigate } from 'react-router-dom'
import SystemPage from './pages/System'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/work" replace />} />
      <Route path="/system" element={<SystemPage />} />
    </Routes>
  )
}
