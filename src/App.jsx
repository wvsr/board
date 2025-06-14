import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Grip, Trash2 } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove, // Will be used in handleDragEnd
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// New SortableTaskItem component
const SortableTaskItem = ({ task, columnKey, getTaskColor, isOverdue, openDetailsModal, deleteTask }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1, // Slightly less transparent
    zIndex: isDragging ? 10 : 'auto', // Ensure dragged item is on top
    boxShadow: isDragging ? '0px 5px 15px rgba(0,0,0,0.3)' : 'none', // Add shadow when dragging
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openDetailsModal(task)}
      className={`${getTaskColor(
        task
      )} p-3 rounded shadow-sm cursor-grab transition flex items-start space-x-2 relative group`}
    >
      {/* Using Grip from lucide-react, ensure cursor-grab is effective */}
      <Grip className='w-4 h-4 text-gray-400 mt-1 drag-handle cursor-grab' />
      <div className='flex-grow'>
        <h3 className='font-mono font-semibold text-gray-100 cursor-pointer'>
          {task.name}
        </h3>
        {task.description && (
          <p className='text-sm text-gray-400'>{task.description}</p>
        )}
        {task.date && (
          <p
            className={`text-xs ${
              isOverdue(task.date) ? 'text-red-400' : 'text-gray-500'
            }`}
          >
            {task.date}
          </p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation() // Important to prevent triggering onClick of the main div
          deleteTask(columnKey, task.id)
        }}
        className='absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition'
      >
        <Trash2 className='w-4 h-4' />
      </button>
    </div>
  )
}

