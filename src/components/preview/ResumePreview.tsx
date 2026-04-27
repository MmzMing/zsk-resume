import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/lib/templates'
import { usePagination, useSmartOnePage } from '@/hooks/usePagination'
import type { ResumeBlock, ExperienceItem } from '@/types/resume'
import { IconRenderer } from './IconRenderer'

const A4_WIDTH = 794
const A4_HEIGHT = 1123

export function ResumePreview() {
  const pageLayout = useResumeStore((s) => s.pageLayout)
  const blocks = useResumeStore((s) => s.blocks)
  const photo = useResumeStore((s) => s.photo)
  const templateId = useResumeStore((s) => s.template.id)

  const template = getTemplate(templateId)
  const colors = template.colors

  const {
    fontFamily = 'Microsoft YaHei',
    fontSize = 12,
    lineHeight = 1.5,
    paragraphSpacing = 8,
    marginTop = 30,
    marginBottom = 30,
    marginLeft = 30,
    marginRight = 30,
  } = pageLayout

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  // Pagination
  const { pageBreaks, totalPages, registerBlockRef } = usePagination(
    sortedBlocks.length,
    marginTop,
    marginBottom,
  )

  // Smart one-page auto-adjustment
  useSmartOnePage(totalPages)

  // Split blocks into pages
  const pages: ResumeBlock[][] = []
  let pageStart = 0
  for (const breakIdx of pageBreaks) {
    pages.push(sortedBlocks.slice(pageStart, breakIdx))
    pageStart = breakIdx
  }
  pages.push(sortedBlocks.slice(pageStart))

  return (
    <div data-preview="resume-root">
      {pages.map((pageBlocks, pageIdx) => (
        <div
          key={pageIdx}
          style={{
            width: A4_WIDTH,
            minHeight: A4_HEIGHT,
            fontFamily: `${fontFamily}, "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif`,
            fontSize: `${fontSize}px`,
            lineHeight,
            paddingTop: marginTop,
            paddingBottom: marginBottom,
            paddingLeft: marginLeft,
            paddingRight: marginRight,
            color: colors.text,
            backgroundColor: '#ffffff',
            marginBottom: pageIdx < pages.length - 1 ? 24 : 0,
            position: 'relative',
          }}
        >
          {pageBlocks.map((block, idx) => {
            const globalIdx = sortedBlocks.indexOf(block)
            return (
              <div key={block.id} ref={registerBlockRef(globalIdx)}>
                <PreviewBlock
                  block={block}
                  colors={colors}
                  template={template}
                  photo={photo}
                  paragraphSpacing={paragraphSpacing}
                  fontSize={fontSize}
                  isLast={idx === pageBlocks.length - 1}
                />
              </div>
            )
          })}

          {/* Page number */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: marginRight,
              fontSize: Math.max(9, fontSize - 3),
              color: '#999',
            }}
          >
            第 {pageIdx + 1}/{totalPages} 页
          </div>
        </div>
      ))}
    </div>
  )
}

interface PreviewBlockProps {
  block: ResumeBlock
  colors: ReturnType<typeof getTemplate>['colors']
  template: ReturnType<typeof getTemplate>
  photo: string | null
  paragraphSpacing: number
  fontSize: number
  isLast: boolean
}

