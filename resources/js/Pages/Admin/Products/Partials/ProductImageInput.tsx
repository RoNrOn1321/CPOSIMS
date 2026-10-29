import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Globe, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Sparkles,
  Link2,
  FileCheck
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';

export interface ProductImageInputProps {
  initialImageUrl?: string | null;
  initialSource?: 'upload' | 'url' | 'none';
  onImageFileChange: (file: File | null) => void;
  onImageUrlChange: (url: string) => void;
  onImageSourceChange: (source: 'upload' | 'url' | 'none') => void;
  onRemoveImageChange?: (remove: boolean) => void;
  fileError?: string;
  urlError?: string;
}

export default function ProductImageInput({
  initialImageUrl,
  initialSource = 'upload',
  onImageFileChange,
  onImageUrlChange,
  onImageSourceChange,
  onRemoveImageChange,
  fileError,
  urlError,
}: ProductImageInputProps) {
  const [method, setMethod] = useState<'upload' | 'url'>(
    initialImageUrl && initialImageUrl.startsWith('http') && !initialImageUrl.includes('/storage/') 
      ? 'url' 
      : 'upload'
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [webUrl, setWebUrl] = useState<string>(
    initialImageUrl && initialImageUrl.startsWith('http') && !initialImageUrl.includes('/storage/')
      ? initialImageUrl
      : ''
  );
  const [webImageStatus, setWebImageStatus] = useState<'idle' | 'loading' | 'valid' | 'error'>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Clean up object URLs to prevent browser memory leaks
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  // Update web image status when webUrl changes
  useEffect(() => {
    if (!webUrl.trim()) {
      setWebImageStatus('idle');
      return;
    }
    setWebImageStatus('loading');
  }, [webUrl]);

  // Handle local file selection
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const newUrl = URL.createObjectURL(file);
    objectUrlRef.current = newUrl;
    setSelectedFile(file);
    setFilePreviewUrl(newUrl);
    setIsRemoved(false);

    onImageFileChange(file);
    onImageUrlChange('');
    onImageSourceChange('upload');
    onRemoveImageChange?.(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle web URL change
  const handleWebUrlChange = (val: string) => {
    setWebUrl(val);
    setIsRemoved(false);
    onImageFileChange(null);
    onImageUrlChange(val);
    onImageSourceChange('url');
    onRemoveImageChange?.(false);
  };

  // Handle removal of current or previewed image
  const handleClearImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setWebUrl('');
    setWebImageStatus('idle');
    setIsRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onImageFileChange(null);
    onImageUrlChange('');
    onImageSourceChange('none');
    onRemoveImageChange?.(true);
  };

  // Switch between Upload and Web Link tabs
  const handleSwitchMethod = (newMethod: 'upload' | 'url') => {
    setMethod(newMethod);
    if (newMethod === 'upload') {
      if (selectedFile) {
        onImageFileChange(selectedFile);
        onImageUrlChange('');
        onImageSourceChange('upload');
      }
    } else {
      if (webUrl) {
        onImageFileChange(null);
        onImageUrlChange(webUrl);
        onImageSourceChange('url');
      }
    }
  };

  // Compute active preview
  const activePreview = !isRemoved
    ? method === 'upload'
      ? filePreviewUrl || (!selectedFile && !webUrl ? initialImageUrl : null)
      : webUrl || initialImageUrl
    : null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Method Selection Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 block">
            Product Image Import Method
          </label>
          {activePreview && (
            <button
              type="button"
              onClick={handleClearImage}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> Remove Image
            </button>
          )}
        </div>

        {/* Tab Pills */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleSwitchMethod('upload')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-extrabold rounded-lg transition-all ${
              method === 'upload'
                ? 'bg-white text-[#5c1516] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud size={14} />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMethod('url')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-extrabold rounded-lg transition-all ${
              method === 'url'
                ? 'bg-white text-[#5c1516] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe size={14} />
            <span>Web Link Import</span>
          </button>
        </div>
      </div>

      {/* Upload Image Method UI */}
      {method === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'border-[#5c1516] bg-rose-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
            } ${fileError ? 'border-red-500 bg-red-50/30' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#5c1516]">
              <UploadCloud size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-700">
                Click to browse or drag & drop image
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supports JPG, PNG, WEBP, GIF, SVG up to 5MB
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileCheck size={16} className="text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800 truncate">{selectedFile.name}</span>
                <span className="text-[11px] text-slate-500 shrink-0">({formatFileSize(selectedFile.size)})</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearImage();
                }}
                className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {fileError && (
            <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle size={12} /> {fileError}
            </p>
          )}
        </div>
      )}

      {/* Web Link Import Method UI */}
      {method === 'url' && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              Direct Image URL from Internet
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Link2 size={14} />
              </span>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/... or https://domain.com/photo.jpg"
                value={webUrl}
                onChange={(e) => handleWebUrlChange(e.target.value)}
                className={`pl-9 h-10 text-xs bg-slate-50/50 rounded-xl ${
                  urlError || webImageStatus === 'error' ? 'border-red-500' : ''
                }`}
              />
              {webUrl && (
                <button
                  type="button"
                  onClick={() => handleWebUrlChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Paste a direct HTTPS image URL from the web.
            </p>
          </div>

          {urlError && (
            <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
              <AlertCircle size={12} /> {urlError}
            </p>
          )}

          {webImageStatus === 'error' && webUrl && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-xs font-semibold">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
              <span>Could not load image from this web address. Please verify the URL or try an alternate link.</span>
            </div>
          )}
        </div>
      )}

      {/* Live Preview Display */}
      <div className="pt-1">
        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
          Image Preview
        </label>
        <div className="relative aspect-[16/9] w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group shadow-2xs">
          {activePreview ? (
            <>
              <img
                src={activePreview}
                alt="Product preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setWebImageStatus('valid')}
                onError={() => {
                  if (method === 'url') {
                    setWebImageStatus('error');
                  }
                }}
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold border-0 px-2 py-0.5 shadow-xs">
                  {selectedFile
                    ? 'Local Upload'
                    : webUrl
                    ? 'Web Imported'
                    : initialImageUrl
                    ? 'Current Image'
                    : 'Preview'}
                </Badge>
              </div>
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2.5 right-2.5 p-1.5 bg-red-600 text-white rounded-xl shadow-md opacity-90 hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <Trash2 size={13} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200/60 flex items-center justify-center text-slate-300">
                <ImageIcon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500">No Image Selected</span>
              <span className="text-[10px] text-slate-400">
                {isRemoved ? 'Image removed. Product will display with a clean icon placeholder.' : 'Select an upload or paste an internet image link.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
