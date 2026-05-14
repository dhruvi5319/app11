import type { Task } from '../../types/task'
import styles from './TaskItem.module.css'

interface TaskItemProps {
  task: Task
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle?.(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        className={styles.checkbox}
      />
      <span className={task.completed ? styles.titleCompleted : styles.title}>
        {task.title}
      </span>
      <button
        type="button"
        onClick={() => onDelete?.(task.id)}
        aria-label={`Delete "${task.title}"`}
        className={styles.deleteButton}
      >
        Delete
      </button>
    </li>
  )
}
