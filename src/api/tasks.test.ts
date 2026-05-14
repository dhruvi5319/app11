import { describe, it, expect, beforeEach } from 'vitest'
import { getTasks, createTask, updateTask, deleteTask } from './tasks'

describe('getTasks()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns [] when localStorage is empty', () => {
    expect(getTasks()).toEqual([])
  })

  it('returns [] when localStorage key does not exist', () => {
    expect(getTasks()).toEqual([])
  })

  it('returns deserialized tasks sorted by createdAt ASC', () => {
    // Create tasks out of order
    const older = createTask('Older task')
    // Create a task with an earlier timestamp to test sort
    const newer = {
      id: 'early-id',
      title: 'Earlier task',
      completed: false,
      createdAt: new Date(Date.now() - 10000).toISOString(),
      updatedAt: new Date(Date.now() - 10000).toISOString(),
    }
    // Insert as first element to simulate out-of-order
    localStorage.setItem('tasktracker_tasks', JSON.stringify([older, newer]))
    const result = getTasks()
    expect(result[0].createdAt <= result[1].createdAt).toBe(true)
    expect(result[0].id).toBe(newer.id)
    expect(result[1].id).toBe(older.id)
  })
})

describe('createTask()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("('Buy milk') → Task with id, title='Buy milk', completed=false, ISO createdAt/updatedAt", () => {
    const task = createTask('Buy milk')
    expect(task.title).toBe('Buy milk')
    expect(task.completed).toBe(false)
    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
    expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    expect(task.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it("('  Buy milk  ') → title is trimmed to 'Buy milk'", () => {
    const task = createTask('  Buy milk  ')
    expect(task.title).toBe('Buy milk')
  })

  it("('') → throws error with code TITLE_REQUIRED", () => {
    expect(() => createTask('')).toThrow()
    try {
      createTask('')
    } catch (err) {
      expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
    }
  })

  it("('   ') → throws error with code TITLE_REQUIRED (whitespace only)", () => {
    expect(() => createTask('   ')).toThrow()
    try {
      createTask('   ')
    } catch (err) {
      expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
    }
  })

  it("('a'.repeat(500)) → creates task (max length OK)", () => {
    const task = createTask('a'.repeat(500))
    expect(task.title).toBe('a'.repeat(500))
  })

  it("('a'.repeat(501)) → throws error with code TITLE_TOO_LONG", () => {
    expect(() => createTask('a'.repeat(501))).toThrow()
    try {
      createTask('a'.repeat(501))
    } catch (err) {
      expect((err as { code: string }).code).toBe('TITLE_TOO_LONG')
    }
  })

  it('persists to localStorage (getTasks after createTask returns the task)', () => {
    const task = createTask('Persistent task')
    const tasks = getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe(task.id)
  })
})

describe('updateTask()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('(id, { completed: true }) → returns task with completed=true, updatedAt refreshed', () => {
    const task = createTask('Test task')
    const originalUpdatedAt = task.updatedAt
    // Small delay to ensure updatedAt changes
    const updated = updateTask(task.id, { completed: true })
    expect(updated.completed).toBe(true)
    expect(updated.id).toBe(task.id)
    expect(updated.updatedAt >= originalUpdatedAt).toBe(true)
  })

  it("(id, { title: 'New title' }) → returns task with updated title, updatedAt refreshed", () => {
    const task = createTask('Old title')
    const updated = updateTask(task.id, { title: 'New title' })
    expect(updated.title).toBe('New title')
  })

  it("(id, { title: '  New  ' }) → title is trimmed to 'New'", () => {
    const task = createTask('Old title')
    const updated = updateTask(task.id, { title: '  New  ' })
    expect(updated.title).toBe('New')
  })

  it("(id, { title: '' }) → throws TITLE_REQUIRED", () => {
    const task = createTask('Valid title')
    expect(() => updateTask(task.id, { title: '' })).toThrow()
    try {
      updateTask(task.id, { title: '' })
    } catch (err) {
      expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
    }
  })

  it("('non-existent-id', {}) → throws TASK_NOT_FOUND", () => {
    expect(() => updateTask('non-existent-id', {})).toThrow()
    try {
      updateTask('non-existent-id', {})
    } catch (err) {
      expect((err as { code: string }).code).toBe('TASK_NOT_FOUND')
    }
  })

  it('persists changes to localStorage', () => {
    const task = createTask('Test task')
    updateTask(task.id, { completed: true })
    const tasks = getTasks()
    const found = tasks.find((t) => t.id === task.id)
    expect(found?.completed).toBe(true)
  })
})

describe('deleteTask()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('(id) → task removed; getTasks() no longer includes it', () => {
    const task = createTask('Task to delete')
    deleteTask(task.id)
    const tasks = getTasks()
    expect(tasks.find((t) => t.id === task.id)).toBeUndefined()
  })

  it("('non-existent-id') → throws TASK_NOT_FOUND", () => {
    expect(() => deleteTask('non-existent-id')).toThrow()
    try {
      deleteTask('non-existent-id')
    } catch (err) {
      expect((err as { code: string }).code).toBe('TASK_NOT_FOUND')
    }
  })

  it('persists deletion to localStorage', () => {
    const task1 = createTask('Task 1')
    const task2 = createTask('Task 2')
    deleteTask(task1.id)
    const tasks = getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe(task2.id)
  })
})
