// src/layout/MainLayout.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiHome, FiSettings, FiClipboard, FiEdit3, FiBarChart2 } from "react-icons/fi";
import styles from "./MainLayout.module.css";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Landing", Icon: FiHome },
    { path: "/configuracion", label: "Configuración", Icon: FiSettings },
    { path: "/gestion", label: "Gestión", Icon: FiClipboard },
    { path: "/pedidos-manuales", label: "Pedidos Manuales", Icon: FiEdit3 },
    { path: "/estadisticas", label: "Estadísticas", Icon: FiBarChart2 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.appShell}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        <div className={styles.logo}>
          <h1>Salsas Wings</h1>
        </div>

        <nav className={styles.nav}>
          {menuItems.map(({ path, label, Icon }) => (
            <Link
              key={path}
              to={path}
              className={`${styles.navLink} ${isActive(path) ? styles.active : ""}`}
              onClick={() => {
                if (window.innerWidth < 768) setSidebarOpen(false); // close on mobile
              }}
            >
              <span className={styles.icon}><Icon aria-hidden="true" /></span>
              <span className={styles.label}>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <button
          aria-label="Cerrar menú"
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <button
            className={styles.toggleSidebar}
            aria-label="Abrir/cerrar menú"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <FiMenu />
          </button>
          <div className={styles.headerRight}>
            <span className={styles.userInfo}>Admin</span>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;