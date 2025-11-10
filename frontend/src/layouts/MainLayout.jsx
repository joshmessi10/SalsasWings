import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainLayout.module.css';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Landing', icon: '📊' },
    { path: '/configuracion', label: 'Configuración', icon: '⚙️' },
    { path: '/gestion', label: 'Gestión', icon: '📋' },
    { path: '/pedidos-manuales', label: 'Pedidos Manuales', icon: '📝' },
    { path: '/estadisticas', label: 'Estadísticas', icon: '📈' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          <h1>SW Admin</h1>
        </div>
        <nav className="nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {sidebarOpen && <span className="label">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="main-content">
        <header className="top-bar">
          <button
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-right">
            <span className="user-info">Admin</span>
          </div>
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
