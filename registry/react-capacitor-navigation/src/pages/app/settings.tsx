import CapacitorTabBar from "@/components/capacitor-tab-bar"
import { Button } from "@/components/ui/button"
import { useCapacitorPage } from "@/hooks/use-capacitor-page"

export default function Settings() {
  const pageRef = useCapacitorPage()

  return (
    <cap-page ref={pageRef}>
      <cap-content slot="content">
        <div className="flex flex-col gap-5 px-6 pb-6 pt-[calc(var(--safe-area-top)+1.5rem)]">
          <p className="text-sm text-muted-foreground">Capstart Navigation</p>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Replace this screen with your project settings.
          </p>

          <Button className="w-full" variant="outline">
            Example action
          </Button>
        </div>
      </cap-content>
      <CapacitorTabBar />
    </cap-page>
  )
}
