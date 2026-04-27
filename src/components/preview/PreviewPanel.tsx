import { useCallback, useRef, useEffect, useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useZoom } from '@/hooks/useZoom'
import { usePan } from '@/hooks/usePan'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { ResumePreview } from './ResumePreview'

export function PreviewPanel() {
  const isMobile = useIsMobile()
  const { zoom, setZoom, zoomIn, zoomOut, resetZoom } = useZoom(isMobile ? 0.4 : 1)
  const { offset, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, resetPan } = usePan()
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScale, setAutoScale] = useState(1)

  // Auto-calculate scale for mobile to fit A4 page
  useEffect(() => {
    if (!isMobile) {
      const timer = setTimeout(() => setAutoScale(1), 0)
      return () => clearTimeout(timer)
    }
    const calculateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const scale = Math.min(1, (width - 32) / 794)
        setAutoScale(scale)
        setZoom(scale)
      }
    }
    calculateScale()
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [isMobile, setZoom])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        const newZoom = Math.min(1.5, Math.max(0.3, zoom + delta))
        setZoom(newZoom)
      }
    },
    [zoom, setZoom]
  )

  const handleReset = useCallback(() => {
    resetZoom()
    resetPan()
    if (isMobile) {
      setZoom(autoScale)
    }
  }, [resetZoom, resetPan, isMobile, autoScale, setZoom])

  return (
    <main className="w-full lg:w-1/2 bg-muted/40 flex flex-col overflow-hidden">
      {/* Zoom controls - simplified on mobile */}
      <div className="flex items-center justify-center gap-1 py-2 border-b bg-background/80 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 sm:size-7"
          onClick={zoomOut}
          disabled={zoom <= 0.3}
        >
          <ZoomOut className="size-4 sm:size-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground w-12 text-center tabular-nums hidden sm:inline">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 sm:size-7"
          onClick={zoomIn}
          disabled={zoom >= 1.5}
        >
          <ZoomIn className="size-4 sm:size-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 sm:size-7"
          onClick={handleReset}
        >
          <RotateCcw className="size-4 sm:size-3.5" />
        </Button>
      </div>

      {/* Preview area */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative">
        {/* Dark overlay for dimming the bright preview */}
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 pointer-events-none z-10" />
        <div
          className="h-full overflow-auto sm:overflow-hidden cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={handleWheel}
        >
          <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
            <div
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.05s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <ResumePreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
