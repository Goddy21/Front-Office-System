import React, { useState, useEffect } from 'react'; // include useEffect
import ClientForm from './ClientForm';
import VisitorList from './VisitorList';
import './dashboard.css';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('new');
  const [visitors, setVisitors] = useState([]);

  // Fetch all visitors when the dashboard mounts
  useEffect(() => {
    fetch('http://localhost:5000/api/visitors')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched visitors:', data); // <-- Add this for debugging
        if (Array.isArray(data)) {
          setVisitors(data);
        } else {
          console.error('Expected array, got:', data);
          setVisitors([]);
        }
      })
      .catch(err => {
        console.error('Error fetching visitors:', err);
        setVisitors([]);
      });
  }, []);
  

  const addVisitor = (visitor) => {
    setVisitors(prev => [visitor, ...prev]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'new':
        return <ClientForm addVisitor={addVisitor} />;
  
      case 'recent':
        // Helper function to normalize names, emails, and phone numbers
        const normalize = (input) => {
          return input
            ? input.toLowerCase().trim().replace(/\s+/g, ' ') // Normalize spaces and case
            : '';
        };
  
        // Track counts based on normalized name, email, or phone
        const visitorCounts = visitors.reduce((acc, visitor) => {
          const nameKey = normalize(visitor.name);
          const emailKey = normalize(visitor.email);
          const phoneKey = normalize(visitor.phone);
  
          // Using name + email or phone as a combined unique identifier
          const uniqueKey = nameKey + '|' + emailKey + '|' + phoneKey;
  
          if (uniqueKey) {
            acc[uniqueKey] = (acc[uniqueKey] || 0) + 1;
          }
          return acc;
        }, {});
  
        // Filter for returning visitors based on the counts of the unique key
        const returningVisitors = visitors.filter(visitor => {
          const nameKey = normalize(visitor.name);
          const emailKey = normalize(visitor.email);
          const phoneKey = normalize(visitor.phone);
  
          const uniqueKey = nameKey + '|' + emailKey + '|' + phoneKey;
          return visitorCounts[uniqueKey] > 1;
        });
  
        console.log('Returning Visitors:', returningVisitors); // Debug output
  
        return <VisitorList title="Returning Visitors" visitors={returningVisitors} />;
  
      case 'all':
        return <VisitorList title="All Visitors" visitors={visitors} />;
  
      default:
        return null;
    }
  };  
  

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Dashboard</h2>
        <button onClick={() => setCurrentView('new')}>➕ New Visitor</button>
        <button onClick={() => setCurrentView('recent')}>🕓 Returning Visitors</button>
        <button onClick={() => setCurrentView('all')}>📋 All Visitors</button>
      </div>
      <div className="main-content">
        {(currentView === 'recent' || currentView === 'all')}
        {renderView()}
      </div>
    </div>
  );
};

export default Dashboard;
