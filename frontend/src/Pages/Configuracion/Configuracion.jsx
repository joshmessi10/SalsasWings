import { useState } from 'react';
import styles from './Configuracion.module.css';

const Configuracion = () => {
  const [alitas, setAlitas] = useState(['BBQ', 'Picante', 'Ajo y Limón', 'Thai']);
  const [salsas, setSalsas] = useState(['Roja', 'Blanca', 'Verde', 'Especial']);
  const [papas, setPapas] = useState(['Papas', 'Papas Criollas', 'Camotes', 'Yuca Frita']);
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('alitas');

  const handleAddItem = () => {
    if (newItem.trim()) {
      if (category === 'alitas') setAlitas([...alitas, newItem]);
      else if (category === 'salsas') setSalsas([...salsas, newItem]);
      else setPapas([...papas, newItem]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index, cat) => {
    if (cat === 'alitas') setAlitas(alitas.filter((_, i) => i !== index));
    else if (cat === 'salsas') setSalsas(salsas.filter((_, i) => i !== index));
    else setPapas(papas.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Configuración</h1>
        <p>Gestiona los tipos de alitas, salsas y papas</p>
      </div>

      <div className={styles.addForm}>
        <div className={styles.formGroup}>
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
          >
            <option value="alitas">Alitas</option>
            <option value="salsas">Salsas</option>
            <option value="papas">Papas</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="item">Nuevo Item</label>
          <input
            id="item"
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className={styles.input}
            placeholder="Ej: Alitas Búfalo"
          />
        </div>
        <button onClick={handleAddItem} className={styles.btnPrimary}>
          Agregar
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Tipos de Alitas</h2>
          <ul className={styles.list}>
            {alitas.map((item, index) => (
              <li key={index}>
                <span>{item}</span>
                <button
                  className={styles.btnDelete}
                  onClick={() => handleRemoveItem(index, 'alitas')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h2>Tipos de Salsas</h2>
          <ul className={styles.list}>
            {salsas.map((item, index) => (
              <li key={index}>
                <span>{item}</span>
                <button
                  className={styles.btnDelete}
                  onClick={() => handleRemoveItem(index, 'salsas')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h2>Tipos de Papas</h2>
          <ul className={styles.list}>
            {papas.map((item, index) => (
              <li key={index}>
                <span>{item}</span>
                <button
                  className={styles.btnDelete}
                  onClick={() => handleRemoveItem(index, 'papas')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;