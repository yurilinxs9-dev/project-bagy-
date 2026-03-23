'use client'

import { useEffect, RefObject } from 'react'

export function useIntersection(
  ref: RefObject<Element>,
  onEnter: () => void,
  onLeave: () => void,
  threshold = 0.1
) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter()
        } else {
          onLeave()
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, onEnter, onLeave, threshold])
}
