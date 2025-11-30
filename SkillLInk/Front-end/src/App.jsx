import { useState } from "react";
import "./App.css";
import HomePage from "./pages/home.jsx";
import ProviderSignup from "./pages/ProviderSignup.jsx";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/firstlandingpage.jsx";
import CustomerSignup from "./pages/CustomerSignup.jsx";
import Login from "./pages/Login.jsx";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
