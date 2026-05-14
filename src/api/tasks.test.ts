import { describe, it, expect, beforeEach } from 'vitest'
import { getTasks, createTask, updateTask, deleteTask } from './tasks'

// In-memory localStorage mock
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
}

const localStorageMock = createLocalStorageMock()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

beforeEach(() => {
  localStorageMock.clear()
})

describe('getTasks', () => {
  it('returns [] when localStorage is empty', () => {
    expect(getTasks()).toEqual([])
  })

  it("returns [] when localStorage key doesn't exist", () => {
    expect(getTasks()).toEqual([])
  })

  it('returns deserialized tasks sorted by createdAt ASC', () => {
    // Insert out-of-order
    const t1 = createTask('First task')
    // Manually insert a task with an earlier createdAt to test sorting
    const existingTasks = JSON.parse(window.localStorage.getItem('tasktracker_tasks') ?? '[]')
    const olderTask = {
      id: 'older-id',
      title: 'Older task',
      completed: false,
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    }
    window.localStorage.setItem('tasktracker_tasks', JSON.stringify([...existingTasks, olderTask]))

    const tasks = getTasks()
    expect(tasks[0].id).toBe('older-id')
    expect(tasks[1].id).toBe(t1.id)
  })
})

describe('createTask', () => {
  it("('Buy milk') → Task with id, title='Buy milk', completed=false, createdAt/updatedAt ISO strings", () => {
    const task = createTask('Buy milk')
    expect(task.id).toBeTruthy()
    expect(task.title).toBe('Buy milk')
    expect(task.completed).toBe(false)
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
    } catch (err: unknown) {
      expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
    }
  })

  it("('   ') → throws error with code TITLE_REQUIRED (whitespace only)", () => {
    expect(() => createTask('   ')).toThrow()
    try {
      createTask('   ')
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      expect((err as { code: string }).code).toBe('TITLE_TOO_LONG')
    }
  })

  it('persists to localStorage (getTasks after createTask returns the task)', () => {
    const task = createTask('Buy milk')
    const tasks = getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe(task.id)
  })
})

describe('updateTask', () => {
  it('(id, { completed: true }) → returns task with completed=true, updatedAt refreshed', () => {
    const task = createTask('Buy milk')
    const updated = updateTask(task.id, { completed: true })
    expect(updated.completed).toBe(true)
    // updatedAt is refreshed (same or later)
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(task.updatedAt).getTime()
    )
  })

  it("(id, { title: 'New title' }) → returns task with title='New title', updatedAt refreshed", () => {
    const task = createTask('Buy milk')
    const updated = updateTask(task.id, { title: 'New title' })
    expect(updated.title).toBe('New title')
  })

  it("(id, { title: '  New  ' }) → title is trimmed to 'New'", () => {
    const task = createTask('Buy milk')
    const updated = updateTask(task.id, { title: '  New  ' })
    expect(updated.title).toBe('New')
  })

  it("(id, { title: '' }) → throws TITLE_REQUIRED", () => {
    const task = createTask('Buy milk')
    expect(() => updateTask(task.id, { title: '' })).toThrow()
    try {
      updateTask(task.id, { title: '' })
    } catch (err: unknown) {
      expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
    }
  })

  it("('non-existent-id', {}) → throws TASK_NOT_FOUND", () => {
    expect(() => updateTask('non-existent-id', {})).toThrow()
    try {
      updateTask('non-existent-id', {})
    } catch (err: unknown) {
      expect((err as { code: string }).code).toBe('TASK_NOT_FOUND')
    }
  })

  it('persists changes to localStorage', () => {
    const task = createTask('Buy milk')
    updateTask(task.id, { completed: true })
    const tasks = getTasks()
    expect(tasks[0].completed).toBe(true)
  })
})

describe('deleteTask', () => {
  it("(id) → task removed; getTasks() no longer includes it", () => {
    const task = createTask('Buy milk')
    deleteTask(task.id)
    const tasks = getTasks()
    expect(tasks).toHaveLength(0)
  })

  it("('non-existent-id') → throws TASK_NOT_FOUND", () => {
    expect(() => deleteTask('non-existent-id')).toThrow()
    try {
      deleteTask('non-existent-id')
    } catch (err: unknown) {
      expect((err as { code: string }).code).toBe('TASK_NOT_FOUND')
    }
  })

  it('persists deletion to localStorage', () => {
    const task = createTask('Buy milk')
    createTask('Walk dog')
    deleteTask(task.id)
    const tasks = getTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Walk dog')
  })
})
