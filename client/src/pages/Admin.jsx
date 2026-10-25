import { useEffect, useState } from 'react'
import { getUsers, deleteUser, setUserRole } from '../api'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Admin({ token, user, onBack, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [query, setQuery] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const data = await getUsers(token)
      setUsers(data.users)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRole(target) {
    const role = target.role === 'admin' ? 'user' : 'admin'
    setBusyId(target.id)
    setError('')
    try {
      const data = await setUserRole(token, target.id, role)
      setUsers((list) => list.map((u) => (u.id === target.id ? data.user : u)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(target) {
    if (!window.confirm(`Delete ${target.name} (${target.email})?`)) return
    setBusyId(target.id)
    setError('')
    try {
      await deleteUser(token, target.id)
      setUsers((list) => list.filter((u) => u.id !== target.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const admins = users.filter((u) => u.role === 'admin').length
  const term = query.trim().toLowerCase()
  const visible = term
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      )
    : users

  return (
    <div className="page page-top">
      <div className="card card-wide">
        <div className="admin-header">
          <div>
            <h1>Admin Panel</h1>
            <p className="subtitle admin-sub">Signed in as {user.email}</p>
          </div>
          <div className="admin-header-actions">
            <button type="button" className="btn btn-small btn-secondary" onClick={onBack}>
              Dashboard
            </button>
            <button type="button" className="btn btn-small" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Total users</span>
          </div>
          <div className="stat">
            <span className="stat-value">{admins}</span>
            <span className="stat-label">Admins</span>
          </div>
          <div className="stat">
            <span className="stat-value">{users.length - admins}</span>
            <span className="stat-label">Regular users</span>
          </div>
        </div>

        <div className="toolbar">
          <input
            type="search"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="btn btn-small btn-secondary" onClick={load}>
            Refresh
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <p className="muted">Loading users...</p>
        ) : visible.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => {
                  const isSelf = u.id === user.id
                  return (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : ''}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td className="row-actions">
                        {isSelf ? (
                          <span className="muted">You</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="link"
                              disabled={busyId === u.id}
                              onClick={() => handleRole(u)}
                            >
                              {u.role === 'admin' ? 'Make user' : 'Make admin'}
                            </button>
                            <button
                              type="button"
                              className="link link-danger"
                              disabled={busyId === u.id}
                              onClick={() => handleDelete(u)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
