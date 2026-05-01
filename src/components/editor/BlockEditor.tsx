import React, { useCallback, useMemo, useState } from 'react'
import { GripVertical, ChevronDown, ChevronRight, Trash2, Plus, X, Pencil, Check } from 'lucide-react'
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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ResumeBlock, HeaderField, ExperienceItem } from '@/types/resume'
import { useResumeStore } from '@/store/resumeStore'
import { Button } from '@/components/ui/button'
import { generateId, cn } from '@/lib/utils'
import { PhotoUploader } from './PhotoUploader'
import { TiptapEditor } from './TiptapEditor'
import { SortableHeaderField } from './SortableHeaderField'

interface BlockEditorProps {
  block: ResumeBlock
  dragHandleProps?: Record<string, unknown>
  showDivider?: boolean
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

const FIXED_TOP_KEYS = new Set(['name', 'title'])

const BlockEditorHeader = ({ block, collapsed, toggleCollapse, dragHandleProps, onAdd }: {
  block: ResumeBlock
  collapsed: boolean
  toggleCollapse: () => void
  dragHandleProps?: Record<string, unknown>
  onAdd?: () => void
}) => {
  const removeBlock = useResumeStore((s) => s.removeBlock)
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(block.title)

  const handleEditStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditTitle(block.title)
    setIsEditing(true)
  }, [block.title])

  const handleEditSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (editTitle.trim()) {
      updateBlock(block.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }, [editTitle, block.id, updateBlock])

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave(e as unknown as React.MouseEvent)
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }, [handleEditSave])

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
        title="拖拽排序"
        aria-label="拖拽排序"
        {...(dragHandleProps ?? {})}
      >
        <GripVertical className="size-4" />
      </button>

      <button
        className="flex items-center gap-1 flex-1 text-sm font-medium text-left min-w-0"
        onClick={toggleCollapse}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        )}
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleEditKeyDown}
            className="flex-1 min-w-0 px-1.5 py-0.5 text-sm border border-primary rounded-md bg-background outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{block.title}</span>
        )}
      </button>

      {isEditing ? (
        <button
          className="size-7 text-green-600 hover:text-green-700 transition-colors flex items-center justify-center"
          onClick={handleEditSave}
          title="确认修改"
          aria-label="确认修改"
        >
          <Check className="size-4" />
        </button>
      ) : (
        <button
          className="size-7 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          onClick={handleEditStart}
          title="编辑名称"
          aria-label="编辑名称"
        >
          <Pencil className="size-3.5" />
        </button>
      )}

      {onAdd && (
        <button
          className="size-7 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
          aria-label={`添加条目到 ${block.title}`}
        >
          <Plus className="size-4" />
        </button>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => removeBlock(block.id)}
        aria-label={`删除 ${block.title}`}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  )
}

const BlockEditorContent = React.memo(({ block }: { block: ResumeBlock }) => (
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
))

