import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ← usa react-router-dom aquí
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Productos from "./pages/Productos";
import Codigo from "./pages/CodigoUsuario";


import PrivateRoute from './utils/PrivateRoute';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/codigo" element={<Codigo />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}