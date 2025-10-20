import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

const { createWorker } = window.Tesseract;

function RecipeScanner({ onCancel, onScanComplete }) {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [error, setError] = useState(null);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setStatus('Processing images...');
      setError(null);
      
      const imageFiles = Array.from(e.target.files);
      const processedImages = [];

      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        alwaysKeepResolution: true,
        exifOrientation: true,
      };

      try {
        for (const file of imageFiles) {
          const compressedFile = await imageCompression(file, options);
          processedImages.push(compressedFile);
        }
        setImages(prevImages => [...prevImages, ...processedImages]);
        setStatus('Idle');
      } catch (compressionError) {
        console.error('Image processing failed:', compressionError);
        setError('Failed to process one or more images.');
        setStatus('Error');
      }
    }
  };

  const handleRotateImage = (indexToRotate) => {
    const imageToRotate = images[indexToRotate];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Swap dimensions for rotation
      canvas.width = img.height;
      canvas.height = img.width;

      // Rotate the context
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        const rotatedFile = new File([blob], imageToRotate.name, {
          type: imageToRotate.type,
          lastModified: Date.now(),
        });
        
        const newImages = [...images];
        newImages[indexToRotate] = rotatedFile;
        setImages(newImages);
      }, imageToRotate.type);
    };
    img.src = URL.createObjectURL(imageToRotate);
  };

  const handleScan = async () => {
    if (images.length === 0) {
      alert('Please select an image first.');
      return;
    }
    
    setStatus('Initializing OCR...');
    setError(null);

    try {
      const worker = await createWorker();
      
      setStatus('Recognizing Text...');
      let fullText = '';
      for (let i = 0; i < images.length; i++) {
          const { data: { text } } = await worker.recognize(images[i]);
          fullText += text + '\n\n';
      }
      
      await worker.terminate();
      onScanComplete(fullText);
    } catch (err) {
      console.error("OCR process failed:", err);
      setError('OCR process failed. Please check your internet connection and browser console for errors.');
      setStatus('Error');
    }
  };

  const isProcessing = status.includes('Initializing') || status.includes('Recognizing') || status.includes('Processing');

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Scan a Recipe</h5>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label htmlFor="recipeImage" className="form-label">
            Capture or Upload Recipe Image(s)
          </label>
          <input
            type="file"
            className="form-control"
            id="recipeImage"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            multiple
            disabled={isProcessing}
          />
        </div>

        {images.length > 0 && (
          <div className="mb-3">
            <h6>Image Preview:</h6>
            <div className="row">
              {images.map((image, index) => (
                <div key={index} className="col-6 col-md-4 mb-2 text-center">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Recipe preview ${index + 1}`}
                    className="img-fluid rounded mb-2"
                  />
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleRotateImage(index)}
                    disabled={isProcessing}
                  >
                    Rotate 90°
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="d-flex align-items-center mb-3">
            <div className="spinner-border text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <strong>{status}</strong>
          </div>
        )}

        <div className="mt-3">
          <button className="btn btn-primary me-2" onClick={handleScan} disabled={images.length === 0 || isProcessing}>
            {isProcessing ? 'Scanning...' : 'Start Scan'}
          </button>
          <button className="btn btn-secondary" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeScanner;
