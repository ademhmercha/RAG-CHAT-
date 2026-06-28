import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineCloudArrowUp, HiOutlineCheckCircle, HiOutlineArrowRight } from "react-icons/hi2";
import UploadZone from "../components/documents/UploadZone";

const formats = ["PDF", "DOCX", "TXT", "CSV", "HTML", "MD"];

export default function Upload() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);

  const handleComplete = () => {
    setUploaded(true);
    setTimeout(() => setUploaded(false), 5000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Upload Document</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">Add documents to your knowledge base</p>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <UploadZone onUploadComplete={handleComplete} />
        </div>

        <div className="mt-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Supported formats</p>
          <div className="flex flex-wrap gap-1.5">
            {formats.map((f) => (
              <span key={f} className="px-2.5 py-1 rounded-md bg-[var(--bg-main)] text-xs text-[var(--text-primary)] opacity-60 border border-[var(--border)]">
                {f}
              </span>
            ))}
          </div>
        </div>

        {uploaded && (
          <div className="mt-3 flex items-center gap-3 text-sm text-[var(--accent)] bg-[#10a37f]/10 rounded-xl px-4 py-3 border border-[#10a37f]/20 animate-in">
            <HiOutlineCheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">Uploaded!</span>
            <button
              onClick={() => navigate("/documents")}
              className="ml-auto flex items-center gap-1 text-xs text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg px-3 py-1.5 transition-colors"
            >
              View <HiOutlineArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
