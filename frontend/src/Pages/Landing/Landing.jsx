import { useState, useEffect } from "react";
import styles from "./Landing.module.css";

const Landing = () => {
  const [orders, setOrders] = useState([]);

  // Cargar pedidos del día desde el backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/pedidos-dia");
        const data = await res.json();
        // Ordenar por horaEntrega ascendente (convertida a Date si posible)
        const sorted = data.sort((a, b) => {
          const t1 = parseTime(a.horaEntrega);
          const t2 = parseTime(b.horaEntrega);
          return t1 - t2;
        });
        setOrders(sorted);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
      }
    };
    fetchOrders();
  }, []);

  const parseTime = (hora) => {
    if (!hora) return new Date().setHours(0, 0, 0, 0);
    const [h, m = 0] = hora.replace(/[^\d:]/g, "").split(":").map(Number);
    const now = new Date();
    now.setHours(h, m, 0, 0);
    return now;
  };

  // Calcular hora -20 min
  const calcularHoraPreparacion = (horaEntrega) => {
    const base = parseTime(horaEntrega);
    const prep = new Date(base.getTime() - 20 * 60000);
    return prep.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  // Cambiar estado de pedido (pendiente ↔ completado)
  const toggleStatus = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === id
          ? { ...o, completado: !o.completado, estado: o.completado ? "Pendiente" : "Completado" }
          : o
      )
    );
  };

  const pedidosHoy = orders.length;
  const completados = orders.filter((o) => o.completado).length;
  const pendientes = pedidosHoy - completados;

  // Mostrar completados al final
  const ordenados = [
    ...orders.filter((o) => !o.completado),
    ...orders.filter((o) => o.completado),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Panel de Control</h1>
        <p>Pedidos del día y tiempos de preparación</p>
      </div>

      {/* === Estadísticas === */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pedidos Hoy</span>
          <span className={styles.statValue}>{pedidosHoy}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pendientes</span>
          <span className={styles.statValue}>{pendientes}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completados</span>
          <span className={styles.statValue}>{completados}</span>
        </div>
      </div>

      {/* === Tabla de pedidos === */}
      <div className={styles.section}>
        <h2>Pedidos del Día</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Combos</th>
              <th>Hora Solicitada</th>
              <th>Preparar a las</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((order) => (
              <tr key={order._id} className={order.completado ? styles.completed : ""}>
                <td>{order.numero}</td>
                <td>
                  {order.direccion}
                  {order.apartamento && `, ${order.apartamento}`}
                </td>
                <td>
                  {order.combos.map((c, i) => (
                    <div key={i}>
                      <strong>Combo {i + 1}:</strong> {c.tipoAlitas}, {c.papas},{" "}
                      {c.vegetales ? "con vegetales" : "sin vegetales"}<br />
                      <em>Salsas:</em> {c.salsas.join(", ")} <br />
                      <em>Bebida:</em> {c.bebida}
                      <hr />
                    </div>
                  ))}
                </td>
                <td>{order.horaEntrega}</td>
                <td>{calcularHoraPreparacion(order.horaEntrega)}</td>
                <td>{order.completado ? "Completado" : "Pendiente"}</td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!order.completado}
                      onChange={() => toggleStatus(order._id)}
                    />
                    {order.completado ? " ✓" : ""}
                  </label>
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
