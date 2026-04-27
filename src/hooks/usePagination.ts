import { useState, useEffect, useRef, useCallback } from 'react'
import { useResumeStore } from '@/store/resumeStore'

const A4_HEIGHT = 1123

interface UsePaginationResult {
  pageBreaks: number[]
  totalPages: number
  registerBlockRef: (index: number) => (el: HTMLDivElement | null) => void
}

export function usePagination(
  blockCount: number,
  marginTop: number,
  marginBottom: number,
): UsePaginationResult {
  const contentHeight = A4_HEIGHT - marginTop - marginBottom
  const blockRefs = useRef<(HTMLDivElement | null)[]>(new Array(blockCount).fill(null))
  const [pageBreaks, setPageBreaks] = useState<number[]>([])
  const [totalPages, setTotalPages] = useState(1)

  const registerBlockRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      blockRefs.current[index] = el
    },
    []
  )

  const recalculate = useCallback(() => {
    const heights = blockRefs.current.map((ref) => {
      if (!ref) return 0
      const style = window.getComputedStyle(ref)
      const margin = parseFloat(style.marginBottom) || 0
      return ref.offsetHeight + margin
    })

    const breaks: number[] = []
    let cumulative = 0

    for (let i = 0; i < heights.length; i++) {
      if (cumulative + heights[i] > contentHeight && cumulative > 0) {
        breaks.push(i)
        cumulative = heights[i]
      } else {
        cumulative += heights[i]
      }
    }

    setPageBreaks(breaks)
    setTotalPages(breaks.length + 1)

    return { totalHeight: cumulative + (breaks.length > 0 ? heights[heights.length - 1] : 0), breaks }
  }, [contentHeight])

  useEffect(() => {
    const timer = setTimeout(recalculate, 100)

    const observers: ResizeObserver[] = []
    blockRefs.current.forEach((ref) => {
      if (ref) {
        const observer = new ResizeObserver(() => recalculate())
        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      clearTimeout(timer)
      observers.forEach((o) => o.disconnect())
    }
  }, [blockCount, recalculate])

  return { pageBreaks, totalPages, registerBlockRef }
}

/**
 * Calculate smart one-page adjustments: shrink layout until content fits one page.
 */
export function useSmartOnePage(totalPages: number) {
  const smartOnePage = useResumeStore((s) => s.smartOnePage)
  const pageLayout = useResumeStore((s) => s.pageLayout)
  const setPageLayout = useResumeStore((s) => s.setPageLayout)

  const adjusted = useRef(false)

  useEffect(() => {
    if (!smartOnePage) {
      adjusted.current = false
      return
    }

    if (totalPages > 1 && !adjusted.current) {
      // Shrink layout proportionally
      const scale = 0.85
      setPageLayout({
        fontSize: Math.max(8, Math.round(pageLayout.fontSize * scale)),
        lineHeight: Math.max(1.1, +(pageLayout.lineHeight * scale).toFixed(1)),
        paragraphSpacing: Math.max(2, Math.round(pageLayout.paragraphSpacing * scale)),
        marginTop: Math.max(10, Math.round(pageLayout.marginTop * scale)),
        marginBottom: Math.max(10, Math.round(pageLayout.marginBottom * scale)),
      })
      adjusted.current = true
    }

    if (totalPages <= 1) {
      adjusted.current = false
    }
  }, [smartOnePage, totalPages, pageLayout.fontSize, pageLayout.lineHeight, pageLayout.paragraphSpacing, pageLayout.marginTop, pageLayout.marginBottom, setPageLayout])

  return { isSmartOnePage: smartOnePage }
}
