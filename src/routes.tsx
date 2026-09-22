import { Routes, Route, Navigate } from 'react-router-dom'
import SystemPage from './pages/System'
import WorkPage from './pages/Work'
import TeamPage from './pages/Team'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/work" replace />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/system" element={<SystemPage />} />
    </Routes>
  )
}
