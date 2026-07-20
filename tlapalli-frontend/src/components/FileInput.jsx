import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

function FileInput({ label, onFileSelect, disabled }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
        accept=".pdf"
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 hover:border-violet-500/50 bg-slate-950/40 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white transition disabled:opacity-60"
        >
          <Upload size={16} />
          {label}
        </button>
        {fileName && (
          <span className="text-xs text-white/60 truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
        )}
      </div>
    </div>
  );
}

export default FileInput;
