import { AppRoutes } from './routes'
import { StoreProvider, useStore } from './state/store'
import { Toast } from './components/Toast'
import { PrototypeControls } from './components/PrototypeControls'

function Chrome() {
  const { state } = useStore()
  return (
    <div className={state.wireframe ? 'wireframe' : undefined}>
      <AppRoutes />
      <Toast />
      <PrototypeControls />
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
