import { AppRoutes } from './routes'
import { StoreProvider } from './state/store'
import { Toast } from './components/Toast'

export default function App() {
  return (
    <StoreProvider>
      <AppRoutes />
      <Toast />
    </StoreProvider>
  )
}
