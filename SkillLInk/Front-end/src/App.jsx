import { useState } from "react";
import "./App.css";
import HomePage from "./pages/home.jsx";
import ProviderSignup from "./pages/ProviderSignup.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/firstlandingpage.jsx";
import CustomerSignup from "./pages/CustomerSignup.jsx";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { Toaster } from "./components/ui/toaster.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/firstlandingpage" element={<LandingPage />} />
        <Route path="/customer-signup" element={<CustomerSignup />} />
        <Route path="/provider-signup" element={<ProviderSignup />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
