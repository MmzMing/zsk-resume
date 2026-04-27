import { useState } from 'react'
import { TopToolbar } from '@/components/layout/TopToolbar'
import { EditorPanel } from '@/components/layout/EditorPanel'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { CookieConsent } from '@/components/consent/CookieConsent'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { PenLine, Eye } from 'lucide-react'

export default function App() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar />

      {isMobile ? (
        <>
          {/* Mobile Tab Bar */}
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

          {/* Mobile Content */}
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
        /* Desktop/Tablet Layout */
        <div className="flex flex-1 overflow-hidden">
          <EditorPanel />
          <PreviewPanel />
        </div>
      )}

      <CookieConsent />
    </div>
  )
}
