import CapacitorHeader from "@/components/capacitor-header"
import { useCapacitorPage } from "@/hooks/use-capacitor-page"

export default function Details() {
  const pageRef = useCapacitorPage()

  return (
    <cap-page ref={pageRef}>
      <CapacitorHeader title="Details" />
      <cap-content slot="content">
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            This screen is outside the tab navigation, so the bottom navigation
            is hidden.
          </p>
        </div>
      </cap-content>
    </cap-page>
  )
}
