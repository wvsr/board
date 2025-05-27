import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, Grip, Trash2 } from 'lucide-react'

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

  // Ref for task name input and columns
  const taskNameInputRef = useRef(null)
  const descRef = useRef(null)
  const columnsRef = useRef({
    plan: useRef(null),
    doing: useRef(null),
    done: useRef(null),
  })

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

      // Vim-like keyboard navigation between columns
      if (e.altKey) {
        switch (e.key) {
          case 'h':
            columnsRef.current.plan.current?.focus()
            break
          case 'j':
            columnsRef.current.doing.current?.focus()
            break
          case 'k':
            columnsRef.current.done.current?.focus()
            break
        }
      }
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

  const handleDragStart = (e, task, columnKey) => {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ task, fromColumn: columnKey })
    )
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, toColumn) => {
    e.preventDefault()
    const { task, fromColumn } = JSON.parse(
      e.dataTransfer.getData('text/plain')
    )

    // Remove from original column
    setColumns((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter((t) => t.id !== task.id),
    }))

    // Add to new column
    setColumns((prev) => ({
      ...prev,
      [toColumn]: [...prev[toColumn], task],
    }))
  }

  const openModal = (column) => {
    setCurrentColumn(column)
    setIsModalOpen(true)
  }

  const openDetailsModal = (task) => {
    setSelectedTask(task)
    setIsDetailsModalOpen(true)
  }

  const renderColumn = (title, columnKey) => (
    <div
      ref={columnsRef.current[columnKey]}
      tabIndex={0}
      className='bg-gray-800 text-gray-200 rounded-lg p-4 space-y-2 focus:outline-blue-500 focus:ring-2 focus:ring-blue-500'
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, columnKey)}
    >
      <h2 className='text-xl font-mono font-bold text-center mb-4 text-gray-100'>
        {title}
      </h2>

      <button
        onClick={() => openModal(columnKey)}
        className='w-full bg-blue-700 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center space-x-2 transition'
      >
        <Plus className='w-5 h-5' />
        <span>Add Task</span>
      </button>

      {columns[columnKey].map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task, columnKey)}
          onClick={() => openDetailsModal(task)}
          className={`${getTaskColor(
            task
          )} p-3 rounded shadow-sm cursor-pointer transition flex items-start space-x-2 relative group`}
        >
          <Grip className='w-4 h-4 text-gray-400 mt-1 drag-handle cursor-move' />
          <div className='flex-grow'>
            <h3 className='font-mono font-semibold text-gray-100'>
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
              e.stopPropagation()
              deleteTask(columnKey, task.id)
            }}
            className='absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ))}
    </div>
  )

  return (
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
  )
}

export default TodoApp
