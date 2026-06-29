import { BrowserRouter } from 'react-router-dom'
import { Providers } from '@/app/Providers'
import { AppRoutes } from '@/app/router'

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  )
}
