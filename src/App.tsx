import { useState, useEffect, useCallback } from 'react'
import { getTasks, createTask, updateTask } from './api/tasks'
import type { Task } from './types/task'
import { CreateTaskInput } from './components/CreateTaskInput/CreateTaskInput'
import { TaskList } from './components/TaskList/TaskList'
import styles from './App.module.css'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])

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

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>TaskTracker</h1>
      <CreateTaskInput onCreate={handleCreate} />
      <TaskList tasks={tasks} onToggle={handleToggle} />
    </main>
  )
}

export default App
