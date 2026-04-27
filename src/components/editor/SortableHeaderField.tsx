import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import type { HeaderField } from '@/types/resume'
import { FieldIconPicker } from './FieldIconPicker'

interface SortableHeaderFieldProps {
  field: HeaderField
  onUpdateValue: (value: string) => void
  onUpdateIcon: (icon: string) => void
  onUpdateLabel?: (label: string) => void
  onRemove: () => void
  fixed?: boolean
}

export function SortableHeaderField({
  field,
  onUpdateValue,
  onUpdateIcon,
  onUpdateLabel,
  onRemove,
  fixed = false,
}: SortableHeaderFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key, disabled: fixed })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  const isCustom = field.key.startsWith('custom_')

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(fixed ? {} : attributes)}
      className="flex items-center gap-2 group"
    >
      {fixed ? (
        <div className="w-4 shrink-0" />
      ) : (
        <div
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-manipulation shrink-0 select-none p-1"
          title="拖拽排序"
          {...listeners}
        >
          <GripVertical className="size-4" />
        </div>
      )}
      <FieldIconPicker value={field.icon} onChange={onUpdateIcon} disabled={fixed} />
      {isCustom && onUpdateLabel ? (
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdateLabel(e.target.value)}
          className="text-xs text-muted-foreground w-16 shrink-0 text-right bg-transparent border-b border-transparent hover:border-muted-foreground focus:border-primary outline-none"
        />
      ) : (
        <label className="text-xs text-muted-foreground w-10 shrink-0 text-right select-none hidden sm:block">
          {field.label}
        </label>
      )}
      <input
        type={field.type}
        placeholder={field.label}
        value={field.value}
        onChange={(e) => onUpdateValue(e.target.value)}
        className="flex-1 px-2.5 py-1.5 text-sm border rounded-md outline-none focus:ring-2 focus:ring-ring bg-background min-w-0 min-h-[40px] sm:min-h-0"
      />
      {fixed ? (
        <div className="w-5 shrink-0" />
      ) : (
        <button
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 p-1"
          onClick={onRemove}
          title={`移除${field.label}`}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}
