import { useState, useEffect } from "react";
import styles from "./PedidosManuales.module.css";

const PedidosManuales = () => {
  const [manualOrders, setManualOrders] = useState([]);
  const [menuConfigs, setMenuConfigs] = useState({
    alitas: [],
    papas: [],
    salsas: [],
    bebidas: [],
  });

  const [form, setForm] = useState({
    numero: "",
    direccion: "",
    apartamento: "",
    horaEntrega: "",
    observaciones: "",
    metodoPago: "Efectivo",
    total: "",
    combos: [
      {
        tipoAlitas: "",
        papas: "",
        vegetales: false,
        salsas: [],
        bebida: "",
      },
    ],
  });

  // === Cargar pedidos manuales ===
  useEffect(() => {
    fetch("http://localhost:3000/pedidos-manuales")
      .then((res) => res.json())
      .then(setManualOrders)
      .catch((err) => console.error("Error cargando pedidos:", err));
  }, []);

  // === Cargar configuración del menú ===
  useEffect(() => {
    fetch("http://localhost:3000/config")
      .then((res) => res.json())
      .then((data) => {
        // Estructura esperada: { alitas: [...], papas: [...], salsas: [...], bebidas: [...] }
        setMenuConfigs({
          alitas: data?.alitas || [],
          papas: data?.papas || [],
          salsas: data?.salsas || [],
          bebidas: data?.bebidas || [],
        });
      })
      .catch((err) => console.error("Error cargando configuración del menú:", err));
  }, []);

  // === Funciones para combos ===
  const handleComboChange = (index, field, value) => {
    const newCombos = [...form.combos];
    newCombos[index][field] = value;
    setForm({ ...form, combos: newCombos });
  };

  const handleSalsaChange = (index, value, iSalsa) => {
    const newCombos = [...form.combos];
    newCombos[index].salsas[iSalsa] = value;
    setForm({ ...form, combos: newCombos });
  };

  const addSalsa = (index) => {
    const newCombos = [...form.combos];
    newCombos[index].salsas.push("");
    setForm({ ...form, combos: newCombos });
  };

  const removeSalsa = (index, iSalsa) => {
    const newCombos = [...form.combos];
    newCombos[index].salsas.splice(iSalsa, 1);
    setForm({ ...form, combos: newCombos });
  };

  const addCombo = () => {
    setForm({
      ...form,
      combos: [
        ...form.combos,
        { tipoAlitas: "", papas: "", vegetales: false, salsas: [], bebida: "" },
      ],
    });
  };

  const removeCombo = (index) => {
    const newCombos = [...form.combos];
    newCombos.splice(index, 1);
    setForm({ ...form, combos: newCombos });
  };

  // === Registrar pedido ===
  const handleSubmit = async () => {
    if (!form.numero || !form.total || form.combos.length === 0) {
      alert("Debes llenar los campos principales y al menos un combo.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/pedidos-manuales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al registrar pedido");
      const nuevoPedido = await res.json();
      setManualOrders([nuevoPedido, ...manualOrders]);

      // Reiniciar formulario
      setForm({
        numero: "",
        direccion: "",
        apartamento: "",
        horaEntrega: "",
        observaciones: "",
        metodoPago: "Efectivo",
        total: "",
        combos: [
          {
            tipoAlitas: "",
            papas: "",
            vegetales: false,
            salsas: [],
            bebida: "",
          },
        ],
      });
    } catch (err) {
      console.error(err);
      alert("Error al crear el pedido manual.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Pedidos Manuales</h1>
        <p>Agrega pedidos recibidos por teléfono o en persona</p>
      </div>

      <div className={styles.formCard}>
        <h2>Registrar Nuevo Pedido</h2>

        {/* === TABLA 1: Datos generales === */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th colSpan="2">Datos del Pedido</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Número</td>
              <td>
                <input
                  type="text"
                  placeholder="Ej: 573108121498"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className={styles.input}
                />
              </td>
            </tr>
            <tr>
              <td>Dirección</td>
              <td>
                <input
                  type="text"
                  placeholder="Dirección"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  className={styles.input}
                />
              </td>
            </tr>
            <tr>
              <td>Apartamento</td>
              <td>
                <input
                  type="text"
                  placeholder="Apartamento / Torre"
                  value={form.apartamento}
                  onChange={(e) =>
                    setForm({ ...form, apartamento: e.target.value })
                  }
                  className={styles.input}
                />
              </td>
            </tr>
            <tr>
              <td>Hora de Entrega</td>
              <td>
                <input
                  type="text"
                  placeholder="Ej: Ya mismo"
                  value={form.horaEntrega}
                  onChange={(e) =>
                    setForm({ ...form, horaEntrega: e.target.value })
                  }
                  className={styles.input}
                />
              </td>
            </tr>
            <tr>
              <td>Observaciones</td>
              <td>
                <textarea
                  placeholder="Observaciones"
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                  className={styles.textarea}
                />
              </td>
            </tr>
            <tr>
              <td>Método de Pago</td>
              <td>
                <select
                  value={form.metodoPago}
                  onChange={(e) =>
                    setForm({ ...form, metodoPago: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata">Daviplata</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Total</td>
              <td>
                <input
                  type="number"
                  placeholder="Ej: 56000"
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  className={styles.input}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* === TABLA 2: Combos === */}
        <h3>Combos</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Alitas</th>
              <th>Papas</th>
              <th>Vegetales</th>
              <th>Salsas</th>
              <th>Bebida</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {form.combos.map((combo, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <select
                    value={combo.tipoAlitas}
                    onChange={(e) =>
                      handleComboChange(index, "tipoAlitas", e.target.value)
                    }
                    className={styles.inputSmall}
                  >
                    <option value="">Seleccionar</option>
                    {menuConfigs.alitas.map((a, i) => (
                      <option key={i} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={combo.papas}
                    onChange={(e) =>
                      handleComboChange(index, "papas", e.target.value)
                    }
                    className={styles.inputSmall}
                  >
                    <option value="">Seleccionar</option>
                    {menuConfigs.papas.map((p, i) => (
                      <option key={i} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.center}>
                  <input
                    type="checkbox"
                    checked={combo.vegetales}
                    onChange={(e) =>
                      handleComboChange(index, "vegetales", e.target.checked)
                    }
                  />
                </td>
                <td>
                  {combo.salsas.map((salsa, iSalsa) => (
                    <div key={iSalsa} className={styles.salsaItem}>
                      <select
                        value={salsa}
                        onChange={(e) =>
                          handleSalsaChange(index, e.target.value, iSalsa)
                        }
                        className={styles.inputSmall}
                      >
                        <option value="">Seleccionar</option>
                        {menuConfigs.salsas.map((s, i) => (
                          <option key={i} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeSalsa(index, iSalsa)}
                        className={styles.btnSmall}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSalsa(index)}
                    className={styles.btnAddSmall}
                  >
                    + Salsa
                  </button>
                </td>
                <td>
                  <select
                    value={combo.bebida}
                    onChange={(e) =>
                      handleComboChange(index, "bebida", e.target.value)
                    }
                    className={styles.inputSmall}
                  >
                    <option value="">Seleccionar</option>
                    {menuConfigs.bebidas.map((b, i) => (
                      <option key={i} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={styles.center}>
                  <button
                    onClick={() => removeCombo(index)}
                    className={styles.btnDelete}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.actions}>
          <button onClick={addCombo} className={styles.btnAddCombo}>
            + Agregar Combo
          </button>
          <button onClick={handleSubmit} className={styles.btnSubmit}>
            Registrar Pedido
          </button>
        </div>
      </div>

      {/* === LISTA DE PEDIDOS === */}
      <div className={styles.listCard}>
        <h2>Pedidos del día</h2>
        {manualOrders.length === 0 ? (
          <p className={styles.empty}>No hay pedidos aún</p>
        ) : (
          manualOrders.map((p) => (
            <div key={p._id} className={styles.orderItem}>
              <div className={styles.orderHeader}>
                <span>{p.numero}</span>
                <span>{new Date(p.fecha).toLocaleString()}</span>
              </div>
              <p>{p.direccion}</p>
              <p>
                <b>Pago:</b> {p.metodoPago} —{" "}
                <b>Total:</b> ${p.total.toLocaleString("es-CO")}
              </p>
              <ul>
                {p.combos.map((c, i) => (
                  <li key={i}>
                    🍗 <b>{c.tipoAlitas}</b> con {c.papas},{" "}
                    {c.vegetales ? "con vegetales" : "sin vegetales"} —{" "}
                    <i>{c.bebida}</i>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PedidosManuales;
