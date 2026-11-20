import React, { useState } from 'react';
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
  User as UserIcon,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/products', label: 'Catalog', icon: Package },
    { to: '/inventory', label: 'Inventory', icon: Warehouse },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/suppliers', label: 'Suppliers & POs', icon: Truck },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ...(isAdmin ? [{ to: '/users', label: 'Users', icon: Users }] : []),
  ];

  return (
    <nav className="navbar navbar-expand-xl modern-navbar sticky-top">
      <div className="container-fluid px-3 px-xl-4">
        {/* Brand & Live status */}
        <div className="d-flex align-items-center gap-3">
          <Link className="d-flex align-items-center gap-2 text-decoration-none" to="/">
            <div className="brand-badge">
              <Boxes size={20} strokeWidth={2.5} />
            </div>
            <div className="d-flex flex-column">
              <span className="brand-title">
                Stock<span className="brand-accent">Smart</span>
              </span>
            </div>
          </Link>

          <div className="d-none d-md-flex align-items-center live-indicator">
            <span className="live-dot"></span>
            <span>Live Sync</span>
          </div>
        </div>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler border-0 p-1 text-slate-700 shadow-none d-xl-none"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Items */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show mt-3 mt-xl-0' : ''}`} id="navbarMain">
          <ul className="navbar-nav mx-auto mb-2 mb-xl-0 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    className="nav-link modern-nav-link"
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* User profile & Action */}
          <div className="d-flex align-items-center justify-content-between justify-content-xl-end gap-3 pt-2 pt-xl-0 border-top border-xl-0 border-light">
            <div className="d-flex align-items-center gap-2">
              <div className="user-avatar-circle">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="d-flex flex-column text-start">
                <span className="fw-bold text-dark small" style={{ lineHeight: 1.2 }}>
                  {user?.first_name || user?.username || 'User'}
                </span>
                <span
                  className="badge bg-emerald-100 text-emerald-800 border"
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.45rem',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    borderColor: '#a7f3d0'
                  }}
                >
                  {role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="d-none d-sm-inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
