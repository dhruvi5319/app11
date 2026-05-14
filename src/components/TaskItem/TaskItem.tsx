import { useRef, useEffect, useState } from 'react'
import type { Task } from '../../types/task'
import styles from './TaskItem.module.css'

interface TaskItemProps {
  task: Task
  onToggle?: (id: string) => void
  onDelete?: (id: string) => void
  isEditing?: boolean
  onEdit?: (id: string, newTitle: string) => void
  onCancelEdit?: (id: string) => void
  onStartEdit?: (id: string) => void
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  isEditing = false,
  onEdit,
  onCancelEdit,
  onStartEdit,
}: TaskItemProps) {
  const [editValue, setEditValue] = useState(task.title)
  const [editError, setEditError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // When entering edit mode, reset value and focus input
  useEffect(() => {
    if (isEditing) {
      setEditValue(task.title)
      setEditError('')
      // Focus after render
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isEditing, task.title])

  function handleConfirm() {
    const trimmed = editValue.trim()
    if (!trimmed) {
      setEditError('Title cannot be empty')
      return
    }
    setEditError('')
    onEdit?.(task.id, trimmed)
  }

  function handleCancel() {
    setEditError('')
    onCancelEdit?.(task.id)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    // Cancel on blur unless focus moved to the save/cancel buttons within the item
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (relatedTarget && relatedTarget.dataset.editAction) {
      return
    }
    handleCancel()
  }

  if (isEditing) {
    return (
      <li className={styles.item}>
        <div className={styles.editRow}>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value)
              if (editError) setEditError('')
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={`${styles.editInput}${task.completed ? ` ${styles.editInputCompleted}` : ''}`}
            aria-label={`Edit title for "${task.title}"`}
          />
          <button
            type="button"
            data-edit-action="save"
            onClick={handleConfirm}
            className={styles.saveButton}
          >
            Save
          </button>
          <button
            type="button"
            data-edit-action="cancel"
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
        {editError && <p className={styles.editError} role="alert">{editError}</p>}
      </li>
    )
  }

  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle?.(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        className={styles.checkbox}
      />
      <button
        type="button"
        onClick={() => onStartEdit?.(task.id)}
        className={task.completed ? styles.titleButtonCompleted : styles.titleButton}
        aria-label={`Edit "${task.title}"`}
      >
        {task.title}
      </button>
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
