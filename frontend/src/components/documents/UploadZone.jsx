import { useState, useRef, useCallback } from "react";
import { HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineStop } from "react-icons/hi2";
import toast from "react-hot-toast";
import { documents as documentsApi } from "../../api/client";

export default function UploadZone({ onUploadComplete }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);
  const dragCounter = useRef(0);
  const abortRef = useRef(null);

  const validateFile = (file) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv", "text/html"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt|csv|html|md)$/i)) {
      toast.error("Unsupported file type");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File exceeds 50 MB limit");
      return false;
    }
    return true;
  };

  const handleFile = (file) => {
    if (validateFile(file)) setSelectedFile(file);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const handleCancel = () => {
    if (abortRef.current) abortRef.current.abort();
    setUploading(false);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + Math.random() * 12, 80));
    }, 400);

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await new Promise((r) => setTimeout(r, 100));
      await documentsApi.upload(formData, controller.signal);
      clearInterval(interval);
      setUploadProgress(100);
      toast.success("Uploaded! Processing in background...");
      setSelectedFile(null);
      setTimeout(() => { setUploadProgress(0); onUploadComplete?.(); }, 500);
    } catch (err) {
      clearInterval(interval);
      if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;
      toast.error(err.response?.data?.message || "Upload failed");
      setUploadProgress(0);
    } finally {
      setUploading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      {!uploading && !selectedFile && (
        <div
          onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
          onDragOver={handleDragOver} onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${dragging ? "border-[#10a37f] bg-[#10a37f]/5" : "border-[var(--border)] hover:border-[var(--border-hover)]"}`}
        >
          <input
            ref={inputRef} type="file" accept=".pdf,.docx,.txt,.csv,.html,.md"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border)]">
              <HiOutlineCloudArrowUp className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)]">
                {dragging ? "Drop your file" : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, DOCX, TXT, CSV, MD — up to 50 MB</p>
            </div>
          </div>
        </div>
      )}

      {selectedFile && !uploading && (
        <div className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-4 animate-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
              <HiOutlineDocumentText className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate">{selectedFile.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all">
              <HiOutlineXMark className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleUpload} className="btn-primary-chat w-full mt-3 flex items-center justify-center gap-2">
            <HiOutlineCloudArrowUp className="w-4 h-4" />
            Upload
          </button>
        </div>
      )}

      {uploading && (
        <div className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-4 animate-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#10a37f]/30 border-t-[#10a37f] rounded-full animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] truncate">{selectedFile?.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{Math.round(uploadProgress)}%</p>
            </div>
            <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-red-400/10 text-[var(--text-tertiary)] hover:text-red-400 transition-all">
              <HiOutlineStop className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full bg-[var(--bg-card)] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
              style={{ width: `${Math.max(uploadProgress, 5)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
