import { useState, useEffect } from 'react'
import { EditorPanel } from '@/components/layout/EditorPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { CookieConsent } from '@/components/consent/CookieConsent'
import { TopToolbar } from '@/components/layout/TopToolbar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { PenLine, Eye } from 'lucide-react'
import { useResumeStore } from '@/store/resumeStore'

function AppContent() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const undo = useResumeStore((s) => s.undo)
  const redo = useResumeStore((s) => s.redo)
  const canUndo = useResumeStore((s) => s.canUndo)
  const canRedo = useResumeStore((s) => s.canRedo)
  const { addToast } = useToast()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      }
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        if (canRedo) redo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        addToast('info', '数据已自动保存')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo, addToast])

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar />

      {isMobile ? (
        <>
          <div className="flex border-b bg-background shrink-0">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PenLine className="size-4" />
              编辑
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="size-4" />
              预览
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'edit' ? (
              <div className="h-full overflow-y-auto">
                <EditorPanel />
              </div>
            ) : (
              <PreviewPanel />
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <EditorPanel />
          <PreviewPanel />
        </div>
      )}

      <CookieConsent />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}
