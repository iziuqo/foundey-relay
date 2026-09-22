import { useLocation } from 'react-router-dom'
import { AppRoutes } from './routes'
import { StoreProvider, useStore } from './state/store'
import { Toast } from './components/Toast'
import { PrototypeControls } from './components/PrototypeControls'

function Chrome() {
  const { state } = useStore()
  const location = useLocation()
  const isDeck = location.pathname.startsWith('/deck')
  return (
    <div className={state.wireframe ? 'wireframe' : undefined}>
      <AppRoutes />
      {!isDeck && <Toast />}
      {!isDeck && <PrototypeControls />}
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Chrome />
    </StoreProvider>
  )
}
