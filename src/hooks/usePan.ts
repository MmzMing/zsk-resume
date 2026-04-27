import { useState, useCallback, useRef } from 'react'

export function usePan() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isPanning.current = true
      startPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
    },
    [offset]
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return
      setOffset({
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y,
      })
    },
    []
  )

  const onMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      isPanning.current = true
      startPos.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y }
    },
    [offset]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPanning.current) return
      const touch = e.touches[0]
      setOffset({
        x: touch.clientX - startPos.current.x,
        y: touch.clientY - startPos.current.y,
      })
    },
    []
  )

  const onTouchEnd = useCallback(() => {
    isPanning.current = false
  }, [])

  const resetPan = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  return { offset, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, resetPan }
}
