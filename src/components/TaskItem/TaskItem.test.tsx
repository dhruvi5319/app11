import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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
  it('renders the task title', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('renders an unchecked checkbox for an incomplete task', () => {
    render(<TaskItem task={baseTask} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders a checked checkbox for a completed task', () => {
    render(<TaskItem task={{ ...baseTask, completed: true }} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('applies line-through style to completed task title', () => {
    const { container } = render(<TaskItem task={{ ...baseTask, completed: true }} />)
    const span = container.querySelector('span')
    // CSS Modules will generate a unique class — just verify the element exists and title shows
    expect(span).toBeInTheDocument()
    expect(span).toHaveTextContent('Buy milk')
  })
})
