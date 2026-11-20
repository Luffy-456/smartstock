import React from 'react';
import { Boxes, ShieldCheck, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 mt-auto" style={{ borderColor: 'rgba(16, 185, 129, 0.15)' }}>
      <div className="container-fluid px-3 px-xl-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2 text-muted small">
          <span className="fw-bold" style={{ color: '#059669' }}>
            StockSmart
          </span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="text-slate-300">•</span>
          <span>Retail Inventory & Multi-Warehouse Optimization</span>
        </div>

        <div className="d-flex align-items-center flex-wrap gap-2">
          <span
            className="badge rounded-pill fw-medium d-inline-flex align-items-center gap-1"
            style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.72rem' }}
          >
            <ShieldCheck size={12} />
            PostgreSQL Supabase
          </span>
          <span
            className="badge rounded-pill fw-medium d-inline-flex align-items-center gap-1"
            style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', fontSize: '0.72rem' }}
          >
            <Zap size={12} />
            Render API Active
          </span>
          <span
            className="badge rounded-pill fw-medium"
            style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '0.72rem' }}
          >
            React 18 + Vite
          </span>
        </div>
      </div>
    </footer>
  );
};
