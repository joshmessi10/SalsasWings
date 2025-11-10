import { useEffect, useState } from "react";

export default function Configuracion() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Cargar configuración al montar el componente
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

  // --- Funciones genéricas para arrays (salsas, papas, bebidas) ---
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

  // --- Precios ---
  const handleChangePrecio = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      precios: { ...prev.precios, [name]: Number(value) },
    }));
  };

  // --- Guardar cambios en el backend ---
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

  if (loading) return <p>Cargando configuración...</p>;
  if (!config) return <p>Error al cargar configuración.</p>;

  // --- Helper para renderizar tablas dinámicas ---
  const renderTable = (title, field) => (
    <div style={{ marginBottom: "2rem" }}>
      <h2>{title}</h2>
      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "1rem" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {config[field].map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleChangeArray(field, i, e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              <td>
                <button onClick={() => handleRemoveArrayItem(field, i)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => handleAddArrayItem(field)}>➕ Agregar {title.slice(0, -1)}</button>
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1>⚙️ Configuración del Menú</h1>

      {renderTable("Salsas", "salsas")}
      {renderTable("Papas", "papas")}
      {renderTable("Bebidas", "bebidas")}

      <h2>Precios</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label>
          Combo sin bebida:
          <input
            type="number"
            name="comboSinBebida"
            value={config.precios.comboSinBebida}
            onChange={handleChangePrecio}
          />
        </label>
        <label>
          Combo con bebida:
          <input
            type="number"
            name="comboConBebida"
            value={config.precios.comboConBebida}
            onChange={handleChangePrecio}
          />
        </label>
        <label>
          Salsa extra:
          <input
            type="number"
            name="salsaExtra"
            value={config.precios.salsaExtra}
            onChange={handleChangePrecio}
          />
        </label>
      </div>

      <button
        style={{ marginTop: "1.5rem", padding: "10px 20px", fontSize: "16px" }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Guardando..." : "💾 Guardar Cambios"}
      </button>
    </div>
  );
}
