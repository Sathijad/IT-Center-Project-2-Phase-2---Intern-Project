import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './Layout.css';

export const Layout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/leave', label: 'My Leave', roles: ['EMPLOYEE', 'ADMIN'] },
    { path: '/leave/apply', label: 'Apply Leave', roles: ['EMPLOYEE', 'ADMIN'] },
    { path: '/attendance', label: 'Attendance', roles: ['EMPLOYEE', 'ADMIN'] },
    { path: '/leave/approvals', label: 'Approvals', roles: ['ADMIN'] },
    { path: '/reports/leave', label: 'Reports', roles: ['ADMIN'] },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.some((role) => (isAdmin ? true : role === 'EMPLOYEE'))
  );

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <h1>IT Center</h1>
          <nav className="layout-nav" aria-label="Main navigation">
            {visibleNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="layout-user">
            <span>{user?.email || user?.username}</span>
            <button onClick={logout} aria-label="Logout">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <p>&copy; 2025 IT Center. All rights reserved.</p>
      </footer>
    </div>
  );
};

