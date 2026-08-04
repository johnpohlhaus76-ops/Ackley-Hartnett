'use client';

import { useState } from 'react';
import { X, Play, Download } from 'lucide-react';

interface DocumentViewerProps {
  title: string;
  type: 'pdf' | 'video';
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({
  title,
  type,
  url,
  isOpen,
  onClose,
}: DocumentViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              title="Download"
            >
              <Download size={18} />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {type === 'pdf' ? (
            <iframe
              src={`${url}#view=FitH`}
              className="w-full h-full border-0"
              title={title}
            />
          ) : (
            <video
              src={url}
              controls
              className="w-full h-full"
              style={{ maxHeight: '70vh' }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
