import mammoth from 'mammoth'
import type { ResumeBlock, BlockType } from '@/types/resume'

interface ParseResult {
  blocks: ResumeBlock[]
  errors: string[]
}

/**
 * Parse a .docx file and convert it to resume blocks.
 */
export async function parseWordTemplate(file: File): Promise<ParseResult> {
  const errors: string[] = []

  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })

    if (result.messages.length > 0) {
      result.messages.forEach((msg) => {
        if (msg.type === 'warning') {
          console.warn('Mammoth warning:', msg.message)
        }
      })
    }

    const html = result.value
    const blocks = parseHtmlToBlocks(html)

    return { blocks, errors }
  } catch (err) {
    return {
      blocks: [],
      errors: ['Word 文件解析失败: ' + (err as Error).message],
    }
  }
}

function parseHtmlToBlocks(html: string): ResumeBlock[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const blocks: ResumeBlock[] = []
  let order = 0

  // Strategy: iterate through child elements and classify by heading/text content
  const children = Array.from(body.children)

  // Detect section boundaries by headings
  let currentSection: { type: BlockType; title: string; items: string[] } | null = null

  function flushSection() {
    if (!currentSection) return
    blocks.push({
      id: generateBlockId(),
      type: currentSection.type,
      title: currentSection.title,
      order: order++,
      collapsed: false,
      lexicalJSON: JSON.stringify({ items: currentSection.items }),
    })
    currentSection = null
  }

  for (const child of children) {
    const tagName = child.tagName.toUpperCase()
    const text = (child.textContent || '').trim()

    if (!text) continue

    // Headings typically indicate new sections
    if (['H1', 'H2', 'H3'].includes(tagName)) {
      flushSection()

      const blockType = classifyHeading(text)
      currentSection = {
        type: blockType,
        title: text,
        items: [],
      }
    } else if (currentSection) {
      // Content items within a section
      const itemText = extractTextContent(child)
      if (itemText.trim()) {
        currentSection.items.push(itemText.trim())
      }
    }
  }

  flushSection()

  // If no blocks detected, create generic ones from the content
  if (blocks.length === 0) {
    const allText = body.textContent || ''
    blocks.push({
      id: generateBlockId(),
      type: 'custom',
      title: '导入内容',
      order: 0,
      collapsed: false,
      lexicalJSON: JSON.stringify({ text: allText }),
    })
  }

  return blocks
}

function classifyHeading(heading: string): BlockType {
  const lower = heading.toLowerCase()

  if (/个人|信息|联系|姓名|基本/.test(lower)) return 'header'
  if (/摘要|概述|简介|summary|about/.test(lower)) return 'summary'
  if (/工作|经历|经验|实习|experience/.test(lower)) return 'experience'
  if (/教育|学历|学校|education/.test(lower)) return 'education'
  if (/技能|技术|能力|skill/.test(lower)) return 'skills'
  if (/项目|project/.test(lower)) return 'projects'
  if (/语言|language/.test(lower)) return 'languages'
  if (/证书|认证|资质|certification/.test(lower)) return 'certifications'

  return 'custom'
}

function extractTextContent(element: Element): string {
  // Handle lists
  if (element.tagName.toUpperCase() === 'UL' || element.tagName.toUpperCase() === 'OL') {
    const items = Array.from(element.querySelectorAll('li'))
    return items.map((li) => `• ${li.textContent?.trim()}`).join('\n')
  }

  // Handle tables
  if (element.tagName.toUpperCase() === 'TABLE') {
    const rows = Array.from(element.querySelectorAll('tr'))
    return rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll('td, th'))
        return cells.map((c) => c.textContent?.trim()).join(' | ')
      })
      .join('\n')
  }

  // Handle paragraphs and other elements
  return element.textContent || ''
}

function generateBlockId(): string {
  return `imported-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
