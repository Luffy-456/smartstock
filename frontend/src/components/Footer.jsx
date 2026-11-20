import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 mt-auto text-muted small">
      <div className="container-fluid px-3 px-lg-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <div>
          <span className="fw-semibold text-dark">StockSmart</span> &copy; 2024–2026. Retail Inventory Optimization System.
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-light text-secondary border">Supabase PostgreSQL</span>
          <span className="badge bg-light text-secondary border">Render Ready</span>
          <span className="badge bg-light text-secondary border">GitHub Pages</span>
        </div>
      </div>
    </footer>
  );
};
