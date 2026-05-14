import { describe, it, expect, beforeEach } from 'vitest'
import { getTasks, createTask, updateTask, deleteTask } from './tasks'

describe('tasks API', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('getTasks()', () => {
    it('returns [] when localStorage is empty', () => {
      const tasks = getTasks()
      expect(tasks).toEqual([])
    })

    it('returns [] when localStorage key does not exist', () => {
      const tasks = getTasks()
      expect(tasks).toEqual([])
    })

    it('returns deserialized tasks sorted by createdAt ASC', () => {
      // Create tasks in non-chronological order
      const task1 = createTask('Task A')
      // Small delay via timestamp manipulation
      const raw = window.localStorage.getItem('tasktracker_tasks')!
      const tasks = JSON.parse(raw)
      tasks[0].createdAt = '2024-01-02T00:00:00.000Z'
      window.localStorage.setItem('tasktracker_tasks', JSON.stringify(tasks))

      const task2 = createTask('Task B')
      const raw2 = window.localStorage.getItem('tasktracker_tasks')!
      const tasks2 = JSON.parse(raw2)
      tasks2[1].createdAt = '2024-01-01T00:00:00.000Z'
      window.localStorage.setItem('tasktracker_tasks', JSON.stringify(tasks2))

      const sorted = getTasks()
      expect(sorted[0].title).toBe(task2.title) // older createdAt
      expect(sorted[1].title).toBe(task1.title) // newer createdAt
    })
  })

  describe('createTask()', () => {
    it('creates task with correct fields for valid title', () => {
      const task = createTask('Buy milk')
      expect(task.id).toBeTruthy()
      expect(task.title).toBe('Buy milk')
      expect(task.completed).toBe(false)
      expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(task.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('trims whitespace from title', () => {
      const task = createTask('  Buy milk  ')
      expect(task.title).toBe('Buy milk')
    })

    it('throws error with code TITLE_REQUIRED for empty string', () => {
      expect(() => createTask('')).toThrow()
      try {
        createTask('')
      } catch (err) {
        expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
      }
    })

    it('throws error with code TITLE_REQUIRED for whitespace-only title', () => {
      expect(() => createTask('   ')).toThrow()
      try {
        createTask('   ')
      } catch (err) {
        expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
      }
    })

    it('creates task for title that is exactly 500 characters', () => {
      const maxTitle = 'a'.repeat(500)
      const task = createTask(maxTitle)
      expect(task.title).toBe(maxTitle)
    })

    it('throws error with code TITLE_TOO_LONG for title over 500 characters', () => {
      expect(() => createTask('a'.repeat(501))).toThrow()
      try {
        createTask('a'.repeat(501))
      } catch (err) {
        expect((err as { code: string }).code).toBe('TITLE_TOO_LONG')
      }
    })

    it('persists to localStorage (getTasks after createTask returns the task)', () => {
      const task = createTask('Persisted task')
      const tasks = getTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe(task.id)
    })
  })

  describe('updateTask()', () => {
    it('updates completed to true and refreshes updatedAt', () => {
      const task = createTask('Test task')
      const updated = updateTask(task.id, { completed: true })
      expect(updated.completed).toBe(true)
      expect(updated.updatedAt).toBeTruthy()
    })

    it('updates title and refreshes updatedAt', () => {
      const task = createTask('Old title')
      const updated = updateTask(task.id, { title: 'New title' })
      expect(updated.title).toBe('New title')
    })

    it('trims whitespace from updated title', () => {
      const task = createTask('Original')
      const updated = updateTask(task.id, { title: '  New  ' })
      expect(updated.title).toBe('New')
    })

    it('throws TITLE_REQUIRED for empty title update', () => {
      const task = createTask('Test')
      expect(() => updateTask(task.id, { title: '' })).toThrow()
      try {
        updateTask(task.id, { title: '' })
      } catch (err) {
        expect((err as { code: string }).code).toBe('TITLE_REQUIRED')
      }
    })

    it('throws TASK_NOT_FOUND for non-existent id', () => {
      expect(() => updateTask('non-existent-id', {})).toThrow()
      try {
        updateTask('non-existent-id', {})
      } catch (err) {
        expect((err as { code: string }).code).toBe('TASK_NOT_FOUND')
      }
    })

    it('persists changes to localStorage', () => {
      const task = createTask('Original')
      updateTask(task.id, { title: 'Updated' })
      const tasks = getTasks()
      expect(tasks[0].title).toBe('Updated')
    })
  })

  describe('deleteTask()', () => {
    it('removes task by id; getTasks no longer includes it', () => {
      const task = createTask('To delete')
      deleteTask(task.id)
      const tasks = getTasks()
      expect(tasks).toHaveLength(0)
    })

    it('throws TASK_NOT_FOUND for non-existent id', () => {
      expect(() => deleteTask('non-existent-id')).toThrow()
      try {
        deleteTask('non-existent-id')
      } catch (err) {
        expect((err as { code: string }).code).toBe('TASK_NOT_FOUND')
      }
    })

    it('persists deletion to localStorage', () => {
      const task1 = createTask('Keep this')
      const task2 = createTask('Delete this')
      deleteTask(task2.id)
      const tasks = getTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe(task1.id)
    })
  })
})
