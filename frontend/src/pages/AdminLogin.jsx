import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Footer } from "../components";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // in real app, should call backend /api/login
    // for now just check against seeded admin credentials
    if (email === "admin@shop.com" && password === "password123") {
      sessionStorage.setItem("isAdminAuthenticated", "true");
      toast.success("Admin logged in successfully");
      navigate("/admin");
    } else {
      toast.error("Invalid Admin Credentials");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container my-5 py-5">
        <div className="row justify-content-center">
          <div className="col-md-4 border p-4 shadow-sm">
            <h2 className="text-center mb-4">Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label>Admin Email</label>
                <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label>Password</label>
                <input type="password" className="form-control" onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-dark w-100">Access Dashboard</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLogin;
