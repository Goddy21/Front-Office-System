import React, { useEffect, useRef, useState } from 'react';
import './style.css';

const Camera = ({ onCapture, reset }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [streaming, setStreaming] = useState(false);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        setStreaming(true);
      };
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    console.log("🟡 Image Captured in Camera:", imageData);
    setPreview(imageData);
    onCapture(imageData);
  };

  // 👇 Reset preview when `reset` prop is true
  useEffect(() => {
    if (reset) {
      console.log("🔄 Resetting camera preview");
      setPreview(null);
    }
  }, [reset]);

  return (
    <div className="camera-container">
      {!preview ? (
        <>
          <video ref={videoRef} className="camera-video" />
          {!streaming && (
            <button type="button" className="camera-btn" onClick={startCamera}>Start Camera</button>
          )}
          {streaming && (
            <button type="button" className="camera-btn" onClick={capturePhoto}>Capture Photo</button>
          )}
        </>
      ) : (
        <>
          <img src={preview} alt="Preview" className="camera-preview" />
          <button type="button" className="camera-btn" onClick={() => setPreview(null)}>Retake</button>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Camera;
