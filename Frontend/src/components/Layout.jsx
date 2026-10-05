import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tags,
  Package,
  TrendingUp,
  Receipt,
  Factory,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Sprout
} from 'lucide-react';
import { useState } from 'react';

const items = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Categories', '/categories', Tags],
  ['Products', '/products', Package],
  ['Income', '/income', TrendingUp],
  ['Expenses', '/expenses', Receipt],
  ['Production', '/production', Factory],
  ['Reports', '/reports', BarChart3],
  ['Users', '/users', Users]
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || 'STAFF';

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    nav('/login');
  };

  return (
    <div className="app-shell">

      <aside className={`sidebar ${open ? 'open' : ''}`}>

        <div className="brand">
          <div className="brand-icon">
            <Sprout size={22} />
          </div>

          <div>
            <b>FarmLedger</b>
            <span>Farm management</span>
          </div>
        </div>

        <div className="nav-label">MAIN MENU</div>

        <nav>
          {items.map(([label, to, Icon]) => {

            // Staff should not see User Management
            if (role === 'STAFF' && label === 'Users') {
              return null;
            }

            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'active' : ''
                }
              >
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </aside>

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="main">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div className="top-title">
            <span>Farm overview</span>
            <small>Manage your farm in one place</small>
          </div>

          <div className="top-user">

            <div className="avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <b>{username}</b>
              <small>{role}</small>
            </div>

          </div>

        </header>

        <section className="content">
          {children}
        </section>

      </main>

    </div>
  );
}
