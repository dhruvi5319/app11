import type { Task } from '../../types/task'
import { TaskItem } from '../TaskItem/TaskItem'
import styles from './TaskList.module.css'

interface TaskListProps {
  tasks: Task[]
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
}

const EMPTY_MESSAGE = 'No tasks yet. Add one above!'

export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className={styles.empty}>{EMPTY_MESSAGE}</p>
    )
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
