import { useState, useEffect } from 'react';
import styles from './Landing.module.css';

const Landing = () => {
  const [orders, setOrders] = useState([
    { id: 1, customer: 'Juan Pérez', items: 'Alitas BBQ x2', status: 'En preparación', time: '12 min' },
    { id: 2, customer: 'María García', items: 'Alitas Picante x3', status: 'Listo', time: '5 min' },
    { id: 3, customer: 'Carlos López', items: 'Combo Especial', status: 'Pendiente', time: '30 min' },
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Panel de Control</h1>
        <p>Gestiona tus pedidos y tiempos de entrega</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos Hoy</span>
          <span className={styles.statValue}>12</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>En Preparación</span>
          <span className={styles.statValue}>3</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completados</span>
          <span className={styles.statValue}>9</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Lista de Pedidos Actuales</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Artículos</th>
              <th>Estado</th>
              <th>Tiempo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>
                  <span className={`${styles.badge} ${styles[order.status.toLowerCase().replace(' ', '')]}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.time}</td>
                <td>
                  <button className={styles.btnSmall}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Landing;