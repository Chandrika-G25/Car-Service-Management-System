import React from 'react';

export const Loading = ({ message = 'Loading details...' }) => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

export default Loading;
