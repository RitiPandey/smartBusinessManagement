import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const hasScanned = useRef(false); // prevent firing twice

  const startScanner = async () => {
    try {
      setError(null);
      setScanning(true);
      hasScanned.current = false;

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get available cameras
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (devices.length === 0) {
        setError('No camera found on this device');
        setScanning(false);
        return;
      }

      // Prefer back camera on phones — look for "back" or "environment" in label
      const backCamera = devices.find(
        (d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
      );

      const selectedCamera = backCamera || devices[devices.length - 1];

      // Start decoding from video stream
      const controls = await reader.decodeFromVideoDevice(
        selectedCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result && !hasScanned.current) {
            // Mark as scanned so we don't fire multiple times
            hasScanned.current = true;
            stopScanner();
            onScan(result.getText());
          }
          // Ignore errors — they fire constantly while scanning
          if (err) {
            // Silently ignore scanning errors as they are normal during scanning
          }
        }
      );

      controlsRef.current = controls;
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Could not access camera. Please allow camera permission.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (error) {
        // Silently handle cleanup errors
        console.warn('Error stopping scanner:', error);
      }
      controlsRef.current = null;
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-primary" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Scan barcode
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Point camera at the barcode
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera area */}
        <div className="p-4">
          {error ? (
            // Error state
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera size={20} className="text-red-400" />
              </div>
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-2">
                Check browser camera permissions and try again
              </p>
              <button
                onClick={startScanner}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            // Video feed
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-xl object-cover"
                style={{ height: '260px' }}
                autoPlay
                muted
                playsInline
              />

              {/* Scanning overlay with animated line */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Corner brackets */}
                <div className="relative w-52 h-32">
                  {/* Top left */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl" />
                  {/* Top right */}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr" />
                  {/* Bottom left */}
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl" />
                  {/* Bottom right */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br" />

                  {/* Animated scan line */}
                  <div
                    className="absolute left-1 right-1 h-0.5 bg-primary opacity-80"
                    style={{
                      animation: 'scanline 1.8s ease-in-out infinite',
                      top: '50%',
                    }}
                  />
                </div>
              </div>

              {/* Scanning status */}
              {scanning && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <div className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Scanning...
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-3">
            Hold the barcode steady inside the frame
          </p>
        </div>
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scanline {
          0% { top: 10%; }
          50% { top: 85%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}