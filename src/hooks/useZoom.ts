import { useState, useCallback } from 'react'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.5
const ZOOM_STEP = 0.1

export function useZoom(initialZoom = 0.65) {
  const [zoom, setZoom] = useState(initialZoom)

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(initialZoom)
  }, [initialZoom])

  return { zoom, zoomIn, zoomOut, resetZoom, setZoom }
}
