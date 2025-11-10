import { useState } from 'react';
import styles from './Gestion.module.css';

const Gestion = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, description: 'Compra de pollo', amount: 500, date: '2024-01-15' },
    { id: 2, description: 'Gas y servicios', amount: 200, date: '2024-01-14' },
    { id: 3, description: 'Empaque y servilletas', amount: 150, date: '2024-01-13' },
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, item: 'Pollo fresco', quantity: 25, unit: 'kg', status: 'Bien' },
    { id: 2, item: 'Papas', quantity: 15, unit: 'kg', status: 'Bajo' },
    { id: 3, item: 'Salsas varias', quantity: 8, unit: 'L', status: 'Bien' },
    { id: 4, item: 'Empaque', quantity: 100, unit: 'u', status: 'Critico' },
  ]);

  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      setExpenses([...expenses, {
        id: expenses.length + 1,
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0],
      }]);
      setNewExpense({ description: '', amount: '' });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión</h1>
        <p>Controla gastos e inventario diario</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>Gastos (Egresos)</h2>
          <div className={styles.addExpenseForm}>
            <input
              type="text"
              placeholder="Descripción del gasto"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Monto"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className={styles.input}
            />
            <button onClick={handleAddExpense} className={styles.btnAdd}>
              Agregar
            </button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.description}</td>
                  <td>${expense.amount}</td>
                  <td>{expense.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.total}>
            Total Gastos: ${expenses.reduce((sum, e) => sum + e.amount, 0)}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Inventario (Revisión Diaria)</h2>
          <div className={styles.inventoryList}>
            {inventory.map((item) => (
              <div key={item.id} className={`${styles.inventoryItem} ${styles[item.status.toLowerCase()]}`}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.item}</span>
                  <span className={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <span className={styles.statusBadge}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gestion;