function PreviewBlock({
  block,
  colors,
  template,
  photo,
  paragraphSpacing,
  fontSize,
  isLast,
}: PreviewBlockProps) {
  const sectionTitle = (title: string) => (
    <h2
      style={{
        fontSize: fontSize + 2,
        fontWeight: 700,
        color: colors.primary,
        marginBottom: 8,
        ...(template.sectionTitleStyle === 'underline'
          ? { borderBottom: `1px solid ${colors.border}`, paddingBottom: 4 }
          : template.sectionTitleStyle === 'bar'
            ? { borderLeft: `3px solid ${colors.primary}`, paddingLeft: 8 }
            : {}),
      }}
    >
      {title}
    </h2>
  )

  const baseStyle: React.CSSProperties = {
    marginBottom: isLast ? 0 : paragraphSpacing * 2,
  }

  if (block.type === 'header') {
    return <HeaderPreview block={block} colors={colors} template={template} photo={photo} baseStyle={baseStyle} fontSize={fontSize} />
  }

  if (block.type === 'experience') {
    const items: ExperienceItem[] = (block.content?.items as ExperienceItem[]) ?? []
    return (
      <section style={baseStyle}>
        {sectionTitle(block.title)}
        {items.length === 0 && <p style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>在编辑区添加工作经历...</p>}
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize, color: colors.text }}>{item.company || '公司名称'}</strong>
              <span style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>{[item.startDate, item.endDate].filter(Boolean).join(' - ') || '日期'}</span>
            </div>
            {item.title && <p style={{ fontSize: Math.max(9, fontSize - 1), color: colors.secondary, marginBottom: 2 }}>{item.title}</p>}
            {item.description && (
              <div
                style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}
          </div>
        ))}
      </section>
    )
  }

  if (block.type === 'education') {
    const items: ExperienceItem[] = (block.content?.items as ExperienceItem[]) ?? []
    return (
      <section style={baseStyle}>
        {sectionTitle(block.title)}
        {items.length === 0 && <p style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>在编辑区添加教育背景...</p>}
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize, color: colors.text }}>{item.company || '学校名称'}</strong>
              <span style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>{[item.startDate, item.endDate].filter(Boolean).join(' - ') || '日期'}</span>
            </div>
            {item.title && <p style={{ fontSize: Math.max(9, fontSize - 1), color: colors.secondary }}>{item.title}</p>}
          </div>
        ))}
      </section>
    )
  }

  if (block.type === 'skills') {
    const skills: string[] = (block.content?.skills as string[]) ?? []
    return (
      <section style={baseStyle}>
        {sectionTitle(block.title)}
        {skills.length === 0 && <p style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>在编辑区添加技能...</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {skills.map((skill) => (
            <span key={skill} style={{
              fontSize: Math.max(9, fontSize - 2), color: colors.text,
            }}>{skill}</span>
          ))}
        </div>
      </section>
    )
  }

  if (block.type === 'summary') {
    const text = (block.content?.text as string) ?? ''
    return (
      <section style={baseStyle}>
        {sectionTitle(block.title)}
        {text ? (
          <div
            style={{ fontSize: Math.max(9, fontSize - 1), color: colors.text, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ) : (
          <p style={{ fontSize: Math.max(9, fontSize - 1), color: colors.text, lineHeight: 1.6 }}>
            在编辑区填写个人摘要...
          </p>
        )}
      </section>
    )
  }

  if (block.type === 'projects') {
    const items: ExperienceItem[] = (block.content?.items as ExperienceItem[]) ?? []
    return (
      <section style={baseStyle}>
        {sectionTitle(block.title)}
        {items.length === 0 && <p style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>在编辑区添加项目经历...</p>}
        {items.map((item) => (
          <div key={item.id} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize, color: colors.text }}>{item.company || '项目名称'}</strong>
              <span style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted }}>{[item.startDate, item.endDate].filter(Boolean).join(' - ') || '日期'}</span>
            </div>
            {item.title && <p style={{ fontSize: Math.max(9, fontSize - 1), color: colors.secondary }}>{item.title}</p>}
            {item.description && (
              <div
                style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted, marginTop: 2 }}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            )}
          </div>
        ))}
      </section>
    )
  }

  // languages, certifications, custom — text content
  const text = (block.content?.text as string) ?? ''
  return (
    <section style={baseStyle}>
      {sectionTitle(block.title)}
      {text ? (
        <div
          style={{ fontSize: Math.max(9, fontSize - 1), color: colors.text, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ) : (
        <p style={{ fontSize: Math.max(9, fontSize - 1), color: colors.text, lineHeight: 1.6 }}>
          在编辑区填写内容...
        </p>
      )}
    </section>
  )
}

function HeaderPreview({
  block,
  colors,
  template,
  photo,
  baseStyle,
  fontSize,
}: {
  block: ResumeBlock
  colors: ReturnType<typeof getTemplate>['colors']
  template: ReturnType<typeof getTemplate>
  photo: string | null
  baseStyle: React.CSSProperties
  fontSize: number
}) {
  const fields = block.headerFields ?? []
  const nameField = fields.find((f) => f.key === 'name')
  const titleField = fields.find((f) => f.key === 'title')
  const topFields = fields.filter((f) => f.layer === 'top' && f.key !== 'name' && f.key !== 'title')
  const bottomFields = fields.filter((f) => f.layer !== 'top' && f.key !== 'name' && f.key !== 'title')
  const isCenter = template.headerAlign === 'center'

  const renderFieldRow = (fieldList: typeof fields) => (
    <div style={{ fontSize: Math.max(9, fontSize - 2), color: colors.muted, lineHeight: 1.8, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: isCenter ? 'center' : 'flex-start' }}>
      {fieldList.filter((f) => f.value).map((field) => (
        <span key={field.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {field.icon && (
            <IconRenderer name={field.icon} size={Math.max(9, fontSize - 2)} color={colors.muted} />
          )}
          <span>{field.value}</span>
        </span>
      ))}
    </div>
  )

  return (
    <section style={{ ...baseStyle, textAlign: template.headerAlign }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          justifyContent: isCenter ? 'center' : 'flex-start',
          flexDirection: 'row',
        }}
      >
        <div style={{ flex: 1, order: 1 }}>
          {nameField?.value && (
            <h1 style={{ fontSize: fontSize + 10, fontWeight: 700, color: colors.primary, marginBottom: 4 }}>
              {nameField.value}
            </h1>
          )}
          {titleField?.value && (
            <p style={{ fontSize: fontSize + 1, color: colors.secondary, marginBottom: 6 }}>
              {titleField.value}
            </p>
          )}
          {topFields.length > 0 && (
            <div style={{ marginBottom: bottomFields.length > 0 ? 4 : 0 }}>
              {renderFieldRow(topFields)}
            </div>
          )}
          {bottomFields.length > 0 && renderFieldRow(bottomFields)}
        </div>

        {photo && (
          <div style={{ order: 2 }}>
            <img src={photo} alt="职业照"
              style={{ width: 90, height: 120, objectFit: 'cover', borderRadius: 4 }} />
          </div>
        )}
      </div>
    </section>
  )
}
