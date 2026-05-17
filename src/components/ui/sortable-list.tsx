"use client"

import * as React from "react"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"

import type {
  DraggableProvided,
  DropResult,
  DroppableProvided,
} from "@hello-pangea/dnd"

import { cn } from "@/lib/utils"

export interface SortableListProps<T> {
  items: T[]
  /**
   * Called when a same-list reorder completes.
   * When `useExternalContext` is true, the parent's `DragDropContext` owns
   * `onDragEnd` and is responsible for routing drops; this callback is then
   * ignored. It is required only in the default, self-contained mode.
   */
  onReorder?: (items: T[]) => void
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode
  keyExtractor?: (item: T) => string
  direction?: "vertical" | "horizontal"
  className?: string
  listClassName?: string
  dragHandle?: boolean
  /**
   * Override the internal Droppable id. Required when multiple SortableLists
   * share a single DragDropContext (e.g. cross-module content moves), so the
   * parent's onDragEnd can route by `result.source.droppableId`.
   */
  droppableId?: string
  /**
   * Optional Droppable `type`. Drag interactions are only allowed between
   * Droppables of the same type. Pair lists you want to exchange items with
   * (e.g. `"content"` across modules); use a distinct type (e.g. `"module"`)
   * for lists that must stay isolated.
   */
  type?: string
  /**
   * When true, the component does NOT render its own DragDropContext or
   * handle drag-end. The parent must wrap consumers in a single
   * <DragDropContext> and own all routing. Existing call sites are
   * unaffected (default behavior is unchanged).
   */
  useExternalContext?: boolean
  /**
   * Receives the Droppable's snapshot so callers can react to drag-over
   * state (e.g. tint the target). Optional.
   */
  droppableClassName?: (isDraggingOver: boolean) => string
}

const DEFAULT_DROPPABLE_ID = "sortable-list"

export function SortableList<T extends { id?: string | number }>({
  items,
  onReorder,
  renderItem,
  keyExtractor = (item) => String(item.id),
  direction = "vertical",
  className,
  listClassName,
  droppableId = DEFAULT_DROPPABLE_ID,
  type,
  useExternalContext = false,
  droppableClassName,
}: SortableListProps<T>) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(sourceIndex, 1)
    newItems.splice(destinationIndex, 0, reorderedItem)

    onReorder?.(newItems)
  }

  const list = (
    <Droppable droppableId={droppableId} direction={direction} type={type}>
      {(provided: DroppableProvided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn(
            "flex",
            direction === "vertical" ? "flex-col gap-2" : "flex-row gap-2",
            droppableClassName?.(snapshot.isDraggingOver),
            className
          )}
        >
          <div
            className={cn(
              "flex w-full",
              direction === "vertical" ? "flex-col gap-2" : "flex-row gap-2",
              listClassName
            )}
          >
            {items.map((item, index) => (
              <Draggable
                key={keyExtractor(item)}
                draggableId={keyExtractor(item)}
                index={index}
              >
                {(provided: DraggableProvided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                    }}
                    className={cn(snapshot.isDragging && "z-50")}
                  >
                    {renderItem(item, index, snapshot.isDragging)}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )

  if (useExternalContext) {
    return list
  }

  return <DragDropContext onDragEnd={handleDragEnd}>{list}</DragDropContext>
}
