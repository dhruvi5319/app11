import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskItem } from './TaskItem'
import type { Task } from '../../types/task'

const baseTask: Task = {
  id: 'task-1',
  title: 'Buy milk',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('TaskItem', () => {
  // --- Phase 2 render tests (preserved) ---

  it('renders the task title', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('renders an unchecked checkbox for an incomplete task', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders a checked checkbox for a completed task', () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('applies completed span to completed task title', () => {
    const { container } = render(<TaskItem task={{ ...baseTask, completed: true }} />)
    const span = container.querySelector('span')
    expect(span).toBeInTheDocument()
    expect(span).toHaveTextContent('Buy milk')
  })

  // --- Phase 3-01 toggle tests (preserved) ---

  it('calls onToggle with task id when checkbox is clicked', async () => {
    const onToggle = vi.fn()
    render(<TaskItem task={baseTask} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('task-1')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggle when clicking checkbox on a completed task', async () => {
    const onToggle = vi.fn()
    render(<TaskItem task={{ ...baseTask, completed: true }} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('task-1')
  })

  it('does not throw when onToggle is not provided', async () => {
    render(<TaskItem task={baseTask} />)
    await expect(userEvent.click(screen.getByRole('checkbox'))).resolves.not.toThrow()
  })

  // --- Phase 3-02 delete tests ---

  it('renders a delete button for each task item', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByRole('button', { name: /delete "buy milk"/i })).toBeInTheDocument()
  })

  it('calls onDelete with task id when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<TaskItem task={baseTask} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('task-1')
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('renders delete button for completed tasks too', () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('does not throw when onDelete is not provided (delete click no-ops)', async () => {
    render(<TaskItem task={baseTask} />)
    await expect(
      userEvent.click(screen.getByRole('button', { name: /delete/i }))
    ).resolves.not.toThrow()
  })
})