export function BlockEditor({ block, dragHandleProps, showDivider = true }: BlockEditorProps) {
  const updateBlock = useResumeStore((s) => s.updateBlock)

  const toggleCollapse = useCallback(() => {
    updateBlock(block.id, { collapsed: !block.collapsed })
  }, [block.id, block.collapsed, updateBlock])

  const handleAddItem = useCallback(() => {
    const newItem: ExperienceItem = {
      id: generateId(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    const items = (block.content?.items as ExperienceItem[]) ?? []
    updateBlock(block.id, { content: { items: [...items, newItem] } })
  }, [block.id, block.content?.items, updateBlock])

  const showAddButton = ['experience', 'education', 'projects'].includes(block.type)

  return (
    <div className={cn("pb-5 pt-4", showDivider && "border-b border-black dark:border-white")}>
      <BlockEditorHeader block={block} collapsed={block.collapsed} toggleCollapse={toggleCollapse} dragHandleProps={dragHandleProps} onAdd={showAddButton ? handleAddItem : undefined} />
      <div
        className={cn(
          "grid overflow-hidden",
          block.collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        )}
        style={{ transition: 'grid-template-rows 200ms ease-out' }}
      >
        <div className="min-h-0 overflow-hidden">
          <BlockEditorContent block={block} />
        </div>
      </div>
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

function useHeaderFieldOperations(blockId: string, fields: HeaderField[]) {
  const updateBlock = useResumeStore((s) => s.updateBlock)

  const updateField = useCallback((key: string, value: string) => {
    const newFields = fields.map((f) => (f.key === key ? { ...f, value } : f))
    updateBlock(blockId, { headerFields: newFields })
  }, [fields, blockId, updateBlock])

  const updateFieldIcon = useCallback((key: string, icon: string) => {
    const newFields = fields.map((f) => (f.key === key ? { ...f, icon } : f))
    updateBlock(blockId, { headerFields: newFields })
  }, [fields, blockId, updateBlock])

  const updateFieldLabel = useCallback((key: string, label: string) => {
    const newFields = fields.map((f) => (f.key === key ? { ...f, label } : f))
    updateBlock(blockId, { headerFields: newFields })
  }, [fields, blockId, updateBlock])

  const removeField = useCallback((key: string) => {
    if (FIXED_TOP_KEYS.has(key)) return
    const newFields = fields.filter((f) => f.key !== key)
    updateBlock(blockId, { headerFields: newFields })
  }, [fields, blockId, updateBlock])

  return { updateField, updateFieldIcon, updateFieldLabel, removeField }
}

function HeaderBlockEditor({ block }: { block: ResumeBlock }) {
  const fields = useMemo(() => block.headerFields ?? [], [block.headerFields])
  const { updateField, updateFieldIcon, updateFieldLabel, removeField } = useHeaderFieldOperations(block.id, fields)

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const fixedTopKeys = new Set(['name', 'title'])
      if (fixedTopKeys.has(String(active.id))) return

      const activeField = fields.find((f) => f.key === active.id)
      const overField = fields.find((f) => f.key === over.id)
      if (!activeField || !overField) return

      const oldIndex = fields.findIndex((f) => f.key === active.id)
      const newIndex = fields.findIndex((f) => f.key === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newFields = [...fields]
      const [moved] = newFields.splice(oldIndex, 1)

      if (activeField.layer !== overField.layer || fixedTopKeys.has(String(over.id))) {
        moved.layer = overField.layer
      }

      newFields.splice(newIndex, 0, moved)
      useResumeStore.getState().updateBlock(block.id, { headerFields: newFields })
    },
    [fields, block.id]
  )

  const addField = useCallback((template: typeof FIELD_TEMPLATES[number]) => {
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
    useResumeStore.getState().updateBlock(block.id, { headerFields: [...fields, newField] })
  }, [fields, block.id])

  const addCustomField = useCallback(() => {
    const key = `custom_${generateId()}`
    const newField: HeaderField = {
      key,
      label: '自定义',
      value: '',
      type: 'text',
      icon: 'bookmark',
      layer: 'bottom',
    }
    useResumeStore.getState().updateBlock(block.id, { headerFields: [...fields, newField] })
  }, [fields, block.id])

  const availableTemplates = useMemo(() => 
    FIELD_TEMPLATES.filter(
      (t) => !FIXED_TOP_KEYS.has(t.key) && !fields.some((f) => f.key === t.key || f.key.startsWith(t.key + '_'))
    ),
    [fields]
  )

  const topFields = useMemo(() => fields.filter((f) => f.layer === 'top'), [fields])
  const bottomFields = useMemo(() => fields.filter((f) => f.layer !== 'top'), [fields])
  const fixedTopFields = useMemo(() => topFields.filter((f) => FIXED_TOP_KEYS.has(f.key)), [topFields])
  const sortableTopFields = useMemo(() => topFields.filter((f) => !FIXED_TOP_KEYS.has(f.key)), [topFields])

  const renderField = useCallback((field: HeaderField) => (
    <SortableHeaderField
      key={field.key}
      field={field}
      onUpdateValue={(value) => updateField(field.key, value)}
      onUpdateIcon={(icon) => updateFieldIcon(field.key, icon)}
      onUpdateLabel={field.key.startsWith('custom_') ? (label) => updateFieldLabel(field.key, label) : undefined}
      onRemove={() => removeField(field.key)}
      fixed={FIXED_TOP_KEYS.has(field.key)}
    />
  ), [updateField, updateFieldIcon, updateFieldLabel, removeField])

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
                <div className="space-y-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">上层</div>
                  <div className="space-y-2">
                    {fixedTopFields.map(renderField)}
                    {sortableTopFields.map(renderField)}
                  </div>
                </div>

                {bottomFields.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">下层</div>
                    <div className="space-y-2">
                      {bottomFields.map(renderField)}
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

type ItemFieldLabel = Record<Exclude<keyof ExperienceItem, 'id'>, string>

function useItemOperations(blockId: string, items: ExperienceItem[]) {
  const updateBlock = useResumeStore((s) => s.updateBlock)

  const updateItem = useCallback((itemId: string, field: keyof ExperienceItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    )
    updateBlock(blockId, { content: { items: newItems } })
  }, [items, blockId, updateBlock])

  const removeItem = useCallback((itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId)
    updateBlock(blockId, { content: { items: newItems } })
  }, [items, blockId, updateBlock])

  const addItem = useCallback(() => {
    const newItem: ExperienceItem = {
      id: generateId(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    updateBlock(blockId, { content: { items: [...items, newItem] } })
  }, [items, blockId, updateBlock])

  return { updateItem, removeItem, addItem }
}

const SortableExperienceItemCard = React.memo(({ item, fieldLabels, onUpdate, onRemove, dragHandleProps }: {
  item: ExperienceItem
  fieldLabels: ItemFieldLabel
  onUpdate: (itemId: string, field: keyof ExperienceItem, value: string) => void
  onRemove: (itemId: string) => void
  dragHandleProps?: Record<string, unknown>
}) => {
  const pageLayout = useResumeStore((s) => s.pageLayout)

  return (
    <div className="border border-black dark:border-white rounded-md p-3 space-y-2 relative">
      <div className="flex items-start gap-2">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none shrink-0 mt-0.5"
          title="拖拽排序"
          aria-label="拖拽排序"
          {...(dragHandleProps ?? {})}
        >
          <GripVertical className="size-3.5" />
        </button>
        <div className="flex-1 min-w-0 space-y-2">
          <button
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1"
            onClick={() => onRemove(item.id)}
            aria-label="删除条目"
          >
            <X className="size-3.5" />
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder={fieldLabels.company} value={item.company}
              onChange={(e) => onUpdate(item.id, 'company', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border border-black dark:border-white rounded-md outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-background min-h-[40px] sm:min-h-0" />
            <input type="text" placeholder={fieldLabels.title} value={item.title}
              onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border border-black dark:border-white rounded-md outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-background min-h-[40px] sm:min-h-0" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" placeholder={fieldLabels.startDate} value={item.startDate}
              onChange={(e) => onUpdate(item.id, 'startDate', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border border-black dark:border-white rounded-md outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-background min-h-[40px] sm:min-h-0" />
            <input type="text" placeholder={fieldLabels.endDate} value={item.endDate}
              onChange={(e) => onUpdate(item.id, 'endDate', e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm border border-black dark:border-white rounded-md outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-background min-h-[40px] sm:min-h-0" />
          </div>

          <TiptapEditor
            value={item.description}
            onChange={(v) => onUpdate(item.id, 'description', v)}
            placeholder={fieldLabels.description}
            fontSize={pageLayout?.fontSize}
            lineHeight={pageLayout?.lineHeight}
            paragraphSpacing={pageLayout?.paragraphSpacing}
          />
        </div>
      </div>
    </div>
  )
})

function SortableExperienceItem({ item, fieldLabels, onUpdate, onRemove }: {
  item: ExperienceItem
  fieldLabels: ItemFieldLabel
  onUpdate: (itemId: string, field: keyof ExperienceItem, value: string) => void
  onRemove: (itemId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SortableExperienceItemCard
        item={item}
        fieldLabels={fieldLabels}
        onUpdate={onUpdate}
        onRemove={onRemove}
        dragHandleProps={listeners}
      />
    </div>
  )
}

function ItemsBlockEditor({ block, fieldLabels }: {
  block: ResumeBlock
  fieldLabels: ItemFieldLabel
}) {
  const items = useMemo(() => (block.content?.items as ExperienceItem[]) ?? [], [block.content?.items])
  const { updateItem, removeItem, addItem } = useItemOperations(block.id, items)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const currentItems = useResumeStore.getState().blocks.find(b => b.id === block.id)?.content?.items as ExperienceItem[] | undefined
      if (!currentItems) return

      const oldIndex = currentItems.findIndex((i) => i.id === active.id)
      const newIndex = currentItems.findIndex((i) => i.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newItems = [...currentItems]
      const [moved] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, moved)
      useResumeStore.getState().updateBlock(block.id, { content: { items: newItems } })
    },
    [block.id]
  )

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableExperienceItem
              key={item.id}
              item={item}
              fieldLabels={fieldLabels}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-1 text-xs"
        onClick={() => addItem()}
      >
        <Plus className="size-3.5" />
        添加条目
      </Button>
    </div>
  )
}

const SkillsBlockEditor = React.memo(({ block }: { block: ResumeBlock }) => {
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const skills: string[] = useMemo(
    () => (block.content?.skills as string[]) ?? [],
    [block.content?.skills]
  )

  const updateSkills = useCallback((text: string) => {
    const newSkills = text.split(/[\n,，]/).map((s) => s.trim()).filter(Boolean)
    updateBlock(block.id, { content: { skills: newSkills } })
  }, [block.id, updateBlock])

  const skillsText = useMemo(() => skills.join('\n'), [skills])

  return (
    <div className="space-y-2">
      <textarea placeholder="每行一个技能（或用逗号分隔）..." value={skillsText}
        onChange={(e) => updateSkills(e.target.value)}
        rows={5}
        className="w-full px-3 py-2 text-sm border border-black dark:border-white rounded-md outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-background resize-y min-h-[100px]" />
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted rounded-full">{skill}</span>
        ))}
      </div>
    </div>
  )
})

const TextBlockEditor = React.memo(({ block, placeholder }: { block: ResumeBlock; placeholder: string }) => {
  const updateBlock = useResumeStore((s) => s.updateBlock)
  const pageLayout = useResumeStore((s) => s.pageLayout)
  const text = (block.content?.text as string) ?? ''

  return (
    <TiptapEditor
      value={text}
      onChange={(v) => updateBlock(block.id, { content: { text: v } })}
      placeholder={placeholder}
      fontSize={pageLayout?.fontSize}
      lineHeight={pageLayout?.lineHeight}
      paragraphSpacing={pageLayout?.paragraphSpacing}
    />
  )
})
