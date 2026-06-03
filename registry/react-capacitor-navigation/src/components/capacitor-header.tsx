import type { ReactNode } from "react"
import { ChevronLeftIcon } from "lucide-react"
import { useNavigate } from "react-router"
import { setDirection } from "@capgo/capacitor-transitions/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CapacitorHeaderProps {
  title?: string
  children?: ReactNode
  className?: string
}

export default function CapacitorHeader({
  title,
  children,
  className,
}: CapacitorHeaderProps) {
  const navigate = useNavigate()

  function goBack() {
    setDirection("back")
    navigate(-1)
  }

  return (
    <cap-header
      slot="header"
      className={cn(
        "sticky top-0 z-50 border-b bg-background/80 pt-[var(--safe-area-top)] backdrop-blur-md",
        className
      )}
    >
      <div className="relative flex h-12 items-center justify-center px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-4"
          onClick={goBack}
          aria-label="Go back"
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children}
      </div>
    </cap-header>
  )
}
