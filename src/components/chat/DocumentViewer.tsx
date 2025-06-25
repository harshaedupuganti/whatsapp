import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface DocumentViewerProps {
  isOpen: boolean;
  documentUrl: string;
  fileName: string;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  documentUrl,
  fileName,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-full m-4">
        {/* Header with controls */}
        <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm rounded-t-2xl p-4 z-10 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{fileName}</h3>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={18} className="text-gray-700" />
            </button>
            
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={18} className="text-gray-700" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Rotate"
            >
              <RotateCw size={18} className="text-gray-700" />
            </button>
            
            <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              {Math.round(zoom * 100)}%
            </div>
            
            <button
              onClick={handleClose}
              className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} className="text-red-600" />
            </button>
          </div>
        </div>
        
        {/* Document viewer */}
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden pt-16">
          <div 
            className="w-full h-full overflow-auto"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            {/* For demo purposes, we'll show a placeholder. In a real app, this would be an iframe or PDF viewer */}
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Preview</h3>
                <p className="text-gray-600 mb-4">{fileName}</p>
                <p className="text-sm text-gray-500">
                  In a real application, this would display the actual document content using a PDF viewer or iframe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};