import React from 'react'
import type { ResumeBlock } from '@/types/resume'
import type { DocumentProps } from '@react-pdf/renderer'

interface PageLayoutPartial {
  fontSize?: number
  lineHeight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number
}

export async function downloadATSPDF(
  blocks: ResumeBlock[],
  photo: string | null,
  pageLayout: PageLayoutPartial,
  template: unknown
): Promise<void> {
  const { pdf } = await import('@react-pdf/renderer')
  const { ATSResumePDF } = await import('./atsPDFGenerator')

  const element = React.createElement(ATSResumePDF, { blocks, photo, pageLayout, template })
  const blob = await pdf(element as unknown as React.ReactElement<DocumentProps>).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `resume-ats-${new Date().toISOString().split('T')[0]}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
