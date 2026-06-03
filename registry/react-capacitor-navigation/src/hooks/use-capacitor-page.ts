import { useEffect, useRef } from "react"
import { setupPage } from "@capgo/capacitor-transitions/react"

export function useCapacitorPage<TElement extends HTMLElement = HTMLElement>() {
  const pageRef = useRef<TElement>(null)

  useEffect(() => {
    if (!pageRef.current) {
      return
    }

    return setupPage(pageRef.current)
  }, [])

  return pageRef
}
