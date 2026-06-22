import React from 'react';

export default function StatusBadge({ status }) {
  const label = String(status || 'pending').replaceAll('_', ' ');
  return <span className={`status-badge ${status || 'pending'}`}>{label}</span>;
}
