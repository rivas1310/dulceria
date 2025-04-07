"use client"
import { getImagePath } from '@/src/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TbPhotoPlus } from 'react-icons/tb';
import { CldUploadWidget } from 'next-cloudinary';

export default function ImageUpload({image}:{image: string | undefined}) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (image) {
      setImageUrl(image);
    }
  }, [image]);

  const handleSuccess = (result: any) => {
    if (result.event !== 'success') return;
    
    try {
      const secureUrl = result.info.secure_url;
      console.log('✅ Imagen subida exitosamente:', secureUrl);
      setImageUrl(secureUrl);
      setPreviewUrl(secureUrl);
      setError('');
      setIsUploading(false);
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      setError('Error al procesar la imagen');
      setIsUploading(false);
    }
  };

  const handleError = (error: any) => {
    console.error('Error de Cloudinary:', error);
    setError('Error al subir la imagen');
    setIsUploading(false);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-slate-800">Imagen Productos</label>
        
        {error && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        <CldUploadWidget 
          onSuccess={handleSuccess}
          onError={handleError}
          onOpen={() => setIsUploading(true)}
          uploadPreset="tuuncynd"
          options={{
            maxFiles: 1,
            resourceType: 'auto',
            folder: 'products',
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'],
            maxImageFileSize: 5000000 // 5MB
          }}
        >
          {({ open }) => (
            <div
              className="relative cursor-pointer hover:opacity-70 transition p-10 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 bg-slate-100"
              onClick={() => {
                if (!isUploading) {
                  open();
                }
              }}
            >
              <TbPhotoPlus size={50} />
              <p className="text-lg font-semibold">
                {isUploading ? 'Subiendo...' : 'Agregar Imagen'}
              </p>

              {previewUrl && (
                <div className='absolute inset-0 w-full h-full'>
                  <Image
                    fill
                    style={{objectFit: 'contain'}}
                    src={previewUrl}
                    alt='Imagen de Producto'
                  />
                </div>
              )}
            </div>
          )}
        </CldUploadWidget>
      </div>

      {image && !previewUrl && (
        <div className='space-y-2 mt-4'>
          <label>Imagen Actual:</label>
          <div className='relative w-64 h-64'>
            <Image
              fill
              src={getImagePath(image)}
              alt='Imagen Producto'
              style={{objectFit:'contain'}}
            />
          </div>
        </div>
      )}

      <input
        type="hidden" 
        name='image'
        defaultValue={imageUrl || image || '/placeholder-image.jpg'}
      />
    </>
  );
}
