import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './app'
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster mobileOffset={{ top: 'var(--safe-area-top)' }} position="top-center" visibleToasts={1} />
    </BrowserRouter>
  </StrictMode>
)
