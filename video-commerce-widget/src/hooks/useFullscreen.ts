'use client'

import { useState, useCallback } from 'react'

interface UseFullscreenReturn {
  isOpen: boolean
  currentIndex: number
  open: (index: number) => void
  close: () => void
  goNext: (total: number) => void
  goPrev: (total: number) => void
}

export function useFullscreen(): UseFullscreenReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const open = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const goNext = useCallback((total: number) => {
    setCurrentIndex((prev) => (prev + 1) % total)
  }, [])

  const goPrev = useCallback((total: number) => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
  }, [])

  return { isOpen, currentIndex, open, close, goNext, goPrev }
}
