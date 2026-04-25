import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

export default function UploadBox({ onFileSelect, selectedFile, onClear }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragging 
              ? 'border-white/40 bg-white/[0.05] scale-[1.01]' 
              : 'border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02]'}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            accept=".csv,.xlsx,.xls,.json"
          />
          <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] rounded-lg flex items-center justify-center mx-auto mb-4 text-zinc-400 group-hover:text-white transition-colors">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-white font-medium mb-1">Click to upload or drag and drop</h3>
          <p className="text-zinc-500 text-sm">Supported formats: CSV, Excel, JSON (Max 10MB)</p>
        </div>
      ) : (
        <div className="card-linear flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{selectedFile.name}</p>
              <p className="text-xs text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
            </div>
          </div>
          <button 
            onClick={onClear}
            className="p-2 text-zinc-500 hover:text-white transition-colors hover:bg-white/[0.05] rounded-md"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
