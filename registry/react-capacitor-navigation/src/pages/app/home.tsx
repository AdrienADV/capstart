import { ArrowRightIcon } from "lucide-react"
import { useNavigate } from "react-router"
import { setDirection } from "@capgo/capacitor-transitions/react"

import CapacitorTabBar from "@/components/capacitor-tab-bar"
import { Button } from "@/components/ui/button"
import { useCapacitorPage } from "@/hooks/use-capacitor-page"

export default function Home() {
  const navigate = useNavigate()
  const pageRef = useCapacitorPage()

  function goToDetails() {
    setDirection("forward")
    navigate("/app/details")
  }

  return (
    <cap-page ref={pageRef}>
      <cap-content slot="content">
        <div className="flex flex-col gap-5 px-6 pb-6 pt-[calc(var(--safe-area-top)+1.5rem)]">
          <p className="text-sm text-muted-foreground">Capstart Navigation</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            This screen lives inside the tab navigation.
          </p>

          <Button className="w-full" onClick={goToDetails}>
            Go to details
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>
      </cap-content>
      <CapacitorTabBar />
    </cap-page>
  )
}
