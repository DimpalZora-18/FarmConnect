import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import ProtectedTest from "./pages/ProtectedTest";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Products from "./pages/Products";

function App(){
  return(
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/protected-test" 
              element={
                  <RoleBasedRoute allowedRoles={["admin"]}>
                      <ProtectedTest />
                   </RoleBasedRoute>
              } 
        />
        <Route path="/products" element={<Products/>} />
        
        {/* <Route
            path="/admin"
            element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                </RoleBasedRoute>
            }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;