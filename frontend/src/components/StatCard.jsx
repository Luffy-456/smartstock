import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: { bg: '#eff6ff', text: '#2563eb' },
    success: { bg: '#ecfdf5', text: '#10b981' },
    warning: { bg: '#fffbeb', text: '#f59e0b' },
    danger: { bg: '#fef2f2', text: '#ef4444' },
    purple: { bg: '#faf5ff', text: '#8b5cf6' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card stat-card h-100 p-3">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted small text-uppercase fw-semibold mb-1">{title}</div>
          <div className="h3 fw-bold mb-0 text-dark">{value}</div>
          {subtitle && <div className="small text-muted mt-1">{subtitle}</div>}
        </div>
        {Icon && (
          <div className="stat-icon-wrapper" style={{ backgroundColor: scheme.bg, color: scheme.text }}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};
