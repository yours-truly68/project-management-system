"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Column } from "@/features/columns/types/column.types";
import { Task } from "@/features/tasks/types/task.types";
import { WorkspaceMemberDetailed } from "@/features/workspaces/types/workspace.types";
import { ColumnActionsMenu } from "@/features/columns/components/column-actions-menu";
import { TaskCard } from "@/features/tasks/components/task-card";
import { ColumnEmptyState } from "@/features/columns/components/column-empty-state";
import { useReorderColumns } from "@/features/columns/hooks/use-columns";
import { useMoveTask, useReorderTasks } from "@/features/tasks/hooks/use-tasks";

interface BoardViewProps {
  boardId: string;
  columns: Column[];
  tasksByColumn: Record<string, Task[]>;
  members: WorkspaceMemberDetailed[];
  canManageBoard: boolean;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTask: (columnId: string) => void;
  onSelectTask: (task: Task) => void;
  getColumnColor: (name: string, defaultColor: string | null) => string;
  columnRefs?: React.RefObject<Record<string, HTMLDivElement | null>>;
}

export function BoardView({
  boardId,
  columns,
  tasksByColumn,
  members,
  canManageBoard,
  onEditColumn,
  onDeleteColumn,
  onAddTask,
  onSelectTask,
  getColumnColor,
  columnRefs,
}: BoardViewProps) {
  const { mutate: reorderColumns } = useReorderColumns(boardId);
  const { mutate: moveTask } = useMoveTask(boardId);
  const { mutate: reorderTasks } = useReorderTasks(boardId);

  // SSR Hydration guard — must be declared before scroll hooks so they can reference it
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Local synchronous state for DND to prevent snap-back / rollup animations
  const [localColumns, setLocalColumns] = React.useState<Column[]>(columns);
  const [prevColumns, setPrevColumns] = React.useState<Column[]>(columns);

  const [localTasksByColumn, setLocalTasksByColumn] = React.useState<Record<string, Task[]>>(tasksByColumn);
  const [prevTasksByColumn, setPrevTasksByColumn] = React.useState<Record<string, Task[]>>(tasksByColumn);

  if (columns !== prevColumns) {
    setLocalColumns(columns);
    setPrevColumns(columns);
  }

  if (tasksByColumn !== prevTasksByColumn) {
    setLocalTasksByColumn(tasksByColumn);
    setPrevTasksByColumn(tasksByColumn);
  }

  const sortedColumns = React.useMemo(() => {
    return [...localColumns].sort((a, b) => a.position - b.position);
  }, [localColumns]);

  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const dragInfoRef = React.useRef<{
    isDragging: boolean;
    pointerX: number;
  }>({
    isDragging: false,
    pointerX: 0,
  });

  const scrollIntervalRef = React.useRef<number | null>(null);

  const startAutoScrollLoop = () => {
    if (scrollIntervalRef.current) return;

    const loop = () => {
      if (!dragInfoRef.current.isDragging || !scrollContainerRef.current) {
        stopAutoScrollLoop();
        return;
      }

      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();
      const pointerX = dragInfoRef.current.pointerX;

      const threshold = 120; // start auto scroll when within 120px of boundaries
      const maxSpeed = 16;   // max pixels to scroll per frame

      const distToRight = rect.right - pointerX;
      const distToLeft = pointerX - rect.left;

      if (distToRight > 0 && distToRight < threshold) {
        const ratio = (threshold - distToRight) / threshold;
        const speed = Math.round(maxSpeed * ratio);
        container.scrollLeft += speed;
      } else if (distToLeft > 0 && distToLeft < threshold) {
        const ratio = (threshold - distToLeft) / threshold;
        const speed = Math.round(maxSpeed * ratio);
        container.scrollLeft -= speed;
      }

      scrollIntervalRef.current = requestAnimationFrame(loop);
    };

    scrollIntervalRef.current = requestAnimationFrame(loop);
  };

  const stopAutoScrollLoop = () => {
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    dragInfoRef.current.pointerX = e.clientX;
  };

  const handleDragStart = () => {
    dragInfoRef.current.isDragging = true;
    window.addEventListener("pointermove", handlePointerMove);
    startAutoScrollLoop();
  };

  const handleDragEndInternal = (result: DropResult) => {
    dragInfoRef.current.isDragging = false;
    window.removeEventListener("pointermove", handlePointerMove);
    stopAutoScrollLoop();
    handleDragEnd(result);
  };

  // Convert mouse wheel vertical movement to horizontal scroll on the board container
  // Fires after mount so scrollContainerRef.current is populated
  React.useEffect(() => {
    if (!mounted) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaX === 0 && e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [mounted]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
      }
    };
  }, []);


  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const orderedIds = sortedColumns.map((c) => c.id);
      const [removed] = orderedIds.splice(source.index, 1);
      orderedIds.splice(destination.index, 0, removed);

      // 1. Update local state synchronously to prevent snap-back
      const idToIndex = new Map(orderedIds.map((id, index) => [id, index]));
      const newColumns = localColumns.map((col) => {
        const newIndex = idToIndex.get(col.id);
        return newIndex !== undefined ? { ...col, position: newIndex } : col;
      }).sort((a, b) => a.position - b.position);

      setLocalColumns(newColumns);

      // 2. Trigger asynchronous background mutation
      reorderColumns({ ordered_ids: orderedIds });
    } else if (type === "TASK") {
      const taskId = draggableId;
      const sourceColId = source.droppableId;
      const destColId = destination.droppableId;

      if (sourceColId === destColId) {
        const columnTasks = localTasksByColumn[sourceColId] || [];
        const sortedColumnTasks = [...columnTasks].sort((a, b) => a.position - b.position);
        const orderedIds = sortedColumnTasks.map((t) => t.id);
        const [removed] = orderedIds.splice(source.index, 1);
        orderedIds.splice(destination.index, 0, removed);

        // 1. Update local state synchronously to prevent snap-back
        const positionMap = new Map(orderedIds.map((id, index) => [id, index]));
        const updatedTasks = columnTasks.map((task) => {
          const newPos = positionMap.get(task.id);
          return newPos !== undefined ? { ...task, position: newPos } : task;
        }).sort((a, b) => a.position - b.position);

        setLocalTasksByColumn((prev) => ({
          ...prev,
          [sourceColId]: updatedTasks,
        }));

        // 2. Trigger asynchronous background mutation
        reorderTasks({ columnId: sourceColId, orderedIds });
      } else {
        const sourceTasks = (localTasksByColumn[sourceColId] || [])
          .filter((t) => t.id !== taskId)
          .sort((a, b) => a.position - b.position);

        const targetTasks = (localTasksByColumn[destColId] || [])
          .sort((a, b) => a.position - b.position);

        const movedTask = (localTasksByColumn[sourceColId] || []).find((t) => t.id === taskId);
        if (!movedTask) return;

        const optimisticMovedTask = {
          ...movedTask,
          column_id: destColId,
        };

        const updatedTargetTasks = [...targetTasks];
        const targetIndex = Math.max(0, Math.min(destination.index, updatedTargetTasks.length));
        updatedTargetTasks.splice(targetIndex, 0, optimisticMovedTask);

        // Re-index positions
        const reindexedSource = sourceTasks.map((t, idx) => ({ ...t, position: idx }));
        const reindexedTarget = updatedTargetTasks.map((t, idx) => ({ ...t, position: idx }));

        // 1. Update local state synchronously to prevent snap-back
        setLocalTasksByColumn((prev) => ({
          ...prev,
          [sourceColId]: reindexedSource,
          [destColId]: reindexedTarget,
        }));

        // 2. Trigger asynchronous background mutation
        moveTask({
          taskId,
          column_id: destColId,
          position: destination.index,
        });
      }
    }
  };

  if (sortedColumns.length === 0) {
    return <ColumnEmptyState boardId={boardId} />;
  }

  // Pre-hydration rendering fallback (static elements)
  if (!mounted) {
    const fallbackSortedColumns = [...columns].sort((a, b) => a.position - b.position);
    return (
      <div
        ref={scrollContainerRef}
        className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-3 select-none"
      >
        {fallbackSortedColumns.map((column) => (
          <div
            key={column.id}
            ref={(el) => {
              if (columnRefs?.current) {
                columnRefs.current[column.id] = el;
              }
            }}
            className="flex flex-col bg-column-surface rounded-[18px] border border-border p-4 space-y-4 flex-1 min-w-[320px] max-w-none h-full overflow-hidden shadow-sm animate-fade-in"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-1 select-none shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getColumnColor(column.name, column.color) }}
                />
                <h3 className="text-base font-bold text-foreground/90 tracking-tight truncate flex items-center gap-2">
                  <span>{column.name}</span>
                  <span className="text-xs font-semibold text-secondary-text px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                    {tasksByColumn[column.id]?.length || 0}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <ColumnActionsMenu
                  canManage={canManageBoard}
                  onEdit={() => onEditColumn(column)}
                  onDelete={() => onDeleteColumn(column.id)}
                />
              </div>
            </div>

            {/* Add Task CTA */}
            {canManageBoard && (
              <button
                onClick={() => onAddTask(column.id)}
                className="w-full h-11 bg-accent border border-border hover:bg-card-hover rounded-xl flex items-center justify-center transition-all text-foreground hover:text-foreground cursor-pointer shrink-0 gap-2 text-sm font-semibold"
                aria-label="Add Task"
              >
                <Plus className="w-4 h-4 text-foreground/80" />
                <span>Add Task</span>
              </button>
            )}

            {/* Column Task List Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 min-h-0">
              {!tasksByColumn[column.id] || tasksByColumn[column.id].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-border/30 rounded-xl select-none text-center h-full justify-center my-auto">
                  <span className="text-sm font-semibold text-muted-foreground/50">No tasks in this stage</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...tasksByColumn[column.id]]
                    .sort((a, b) => a.position - b.position)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        columnName={column.name}
                        onClick={() => onSelectTask(task)}
                        members={members}
                        boardId={boardId}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Interactive Drag & Drop rendering
  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEndInternal}>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              scrollContainerRef.current = el;
            }}
            {...provided.droppableProps}
            className="flex-1 flex gap-4 overflow-x-auto min-h-0 pb-3 select-none"
          >
            {sortedColumns.map((column, colIndex) => (
              <Draggable key={column.id} draggableId={column.id} index={colIndex}>
                {(colProvided) => (
                  <div
                    ref={(el) => {
                      colProvided.innerRef(el);
                      if (columnRefs?.current) {
                        columnRefs.current[column.id] = el;
                      }
                    }}
                    {...colProvided.draggableProps}
                    style={colProvided.draggableProps.style as React.CSSProperties}
                    className="flex flex-col bg-column-surface rounded-[18px] border border-border p-4 space-y-4 flex-1 min-w-[320px] max-w-none h-full overflow-hidden shadow-sm animate-fade-in"
                  >
                    {/* Column Header */}
                    <div
                      {...colProvided.dragHandleProps}
                      className="flex items-center justify-between pb-1 select-none shrink-0 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: getColumnColor(column.name, column.color),
                          }}
                        />
                        <h3 className="text-base font-bold text-foreground/90 tracking-tight truncate flex items-center gap-2">
                          <span>{column.name}</span>
                          <span className="text-xs font-semibold text-secondary-text px-2 py-0.5 rounded-full bg-background/50 border border-border/40 font-mono">
                            {localTasksByColumn[column.id]?.length || 0}
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <ColumnActionsMenu
                          canManage={canManageBoard}
                          onEdit={() => onEditColumn(column)}
                          onDelete={() => onDeleteColumn(column.id)}
                        />
                      </div>
                    </div>

                    {/* Add Task CTA */}
                    {canManageBoard && (
                      <button
                        onClick={() => onAddTask(column.id)}
                        className="w-full h-11 bg-accent border border-border hover:bg-card-hover rounded-xl flex items-center justify-center transition-all text-foreground hover:text-foreground cursor-pointer shrink-0 gap-2 text-sm font-semibold"
                        aria-label="Add Task"
                      >
                        <Plus className="w-4 h-4 text-foreground/80" />
                        <span>Add Task</span>
                      </button>
                    )}

                    {/* Column Task List Area */}
                    <Droppable droppableId={column.id} type="TASK" direction="vertical">
                      {(taskProvided) => (
                        <div
                          ref={taskProvided.innerRef}
                          {...taskProvided.droppableProps}
                          className="flex-1 overflow-y-auto pr-0.5 min-h-[150px]"
                        >
                          {!localTasksByColumn[column.id] || localTasksByColumn[column.id].length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-border/30 rounded-xl select-none text-center h-full justify-center my-auto min-h-[100px]">
                              <span className="text-sm font-semibold text-muted-foreground/50">
                                No tasks in this stage
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-3 pb-4">
                              {[...localTasksByColumn[column.id]]
                                .sort((a, b) => a.position - b.position)
                                .map((task, taskIndex) => (
                                  <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                                    {(taskProvidedDrag) => (
                                      <div
                                        ref={taskProvidedDrag.innerRef}
                                        {...taskProvidedDrag.draggableProps}
                                        {...taskProvidedDrag.dragHandleProps}
                                        style={taskProvidedDrag.draggableProps.style as React.CSSProperties}
                                      >
                                        <TaskCard
                                          task={task}
                                          columnName={column.name}
                                          onClick={() => onSelectTask(task)}
                                          members={members}
                                          boardId={boardId}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                            </div>
                          )}
                          {taskProvided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default BoardView;
