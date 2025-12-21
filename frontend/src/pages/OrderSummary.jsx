import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Navbar, Footer } from "../components";

const OrderSummary = () => {
  const location = useLocation();
  const { name, items, total } = location.state || {};

  if (!items) {
    return (
      <div className="text-center my-5">
        <h2>No order found</h2>
        <Link to="/" className="btn btn-dark">Go Home</Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container my-5 py-5 text-center">
        <h1 className="display-4 text-success">Order Confirmed!</h1>
        <p className="lead">Thank you, <strong>{name}</strong>.</p>
        <hr />

        <div className="row justify-content-center">
          <div className="col-md-6 text-start">
            <h5>Items Purchased:</h5>
            <ul className="list-group mb-3">
              {items.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between">
                  <span>{item.title} (x{item.qty})</span>
                  <span>${(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))}
              <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total Paid</span>
                <span>${total.toFixed(2)}</span>
              </li>
            </ul>
            <Link to="/" className="btn btn-dark w-100">Continue Shopping</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSummary;
