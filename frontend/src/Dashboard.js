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
  
  const deleteVisitor = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/visitors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVisitors((prevVisitors) => prevVisitors.filter((visitor) => visitor.id !== id));
      } else {
        console.error('Failed to delete visitor');
      }
    } catch (err) {
      console.error('Error deleting visitor:', err);
    }
  };

  const addVisitor = (visitor) => {
    setVisitors(prev => [visitor, ...prev]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'new':
        return <ClientForm addVisitor={addVisitor} />;
  
      case 'recent':
        const normalize = (input) => {
          return input
            ? input.toLowerCase().trim().replace(/\s+/g, ' ')
            : '';
        };
        
        // Track how often each unique identifier (phone, ID, or full name) appears
        const visitorCounts = visitors.reduce((acc, visitor) => {
          const idKey = normalize(visitor.id_number);
          const phoneKey = normalize(visitor.phone);
          const nameKey = normalize(visitor.first_name + ' ' + visitor.last_name);
        
          const keys = [idKey, phoneKey, nameKey];
        
          keys.forEach(key => {
            if (key) {
              acc[key] = (acc[key] || 0) + 1;
            }
          });
        
          return acc;
        }, {});
        
        // Filter visitors who have any identifier that appears more than once
        const returningVisitors = visitors.filter(visitor => {
          const idKey = normalize(visitor.id_number);
          const phoneKey = normalize(visitor.phone);
          const nameKey = normalize(visitor.first_name + ' ' + visitor.last_name);
        
          return (
            (idKey && visitorCounts[idKey] > 1) ||
            (phoneKey && visitorCounts[phoneKey] > 1) ||
            (nameKey && visitorCounts[nameKey] > 1)
          );
        });
        
        console.log('Returning Visitors:', returningVisitors);
        
        return <VisitorList title="Returning Visitors" visitors={returningVisitors} deleteVisitor={deleteVisitor}/>;
        
  
      case 'all':
        return <VisitorList title="All Visitors" visitors={visitors} deleteVisitor={deleteVisitor}/>;
  
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
