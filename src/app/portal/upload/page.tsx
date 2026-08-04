"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Trash2, Download, Eye, Play, ExternalLink } from "lucide-react";

interface UploadedFile {
  url: string;
  filename: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUploadedFiles();
  }, []);

  const loadUploadedFiles = async () => {
    try {
      const stored = localStorage.getItem("uploadedFiles");
      if (stored) {
        setFiles(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load files", err);
    }
  };

  const saveUploadedFiles = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));
  };

  const handleUpload = async (uploadFile: File) => {
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      const newFile: UploadedFile = {
        url: data.url,
        filename: data.filename,
        type: data.type,
        size: data.size,
        uploadedAt: data.uploadedAt,
      };

      const updated = [newFile, ...files];
      saveUploadedFiles(updated);
      setSuccess(`✓ ${uploadFile.name} uploaded successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles[0]) {
      handleUpload(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const deleteFile = (url: string) => {
    const updated = files.filter((f) => f.url !== url);
    saveUploadedFiles(updated);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("video/")) return "🎥";
    if (type === "application/pdf") return "📄";
    if (type.includes("presentation")) return "📊";
    if (type === "application/json") return "{}";
    if (type.includes("sheet")) return "📑";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">📤 Media & Data Center</h1>
        <p className="text-slate-600">Upload videos, PDFs, presentations, and data files</p>
      </div>

      {/* Upload Area */}
      <div className="card p-8">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-slate-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            accept=".mp4,.webm,.mov,.pdf,.pptx,.json,.xlsx,.csv"
          />

          <Upload size={48} className="mx-auto mb-3 text-slate-400" />
          <h3 className="font-semibold text-lg mb-1 text-ink">
            {uploading ? "Uploading..." : "Drop files here or click to upload"}
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Videos (MP4, WebM, MOV), PDFs, PowerPoints, Data (JSON, XLSX, CSV)
          </p>
          <p className="text-xs text-slate-500">Max 100MB per file</p>

          {uploading && (
            <div className="mt-4 inline-block">
              <div className="animate-spin">⏳</div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-ink">{files.length}</div>
          <p className="text-sm text-slate-600">Files Uploaded</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-ink">
            {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
          </div>
          <p className="text-sm text-slate-600">Total Storage</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-ink">
            {files.filter((f) => f.type.startsWith("video/")).length}
          </div>
          <p className="text-sm text-slate-600">Videos</p>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-ink">Uploaded Files</h3>
          </div>

          <div className="divide-y divide-slate-200">
            {files.map((file) => (
              <div
                key={file.url}
                className="p-4 hover:bg-slate-50 transition flex items-start gap-4"
              >
                <div className="text-3xl mt-1">{getFileIcon(file.type)}</div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{file.filename}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{file.type}</p>
                </div>

                <div className="flex gap-2">
                  {file.type.startsWith("video/") ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded hover:bg-slate-200 text-slate-600"
                      title="Play video"
                    >
                      <Play size={18} />
                    </a>
                  ) : (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded hover:bg-slate-200 text-slate-600"
                      title="View file"
                    >
                      <Eye size={18} />
                    </a>
                  )}

                  <a
                    href={file.url}
                    download
                    className="p-2 rounded hover:bg-slate-200 text-slate-600"
                    title="Download file"
                  >
                    <Download size={18} />
                  </a>

                  <button
                    onClick={() => deleteFile(file.url)}
                    className="p-2 rounded hover:bg-red-100 text-red-600"
                    title="Delete file"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !uploading && (
        <div className="text-center py-12 text-slate-500">
          <p>No files uploaded yet. Start by uploading videos, PDFs, or data files above.</p>
        </div>
      )}
    </div>
  );
}
