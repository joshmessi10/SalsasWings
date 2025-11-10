import { useState, useEffect } from "react";
import styles from "./PedidosManuales.module.css";

const PedidosManuales = () => {
  const [manualOrders, setManualOrders] = useState([]);
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

  // === Cargar pedidos ya registrados ===
  useEffect(() => {
    fetch("http://localhost:3000/pedidos-manuales")
      .then((res) => res.json())
      .then(setManualOrders)
      .catch((err) => console.error("Error cargando pedidos:", err));
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

  // === Enviar pedido ===
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

      {/* === Formulario === */}
      <div className={styles.formCard}>
        <h2>Registrar Nuevo Pedido</h2>

        <div className={styles.form}>
          <input
            type="text"
            placeholder="Número (Ej: 573108121498)"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Apartamento / Torre"
            value={form.apartamento}
            onChange={(e) => setForm({ ...form, apartamento: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Hora de entrega (Ej: Ya mismo)"
            value={form.horaEntrega}
            onChange={(e) => setForm({ ...form, horaEntrega: e.target.value })}
            className={styles.input}
          />
          <textarea
            placeholder="Observaciones"
            value={form.observaciones}
            onChange={(e) =>
              setForm({ ...form, observaciones: e.target.value })
            }
            className={styles.textarea}
          />
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
          <input
            type="number"
            placeholder="Total (Ej: 56000)"
            value={form.total}
            onChange={(e) => setForm({ ...form, total: e.target.value })}
            className={styles.input}
          />

          {/* === Sección Combos === */}
          <h3>Combos</h3>
          {form.combos.map((combo, index) => (
            <div key={index} className={styles.comboCard}>
              <h4>Combo {index + 1}</h4>
              <input
                type="text"
                placeholder="Tipo de alitas"
                value={combo.tipoAlitas}
                onChange={(e) =>
                  handleComboChange(index, "tipoAlitas", e.target.value)
                }
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Tipo de papas"
                value={combo.papas}
                onChange={(e) =>
                  handleComboChange(index, "papas", e.target.value)
                }
                className={styles.input}
              />
              <label>
                <input
                  type="checkbox"
                  checked={combo.vegetales}
                  onChange={(e) =>
                    handleComboChange(index, "vegetales", e.target.checked)
                  }
                />
                Incluir vegetales
              </label>

              <div className={styles.salsasSection}>
                <p>Salsas:</p>
                {combo.salsas.map((salsa, iSalsa) => (
                  <div key={iSalsa} className={styles.salsaItem}>
                    <input
                      type="text"
                      placeholder={`Salsa ${iSalsa + 1}`}
                      value={salsa}
                      onChange={(e) =>
                        handleSalsaChange(index, e.target.value, iSalsa)
                      }
                      className={styles.inputSmall}
                    />
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
                  + Agregar Salsa
                </button>
              </div>

              <input
                type="text"
                placeholder="Bebida"
                value={combo.bebida}
                onChange={(e) =>
                  handleComboChange(index, "bebida", e.target.value)
                }
                className={styles.input}
              />

              <button
                onClick={() => removeCombo(index)}
                className={styles.btnDelete}
              >
                Eliminar Combo
              </button>
            </div>
          ))}

          <button onClick={addCombo} className={styles.btnAddCombo}>
            + Agregar Combo
          </button>

          <button onClick={handleSubmit} className={styles.btnSubmit}>
            Registrar Pedido
          </button>
        </div>
      </div>

      {/* === Lista de pedidos del día === */}
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
