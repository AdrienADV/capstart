import { HomeIcon, SettingsIcon } from "lucide-react"
import { NavLink } from "react-router"
import { setNavigation } from "@capgo/capacitor-transitions/react"

import { cn } from "@/lib/utils"

const tabs = [
  { to: "/app", icon: HomeIcon, label: "Home" },
  { to: "/app/settings", icon: SettingsIcon, label: "Settings" },
]

export default function CapacitorTabBar() {
  return (
    <cap-footer slot="footer">
      <nav className="border-t bg-background">
        <div className="flex pb-[var(--safe-area-bottom)]">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/app"}
              replace
              onClick={() => setNavigation("root", "forward")}
              className={({ isActive }) =>
                cn(
                  "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <tab.icon className="size-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </cap-footer>
  )
}
