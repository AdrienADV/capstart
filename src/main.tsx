import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './app'
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from './components/theme-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
          <Toaster mobileOffset={{ top: 'var(--safe-area-top)' }} position="top-center" visibleToasts={1} />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
