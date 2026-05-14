import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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

  it('renders tasks in the order provided (oldest-first ordering is App.tsx responsibility)', () => {
    const tasks = [makeTask('1', 'First task'), makeTask('2', 'Second task')]
    render(<TaskList tasks={tasks} />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('First task')
    expect(items[1]).toHaveTextContent('Second task')
  })
})
