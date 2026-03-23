'use client'

import React from 'react'

interface NavigationArrowsProps {
  prevRef: React.RefObject<HTMLButtonElement>
  nextRef: React.RefObject<HTMLButtonElement>
}

export function NavigationArrows({ prevRef, nextRef }: NavigationArrowsProps) {
  const btnClass =
    'absolute top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-md hover:bg-white transition-all hover:scale-110 active:scale-95'

  return (
    <>
      <button ref={prevRef} className={`${btnClass} -left-5`} aria-label="Anterior">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button ref={nextRef} className={`${btnClass} -right-5`} aria-label="Próximo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  )
}
