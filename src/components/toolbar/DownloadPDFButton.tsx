import { useCallback, useState } from 'react'
import { FileDown, Loader2, CheckCircle2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/Toast'

const A4_WIDTH_MM = 210

export function DownloadPDFButton() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { addToast } = useToast()

  const handleDownload = useCallback(async () => {
    setLoading(true)
    try {
      const root = document.querySelector('[data-preview="resume-root"]') as HTMLElement
      if (!root) {
        addToast('error', '预览区域未找到，请刷新页面后重试')
        setLoading(false)
        return
      }

      const pageDivs = Array.from(root.children) as HTMLElement[]

      if (pageDivs.length === 0) {
        addToast('error', '未找到简历页面')
        setLoading(false)
        return
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      for (let i = 0; i < pageDivs.length; i++) {
        if (i > 0) pdf.addPage()

        const canvas = await html2canvas(pageDivs[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDoc) => {
            clonedDoc.querySelectorAll('style').forEach((s) => s.remove())
            clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((s) => s.remove())

            clonedDoc.querySelectorAll('*').forEach((el) => {
              const htmlEl = el as HTMLElement
              const computed = window.getComputedStyle(el)

              const color = computed.color
              const bgColor = computed.backgroundColor
              const borderColor = computed.borderColor

              if (color && color.includes('oklch')) {
                htmlEl.style.color = '#000000'
              }
              if (bgColor && bgColor.includes('oklch')) {
                htmlEl.style.backgroundColor = '#ffffff'
              }
              if (borderColor && borderColor.includes('oklch')) {
                htmlEl.style.borderColor = '#cccccc'
              }
            })
          },
        })

        const imgWidth = A4_WIDTH_MM
        const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.92),
          'JPEG',
          0,
          0,
          imgWidth,
          imgHeight
        )
      }

      pdf.save('简历.pdf')
      setSuccess(true)
      addToast('success', 'PDF 导出成功')
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error('PDF generation failed:', err)
      addToast('error', 'PDF 生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  return (
    <Button
      size="sm"
      className="gap-1.5 text-xs font-medium"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : success ? (
        <CheckCircle2 className="size-3.5 text-green-600" />
      ) : (
        <FileDown className="size-3.5" />
      )}
      {loading ? '生成中...' : '下载 PDF'}
    </Button>
  )
}
