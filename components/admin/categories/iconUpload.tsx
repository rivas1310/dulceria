"use client"
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TbPhotoPlus } from 'react-icons/tb'

type IconUploadProps = {
  currentIcon?: string;
  onUpload: (path: string) => void;
  type?: 'category' | 'subcategory';
  disabled?: boolean;
};

export default function IconUpload({ 
  currentIcon, 
  onUpload,
  type = 'category',
  disabled = false 
}: IconUploadProps) {
  const [iconUrl, setIconUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Iconos predeterminados según el tipo
  const defaultIcon = type === 'category' 
    ? '/icons/default-category.svg' 
    : '/icons/default-subcategory.svg';

  // Inicializar con el icono actual si existe
  useEffect(() => {
    if (currentIcon) {
      setIconUrl('');
    }
  }, [currentIcon]);

  const handleSuccess = (result: any) => {
    if (result.event !== 'success') return;
    
    try {
      const secureUrl = result.info.secure_url;
      console.log(`✅ Icono de ${type} subido exitosamente:`, secureUrl);
      setIconUrl(secureUrl);
      onUpload(secureUrl);
      setError('');
    } catch (error) {
      console.error(`Error al procesar imagen de ${type}:`, error);
      setError('Error al procesar la imagen');
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="bg-blue-50 p-2 rounded mb-2">
        <p className="text-xs text-blue-700 font-medium">
          Subiendo icono para: <strong>{type === 'category' ? 'Categoría' : 'Subcategoría'}</strong>
        </p>
      </div>
      
      <CldUploadWidget 
        onSuccess={(result, { widget }) => {
          handleSuccess(result);
          widget.close();
        }}
        onError={(error) => {
          console.error(`Error de Cloudinary al subir icono de ${type}:`, error);
          setError('Error al subir la imagen');
        }}
        uploadPreset="tuuncynd"
        options={{
          maxFiles: 1,
          resourceType: 'auto',
          folder: 'icons',
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'],
          maxImageFileSize: 2000000 // 2MB
        }}
      >
        {({ open }) => (
          <div className="space-y-2">
            <div
              onClick={() => !disabled && open()}
              className={`
                relative 
                border-2 
                border-dashed 
                border-gray-300 
                rounded-md 
                h-32 
                w-32 
                mx-auto
                flex 
                flex-col 
                justify-center 
                items-center 
                ${!disabled ? 'cursor-pointer hover:border-blue-500' : 'opacity-70 cursor-not-allowed'}
              `}
            >
              {iconUrl ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <Image
                    fill
                    src={iconUrl}
                    alt={`Icono nuevo de ${type === 'category' ? 'categoría' : 'subcategoría'}`}
                    className="object-contain"
                  />
                </div>
              ) : currentIcon ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <Image
                    fill
                    src={currentIcon}
                    alt={`Icono actual de ${type === 'category' ? 'categoría' : 'subcategoría'}`}
                    className="object-contain"
                    onError={(e) => {
                      console.error(`Error al cargar el icono actual de ${type}:`, currentIcon);
                      // Usar icono predeterminado en caso de error
                      e.currentTarget.src = defaultIcon;
                    }}
                  />
                </div>
              ) : (
                <>
                  <Image
                    src={defaultIcon}
                    alt={`Icono predeterminado de ${type === 'category' ? 'categoría' : 'subcategoría'}`}
                    width={40}
                    height={40}
                    className="opacity-50 mb-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Subir icono</p>
                </>
              )}
            </div>
            
            {/* Instrucciones */}
            <p className="text-xs text-gray-500 text-center mt-1">
              Formatos aceptados:<br/>
              <span className="font-medium">SVG, PNG, JPG, WEBP, GIF</span><br />
              Tamaño máx: 2MB
            </p>

            {/* Botón para abrir el selector */}
            <button
              type="button"
              onClick={() => !disabled && open()}
              className={`mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 mx-auto block ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={disabled}
            >
              Subir icono
            </button>
          </div>
        )}
      </CldUploadWidget>
      
      {/* Valor oculto para el formulario si es necesario */}
      <input
        type="hidden"
        name="iconPath"
        value={iconUrl || currentIcon || defaultIcon}
      />
    </div>
  );
}