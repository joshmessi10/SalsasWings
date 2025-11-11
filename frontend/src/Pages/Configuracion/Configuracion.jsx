import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import styles from "./Configuracion.module.css";

export default function Configuracion() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    fetch(`${API_URL}/config`)
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando configuración:", err);
        setLoading(false);
      });
  }, []);

  const handleChangeArray = (field, index, value) => {
    const newArray = [...config[field]];
    newArray[index] = value;
    setConfig({ ...config, [field]: newArray });
  };

  const handleAddArrayItem = (field) => {
    setConfig({ ...config, [field]: [...config[field], ""] });
  };

  const handleRemoveArrayItem = (field, index) => {
    const newArray = config[field].filter((_, i) => i !== index);
    setConfig({ ...config, [field]: newArray });
  };

  const handleChangePrecio = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      precios: { ...prev.precios, [name]: Number(value) },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setConfig(data);
      alert("✅ Configuración guardada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error guardando configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando configuración...</p>;
  if (!config) return <p className={styles.error}>Error al cargar configuración.</p>;

  const renderTable = (title, field) => (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      <div className={styles.tableWrap}>
        <table className={styles.table} role="table" aria-label={`Tabla de ${title}`}>
          <thead>
            <tr role="row">
              <th className={styles.colIndex}>#</th>
              <th>Nombre</th>
              <th className={styles.colAction}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {config[field].map((item, i) => (
              <tr key={i} role="row">
                <td className={styles.center}>{i + 1}</td>
                <td>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleChangeArray(field, i, e.target.value)}
                    className={styles.input}
                    placeholder="Escribe un nombre…"
                  />
                </td>
                <td className={styles.center}>
                  <button
                    type="button"
                    className={styles.btnDelete}
                    aria-label={`Eliminar ${item || `fila ${i + 1}`}`}
                    title="Eliminar"
                    onClick={() => handleRemoveArrayItem(field, i)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ÚNICO botón de agregar abajo */}
      <button
        type="button"
        className={styles.tableAddBtn}
        onClick={() => handleAddArrayItem(field)}
      >
        <FiPlus size={16} /> <span>Agregar {title.slice(0, -1)}</span>
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Configuración del Menú</h1>
        <p>Administra opciones y precios del menú</p>
      </div>

      {/* 3 columnas en una sola línea */}
      <div className={styles.grid}>
        {renderTable("Salsas", "salsas")}
        {renderTable("Papas", "papas")}
        {renderTable("Bebidas", "bebidas")}
      </div>

      <div className={styles.prices}>
        <h2>Precios</h2>
        <label className={styles.priceItem}>
          <span>Combo sin bebida</span>
          <input
            type="number"
            name="comboSinBebida"
            value={config.precios.comboSinBebida}
            onChange={handleChangePrecio}
            className={styles.input}
            placeholder="0"
          />
        </label>
        <label className={styles.priceItem}>
          <span>Combo con bebida</span>
          <input
            type="number"
            name="comboConBebida"
            value={config.precios.comboConBebida}
            onChange={handleChangePrecio}
            className={styles.input}
            placeholder="0"
          />
        </label>
        <label className={styles.priceItem}>
          <span>Salsa extra</span>
          <input
            type="number"
            name="salsaExtra"
            value={config.precios.salsaExtra}
            onChange={handleChangePrecio}
            className={styles.input}
            placeholder="0"
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={saving}
        >
          <FiSave size={16} />
          <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
        </button>
      </div>
    </div>
  );
}
