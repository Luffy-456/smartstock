import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, Lock, User, AlertCircle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-3 position-relative overflow-hidden"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 85% 80%, rgba(20, 184, 166, 0.10) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.05) 0%, transparent 60%)
        `,
      }}
    >
      {/* Decorative Floating Ambient Elements */}
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '320px',
          height: '320px',
          top: '-80px',
          right: '-80px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="position-absolute rounded-circle"
        style={{
          width: '360px',
          height: '360px',
          bottom: '-100px',
          left: '-100px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '440px', borderRadius: '1.25rem' }}>
        <div className="card-body p-4 p-sm-5 position-relative">
          {/* Header Brand */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex p-3 rounded-3 mb-3 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: 'white',
                boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.45)',
              }}
            >
              <Boxes size={34} strokeWidth={2.4} />
            </div>
            <h2 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.03em' }}>
              Stock<span style={{ color: '#059669' }}>Smart</span>
            </h2>
            <p className="text-muted small mb-0">
              Retail Inventory & Fulfillment Optimization
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-modern alert-modern-danger py-2 mb-3" role="alert">
              <AlertCircle size={18} className="flex-shrink-0" />
              <div className="small">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-slate-700">Username</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-1"
                  placeholder="e.g. admin or warehouse_mgr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-slate-700">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 ps-1"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="mt-4 pt-3 border-top text-center">
            <span className="text-muted small fw-medium d-block mb-2">
              <Sparkles size={13} className="text-emerald-600 me-1" />
              Quick fill credentials:
            </span>
            <div className="d-flex flex-wrap justify-content-center gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('admin', 'StockSmart@2026')}
                className="btn btn-sm btn-outline-secondary py-1 px-2.5"
                style={{ fontSize: '0.75rem' }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('warehouse_mgr', 'StockSmart@2026')}
                className="btn btn-sm btn-outline-secondary py-1 px-2.5"
                style={{ fontSize: '0.75rem' }}
              >
                Warehouse Mgr
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('store_associate', 'StockSmart@2026')}
                className="btn btn-sm btn-outline-secondary py-1 px-2.5"
                style={{ fontSize: '0.75rem' }}
              >
                Store Associate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-center text-muted small">
        <span className="d-inline-flex align-items-center gap-1.5">
          <span className="live-dot" style={{ width: '6px', height: '6px' }}></span>
          Enterprise RBAC • Supabase Cloud PostgreSQL
        </span>
      </div>
    </div>
  );
};
