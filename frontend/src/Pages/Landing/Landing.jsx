import { useState, useEffect, useMemo } from "react";
import { FiCheckCircle, FiClock, FiMapPin, FiUser, FiList } from "react-icons/fi";
import styles from "./Landing.module.css";

const Landing = () => {
  const [orders, setOrders] = useState([]);

  // --- util original ---
  const parseTime = (hora) => {
    if (!hora) return new Date().setHours(0, 0, 0, 0);
    const [h, m = 0] = hora.replace(/[^\d:]/g, "").split(":").map(Number);
    const now = new Date();
    now.setHours(h, m, 0, 0);
    return now;
  };

  const calcularHoraPreparacion = (horaEntrega) => {
    const base = parseTime(horaEntrega);
    const prep = new Date(base.getTime() - 20 * 60000);
    return prep.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  };

  // --- data fetch original ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/pedidos-dia");
        const data = await res.json();
        const sorted = data.sort((a, b) => parseTime(a.horaEntrega) - parseTime(b.horaEntrega));
        setOrders(sorted);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
      }
    };
    fetchOrders();
  }, []);

  // --- toggle original ---
  const toggleStatus = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === id
          ? { ...o, completado: !o.completado, estado: o.completado ? "Pendiente" : "Completado" }
          : o
      )
    );
  };

  // KPIs (idéntico resultado)
  const pedidosHoy = orders.length;
  const completados = orders.filter((o) => o.completado).length;
  const pendientes = pedidosHoy - completados;

  // Mostrar completados al final (misma idea)
  const ordenados = useMemo(
    () => [...orders.filter((o) => !o.completado), ...orders.filter((o) => o.completado)],
    [orders]
  );

  // --- decorado visual según tiempo restante (no cambia datos) ---
  const classByTime = (o) => {
    if (o.completado) return `${styles.orderItem} ${styles.isDelivered}`;
    const diffMs = parseTime(o.horaEntrega) - new Date().getTime();
    if (diffMs <= 0) return `${styles.orderItem} ${styles.isLate}`;
    if (diffMs <= 20 * 60 * 1000) return `${styles.orderItem} ${styles.isDueSoon}`;
    return `${styles.orderItem} ${styles.isDefault}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Panel de Control</h1>
        <p>Pedidos del día y tiempos de preparación</p>
      </div>

      {/* Stats compactas (mismo CSS) */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}><FiList /> Pedidos Hoy</span>
          <span className={styles.statValue}>{pedidosHoy}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}><FiClock /> Pendientes</span>
          <span className={styles.statValue}>{pendientes}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}><FiCheckCircle /> Completados</span>
          <span className={styles.statValue}>{completados}</span>
        </div>
      </div>

      {/* Sección de pedidos: cards en matriz (no tabla) */}
      <div className={styles.section}>
        <h2>Pedidos del Día</h2>

        {ordenados.length === 0 ? (
          <p className={styles.empty}>No hay pedidos aún</p>
        ) : (
          <div className={styles.ordersList}>
            {ordenados.map((order) => (
              <div key={order._id} className={classByTime(order)}>
                {/* Header de la card */}
                <div className={styles.orderHeader}>
                  <span className={styles.customer}>
                    <FiUser style={{ verticalAlign: "-2px" }} /> {order.numero}
                  </span>
                  <span className={styles.date}>
                    {order.horaEntrega ? `Solicitado: ${order.horaEntrega}` : "Sin hora"}
                  </span>
                </div>

                {/* Body de la card */}
                <div className={styles.orderBody}>
                  <p className={styles.items}>
                    <FiMapPin style={{ verticalAlign: "-2px" }} />{" "}
                    {order.direccion}
                    {order.apartamento ? `, ${order.apartamento}` : ""}
                  </p>

                  <p className={styles.items}>
                    <strong>Preparar a las:</strong> {calcularHoraPreparacion(order.horaEntrega)}
                  </p>

                  <p className={styles.items}>
                    <strong>Estado:</strong>{" "}
                    <span
                      className={
                        order.completado
                          ? `${styles.badge} ${styles.listo}`
                          : `${styles.badge} ${styles.pendiente}`
                      }
                    >
                      {order.completado ? "Completado" : "Pendiente"}
                    </span>
                  </p>

                  {/* Combos */}
                  <ul className={styles.comboList}>
                    {order.combos.map((c, i) => (
                      <li key={i}>
                        <span style={{ fontWeight: 600 }}>Combo {i + 1}:</span>&nbsp;
                        <span>
                          {c.tipoAlitas}, {c.papas},{" "}
                          {c.vegetales ? "con vegetales" : "sin vegetales"}
                          {Array.isArray(c.salsas) && c.salsas.length > 0 && (
                            <> • Salsas: {c.salsas.join(", ")}</>
                          )}
                          {c.bebida ? <> • Bebida: <em>{c.bebida}</em></> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Barra de acción / estado (toggle original) */}
                <div className={styles.statusBar}>
                  <button
                    type="button"
                    className={`${styles.btnStatus} ${
                      order.completado ? styles.btnDelivered : styles.btnPending
                    }`}
                    onClick={() => toggleStatus(order._id)}
                    title={order.completado ? "Marcar como pendiente" : "Marcar como completado"}
                  >
                    {order.completado ? <FiCheckCircle /> : <FiClock />}
                    {order.completado ? "Completado" : "Marcar completado"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