const TodoApp = () => {
  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem('todoColumns')
    return savedColumns
      ? JSON.parse(savedColumns)
      : {
          plan: [],
          doing: [],
          done: [],
        }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentColumn, setCurrentColumn] = useState('plan')
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTaskId, setActiveTaskId] = useState(null) // Optional: for styling active drag item

  // Ref for task name input and columns
  const taskNameInputRef = useRef(null)
  const descRef = useRef(null)
  // columnsRef is no longer needed for focus with dnd-kit's keyboard sensors for column focus itself
  // Individual task items will get focus through dnd-kit's keyboard sensor interactions
  // const columnsRef = useRef({
  //   plan: useRef(null),
  //   doing: useRef(null),
  //   done: useRef(null),
  // })

  // Calculate total completed tasks
  const totalCompletedTasks = columns.done.length

  // Determine if a task is overdue
  const isOverdue = (taskDate) => {
    const today = new Date()
    const taskDateObj = new Date(taskDate)
    return (
      taskDateObj < today && taskDateObj.toDateString() !== today.toDateString()
    )
  }

  // Task color based on date
  const getTaskColor = (task) => {
    if (isOverdue(task.date)) {
      return 'bg-red-900/30 hover:bg-red-900/40'
    }
    return 'bg-gray-700 hover:bg-gray-600'
  }

  useEffect(() => {
    setNewTask({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    })
    if (taskNameInputRef) taskNameInputRef.current?.focus()
  }, [isModalOpen])
  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todoColumns', JSON.stringify(columns))
  }, [columns])

  // Keyboard navigation and shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open modal for plan column when '/' is pressed
      if (e.key === '/' && !isModalOpen) {
        e.preventDefault()
        openModal('plan')
        setTimeout(() => taskNameInputRef.current?.focus(), 100)
      }

      // Create task on Ctrl + Enter when modal is open
      if (e.key === 'Enter' && isModalOpen) {
        if (e.key === 'Enter' && e.shiftKey && isModalOpen) {
          descRef.current.focus()
        } else {
          addTask()
        }
      }

      // Close modal on Escape
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }

      // Vim-like keyboard navigation between columns (Alt+H,J,K)
      // This specific navigation is not directly replicated by dnd-kit's default keyboard navigation.
      // dnd-kit provides keyboard navigation for items within and between sortable lists (e.g. using Tab, Space, Arrow keys).
      // If column-to-column focus with Alt keys is still desired, it would need a separate implementation.
      // For now, we rely on dnd-kit's built-in accessibility for items.
      // if (e.altKey) {
      //   switch (e.key) {
      //     case 'h':
      //       columnsRef.current.plan.current?.focus()
      //       break
      //     case 'j':
      //       columnsRef.current.doing.current?.focus()
      //       break
      //     case 'k':
      //       columnsRef.current.done.current?.focus()
      //       break
      //   }
      // }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, newTask])

  const addTask = () => {
    if (!newTask.name) {
      alert('Task name is required')
      return
    }

    setColumns((prev) => ({
      ...prev,
      [currentColumn]: [
        ...prev[currentColumn],
        {
          id: Date.now(),
          ...newTask,
        },
      ],
    }))

    // Reset modal
    setNewTask({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    })
    setIsModalOpen(false)
  }

  const deleteTask = (columnKey, taskId) => {
    setColumns((prev) => ({
      ...prev,
      [columnKey]: prev[columnKey].filter((t) => t.id !== taskId),
    }))
  }

  // Helper to find which column a task belongs to
  const findColumn = (taskId) => {
    if (!taskId) return null;
    const columnKeys = Object.keys(columns);
    for (const key of columnKeys) {
      if (columns[key].find(task => task.id === taskId)) {
        return key;
      }
    }
    return null;
  }

  const dndHandleDragStart = (event) => {
    const { active } = event;
    setActiveTaskId(active.id);
  }

  // The old HTML5 drag and drop functions (handleDragStart, handleDragOver, handleDrop)
  // are now fully replaced by dnd-kit's context and handlers.
  // They can be safely removed.

  const openModal = (column) => {
    setCurrentColumn(column)
    setIsModalOpen(true)
  }

  const openDetailsModal = (task) => {
    setSelectedTask(task)
    setIsDetailsModalOpen(true)
  }

  const renderColumn = (title, columnKey) => {
    const taskIds = columns[columnKey].map(task => task.id.toString()); // Ensure IDs are strings for dnd-kit

    const sourceColumnOfActiveTask = activeTaskId ? findColumn(activeTaskId) : null;
    const isDropTargetColumn = activeTaskId && sourceColumnOfActiveTask && sourceColumnOfActiveTask !== columnKey;

    return (
      <div
        // ref={columnsRef.current[columnKey]} // Not needed for column focus with dnd-kit
        // tabIndex={0} // Not needed for column focus
        className={`bg-gray-800 text-gray-200 rounded-lg p-4 space-y-2 flex flex-col h-full transition-colors duration-150 ease-in-out ${
          isDropTargetColumn ? 'bg-gray-700/50' : '' // Subtle background change if it's a drop target
        }`}
        // Old onDragOver and onDrop are removed as dnd-kit handles this via DndContext and SortableContext.
      >
        <h2 className='text-xl font-mono font-bold text-center mb-4 text-gray-100'>
          {title}
        </h2>

        <button
          onClick={() => openModal(columnKey)}
          className='w-full bg-blue-700 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center space-x-2 transition mb-2' // Added mb-2
        >
          <Plus className='w-5 h-5' />
          <span>Add Task</span>
        </button>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 flex-grow"> {/* Added flex-grow to allow this div to take space for sorting */}
            {columns[columnKey].map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                columnKey={columnKey}
                getTaskColor={getTaskColor}
                isOverdue={isOverdue}
                openDetailsModal={openDetailsModal}
                deleteTask={deleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    )
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dndHandleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTaskId(null); // Clear active task ID

    if (!over) {
      console.log("Drag ended outside a droppable area");
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    console.log(`Drag End: active.id=${activeId}, over.id=${overId}`);


    const sourceColumnKey = findColumn(activeId);
    // Determine destination column: could be a column ID directly or the column of the task `overId`
    let destinationColumnKey = Object.keys(columns).includes(overId) ? overId : findColumn(overId);

    if (!sourceColumnKey) {
        console.error("Could not find source column for activeId:", activeId);
        return;
    }

    // If dropped on a column but not a specific task, and that column is not the source column
    // This can happen if over.id is 'plan', 'doing', 'done'
    if (Object.keys(columns).includes(overId) && !destinationColumnKey) {
        destinationColumnKey = overId;
    } else if (!destinationColumnKey && overId) { // Dropped on a task, find its column
        destinationColumnKey = findColumn(overId);
    }


    if (!destinationColumnKey) {
        console.error("Could not determine destination column for overId:", overId);
        return;
    }

    const draggedTask = columns[sourceColumnKey].find(task => task.id === activeId);
    if (!draggedTask) {
        console.error("Could not find dragged task in source column");
        return;
    }

    // Scenario 1: Reordering within the same column
    if (sourceColumnKey === destinationColumnKey) {
      if (activeId === overId) return; // Dropped on itself, no change

      setColumns(prev => {
        const columnTasks = [...prev[sourceColumnKey]];
        const oldIndex = columnTasks.findIndex(task => task.id === activeId);
        const newIndex = columnTasks.findIndex(task => task.id === overId);

        if (oldIndex === -1 || newIndex === -1) {
            console.error("Task not found in column for reordering");
            return prev; // Or handle error appropriately
        }
        return {
          ...prev,
          [sourceColumnKey]: arrayMove(columnTasks, oldIndex, newIndex),
        };
      });
    } else {
      // Scenario 2: Moving to a different column
      setColumns(prev => {
        const sourceItems = [...prev[sourceColumnKey]];
        const destinationItems = [...prev[destinationColumnKey]];

        const draggedItemIndexInSource = sourceItems.findIndex(item => item.id === activeId);
        // const [draggedItem] = sourceItems.splice(draggedItemIndexInSource, 1); // This was mutating sourceItems too early

        const newSourceItems = sourceItems.filter(item => item.id !== activeId);


        let targetIndexInDestination;
        // If overId is a column ID, append to the end of that column.
        // Otherwise, it's a task ID, so find its index.
        if (Object.keys(columns).includes(overId)) { // Dropped directly on a column container
            targetIndexInDestination = destinationItems.length;
        } else { // Dropped on another task
            targetIndexInDestination = destinationItems.findIndex(item => item.id === overId);
            if (targetIndexInDestination === -1) { // Fallback if overId task not found (should not happen)
                targetIndexInDestination = destinationItems.length;
            }
        }

        const newDestinationItems = [...destinationItems];
        newDestinationItems.splice(targetIndexInDestination, 0, draggedTask);

        return {
          ...prev,
          [sourceColumnKey]: newSourceItems,
          [destinationColumnKey]: newDestinationItems,
        };
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={dndHandleDragStart} onDragEnd={dndHandleDragEnd}>
      <div className='min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col'>
        <div className='container mx-auto flex-grow'>
          <h1 className='text-3xl font-mono font-bold text-center mb-8 text-gray-100'>
            Todo List
          </h1>

          <div className='grid grid-cols-3 gap-6'>
            {renderColumn('Plan', 'plan')}
            {renderColumn('Doing', 'doing')}
            {renderColumn('Done', 'done')}
          </div>
        </div>

        {/* Footer with task completion count */}
        <footer className='text-center text-gray-500 mt-6 text-sm font-mono'>
          Total Tasks Completed: {totalCompletedTasks}
        </footer>

        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div
              className='fixed inset-0 bg-transparent z-20'
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className='bg-gray-800 text-gray-100 rounded-lg p-6 w-96 relative z-30'>
            <button
              onClick={() => setIsModalOpen(false)}
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-200'
            >
              <X className='w-6 h-6' />
            </button>
            <h2 className='text-xl font-mono font-bold mb-4 text-gray-100'>
              Create New Task
            </h2>

            <input
              ref={taskNameInputRef}
              type='text'
              placeholder='Task Name'
              value={newTask.name}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, name: e.target.value }))
              }
              className='w-full p-2 rounded mb-4 font-mono bg-gray-700 text-gray-100 border-gray-600'
            />

            <textarea
              placeholder='Description (Optional)'
              ref={descRef}
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
              className='w-full p-2 rounded mb-4 font-mono bg-gray-700 text-gray-100 border-gray-600'
              rows='3'
            />

            <input
              type='date'
              value={newTask.date}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, date: e.target.value }))
              }
              className='w-full p-2 rounded mb-4 font-mono bg-gray-700 text-gray-100 border-gray-600'
            />

            <button
              onClick={addTask}
              className='w-full bg-blue-700 hover:bg-blue-600 text-white py-2 rounded transition font-mono'
            >
              Save Task
            </button>
            </div>
          </div>
        )}

        {/* Task Details Modal */}
        {isDetailsModalOpen && selectedTask && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div
              className='fixed inset-0 bg-transparent z-20'
              onClick={() => {
                setIsDetailsModalOpen(false)
                setSelectedTask(null)
              }}
            ></div>
            <div className='bg-gray-800 text-gray-100 rounded-lg p-6 w-96 relative z-30 max-w-md mx-auto'>
            <button
              onClick={() => {
                setIsDetailsModalOpen(false)
                setSelectedTask(null)
              }}
              className='absolute top-3 right-3 text-gray-400 hover:text-gray-200'
            >
              <X className='w-6 h-6' />
            </button>
            <h2 className='text-xl font-mono font-bold mb-4 text-gray-100'>
              {selectedTask.name}
            </h2>
            {selectedTask.description && (
              <p className='text-sm text-gray-300 mb-2 whitespace-pre-wrap break-words'>
                {selectedTask.description}
              </p>
            )}
            {selectedTask.date && (
              <p
                className={`text-xs font-mono ${
                  isOverdue(selectedTask.date)
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`}
              >
                Due Date: {selectedTask.date}
                {isOverdue(selectedTask.date) && (
                  <span className='italic'> (Overdue)</span>
                )}
              </p>
            )}
            </div>
          </div>
        )}
      </div>
    </DndContext>
  )
}

export default TodoApp
