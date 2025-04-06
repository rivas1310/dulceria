"use client"
import { getImagePath } from '@/src/lib/utils';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { TbPhotoPlus } from 'react-icons/tb';

export default function ImageUpload({image}:{image: string | undefined}) {
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Crear una URL para previsualizar la imagen
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    
    // Simulamos una URL de Cloudinary para mantener la compatibilidad
    // En un entorno real, aquí subirías la imagen a un servidor
    setImageUrl(`/uploads/${file.name}`);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-slate-800">Imagen Productos</label>
        <div
          className="relative cursor-pointer hover:opacity-70 transition p-10 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600 bg-slate-100"
          onClick={handleClick}
        >
          <TbPhotoPlus size={50} />
          <p className="text-lg font-semibold">Agregar Imagen</p>

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
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
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
        defaultValue={imageUrl ? imageUrl : image}
      />
    </>
  );
}
