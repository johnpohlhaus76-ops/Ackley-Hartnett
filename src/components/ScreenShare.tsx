'use client';

import { useState, useRef, useEffect } from 'react';
import { Monitor, Maximize2, X, Users, Video } from 'lucide-react';

interface ScreenShareProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function ScreenShare({ isOpen, onClose, sessionId }: ScreenShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const connectSession = async () => {
      try {
        // Initialize WebSocket connection for collaborative session
        const ws = new WebSocket(
          `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/screen-share?sessionId=${sessionId}`
        );

        ws.onopen = () => {
          console.log('Screen share session connected');
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'participants') {
            setParticipants(data.participants);
          }
        };

        return () => ws.close();
      } catch (error) {
        console.error('Failed to connect session:', error);
      }
    };

    connectSession();
  }, [isOpen, sessionId]);

  const handleStartSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as any,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsSharing(true);

      stream.getVideoTracks()[0].onended = () => {
        handleStopSharing();
      };
    } catch (error) {
      if ((error as any).name !== 'NotAllowedError') {
        console.error('Screen share error:', error);
      }
    }
  };

  const handleStopSharing = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsSharing(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Monitor size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Screen Share Session</h3>
            {isSharing && <span className="flex items-center gap-1 text-sm text-green-600"><span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />Live</span>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Screen Share Area */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
          {isSharing ? (
            <video
              ref={videoRef}
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <Monitor size={48} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">Start sharing your screen</p>
            </div>
          )}

          {/* Participants Indicator */}
          {participants.length > 0 && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <Users size={16} />
              {participants.length} watching
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-50 border-t p-4 flex gap-2 justify-center">
          {!isSharing ? (
            <button
              onClick={handleStartSharing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Monitor size={18} />
              Share Screen
            </button>
          ) : (
            <button
              onClick={handleStopSharing}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Sharing
            </button>
          )}

          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Video size={16} />
            Session ID: {sessionId.slice(0, 8)}
          </div>
        </div>
      </div>
    </div>
  );
}
