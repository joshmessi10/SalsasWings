import { get, post, put, API } from "../../lib/api";
import { useEffect, useState } from "react";
import styles from "./Gestion.module.css";

const Gestion = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({
    totalCombos: 0,
    alitas: 0,
    papas: 0,
    vegetales: 0,
    salsas: 0,
    frascos: 0,
    gaseosas: 0,
    cervezas: 0,
    cajas: 0,
  });

  // Cargar pedidos y gastos
  useEffect(() => {
    get("/pedidos-dia")
      .then((res) => res.json())
      .then((data) => {
        setPedidos(data);
        calcularTotales(data);
      })
      .catch((err) => console.error("Error obteniendo pedidos:", err));

    get("/gastos")
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Error obteniendo gastos:", err));
  }, []);

  // Calcular totales lógicos
  const calcularTotales = (data) => {
    let totalCombos = 0,
      alitas = 0,
      papas = 0,
      vegetales = 0,
      salsas = 0,
      gaseosas = 0,
      cervezas = 0,
      cajas = 0;

    data.forEach((pedido) => {
      pedido.combos.forEach((combo) => {
        totalCombos++;
        alitas += 10;
        papas++;
        cajas++;
        salsas += combo.salsas.length;
        if (combo.vegetales) vegetales++;
        if (combo.bebida === "Coca-Cola") gaseosas++;
        if (combo.bebida === "Corona") cervezas++;
      });
    });

    setStats({
      totalCombos,
      alitas,
      papas,
      vegetales,
      salsas,
      frascos: salsas,
      gaseosas,
      cervezas,
      cajas,
    });
  };

  // Agregar nuevo gasto
  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      try {
        const res = await get("/gastos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
          }),
        });
        const saved = await res.json();
        if (!res.ok) throw new Error(saved.error || "Error al guardar gasto");

        setExpenses([saved, ...expenses]);
        setNewExpense({ description: "", amount: "" });
      } catch (err) {
        console.error("Error guardando gasto:", err);
        alert("No se pudo guardar el gasto.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Gastos y Producción</h1>
        <p>Control diario de egresos e inventario lógico basado en pedidos</p>
      </div>

      <div className={styles.grid}>
        {/* === GASTOS === */}
        <div className={styles.section}>
          <h2>💸 Gastos (Egresos)</h2>
          <div className={styles.addExpenseForm}>
            <input
              type="text"
              placeholder="Descripción del gasto"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Monto"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
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
                <tr key={expense._id}>
                  <td>{expense.description}</td>
                  <td>${expense.amount.toLocaleString("es-CO")}</td>
                  <td>{expense.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.total}>
            Total Gastos: $
            {expenses
              .reduce((sum, e) => sum + e.amount, 0)
              .toLocaleString("es-CO")}
          </div>
        </div>

        {/* === INVENTARIO LÓGICO === */}
        <div className={styles.section}>
          <h2>📊 Resumen de Producción</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td>Total Combos</td>
                <td>{stats.totalCombos}</td>
              </tr>
              <tr>
                <td>Pollo (alitas)</td>
                <td>{stats.alitas}</td>
              </tr>
              <tr>
                <td>Papas</td>
                <td>{stats.papas}</td>
              </tr>
              <tr>
                <td>Combos con vegetales</td>
                <td>{stats.vegetales}</td>
              </tr>
              <tr>
                <td>Salsas (total)</td>
                <td>{stats.salsas}</td>
              </tr>
              <tr>
                <td>Frascos de salsa</td>
                <td>{stats.frascos}</td>
              </tr>
              <tr>
                <td>Gaseosas</td>
                <td>{stats.gaseosas}</td>
              </tr>
              <tr>
                <td>Cervezas</td>
                <td>{stats.cervezas}</td>
              </tr>
              <tr>
                <td>Cajas</td>
                <td>{stats.cajas}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Gestion;
