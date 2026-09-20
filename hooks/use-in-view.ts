"use client"

import { useEffect, useRef, useState } from "react"

// Reports when an element first enters the viewport.
//
// This deliberately does not use a fractional `threshold` (the old default was
// 0.1). A threshold is a fraction of the *element*, so an element more than ten
// viewports tall can never have 10% of itself on screen and would stay hidden
// forever. Any intersection at all, with the bottom edge pulled in slightly so
// short blocks still fade in as they arrive, works for every height.
export function useInView<T extends HTMLElement>(rootMargin = "0px 0px -8% 0px") {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true) // no observer support: show the content rather than hide it
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, isVisible }
}
