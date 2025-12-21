import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components";

import AdminSales from "../components/admin/AdminSales";
import AdminCustomers from "../components/admin/AdminCustomers";
import AdminInventory from "../components/admin/AdminInventory";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("sales");

  useEffect(() => {
    const ok = sessionStorage.getItem("isAdminAuthenticated") === "true";
    if (!ok) navigate("/admin-login", { replace: true });
  }, [navigate]);

  const handleAdminLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    navigate("/admin-login", { replace: true });
  };

  return (
    <>
      <Navbar />
      <div className="container my-3 py-3">
        <h1 className="text-center">Admin Control Panel</h1>
        <hr />

        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-outline-dark" type="button" onClick={handleAdminLogout}>
            Logout Admin
          </button>
        </div>

        <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
          <button
            className={`btn ${tab === "sales" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setTab("sales")}
            type="button"
          >
            Sales
          </button>
          <button
            className={`btn ${tab === "customers" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setTab("customers")}
            type="button"
          >
            Customers
          </button>
          <button
            className={`btn ${tab === "inventory" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setTab("inventory")}
            type="button"
          >
            Inventory
          </button>
        </div>

        {tab === "sales" && <AdminSales />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "inventory" && <AdminInventory />}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
