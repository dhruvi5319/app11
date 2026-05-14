import { useState, useRef } from 'react'
import { InlineError } from '../ui/InlineError'
import styles from './CreateTaskInput.module.css'

const MAX_TITLE_LENGTH = 500
const ERROR_ID = 'create-task-error'

interface CreateTaskInputProps {
  onCreate: (title: string) => void
}

export function CreateTaskInput({ onCreate }: CreateTaskInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function validate(value: string): string | null {
    const trimmed = value.trim()
    if (trimmed.length === 0) return 'Task title is required.'
    if (trimmed.length > MAX_TITLE_LENGTH) return 'Task title must be 500 characters or fewer.'
    return null
  }

  function handleSubmit() {
    const validationError = validate(inputValue)
    if (validationError) {
      setError(validationError)
      inputRef.current?.focus()
      return
    }
    onCreate(inputValue.trim())
    setInputValue('')
    setError(null)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    if (error) setError(null)  // clear error on any input change
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task…"
          aria-label="New task title"
          aria-describedby={error ? ERROR_ID : undefined}
          className={styles.input}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className={styles.button}
        >
          Add Task
        </button>
      </div>
      {error && <InlineError message={error} id={ERROR_ID} />}
    </div>
  )
}
