import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend = null }) => {
  const colorMap = {
    emerald: {
      bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      text: '#059669',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    primary: {
      bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      text: '#059669',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    success: {
      bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      text: '#16a34a',
      border: 'rgba(34, 197, 94, 0.25)',
    },
    teal: {
      bg: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
      text: '#0d9488',
      border: 'rgba(20, 184, 166, 0.25)',
    },
    warning: {
      bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      text: '#d97706',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    danger: {
      bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      text: '#e11d48',
      border: 'rgba(244, 63, 94, 0.25)',
    },
    purple: {
      bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      text: '#7c3aed',
      border: 'rgba(139, 92, 246, 0.25)',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="stat-card-modern h-100">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.725rem', letterSpacing: '0.06em' }}>
          {title}
        </span>
        {Icon && (
          <div
            className="stat-icon-container shadow-sm"
            style={{
              background: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
            }}
          >
            <Icon size={22} strokeWidth={2.2} />
          </div>
        )}
      </div>

      <div className="stat-value mb-1">{value}</div>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mt-2">
        {subtitle && (
          <span className="text-secondary small fw-medium" style={{ fontSize: '0.8rem' }}>
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className="badge rounded-pill fw-semibold"
            style={{
              backgroundColor: trend.isPositive ? '#ecfdf5' : '#fff1f2',
              color: trend.isPositive ? '#065f46' : '#9f1239',
              fontSize: '0.725rem',
              padding: '0.25rem 0.5rem',
            }}
          >
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
