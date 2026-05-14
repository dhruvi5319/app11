import { describe, it, expect, beforeEach } from 'vitest'
import { readTasks, writeTasks, StorageReadError } from './localStorage'
import type { Task } from '../types/task'

const STORAGE_KEY = 'tasktracker_tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'test-id-1',
    title: 'Test task',
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('readTasks()', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns [] when localStorage has no tasktracker_tasks key', () => {
    expect(readTasks()).toEqual([])
  })

  it('returns parsed Task[] when valid JSON exists', () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2', title: 'Another task' })]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    expect(readTasks()).toEqual(tasks)
  })

  it('throws StorageReadError with code STORAGE_CORRUPT when JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json {{{')
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
  beforeEach(() => {
    localStorage.clear()
  })

  it('serializes tasks to JSON and sets tasktracker_tasks in localStorage', () => {
    const tasks = [makeTask({ id: '1' })]
    writeTasks(tasks)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBe(JSON.stringify(tasks))
  })

  it('after writeTasks, readTasks returns the same tasks', () => {
    const tasks = [makeTask({ id: '1' }), makeTask({ id: '2', title: 'Second task' })]
    writeTasks(tasks)
    expect(readTasks()).toEqual(tasks)
  })
})
