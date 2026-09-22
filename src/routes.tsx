import { Routes, Route, Navigate } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/work" replace />} />
      <Route path="/work" element={<div>Loading Relay…</div>} />
    </Routes>
  )
}
