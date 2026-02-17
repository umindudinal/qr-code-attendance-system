import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AppShell = ({ children }) => {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="brand">
          <div className="brand__mark">QR</div>
          <div>
            <p className="brand__title">PulseAttend</p>
            <p className="brand__subtitle">Realtime attendance console</p>
          </div>
        </div>
        <nav className="app-shell__nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/scan" className={({ isActive }) => (isActive ? 'active' : '')}>
            Scan
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="app-shell__user">
          <div>
            <p className="app-shell__name">{user?.name}</p>
            <p className="app-shell__role">{user?.role?.toUpperCase()}</p>
          </div>
          <button className="button button--ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="app-shell__main">{children}</main>
    </div>
  )
}

export default AppShell
