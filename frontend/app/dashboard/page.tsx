'use client'

import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

interface Task {
  id: number
  title: string
  description: string
  status: 'PENDING' | 'COMPLETED'
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState({ title: '', description: '', status: 'PENDING' })

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks', {
        params: { page, limit: 10, search, status: filter }
      })
      setTasks(res.data.tasks)
      setTotalPages(res.data.pagination.totalPages)
    } catch {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTasks()
  }, [page, filter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTasks()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editTask) {
        await api.patch(`/tasks/${editTask.id}`, form)
        toast.success('Task updated!')
      } else {
        await api.post('/tasks', form)
        toast.success('Task added!')
      }
      setForm({ title: '', description: '', status: 'PENDING' })
      setShowForm(false)
      setEditTask(null)
      fetchTasks()
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted!')
      fetchTasks()
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await api.patch(`/tasks/${id}/toggle`)
      toast.success('Status updated!')
      fetchTasks()
    } catch {
      toast.error('Failed to toggle task')
    }
  }

  const handleEdit = (task: Task) => {
    setEditTask(task)
    setForm({ title: task.title, description: task.description, status: task.status })
    setShowForm(true)
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('accessToken')
      router.push('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Toaster />

      {/* Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">

        {/* Search + Filter */}
        <div className="flex gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
          </form>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => { setShowForm(!showForm); setEditTask(null); setForm({ title: '', description: '', status: 'PENDING' }) }}
          className="mb-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-4">
            <h2 className="text-lg font-semibold mb-4">{editTask ? 'Edit Task' : 'Add Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {editTask ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks found</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className={`font-semibold ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => handleEdit(task)}
                    className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-lg hover:bg-yellow-200 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Prev
            </button>
            <span className="px-4 py-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}