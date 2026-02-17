import { useEffect, useState } from 'react'
import { getJson, patchJson, postJson } from '../api/client'
import AppShell from '../components/AppShell'
import Spinner from '../components/Spinner'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [statusType, setStatusType] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [submitting, setSubmitting] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await getJson('/api/users')
      setUsers(data.users)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const updateRole = async (userId, role) => {
    setMessage('')
    setStatusType('')
    try {
      const data = await patchJson(`/api/users/${userId}/role`, { role })
      setUsers((prev) => prev.map((user) => (user._id === userId ? data.user : user)))
      setMessage('Role updated')
      setStatusType('success')
    } catch (err) {
      setMessage(err.message || 'Failed to update role')
      setStatusType('error')
    }
  }

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setStatusType('')
    try {
      await postJson('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      await loadUsers()
      setForm({ name: '', email: '', password: '', role: 'user' })
      setMessage('User created')
      setStatusType('success')
    } catch (err) {
      setMessage(err.message || 'Failed to create user')
      setStatusType('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <section className="card admin-card">
        <div className="admin-card__header">
          <div>
            <h2>User management</h2>
            <p className="muted">Assign roles and monitor access across the organization.</p>
          </div>
          {message && statusType === 'success' && <span className="pill pill--info">{message}</span>}
        </div>

        <form className="admin-form" onSubmit={handleCreateUser}>
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              required
            />
          </label>
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </label>
          <label className="field">
            <span>Temporary password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button className="button button--primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Add user'}
          </button>
        </form>
        {message && statusType === 'error' && <p className="form__error">{message}</p>}

        {loading ? (
          <Spinner label="Loading users" />
        ) : (
          <div className="table">
            <div className="table__row table__row--head">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Actions</span>
            </div>
            {users.map((user) => (
              <div key={user._id} className="table__row">
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span className="pill">{user.role}</span>
                <div className="table__actions">
                  <button
                    className="button button--ghost"
                    onClick={() => updateRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                  >
                    Make {user.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default AdminUsers
