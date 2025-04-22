// src/VisitorList.js
import React, { useState } from 'react';
import './VisitorList.css';

const VisitorList = ({ title, visitors = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisitors = visitors.filter(visitor => {
    const fullText = `
      ${visitor.first_name} 
      ${visitor.last_name} 
      ${visitor.email} 
      ${visitor.id_number}
      ${visitor.phone} 
      ${visitor.issueType} 
      ${visitor.redirectTo}
    `.toLowerCase();

    return fullText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="visitor-list-container">
      <h2>{title}</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="🔍 Search visitors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <ul className="visitor-list">
        {filteredVisitors.map((visitor, index) => (
          <li key={index} className="visitor-item">
            <img
              src={visitor.photo || 'https://via.placeholder.com/60'}
              alt={`${visitor.first_name} ${visitor.last_name}`}
              className="visitor-photo"
            />
            <div className="visitor-details">
              <p><strong>Name:</strong> {visitor.first_name} {visitor.last_name}</p>
              <p><strong>Email:</strong> {visitor.email}</p>
              <p><strong>ID Number:</strong>{visitor.id_number}</p>
              <p><strong>Phone:</strong> {visitor.phone}</p>
              <p><strong>Issue Type:</strong> {visitor.issueType}</p>
              <p><strong>Redirected To:</strong> {visitor.redirectTo}</p>
              <p><strong>Visit Time:</strong> {new Date(visitor.timestamp).toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                {visitor.served ? (
                  <span style={{ color: 'green' }}>✅ Served</span>
                ) : (
                  <span style={{ color: 'red' }}>🕒 Not Served</span>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VisitorList;
