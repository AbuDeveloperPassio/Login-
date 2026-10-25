export default function Dashboard({ user, onLogout, onAdmin }) {
  return (
    <div className="page">
      <div className="card">
        <div className="logo">✓</div>
        <h1>Hello, {user.name}!</h1>
        <p className="subtitle">
          You are logged in as {user.email}
          {user.role === 'admin' && <span className="badge badge-admin">Admin</span>}
        </p>
        <div className="actions">
          {onAdmin && (
            <button type="button" className="btn" onClick={onAdmin}>
              Open Admin Panel
            </button>
          )}
          <button
            type="button"
            className={onAdmin ? 'btn btn-secondary' : 'btn'}
            onClick={onLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
