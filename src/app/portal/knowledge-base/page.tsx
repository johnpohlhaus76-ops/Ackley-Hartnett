'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Send, Loader2, FileText, Video, Trash2, Plus, Monitor, Globe } from 'lucide-react';
import { DocumentViewer } from '@/components/DocumentViewer';
import { ScreenShare } from '@/components/ScreenShare';

type Language = 'en' | 'zh' | 'th' | 'vi' | 'ko' | 'ja';

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  zh: { name: '中文', flag: '🇨🇳' },
  th: { name: 'ไทย', flag: '🇹🇭' },
  vi: { name: 'Việt Nam', flag: '🇻🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  ja: { name: '日本語', flag: '🇯🇵' },
};

interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  url: string;
  uploadedAt: string;
  summary?: string;
  translations?: Record<Language, { summary?: string }>;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  originalLanguage?: Language;
}

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [screenShareOpen, setScreenShareOpen] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/knowledge-base/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fileTitle) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', fileTitle);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error('Upload failed');

      // Process the document
      const processRes = await fetch('/api/knowledge-base/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fileTitle,
          type: file.type === 'application/pdf' ? 'pdf' : 'video',
          url: uploadData.url,
          description: fileDescription,
        }),
      });

      if (processRes.ok) {
        await loadDocuments();
        setFile(null);
        setFileTitle('');
        setFileDescription('');
        alert('Document uploaded and processed successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/knowledge-base/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get answer:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    // TODO: Implement document deletion
    console.log('Delete document:', docId);
  };

  return (
    <>
    <DocumentViewer
      title={selectedDoc?.title || ''}
      type={selectedDoc?.type || 'pdf'}
      url={selectedDoc?.url || ''}
      isOpen={!!selectedDoc}
      onClose={() => setSelectedDoc(null)}
    />
    <ScreenShare
      isOpen={screenShareOpen}
      onClose={() => setScreenShareOpen(false)}
      sessionId={sessionId}
    />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 max-w-7xl mx-auto">
      {/* Left: Documents */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Base</h2>

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="mb-6 pb-6 border-b">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Document title"
                value={fileTitle}
                onChange={e => setFileTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Description or transcript (optional)"
                value={fileDescription}
                onChange={e => setFileDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600">
                    {file ? file.name : 'PDF or Video'}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,video/*,.pptx,.ppt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                disabled={!file || !fileTitle || uploading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Document List */}
          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No documents yet</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1 hover:text-blue-600 transition-colors">
                      {doc.type === 'pdf' ? (
                        <FileText size={16} className="text-red-500 flex-shrink-0" />
                      ) : (
                        <Video size={16} className="text-blue-500 flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                    </div>
                    {doc.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2">{doc.summary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Q&A Chat */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border shadow-sm p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Ask Questions</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScreenShareOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Start screen share"
              >
                <Monitor size={18} />
              </button>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-2 py-1 border rounded-lg text-sm bg-white hover:bg-gray-50"
              >
                {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
                  <option key={code} value={code}>
                    {flag} {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-96 max-h-96 pb-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-center">
                  Upload documents to get started.<br />
                  <span className="text-sm">Then ask questions about them!</span>
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-sm px-4 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
