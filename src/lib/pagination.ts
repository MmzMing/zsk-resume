const A4_HEIGHT = 1123 // 297mm * 3.78 px/mm

interface PaginationResult {
  pages: number
  pageBreaks: number[] // block index where page breaks should occur
}

/**
 * Calculate where page breaks should occur based on block heights.
 */
export function calculatePagination(
  blockHeights: number[],
  marginTop: number,
  marginBottom: number,
): PaginationResult {
  const contentHeight = A4_HEIGHT - marginTop - marginBottom
  const pageBreaks: number[] = []
  let currentHeight = 0

  for (let i = 0; i < blockHeights.length; i++) {
    const h = blockHeights[i]

    if (currentHeight + h > contentHeight && currentHeight > 0) {
      pageBreaks.push(i)
      currentHeight = h
    } else {
      currentHeight += h
    }
  }

  return {
    pages: pageBreaks.length + 1,
    pageBreaks,
  }
}

/**
 * "Smart one page" — try to fit all content on one page
 * by reducing font size, line height, and spacing.
 */
export function calculateSmartOnePageAdjustment(
  blockHeights: number[],
  currentLayout: {
    fontSize: number
    lineHeight: number
    paragraphSpacing: number
    marginTop: number
    marginBottom: number
  },
): {
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  marginTop: number
  marginBottom: number
} {
  const contentHeight = A4_HEIGHT - currentLayout.marginTop - currentLayout.marginBottom
  const totalHeight = blockHeights.reduce((sum, h) => sum + h, 0)

  if (totalHeight <= contentHeight) {
    return {
      fontSize: currentLayout.fontSize,
      lineHeight: currentLayout.lineHeight,
      paragraphSpacing: currentLayout.paragraphSpacing,
      marginTop: currentLayout.marginTop,
      marginBottom: currentLayout.marginBottom,
    }
  }

  // Calculate scale factor needed
  const scale = contentHeight / totalHeight

  // Clamp adjustments
  return {
    fontSize: Math.max(8, Math.round(currentLayout.fontSize * scale)),
    lineHeight: Math.max(1.1, +(currentLayout.lineHeight * scale).toFixed(1)),
    paragraphSpacing: Math.max(1, Math.round(currentLayout.paragraphSpacing * scale)),
    marginTop: Math.max(10, Math.round(currentLayout.marginTop * scale)),
    marginBottom: Math.max(10, Math.round(currentLayout.marginBottom * scale)),
  }
}
