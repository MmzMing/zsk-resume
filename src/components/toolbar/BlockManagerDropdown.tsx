import { useCallback } from 'react'
import { Blocks, GripVertical, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResumeStore as useResumeStoreRaw } from '@/store/resumeStore'
import { generateId } from '@/lib/utils'
import type { BlockType, ResumeBlock } from '@/types/resume'

const ADDABLE_BLOCKS: { type: BlockType; label: string }[] = [
  { type: 'header', label: '个人信息' },
  { type: 'summary', label: '个人摘要' },
  { type: 'experience', label: '工作经历' },
  { type: 'education', label: '教育背景' },
  { type: 'skills', label: '技能特长' },
  { type: 'projects', label: '项目经历' },
  { type: 'languages', label: '语言能力' },
  { type: 'certifications', label: '证书资质' },
  { type: 'custom', label: '自定义模块' },
]

interface BlockManagerDropdownProps {
  blocks: ResumeBlock[]
  addBlock: (block: ResumeBlock) => void
}

export function BlockManagerDropdown({ blocks, addBlock }: BlockManagerDropdownProps) {
  const reorderBlocks = useResumeStoreRaw((s) => s.reorderBlocks)
  const removeBlock = useResumeStoreRaw((s) => s.removeBlock)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
  const selectedTypes = new Set(blocks.map((b) => b.type))
  const availableBlocks = ADDABLE_BLOCKS.filter((b) => !selectedTypes.has(b.type))

  const handleAddBlock = useCallback(
    (type: BlockType, label: string, e: Event) => {
      e.preventDefault()
      const existingTypes = new Set(blocks.map((b) => b.type))
      if (existingTypes.has(type)) return
      const id = generateId()
      addBlock({
        id,
        type,
        title: label,
        order: blocks.length,
        collapsed: false,
        lexicalJSON: null,
      })
    },
    [blocks, addBlock]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium hidden md:inline-flex">
          <Blocks className="size-3.5" />
          模块管理
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-[60vh] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>已选模块</span>
          <span className="text-xs text-muted-foreground font-normal">拖拽排序</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {sortedBlocks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event
              if (!over || active.id === over.id) return
              const fromIndex = sortedBlocks.findIndex((b) => b.id === active.id)
              const toIndex = sortedBlocks.findIndex((b) => b.id === over.id)
              if (fromIndex === -1 || toIndex === -1) return
              reorderBlocks(fromIndex, toIndex)
            }}
          >
            <SortableContext
              items={sortedBlocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedBlocks.map((block) => (
                <SortableBlockItem key={block.id} block={block} onRemove={removeBlock} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="px-4 py-3 text-xs text-muted-foreground">暂未选择任何模块</div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>未添加模块</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableBlocks.length > 0 ? (
          availableBlocks.map((b) => (
            <DropdownMenuItem
              key={b.type}
              onSelect={(e) => handleAddBlock(b.type, b.label, e)}
              className="text-foreground"
            >
              + {b.label}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-4 py-3 text-xs text-muted-foreground">所有模块已添加</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortableBlockItem({
  block,
  onRemove,
}: {
  block: ResumeBlock
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <DropdownMenuItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between gap-2 pr-2"
      onSelect={(e) => e.preventDefault()}
    >
      <span className="flex items-center gap-2 flex-1 min-w-0">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="truncate">{block.title}</span>
      </span>
      <button
        className="text-muted-foreground hover:text-destructive shrink-0 p-0.5 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(block.id)
        }}
        title="移除模块"
      >
        <X className="size-3.5" />
      </button>
    </DropdownMenuItem>
  )
}
