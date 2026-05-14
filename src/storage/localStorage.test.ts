import { describe, it, expect, beforeEach } from 'vitest'
import { readTasks, writeTasks, StorageReadError } from './localStorage'
import type { Task } from '../types/task'

const mockTask: Task = {
  id: 'test-id-1',
  title: 'Test task',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('localStorage adapter', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('readTasks()', () => {
    it('returns [] when localStorage has no tasktracker_tasks key', () => {
      const tasks = readTasks()
      expect(tasks).toEqual([])
    })

    it('returns parsed Task[] when valid JSON exists', () => {
      window.localStorage.setItem('tasktracker_tasks', JSON.stringify([mockTask]))
      const tasks = readTasks()
      expect(tasks).toEqual([mockTask])
    })

    it('throws StorageReadError with code STORAGE_CORRUPT when JSON is invalid', () => {
      window.localStorage.setItem('tasktracker_tasks', 'invalid-json{{{')
      expect(() => readTasks()).toThrow(StorageReadError)
      try {
        readTasks()
      } catch (err) {
        expect(err).toBeInstanceOf(StorageReadError)
        expect((err as StorageReadError).code).toBe('STORAGE_CORRUPT')
      }
    })
  })

  describe('writeTasks()', () => {
    it('serializes tasks to JSON and sets tasktracker_tasks in localStorage', () => {
      writeTasks([mockTask])
      const raw = window.localStorage.getItem('tasktracker_tasks')
      expect(raw).toBe(JSON.stringify([mockTask]))
    })

    it('after writeTasks, readTasks returns the same tasks', () => {
      writeTasks([mockTask])
      const tasks = readTasks()
      expect(tasks).toEqual([mockTask])
    })
  })
})
