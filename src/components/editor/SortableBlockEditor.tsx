import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ResumeBlock } from '@/types/resume'
import { BlockEditor } from './BlockEditor'

interface SortableBlockEditorProps {
  block: ResumeBlock
}

export function SortableBlockEditor({ block }: SortableBlockEditorProps) {
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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockEditor block={block} dragHandleProps={listeners} />
    </div>
  )
}
