'use client';
// components/admin/ImageUploader.tsx
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Props {
  label: string;
  currentUrl?: string | null;
  onUpload: (url: string, publicId: string) => void;
  folder?: string;
}

export default function ImageUploader({ label, currentUrl, onUpload, folder = 'general' }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getToken = () => localStorage.getItem('crown_token') || '';

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ image: base64, folder }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        onUpload(data.url, data.publicId);
        setPreview(data.url);
        toast.success('Image uploaded successfully!');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
        setPreview(currentUrl || null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [folder, currentUrl, onUpload]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-navy-800 mb-1.5">{label}</label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 min-h-[160px] flex items-center justify-center
          ${dragging ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gold-400 bg-gray-50 hover:bg-gold-50/30'}
          ${uploading ? 'pointer-events-none' : ''}`}
      >
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-navy-800 border-t-gold-500 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Uploading…</span>
            </div>
          </div>
        )}

        {preview ? (
          <>
            <div className="relative w-full h-40">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover rounded-xl"
                sizes="400px"
              />
            </div>
            <button
              onClick={clear}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow z-10"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
              Click to change
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 p-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <FiImage className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                <span className="text-gold-600 hover:underline">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
      />
    </div>
  );
}
