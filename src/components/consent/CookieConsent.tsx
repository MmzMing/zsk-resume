import { useEffect, useState } from 'react'
import { useConsentStore } from '@/store/consentStore'

export function CookieConsent() {
  const status = useConsentStore((s) => s.status)
  const setGranted = useConsentStore((s) => s.setGranted)
  const setDenied = useConsentStore((s) => s.setDenied)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'pending') {
      const timer = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setVisible(false), 0)
    return () => clearTimeout(timer)
  }, [status])

  if (!visible) return null

  return (
    <>
      {/* Overlay backdrop - blocks all interaction */}
      <div className="fixed inset-0 z-[99] bg-black/60" aria-hidden="true" />

      {/* Consent dialog */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-card border-t shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Cookie 与数据存储</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              本网站使用浏览器的 localStorage 来保存您的简历编辑数据（如个人信息、工作经历、主题偏好等），以便您在刷新页面后不会丢失内容。
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              所有数据仅存储在您的本地浏览器中，不会上传到任何服务器。您随时可以撤销此授权。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1">
            <button
              onClick={() => setGranted()}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-manipulation"
            >
              同意使用本地存储
            </button>
            <button
              onClick={() => setDenied()}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-medium border rounded-lg hover:bg-muted transition-colors touch-manipulation"
            >
              不同意
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
