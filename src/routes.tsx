import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './state/store'
import SystemPage from './pages/System'
import WorkPage from './pages/Work'
import TeamPage from './pages/Team'
import UpdatesPage from './pages/Updates'
import LookupPage from './pages/Lookup'

function Landing() {
  const { state } = useStore()
  return <Navigate to={state.persona === 'm1' ? '/team' : '/work'} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/updates" element={<UpdatesPage />} />
      <Route path="/lookup" element={<LookupPage />} />
      <Route path="/system" element={<SystemPage />} />
    </Routes>
  )
}
