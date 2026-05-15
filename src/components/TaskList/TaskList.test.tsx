import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TaskList } from './TaskList'
import type { Task } from '../../types/task'

const makeTask = (id: string, title: string, completed = false): Task => ({
  id,
  title,
  completed,
  createdAt: `2026-01-0${id}T00:00:00.000Z`,
  updatedAt: `2026-01-0${id}T00:00:00.000Z`,
})

describe('TaskList', () => {
  // --- Phase 2 render tests (preserved) ---

  it('shows empty state message when tasks array is empty', () => {
    render(<TaskList tasks={[]} />)
    expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument()
  })

  it('does not render a list when tasks is empty', () => {
    render(<TaskList tasks={[]} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renders a list item for each task', () => {
    const tasks = [makeTask('1', 'Buy milk'), makeTask('2', 'Walk the dog')]
    render(<TaskList tasks={tasks} />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('does not show empty state when tasks exist', () => {
    render(<TaskList tasks={[makeTask('1', 'Buy milk')]} />)
    expect(screen.queryByText('No tasks yet. Add one above!')).not.toBeInTheDocument()
  })

  it('renders tasks in the order provided', () => {
    const tasks = [makeTask('1', 'First task'), makeTask('2', 'Second task')]
    render(<TaskList tasks={tasks} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('First task')
    expect(items[1]).toHaveTextContent('Second task')
  })

  // --- Phase 3 onToggle pass-through tests ---

  it('passes onToggle to TaskItem — clicking a checkbox calls onToggle with task id', async () => {
    const onToggle = vi.fn()
    render(<TaskList tasks={[makeTask('1', 'Buy milk')]} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('1')
  })

  it('renders without errors when onToggle is not provided', () => {
    render(<TaskList tasks={[makeTask('1', 'Buy milk')]} />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('passes onDelete to TaskItem — clicking delete button calls onDelete with task id', async () => {
    const onDelete = vi.fn()
    render(<TaskList tasks={[makeTask('1', 'Buy milk')]} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  // --- Phase 4 edit pass-through tests ---

  it('renders task in edit mode when editingId matches task id', () => {
    render(
      <TaskList
        tasks={[makeTask('1', 'Buy milk')]}
        editingId="1"
      />
    )
    expect(screen.getByRole('textbox', { name: /Edit title/ })).toBeInTheDocument()
  })

  it('does not render edit mode for non-matching task', () => {
    render(
      <TaskList
        tasks={[makeTask('1', 'Buy milk'), makeTask('2', 'Walk dog')]}
        editingId="1"
      />
    )
    // Task 1 is in edit mode, Task 2 is not
    expect(screen.getByRole('textbox', { name: /Edit title/ })).toBeInTheDocument()
    expect(screen.getByText('Walk dog')).toBeInTheDocument()
  })

  it('calls onStartEdit when title button clicked', async () => {
    const onStartEdit = vi.fn()
    render(
      <TaskList
        tasks={[makeTask('1', 'Buy milk')]}
        onStartEdit={onStartEdit}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /Edit "Buy milk"/ }))
    expect(onStartEdit).toHaveBeenCalledWith('1')
  })
})
