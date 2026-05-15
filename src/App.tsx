import { useState, useEffect, useCallback } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks'
import type { Task } from './types/task'
import { CreateTaskInput } from './components/CreateTaskInput/CreateTaskInput'
import { TaskList } from './components/TaskList/TaskList'
import styles from './App.module.css'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  useEffect(() => {
    setTasks(getTasks())
  }, [])

  const handleCreate = useCallback((title: string) => {
    createTask(title)
    setTasks(getTasks())
  }, [])

  const handleToggle = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    updateTask(id, { completed: !task.completed })
    setTasks(getTasks())
  }, [tasks])

  const handleDelete = useCallback((id: string) => {
    deleteTask(id)
    setTasks(getTasks())
    // If the deleted task was being edited, clear edit state
    setEditingTaskId((prev) => (prev === id ? null : prev))
  }, [])

  const handleStartEdit = useCallback((id: string) => {
    setEditingTaskId(id)
  }, [])

  const handleEdit = useCallback((id: string, newTitle: string) => {
    updateTask(id, { title: newTitle })
    setTasks(getTasks())
    setEditingTaskId(null)
  }, [])

  const handleCancelEdit = useCallback((_id: string) => {
    setEditingTaskId(null)
  }, [])

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>TaskTracker</h1>
      <CreateTaskInput onCreate={handleCreate} />
      <TaskList
        tasks={tasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
        editingId={editingTaskId}
        onStartEdit={handleStartEdit}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
      />
    </main>
  )
}

export default App
