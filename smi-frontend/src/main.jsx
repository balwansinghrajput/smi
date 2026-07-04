import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '@/app/store'
import AppRoutes from '@/routes'
import '@/index.css'

import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy'}>
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
)
