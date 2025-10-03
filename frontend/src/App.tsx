import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ← usa react-router-dom aquí
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Map from "./pages/Map";


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
          <Route path="/map" element={<Map />} />
          <Route path="/users" element={<UserProfiles />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/images" element={<Images />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/forms" element={<FormElements />} />
          <Route path="/blank" element={<Blank />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}