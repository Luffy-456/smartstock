import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const str = String(status);
  const normalized = str.toLowerCase().replace(/\s+/g, '_');
  
  return (
    <span className={`badge-status badge-status-${normalized}`}>
      {str.replace(/_/g, ' ')}
    </span>
  );
};
