// src/ClientForm.js
import React, { useState } from 'react';
import Camera from './Camera';
import './style.css';

const ClientForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name:'',
    artist_name:'',
    email: '',
    id_number:'',
    phone: '',
    issueType: '',
    photo: '',
    redirectTo: ''
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCapture = (base64Image) => {
    console.log("Captured image: ", base64Image);
    setFormData(prev => ({ ...prev, photo: base64Image }));
    setPhotoPreview(base64Image);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
        const response = await fetch('http://localhost:5000/api/visitors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            setStatusMessage("✅ Visitor received successfully!");
            setIsSubmitting(false)
            console.log('Visitors details received: ', data);
        } else {
            // Parse the JSON response even for error cases
            try {
                const errorData = await response.json();
                setStatusMessage(errorData.error || "Something went wrong. Try again later!");
                console.log('Visitors data reception failed: ', errorData);
            } catch (parseError) {
                // Handle cases where the server doesn't return JSON
                setStatusMessage("Something went wrong.  Server error.");
                console.error('Error parsing error response:', parseError);
            }
        }
    } catch (error) {
        console.error('Error', error);
        setStatusMessage("Network error.  Could not connect to the server.");
    }

    // Clear form
    setFormData({
      first_name: '',
      last_name:'',
      artist_name:'',
      email: '',
      id_number:'',
      phone: '',
      issueType: '',
      photo: '',
      redirectTo: ''
    });
    setPhotoPreview(null);
};


  return (
    <div className="client-form">
      <h2 className="form-title">Welcome to Mkononi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Artist Name</label>
          <input type="text" name="artist_name" value={formData.artist_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
        <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
        <label>ID Number</label>
          <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} required pattern="[0-9]{8}" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="e.g. 07..." />
        </div>

        <div className="form-group">
          <label>Purpose of Visit</label>
          <select name="issueType" value={formData.issueType} onChange={handleChange} required>
            <option value="">-- Select --</option>
            <option value="Skiza Tunes">Skiza Tunes</option>
            <option value="Digital Distribution Service">Digital Distribution Service</option>
            <option value="Payments">Payments</option>
            <option value="Youtube Management">YouTube Management</option>
            <option value="Payments">Payments</option>
            <option value="Royalty Advances">Royalty Advances</option>
            <option value="General Inquiries">General Inquiries</option>
          </select>
        </div>

        <div className="form-group">
          <label>Capture Visitor Photo</label>
          <Camera onCapture={handleCapture} reset={photoPreview === null} />
        </div>

        {photoPreview && (
          <div className="form-group">
            <label>Photo Preview:</label>
            <img
              src={photoPreview}
              alt="Captured"
              style={{ width: '150px', borderRadius: '8px', marginTop: '10px' }}
            />
          </div>
        )}
        <div className="form-group">
          <label>Redirect to Staff</label>
          <select name="redirectTo" value={formData.redirectTo} onChange={handleChange} required>
            <option value="">-- Select Staff --</option>
            <option value="Admin - Contract Agreements">Admin - Contract Agreement</option>
            <option value="Lilian - Payments">Lilian - Payments</option>
            <option value="Ann- Content upload">Ann - Content Upload</option>
            <option value="Edwin- General Support">Edwin - General Support</option>
          </select>
        </div>
        <button className="submit-btn" type="submit">Submit</button>
        <br />
        {isSubmitting && (
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
          <p>Submitting...</p>
        </div>
        )}
        {statusMessage && <p className="status-msg">{statusMessage}</p>}
      </form>
    </div>
  );
};

export default ClientForm;
