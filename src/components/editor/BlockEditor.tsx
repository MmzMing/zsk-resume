import { useState, useCallback, useMemo } from 'react'
import { GripVertical, ChevronDown, ChevronRight, Trash2, Plus, X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { ResumeBlock, HeaderField, ExperienceItem } from '@/types/resume'
import { useResumeStore } from '@/store/resumeStore'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/utils'
import { PhotoUploader } from './PhotoUploader'
import { TiptapEditor } from './TiptapEditor'
import { SortableHeaderField } from './SortableHeaderField'

interface BlockEditorProps {
  block: ResumeBlock
  dragHandleProps?: Record<string, unknown>
}

const FIELD_TEMPLATES: { label: string; key: string; type: HeaderField['type'] }[] = [
  { label: '姓名', key: 'name', type: 'text' },
  { label: '职位', key: 'title', type: 'text' },
  { label: '电话', key: 'phone', type: 'tel' },
  { label: '邮箱', key: 'email', type: 'email' },
  { label: '地址', key: 'location', type: 'text' },
  { label: '网站', key: 'website', type: 'url' },
  { label: 'LinkedIn', key: 'linkedin', type: 'url' },
  { label: 'GitHub', key: 'github', type: 'url' },
  { label: '微信', key: 'wechat', type: 'text' },
  { label: 'QQ', key: 'qq', type: 'text' },
]

export function BlockEditor({ block, dragHandleProps }: BlockEditorProps) {
  const [collapsed, setCollapsed] = useState(block.collapsed)
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const removeBlock = useResumeStore((s) => s.removeBlock)

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    updateBlock(block.id, { collapsed: !collapsed })
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* Block Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
          title="拖拽排序"
          {...(dragHandleProps ?? {})}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          className="flex items-center gap-1 flex-1 text-sm font-medium text-left min-w-0"
          onClick={toggleCollapse}
        >
          {collapsed ? (
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">{block.title}</span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => removeBlock(block.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Block Content */}
      {!collapsed && (
        <div className="p-3 lg:p-4">
          {block.type === 'header' && (
            <HeaderBlockEditor block={block} />
          )}

          {block.type === 'experience' && (
            <ItemsBlockEditor block={block} fieldLabels={{ company: '公司名称', title: '职位', startDate: '开始日期', endDate: '结束日期', description: '工作描述' }} />
          )}

          {block.type === 'education' && (
            <ItemsBlockEditor block={block} fieldLabels={{ company: '学校名称', title: '专业/学位', startDate: '开始日期', endDate: '结束日期', description: '备注' }} />
          )}

          {block.type === 'skills' && (
            <SkillsBlockEditor block={block} />
          )}

          {block.type === 'summary' && (
            <TextBlockEditor block={block} placeholder="个人摘要..." />
          )}

          {block.type === 'projects' && (
            <ItemsBlockEditor block={block} fieldLabels={{ company: '项目名称', title: '技术栈', startDate: '开始日期', endDate: '结束日期', description: '项目描述' }} />
          )}

          {!['header', 'experience', 'education', 'skills', 'summary', 'projects'].includes(block.type) && (
            <TextBlockEditor block={block} placeholder="在此输入内容..." />
          )}
        </div>
      )}
    </div>
  )
}

const DEFAULT_FIELD_ICONS: Record<string, string> = {
  name: 'user',
  title: 'briefcase',
  phone: 'phone',
  email: 'mail',
  location: 'mapPin',
  website: 'globe',
  linkedin: 'linkedin',
  github: 'github',
  wechat: 'messageCircle',
  qq: 'hash',
}

function HeaderBlockEditor({ block }: { block: ResumeBlock }) {
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const fields = useMemo(() => block.headerFields ?? [], [block.headerFields])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const updateField = (key: string, value: string) => {
    const newFields = fields.map((f) => (f.key === key ? { ...f, value } : f))
    updateBlock(block.id, { headerFields: newFields })
  }

  const updateFieldIcon = (key: string, icon: string) => {
    const newFields = fields.map((f) => (f.key === key ? { ...f, icon } : f))
    updateBlock(block.id, { headerFields: newFields })
  }

  const FIXED_TOP_KEYS = new Set(['name', 'title'])

  const removeField = (key: string) => {
    if (FIXED_TOP_KEYS.has(key)) return
    const newFields = fields.filter((f) => f.key !== key)
    updateBlock(block.id, { headerFields: newFields })
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const fixedTopKeys = new Set(['name', 'title'])

      // Prevent dragging fixed fields
      if (fixedTopKeys.has(String(active.id))) return

      const activeField = fields.find((f) => f.key === active.id)
      const overField = fields.find((f) => f.key === over.id)
      if (!activeField || !overField) return

      const oldIndex = fields.findIndex((f) => f.key === active.id)
      const newIndex = fields.findIndex((f) => f.key === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newFields = [...fields]
      const [moved] = newFields.splice(oldIndex, 1)

      // Change layer when dropped onto a field in a different layer
      // Dropping onto fixed fields (name/title) changes to 'top' layer
      if (activeField.layer !== overField.layer || fixedTopKeys.has(String(over.id))) {
        moved.layer = overField.layer
      }

      newFields.splice(newIndex, 0, moved)
      updateBlock(block.id, { headerFields: newFields })
    },
    [fields, block.id, updateBlock]
  )

  const addField = (template: typeof FIELD_TEMPLATES[number]) => {
    const defaultIcon = DEFAULT_FIELD_ICONS[template.key] || 'bookmark'
    const isDuplicate = fields.some((f) => f.key === template.key)
    const key = isDuplicate ? `${template.key}_${generateId()}` : template.key
    const newField: HeaderField = {
      key,
      label: template.label,
      value: '',
      type: template.type,
      icon: defaultIcon,
      layer: 'bottom',
    }
    updateBlock(block.id, { headerFields: [...fields, newField] })
  }

  const addCustomField = () => {
    const key = `custom_${generateId()}`
    const newField: HeaderField = {
      key,
      label: '自定义',
      value: '',
      type: 'text',
      icon: 'bookmark',
      layer: 'bottom',
    }
    updateBlock(block.id, { headerFields: [...fields, newField] })
  }

  const updateFieldLabel = (key: string, label: string) => {
    const newFields = fields.map((f) => (f.key === key ? { ...f, label } : f))
    updateBlock(block.id, { headerFields: newFields })
  }

  const availableTemplates = FIELD_TEMPLATES.filter(
    (t) => !FIXED_TOP_KEYS.has(t.key) && !fields.some((f) => f.key === t.key || f.key.startsWith(t.key + '_'))
  )

  const topFields = fields.filter((f) => f.layer === 'top')
  const bottomFields = fields.filter((f) => f.layer !== 'top')

  const fixedTopFields = topFields.filter((f) => FIXED_TOP_KEYS.has(f.key))
  const sortableTopFields = topFields.filter((f) => !FIXED_TOP_KEYS.has(f.key))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 items-start">
        <div className="shrink-0 w-[100px] sm:w-[120px] flex flex-col items-center gap-2 mx-auto sm:mx-0">
          <PhotoUploader />
          <span className="text-[10px] text-muted-foreground">职业照</span>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {/* Top Layer - Fixed fields + Sortable fields */}
                <div className="space-y-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">上层</div>
                  <div className="space-y-2">
                    {/* Fixed fields: name & title */}
                    {fixedTopFields.map((field) => (
                      <SortableHeaderField
                        key={field.key}
                        field={field}
                        onUpdateValue={(value) => updateField(field.key, value)}
                        onUpdateIcon={(icon) => updateFieldIcon(field.key, icon)}
                        onUpdateLabel={field.key.startsWith('custom_') ? (label) => updateFieldLabel(field.key, label) : undefined}
                        onRemove={() => removeField(field.key)}
                        fixed
                      />
                    ))}
                    {/* Sortable top fields */}
                    {sortableTopFields.map((field) => (
                      <SortableHeaderField
                        key={field.key}
                        field={field}
                        onUpdateValue={(value) => updateField(field.key, value)}
                        onUpdateIcon={(icon) => updateFieldIcon(field.key, icon)}
                        onUpdateLabel={field.key.startsWith('custom_') ? (label) => updateFieldLabel(field.key, label) : undefined}
                        onRemove={() => removeField(field.key)}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom Layer */}
                {bottomFields.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">下层</div>
                    <div className="space-y-2">
                      {bottomFields.map((field) => (
                        <SortableHeaderField
                          key={field.key}
                          field={field}
                          onUpdateValue={(value) => updateField(field.key, value)}
                          onUpdateIcon={(icon) => updateFieldIcon(field.key, icon)}
                          onUpdateLabel={field.key.startsWith('custom_') ? (label) => updateFieldLabel(field.key, label) : undefined}
                          onRemove={() => removeField(field.key)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:pl-[136px]">
        {availableTemplates.map((t) => (
          <button
            key={t.key}
            className="inline-flex items-center gap-1 px-2 py-1.5 sm:py-1 text-[11px] border border-dashed rounded-md text-muted-foreground hover:text-foreground hover:border-primary transition-colors touch-manipulation"
            onClick={() => addField(t)}
          >
            <Plus className="size-3" />
            {t.label}
          </button>
        ))}
        <button
          className="inline-flex items-center gap-1 px-2 py-1.5 sm:py-1 text-[11px] border border-dashed rounded-md text-muted-foreground hover:text-foreground hover:border-primary transition-colors touch-manipulation"
          onClick={addCustomField}
        >
          <Plus className="size-3" />
          自定义
        </button>
      </div>
    </div>
  )
}

/* ── Items block editor (experience / education / projects) ── */

type ItemFieldLabel = Record<Exclude<keyof ExperienceItem, 'id'>, string>

function ItemsBlockEditor({ block, fieldLabels }: {
  block: ResumeBlock
  fieldLabels: ItemFieldLabel
}) {
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const pageLayout = useResumeStore((s) => s.pageLayout)
  const items: ExperienceItem[] = (block.content?.items as ExperienceItem[]) ?? []

  const updateItem = (itemId: string, field: keyof ExperienceItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    )
    updateBlock(block.id, { content: { ...block.content, items: newItems } })
  }

  const removeItem = (itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId)
    updateBlock(block.id, { content: { ...block.content, items: newItems } })
  }

  const addItem = () => {
    const newItem: ExperienceItem = {
      id: generateId(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    updateBlock(block.id, { content: { ...block.content, items: [...items, newItem] } })
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border rounded-md p-3 space-y-2 relative">
          <button
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1"
            onClick={() => removeItem(item.id)}
          >
            <X className="size-3.5" />
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder={fieldLabels.company} value={item.company}
              onChange={(e) => updateItem(item.id, 'company', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring bg-background min-h-[40px] sm:min-h-0" />
            <input type="text" placeholder={fieldLabels.title} value={item.title}
              onChange={(e) => updateItem(item.id, 'title', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring bg-background min-h-[40px] sm:min-h-0" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder={fieldLabels.startDate} value={item.startDate}
              onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring bg-background min-h-[40px] sm:min-h-0" />
            <input type="text" placeholder={fieldLabels.endDate} value={item.endDate}
              onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring bg-background min-h-[40px] sm:min-h-0" />
          </div>

          <TiptapEditor
            value={item.description}
            onChange={(v) => updateItem(item.id, 'description', v)}
            placeholder={fieldLabels.description}
            fontSize={pageLayout?.fontSize}
            lineHeight={pageLayout?.lineHeight}
            paragraphSpacing={pageLayout?.paragraphSpacing}
          />
        </div>
      ))}

      <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto" onClick={addItem}>+ 添加条目</Button>
    </div>
  )
}

/* ── Skills block editor ── */

function SkillsBlockEditor({ block }: { block: ResumeBlock }) {
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const skills: string[] = (block.content?.skills as string[]) ?? []

  const updateSkills = (text: string) => {
    const newSkills = text.split(/[\n,，]/).map((s) => s.trim()).filter(Boolean)
    updateBlock(block.id, { content: { ...block.content, skills: newSkills } })
  }

  return (
    <div className="space-y-2">
      <textarea placeholder="每行一个技能（或用逗号分隔）..." value={skills.join('\n')}
        onChange={(e) => updateSkills(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring bg-background resize-y min-h-[100px]" />
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded-full">{skill}</span>
        ))}
      </div>
    </div>
  )
}

/* ── Text block editor (summary / custom) ── */

function TextBlockEditor({ block, placeholder }: { block: ResumeBlock; placeholder: string }) {
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const text = (block.content?.text as string) ?? ''
  const { pageLayout } = useResumeStore()

  return (
    <TiptapEditor
      value={text}
      onChange={(v) => updateBlock(block.id, { content: { ...block.content, text: v } })}
      placeholder={placeholder}
      fontSize={pageLayout?.fontSize}
      lineHeight={pageLayout?.lineHeight}
      paragraphSpacing={pageLayout?.paragraphSpacing}
    />
  )
}
