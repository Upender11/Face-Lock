import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center align-center py-2" style={{ display: 'inline-flex' }}>
      <div className="spinner"></div>
    </div>
  );
}
