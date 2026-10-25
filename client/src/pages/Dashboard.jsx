export default function Dashboard({ user, onLogout }) {
  return (
    <div className="page">
      <div className="card">
        <div className="logo">✓</div>
        <h1>Hello, {user.name}!</h1>
        <p className="subtitle">You are logged in as {user.email}</p>
        <button type="button" className="btn" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  )
}
