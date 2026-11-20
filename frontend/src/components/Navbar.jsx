import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Truck,
  BarChart3,
  Users,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="bg-primary rounded p-1 d-flex align-items-center justify-content-center text-white">
            <Boxes size={20} />
          </div>
          <span className="fw-bold tracking-tight text-white">Stock<span className="text-primary">Smart</span></span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/" end>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/products">
                <Package size={16} />
                <span>Catalog</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/inventory">
                <Warehouse size={16} />
                <span>Inventory & Transfers</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/orders">
                <ShoppingCart size={16} />
                <span>Orders</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/suppliers">
                <Truck size={16} />
                <span>Suppliers & POs</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-1" to="/analytics">
                <BarChart3 size={16} />
                <span>Analytics</span>
              </NavLink>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/users">
                  <Users size={16} />
                  <span>Users</span>
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center text-light small">
              <div className="me-2 text-end d-none d-sm-block">
                <div className="fw-semibold text-white">{user?.first_name || user?.username}</div>
                <div className="badge bg-secondary text-light" style={{ fontSize: '0.7rem' }}>{role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
              title="Logout"
            >
              <LogOut size={15} />
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
