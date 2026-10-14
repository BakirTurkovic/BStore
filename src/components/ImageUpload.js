'use client';

import Image from 'next/image';
import { useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function ImageUpload({ imageUrl = '', onUploadComplete }) {
  const [previewOverride, setPreviewOverride] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const previewUrl = previewOverride || imageUrl;

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPEG, PNG, WebP, or AVIF image.');
      event.target.value = '';
      return;
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError('Image must be greater than 0 bytes and no larger than 5 MB.');
      event.target.value = '';
      return;
    }
    if (typeof onUploadComplete !== 'function') {
      setError('Image upload is not connected to a product form.');
      event.target.value = '';
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewOverride(localPreview);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Upload endpoint returned an invalid response (HTTP ${response.status}).`);
      }
      if (!response.ok) {
        const error = new Error(data.message || `Image upload failed (HTTP ${response.status}).`);
        error.code = data.code;
        error.requestId = data.requestId;
        throw error;
      }
      if (typeof data.imageUrl !== 'string') throw new Error('Upload did not return an image URL.');

      setPreviewOverride('');
      onUploadComplete(data.imageUrl);
    } catch (uploadError) {
      console.error('Product image upload failed:', uploadError);
      const code = uploadError.code ? ` (${uploadError.code})` : '';
      const requestId = uploadError.requestId ? ` Request ID: ${uploadError.requestId}.` : '';
      setError(`${uploadError.message || 'Image upload failed. Please try again.'}${code}.${requestId}`);
      setPreviewOverride('');
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="product-image" className="block text-sm font-medium text-gray-700">
        Product image
      </label>
      {previewUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <Image
            src={previewUrl}
            alt="Product image preview"
            fill
            unoptimized
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 480px"
          />
        </div>
      )}
      <input
        id="product-image"
        name="product-image"
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        disabled={isUploading}
        onChange={handleFileChange}
        className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:font-medium file:text-gray-800 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="text-xs text-gray-500">
        {isUploading
          ? 'Uploading image...'
          : 'JPEG, PNG, WebP, or AVIF. Maximum file size: 5 MB.'}
      </p>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
