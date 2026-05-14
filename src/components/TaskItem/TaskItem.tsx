import type { Task } from '../../types/task'
import styles from './TaskItem.module.css'

interface TaskItemProps {
  task: Task
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        checked={task.completed}
        readOnly
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        className={styles.checkbox}
      />
      <span className={task.completed ? styles.titleCompleted : styles.title}>
        {task.title}
      </span>
    </li>
  )
}
