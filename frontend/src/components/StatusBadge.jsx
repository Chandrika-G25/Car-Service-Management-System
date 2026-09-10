import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalized = status.toUpperCase();
  const lower = status.toLowerCase();

  return (
    <span className={`badge badge-${lower}`}>
      {normalized.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
