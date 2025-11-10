import { useEffect, useState } from "react";
import styles from "./Estadisticas.module.css";

const Estadisticas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos del día desde el backend
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("http://localhost:3000/pedidos-dia");
        const data = await res.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error obteniendo pedidos del día:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando estadísticas...</div>;

  // === Cálculos básicos ===
  const totalPedidos = pedidos.length;
  const pedidosCompletados = totalPedidos; // todos se consideran completados
  const pedidosPendientes = 0; // podrías extender con estado real si lo agregas
  const ingresosTotales = pedidos.reduce((acc, p) => acc + (p.total || 0), 0);
  const gastoEstimado = ingresosTotales * 0.35; // ejemplo estimado de costos
  const gananciaNeta = ingresosTotales - gastoEstimado;

  // === Agrupar ventas por día de la semana ===
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const ventasPorDia = diasSemana.map((dia, i) => {
    const pedidosDia = pedidos.filter((p) => new Date(p.fecha).getDay() === i);
    const revenue = pedidosDia.reduce((acc, p) => acc + (p.total || 0), 0);
    return { day: dia, orders: pedidosDia.length, revenue };
  });

  // === Top productos (por nombre de salsa o tipo de alitas) ===
  const contadorProductos = {};
  pedidos.forEach((p) => {
    p.combos.forEach((c) => {
      const key = c.tipoAlitas || "Desconocido";
      contadorProductos[key] = (contadorProductos[key] || 0) + 1;
    });
  });

  const topProducts = Object.entries(contadorProductos)
    .map(([name, sales]) => ({
      name,
      sales,
      revenue: sales * 25000, // estimación base
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const stats = [
    { label: "Ingresos Hoy", value: `$ ${ingresosTotales.toLocaleString("es-CO")}`, icon: "💰", color: "green" },
    { label: "Pedidos Completados", value: pedidosCompletados.toString(), icon: "✓", color: "blue" },
    { label: "Pedidos Pendientes", value: pedidosPendientes.toString(), icon: "⏳", color: "yellow" },
    { label: "Gasto Total", value: `$ ${gastoEstimado.toLocaleString("es-CO")}`, icon: "💸", color: "red" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Estadísticas</h1>
        <p>Desempeño general del negocio</p>
      </div>

      {/* === Resumen rápido === */}
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

      {/* === Ventas por Día === */}
      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <h2>Ventas por Día</h2>
          <div className={styles.chart}>
            {ventasPorDia.map((data, index) => (
              <div key={index} className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{
                    height: `${(data.revenue / Math.max(...ventasPorDia.map(v => v.revenue || 1))) * 100}%`,
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

        {/* === Productos más vendidos === */}
        <div className={styles.card}>
          <h2>Productos Más Vendidos</h2>
          <div className={styles.productList}>
            {topProducts.map((product, index) => (
              <div key={index} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productStats}>
                    {product.sales} vendidas • ${product.revenue.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className={styles.productBar}>
                  <div
                    className={styles.productBarFill}
                    style={{
                      width: `${(product.sales / topProducts[0].sales) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Resumen mensual === */}
      <div className={styles.card}>
        <h2>Resumen Mensual</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Hoy</th>
              <th>Estimación Mes</th>
              <th>Cambio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ingresos Totales</td>
              <td>$ {ingresosTotales.toLocaleString("es-CO")}</td>
              <td>$ {(ingresosTotales * 30).toLocaleString("es-CO")}</td>
              <td className={styles.positive}>+12.6%</td>
            </tr>
            <tr>
              <td>Número de Pedidos</td>
              <td>{totalPedidos}</td>
              <td>{totalPedidos * 30}</td>
              <td className={styles.positive}>+5.9%</td>
            </tr>
            <tr>
              <td>Gasto Total</td>
              <td>$ {gastoEstimado.toLocaleString("es-CO")}</td>
              <td>$ {(gastoEstimado * 30).toLocaleString("es-CO")}</td>
              <td className={styles.positive}>-4.0%</td>
            </tr>
            <tr>
              <td>Ganancia Neta</td>
              <td>$ {gananciaNeta.toLocaleString("es-CO")}</td>
              <td>$ {(gananciaNeta * 30).toLocaleString("es-CO")}</td>
              <td className={styles.positive}>+23.8%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Estadisticas;
