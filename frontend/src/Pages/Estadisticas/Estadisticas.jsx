import { useState } from 'react';
import styles from './Estadisticas.module.css';

const Estadisticas = () => {
  const stats = [
    { label: 'Ingresos Hoy', value: '$ 1,250,000', icon: '💰', color: 'green' },
    { label: 'Pedidos Completados', value: '45', icon: '✓', color: 'blue' },
    { label: 'Pedidos Pendientes', value: '3', icon: '⏳', color: 'yellow' },
    { label: 'Gasto Total', value: '$ 450,000', icon: '💸', color: 'red' },
  ];

  const dailyData = [
    { day: 'Lunes', orders: 45, revenue: 1200000 },
    { day: 'Martes', orders: 52, revenue: 1450000 },
    { day: 'Miércoles', orders: 38, revenue: 950000 },
    { day: 'Jueves', orders: 61, revenue: 1650000 },
    { day: 'Viernes', orders: 58, revenue: 1550000 },
    { day: 'Sábado', orders: 75, revenue: 1950000 },
    { day: 'Domingo', orders: 42, revenue: 1100000 },
  ];

  const topProducts = [
    { name: 'Alitas BBQ', sales: 156, revenue: 624000 },
    { name: 'Alitas Picante', sales: 142, revenue: 568000 },
    { name: 'Combo Especial', sales: 89, revenue: 445000 },
    { name: 'Papas Criollas', sales: 120, revenue: 240000 },
    { name: 'Alitas Thai', sales: 65, revenue: 260000 },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Estadísticas</h1>
        <p>Desempeño general del negocio</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={`${styles.statBox} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <h2>Ventas por Día</h2>
          <div className={styles.chart}>
            {dailyData.map((data, index) => (
              <div key={index} className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${(data.revenue / 2000000) * 100}%`,
                  }}
                />
                <span className={styles.barLabel}>{data.day.slice(0, 3)}</span>
              </div>
            ))}
          </div>
          <div className={styles.chartLegend}>
            <p>Ingresos por día (en miles)</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2>Productos Más Vendidos</h2>
          <div className={styles.productList}>
            {topProducts.map((product, index) => (
              <div key={index} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productStats}>
                    {product.sales} vendidas • $ {product.revenue}
                  </span>
                </div>
                <div className={styles.productBar}>
                  <div
                    className={styles.productBarFill}
                    style={{
                      width: `${(product.sales / 156) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Resumen Mensual</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Este Mes</th>
              <th>Mes Anterior</th>
              <th>Cambio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ingresos Totales</td>
              <td>$ 28,500,000</td>
              <td>$ 25,300,000</td>
              <td className={styles.positive}>+12.6%</td>
            </tr>
            <tr>
              <td>Número de Pedidos</td>
              <td>1,250</td>
              <td>1,180</td>
              <td className={styles.positive}>+5.9%</td>
            </tr>
            <tr>
              <td>Gasto Total</td>
              <td>$ 9,800,000</td>
              <td>$ 10,200,000</td>
              <td className={styles.positive}>-4.0%</td>
            </tr>
            <tr>
              <td>Ganancia Neta</td>
              <td>$ 18,700,000</td>
              <td>$ 15,100,000</td>
              <td className={styles.positive}>+23.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estadisticas;