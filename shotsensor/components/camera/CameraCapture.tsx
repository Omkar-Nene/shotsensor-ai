/**
 * Mobile-First Camera Capture Component
 * Handles camera access, image capture, and file upload fallback
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import Button from '../ui/Button';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onError: (error: string) => void;
}

export default function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Check for multiple cameras (front/back)
  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      })
      .catch(() => {
        // Ignore error, just assume single camera
      });
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      onError(
        'Unable to access camera. Please check permissions or use the upload option.'
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Flip camera (front/back)
  const flipCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    stopCamera();
    await startCamera();
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
  };

  // Confirm and use captured image
  const confirmCapture = () => {
    if (capturedImage) {
      stopCamera();
      onCapture(capturedImage);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Handle file upload (fallback for desktop or camera issues)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('Image too large. Please select an image under 10MB');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onCapture(imageData);
    };
    reader.onerror = () => {
      onError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Capture Table</h2>
          <p className="text-blue-200">
            Take a clear photo of the entire table
          </p>
        </div>

        {/* Camera View or Captured Image */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          {capturedImage ? (
            // Show captured image
            <img
              src={capturedImage}
              alt="Captured table"
              className="w-full h-full object-contain"
            />
          ) : isCameraActive ? (
            // Show live camera feed
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Camera overlay guides */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-4 border-white/30 border-dashed rounded-xl" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
              </div>
            </>
          ) : (
            // Placeholder
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-6xl">📷</div>
                <p className="text-white/60">Camera not active</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="space-y-4">
          {capturedImage ? (
            // Captured image controls
            <div className="flex gap-3">
              <Button
                onClick={retakePhoto}
                variant="outline"
                fullWidth
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                ↺ Retake
              </Button>
              <Button onClick={confirmCapture} variant="secondary" fullWidth>
                ✓ Use This Photo
              </Button>
            </div>
          ) : isCameraActive ? (
            // Camera active controls
            <div className="space-y-3">
              <Button onClick={capturePhoto} variant="secondary" fullWidth size="lg">
                📸 Capture Photo
              </Button>
              <div className="flex gap-3">
                {hasMultipleCameras && (
                  <Button
                    onClick={flipCamera}
                    variant="outline"
                    fullWidth
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    🔄 Flip Camera
                  </Button>
                )}
                <Button
                  onClick={stopCamera}
                  variant="ghost"
                  fullWidth
                  className="text-white hover:bg-white/10"
                >
                  ✕ Close Camera
                </Button>
              </div>
            </div>
          ) : (
            // Start camera or upload
            <div className="space-y-3">
              <Button onClick={startCamera} variant="primary" fullWidth size="lg">
                📷 Open Camera
              </Button>
              <div className="relative">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  fullWidth
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  📁 Upload Photo Instead
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 space-y-2">
          <p className="text-blue-200 text-sm font-semibold">📋 Tips for best results:</p>
          <ul className="text-blue-300/80 text-xs space-y-1 ml-4 list-disc">
            <li>Capture the entire table in frame</li>
            <li>Ensure good lighting (avoid shadows)</li>
            <li>Hold phone steady and level</li>
            <li>Make sure all balls are visible</li>
            <li>Avoid glare on balls or table</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()} // TODO: Better navigation
            className="text-blue-200 hover:text-white underline text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
