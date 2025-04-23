import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: "#111827",
        color: "white",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
      className="navbar"
    >
      <Link to="/" className="navbar-brand">🛍️ ShopZone</Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
        <Link to="/cart">🛒 Cart ({getTotalItems()})</Link>
      </div>
    </nav>
  );
};

export default Navbar;
