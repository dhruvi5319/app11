import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateTaskInput } from './CreateTaskInput'

describe('CreateTaskInput', () => {
  beforeEach(() => {
    // Reset any state between tests
  })

  // US-0.1: visible on page load
  it('renders an input field and Add Task button', () => {
    render(<CreateTaskInput onCreate={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: /new task title/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
  })

  // US-0.1: keyboard submit (Enter)
  it('calls onCreate with trimmed title when Enter is pressed', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Buy milk{Enter}')
    expect(onCreate).toHaveBeenCalledWith('Buy milk')
    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  // US-0.2: button submit
  it('calls onCreate with trimmed title when Add Task button is clicked', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    await userEvent.type(screen.getByRole('textbox'), 'Write report')
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(onCreate).toHaveBeenCalledWith('Write report')
  })

  // US-0.1 / US-0.2: input clears after submission
  it('clears the input after successful submission', async () => {
    render(<CreateTaskInput onCreate={vi.fn()} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Buy milk{Enter}')
    expect(input).toHaveValue('')
  })

  // US-0.1: trimming
  it('trims whitespace from title before calling onCreate', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    await userEvent.type(screen.getByRole('textbox'), '  Buy milk  {Enter}')
    expect(onCreate).toHaveBeenCalledWith('Buy milk')
  })

  // US-0.3: empty submission rejected
  it('shows "Task title is required." error and does not call onCreate when input is empty', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByRole('alert')).toHaveTextContent('Task title is required.')
    expect(onCreate).not.toHaveBeenCalled()
  })

  // US-0.3: whitespace-only submission rejected
  it('shows "Task title is required." error for whitespace-only title', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    await userEvent.type(screen.getByRole('textbox'), '   {Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent('Task title is required.')
    expect(onCreate).not.toHaveBeenCalled()
  })

  // US-0.3: error clears on typing
  it('clears the inline error when the user starts typing', async () => {
    render(<CreateTaskInput onCreate={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.type(screen.getByRole('textbox'), 'x')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // US-0.4: title too long rejected (using fireEvent.change for performance with long strings)
  it('shows "Task title must be 500 characters or fewer." for titles over 500 chars', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    const longTitle = 'a'.repeat(501)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: longTitle } })
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Task title must be 500 characters or fewer.'
    )
    expect(onCreate).not.toHaveBeenCalled()
  })

  // US-0.4: exactly 500 chars is accepted (using fireEvent.change for performance)
  it('accepts a title that is exactly 500 characters long', async () => {
    const onCreate = vi.fn()
    render(<CreateTaskInput onCreate={onCreate} />)
    const maxTitle = 'a'.repeat(500)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: maxTitle } })
    await userEvent.click(screen.getByRole('button', { name: /add task/i }))
    expect(onCreate).toHaveBeenCalledWith(maxTitle)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
