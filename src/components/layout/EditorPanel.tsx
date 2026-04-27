import { useCallback } from 'react'
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
import { useResumeStore } from '@/store/resumeStore'
import { SortableBlockEditor } from '@/components/editor/SortableBlockEditor'

export function EditorPanel() {
  const blocks = useResumeStore((s) => s.blocks)
  const reorderBlocks = useResumeStore((s) => s.reorderBlocks)

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

      const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)
      const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id)
      const newIndex = sortedBlocks.findIndex((b) => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex)
      }
    },
    [blocks, reorderBlocks]
  )

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  return (
    <aside className="w-full lg:w-1/2 border-r bg-muted/30 overflow-y-auto">
      <div className="p-4 lg:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sortedBlocks.map((block) => (
                <SortableBlockEditor key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  )
}
