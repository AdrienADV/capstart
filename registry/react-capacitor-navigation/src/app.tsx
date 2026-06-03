import { useEffect, useRef } from "react"
import { useLocation } from "react-router"
import { setupRouterOutlet } from "@capgo/capacitor-transitions/react"

import Router from "./router"

export default function App() {
  const location = useLocation()
  const outletRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!outletRef.current) {
      return
    }

    setupRouterOutlet(outletRef.current, {
      platform: "auto",
      swipeGesture: "auto",
    })
  }, [])

  return (
    <cap-router-outlet ref={outletRef}>
      <Router key={location.pathname} location={location} />
    </cap-router-outlet>
  )
}
