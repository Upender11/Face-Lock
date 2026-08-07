import { useEffect, useRef, useState } from 'react';
import { CameraOff } from 'lucide-react';

interface CameraProps {
  onCapture: (base64Image: string) => void;
  isLoading?: boolean;
}

export function Camera({ onCapture, isLoading = false }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });

        if (!isMounted) {
          // If component unmounted while camera was initializing, close it immediately
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error accessing camera:', err);
          setError('Camera permission denied or camera hardware unavailable.');
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      // Clean up stream on unmount
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw frame horizontally flipped so it matches mirror display context
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transformation matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="flex flex-column align-center gap-3" style={{ width: '100%' }}>
      <div className="camera-wrapper">
        {error ? (
          <div className="flex flex-column align-center justify-center gap-2" style={{ height: '100%', color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
            <CameraOff size={32} />
            <p style={{ fontSize: '0.9rem' }}>{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={canvasRef} className="camera-canvas" />
            <div className="camera-overlay">
              <div className="camera-guide-box"></div>
            </div>
          </>
        )}
      </div>

      {!error && (
        <button
          onClick={captureFrame}
          disabled={isLoading || !stream}
          className={`btn btn-primary ${isLoading || !stream ? 'btn-disabled' : ''}`}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          {isLoading ? 'Processing...' : 'Capture and Scan'}
        </button>
      )}
    </div>
  );
}
