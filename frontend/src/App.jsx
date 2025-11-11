import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './Pages/Landing/Landing';
import Configuracion from './Pages/Configuracion/Configuracion';
import Gestion from './Pages/Gestion/Gestion';
import PedidosManuales from './Pages/PedidosManuales/PedidosManuales';
import Estadisticas from './Pages/Estadisticas/Estadisticas';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/gestion" element={<Gestion />} />
          <Route path="/pedidos-manuales" element={<PedidosManuales />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
