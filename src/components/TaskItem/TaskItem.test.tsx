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

  it('applies completed styling to completed task title button', () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} />)
    const titleBtn = screen.getByRole('button', { name: /Edit "Buy milk"/ })
    expect(titleBtn).toBeInTheDocument()
  })

  // --- Phase 3 toggle interaction tests ---

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

  it('does not throw when onToggle is not provided (checkbox click no-ops)', async () => {
    render(<TaskItem task={baseTask} />)
    await expect(userEvent.click(screen.getByRole('checkbox'))).resolves.not.toThrow()
  })

  // --- Phase 3-02 delete tests (preserved) ---

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

  // --- Phase 4 edit mode tests ---

  it('calls onStartEdit when title button is clicked', async () => {
    const onStartEdit = vi.fn()
    render(<TaskItem task={baseTask} onStartEdit={onStartEdit} />)
    await userEvent.click(screen.getByRole('button', { name: /Edit "Buy milk"/ }))
    expect(onStartEdit).toHaveBeenCalledWith('task-1')
  })

  it('shows edit input pre-populated with title when isEditing=true', () => {
    render(<TaskItem task={baseTask} isEditing={true} />)
    const input = screen.getByRole('textbox', { name: /Edit title/ })
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Buy milk')
  })

  it('shows Save and Cancel buttons in edit mode', () => {
    render(<TaskItem task={baseTask} isEditing={true} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onEdit with trimmed new title when Save is clicked', async () => {
    const onEdit = vi.fn()
    render(<TaskItem task={baseTask} isEditing={true} onEdit={onEdit} />)
    const input = screen.getByRole('textbox', { name: /Edit title/ })
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated title')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onEdit).toHaveBeenCalledWith('task-1', 'Updated title')
  })

  it('calls onEdit when Enter is pressed in the edit input', async () => {
    const onEdit = vi.fn()
    render(<TaskItem task={baseTask} isEditing={true} onEdit={onEdit} />)
    const input = screen.getByRole('textbox', { name: /Edit title/ })
    await userEvent.clear(input)
    await userEvent.type(input, 'New title{Enter}')
    expect(onEdit).toHaveBeenCalledWith('task-1', 'New title')
  })

  it('calls onCancelEdit when Cancel is clicked', async () => {
    const onCancelEdit = vi.fn()
    render(<TaskItem task={baseTask} isEditing={true} onCancelEdit={onCancelEdit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancelEdit).toHaveBeenCalledWith('task-1')
  })

  it('calls onCancelEdit when Escape is pressed', async () => {
    const onCancelEdit = vi.fn()
    render(<TaskItem task={baseTask} isEditing={true} onCancelEdit={onCancelEdit} />)
    const input = screen.getByRole('textbox', { name: /Edit title/ })
    await userEvent.type(input, '{Escape}')
    expect(onCancelEdit).toHaveBeenCalledWith('task-1')
  })

  it('shows validation error and does not call onEdit for empty title', async () => {
    const onEdit = vi.fn()
    render(<TaskItem task={baseTask} isEditing={true} onEdit={onEdit} />)
    const input = screen.getByRole('textbox', { name: /Edit title/ })
    await userEvent.clear(input)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Title cannot be empty')
  })

  it('shows validation error for whitespace-only title', async () => {
    const onEdit = vi.fn()
    render(<TaskItem task={baseTask} isEditing={true} onEdit={onEdit} />)
    const input = screen.getByRole('textbox', { name: /Edit title/ })
    await userEvent.clear(input)
    await userEvent.type(input, '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Title cannot be empty')
  })

  it('does not show checkbox or delete button in edit mode', () => {
    render(<TaskItem task={baseTask} isEditing={true} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument()
  })
})
