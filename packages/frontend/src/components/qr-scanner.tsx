'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Flashlight, CheckCircle } from 'lucide-react';

interface QRScanResult {
  data: string;
  type: 'payment-link' | 'address' | 'unknown';
}

interface QRScannerProps {
  onScan: (result: QRScanResult) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const scan = () => {
      if (!isScanning || scanned) return;
      
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scan);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0);

      // Simple QR detection using image data
      // In production, use a library like jsQR
      // For now, we'll simulate with a timeout (demo purposes)
    };

    requestAnimationFrame(scan);
  };

  // Simulate scan for demo
  const simulateScan = () => {
    setScanned(true);
    setTimeout(() => {
      const mockResult: QRScanResult = {
        data: 'vessel://pay/0x1234567890123456789012345678901234567890?amount=100',
        type: 'payment-link'
      };
      onScan(mockResult);
    }, 1000);
  };

  const handleManualInput = () => {
    const input = prompt('Enter payment link or wallet address:');
    if (input) {
      let type: QRScanResult['type'] = 'unknown';
      if (input.startsWith('0x')) type = 'address';
      if (input.includes('vessel://') || input.includes('pay/')) type = 'payment-link';
      
      onScan({ data: input, type });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold">Scan QR Code</h2>
        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <Flashlight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Scanning Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Scanning Frame */}
          <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />
            
            {/* Scanning Line Animation */}
            {isScanning && !scanned && (
              <div className="absolute left-2 right-2 h-0.5 bg-purple-500 animate-scan" />
            )}
          </div>

          {/* Success State */}
          {scanned && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        {error ? (
          <div className="text-center mb-4">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleManualInput}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg"
            >
              Enter Manually
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white/80 mb-4">
              {scanned ? 'Processing...' : 'Point camera at QR code'}
            </p>
            <button
              onClick={simulateScan}
              disabled={scanned}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center gap-2 mx-auto"
            >
              <Camera className="w-5 h-5" />
              {scanned ? 'Scanned!' : 'Simulate Scan'}
            </button>
            <button
              onClick={handleManualInput}
              className="mt-4 text-white/60 hover:text-white text-sm"
            >
              Enter address manually
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 90%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Parse payment link from QR code
 */
export function parsePaymentLink(data: string): {
  address: string;
  amount?: string;
  token?: string;
  merchantId?: string;
} | null {
  try {
    // Format: vessel://pay/{address}?amount={amount}&token={token}
    if (data.includes('vessel://pay/')) {
      const url = data.replace('vessel://pay/', '');
      const [address, params] = url.split('?');
      
      const result: { address: string; amount?: string; token?: string } = {
        address: address.trim()
      };

      if (params) {
        const searchParams = new URLSearchParams(params);
        if (searchParams.has('amount')) result.amount = searchParams.get('amount') || undefined;
        if (searchParams.has('token')) result.token = searchParams.get('token') || undefined;
      }

      return result;
    }

    // Direct address format
    if (data.startsWith('0x') && data.length === 42) {
      return { address: data };
    }

    return null;
  } catch {
    return null;
  }
}

export default QRScanner;
