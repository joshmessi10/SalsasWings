import { useState } from 'react';
import styles from './PedidosManuales.module.css';

const PedidosManuales = () => {
  const [manualOrders, setManualOrders] = useState([
    { id: 1, customer: 'Teléfono: 1234-5678', items: 'Alitas BBQ x2, Papas', total: 45000, date: '2024-01-15 14:30' },
    { id: 2, customer: 'Contador: Marta', items: 'Combo Especial x3', total: 135000, date: '2024-01-15 13:45' },
  ]);

  const [form, setForm] = useState({
    customer: '',
    items: '',
    total: '',
  });

  const handleAddOrder = () => {
    if (form.customer && form.items && form.total) {
      setManualOrders([...manualOrders, {
        id: manualOrders.length + 1,
        ...form,
        date: new Date().toLocaleString(),
      }]);
      setForm({ customer: '', items: '', total: '' });
    }
  };

  const handleDeleteOrder = (id) => {
    setManualOrders(manualOrders.filter(order => order.id !== id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pedidos Manuales</h1>
        <p>Registra pedidos recibidos por teléfono o contador</p>
      </div>

      <div className={styles.formCard}>
        <h2>Registrar Nuevo Pedido</h2>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="customer">Cliente / Referencia</label>
            <input
              id="customer"
              type="text"
              placeholder="Ej: Teléfono: 1234-5678 o Nombre"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="items">Artículos / Detalles</label>
            <textarea
              id="items"
              placeholder="Ej: Alitas BBQ x2, Papas, Gaseosa"
              value={form.items}
              onChange={(e) => setForm({ ...form, items: e.target.value })}
              className={styles.textarea}
              rows="3"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="total">Monto Total</label>
            <input
              id="total"
              type="number"
              placeholder="Ej: 45000"
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
              className={styles.input}
            />
          </div>
          <button onClick={handleAddOrder} className={styles.btnSubmit}>
            Registrar Pedido
          </button>
        </div>
      </div>

      <div className={styles.listCard}>
        <h2>Pedidos Registrados Hoy</h2>
        <div className={styles.ordersList}>
          {manualOrders.length === 0 ? (
            <p className={styles.empty}>No hay pedidos registrados</p>
          ) : (
            manualOrders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderHeader}>
                  <span className={styles.customer}>{order.customer}</span>
                  <span className={styles.date}>{order.date}</span>
                </div>
                <div className={styles.orderBody}>
                  <p className={styles.items}>{order.items}</p>
                  <div className={styles.orderFooter}>
                    <span className={styles.total}>${order.total}</span>
                    <button
                      className={styles.btnDelete}
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosManuales;