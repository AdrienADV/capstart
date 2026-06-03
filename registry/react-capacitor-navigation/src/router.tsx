import type { Location } from "react-router"
import { Navigate, Route, Routes } from "react-router"

import Details from "./pages/app/home/details"
import Home from "./pages/app/home"
import Settings from "./pages/app/settings"

interface RouterProps {
  location: Location
}

export default function Router({ location }: RouterProps) {
  return (
    <Routes location={location}>
      <Route path="app" element={<Home />} />
      <Route path="app/settings" element={<Settings />} />
      <Route path="app/details" element={<Details />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
