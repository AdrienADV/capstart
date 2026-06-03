import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { initTransitions } from "@capgo/capacitor-transitions/react"
import "@capgo/capacitor-transitions"

import App from "./app"
import "./index.css"
import "./styles/capacitor-safe-area.css"

initTransitions({ platform: "auto" })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
