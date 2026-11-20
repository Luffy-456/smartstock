import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalized = String(status).toLowerCase().replace(/\s+/g, '_');
  return (
    <span className={`badge-status badge-status-${normalized}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
