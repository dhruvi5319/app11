import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readTasks, writeTasks, StorageReadError } from './localStorage'
import type { Task } from '../types/task'

const makeTask = (id: string, title: string, createdAt: string): Task => ({
  id,
  title,
  completed: false,
  createdAt,
  updatedAt: createdAt,
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

vi.stubGlobal('window', { localStorage: localStorageMock })

describe('readTasks', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    // Re-wire after clearAllMocks
    const store: Record<string, string> = {}
    localStorageMock.getItem.mockImplementation((key: string) => store[key] ?? null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => { store[key] = value })
    localStorageMock.clear.mockImplementation(() => { Object.keys(store).forEach(k => delete store[k]) })
  })

  it("returns [] when localStorage has no 'tasktracker_tasks' key", () => {
    const result = readTasks()
    expect(result).toEqual([])
  })

  it('returns parsed Task[] when valid JSON exists', () => {
    const tasks = [makeTask('1', 'Buy milk', '2026-01-01T00:00:00.000Z')]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(tasks))
    const result = readTasks()
    expect(result).toEqual(tasks)
  })

  it('throws StorageReadError with code STORAGE_CORRUPT when JSON is invalid', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{{{')
    expect(() => readTasks()).toThrow(StorageReadError)
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{{{')
    try {
      readTasks()
    } catch (err) {
      expect(err).toBeInstanceOf(StorageReadError)
      if (err instanceof StorageReadError) {
        expect(err.code).toBe('STORAGE_CORRUPT')
      }
    }
  })
})

describe('writeTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("serializes tasks to JSON and sets 'tasktracker_tasks' in localStorage", () => {
    const tasks = [makeTask('1', 'Buy milk', '2026-01-01T00:00:00.000Z')]
    writeTasks(tasks)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('tasktracker_tasks', JSON.stringify(tasks))
  })

  it('after writeTasks, readTasks returns the same tasks', () => {
    const tasks = [makeTask('1', 'Buy milk', '2026-01-01T00:00:00.000Z')]
    const stored: Record<string, string> = {}
    localStorageMock.setItem.mockImplementation((key: string, value: string) => { stored[key] = value })
    localStorageMock.getItem.mockImplementation((key: string) => stored[key] ?? null)
    writeTasks(tasks)
    const result = readTasks()
    expect(result).toEqual(tasks)
  })
})
