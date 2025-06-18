import React from 'react';
import { Link } from 'react-router-dom';
import './404.css';

function NotFound() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="notfound__cta">Go Home</Link>
    </div>
  );
}

export default NotFound; 