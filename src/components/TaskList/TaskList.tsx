import type { Task } from '../../types/task'
import { TaskItem } from '../TaskItem/TaskItem'
import styles from './TaskList.module.css'

interface TaskListProps {
  tasks: Task[]
}

const EMPTY_MESSAGE = 'No tasks yet. Add one above!'

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className={styles.empty}>{EMPTY_MESSAGE}</p>
    )
  }

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  )
}
