"use client";

import { CldUploadButton } from 'next-cloudinary';
import { useState } from 'react';
import type { CloudinaryUploadProps } from '@/lib/types';

export function CloudinaryUpload({ onUploadSuccess, onUploadError, locationId }: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (result: any) => {
    if (result.event === 'success') {
      setIsUploading(true);
      try {
        const response = await fetch('/api/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            link: result.info.secure_url,
            locationId: locationId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al guardar la imagen');
        }

        onUploadSuccess(result.info.secure_url, '¡Imagen subida y guardada correctamente!');
      } catch (error) {
        onUploadError?.(error instanceof Error ? error.message : 'Error al guardar la imagen');
      } finally {
        setIsUploading(false);
      }
    }
  };
  return (
    <div className="space-y-4">
      {!isUploading ? (
        <CldUploadButton
          uploadPreset="turnolibre_preset"
          onSuccess={handleUpload}
          options={{
            maxFiles: 1,
            sources: ['local', 'camera'],
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            maxFileSize: 10_000_000, // 10MB
          }}
          className="px-4 py-2 bg-[#426a5a] text-white rounded-md hover:bg-[#2d4a3e] transition-colors"
        >
         Subir Imagen
        </CldUploadButton>
      ) : (
        <button 
          className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50"
          disabled
        >
          Subiendo...
        </button>
      )}
      
      {isUploading && (
        <div className="text-sm text-gray-600">
          Procesando imagen...
        </div>
         
      )}
      
    </div>
  );
}
