"use client"
import { CldUploadWidget } from 'next-cloudinary'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TbPhotoPlus } from 'react-icons/tb'

interface IconUploadProps {
  currentIcon?: string;
  onIconChange: (url: string) => void;
  disabled?: boolean;
  type?: 'category' | 'subcategory';
}

export default function IconUpload({ 
  currentIcon, 
  onIconChange, 
  disabled = false,
  type = 'subcategory'
}: IconUploadProps) {
  const [iconUrl, setIconUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Inicializar con el icono actual si existe
  useEffect(() => {
    if (currentIcon) {
      setIconUrl('');
    }
  }, [currentIcon]);

  // Iconos predeterminados según el tipo
  const defaultIcon = type === 'category' 
    ? '/icons/default-category.svg' 
    : '/icons/default-subcategory.svg';

  const handleSuccess = (result: any) => {
    if (result.event !== 'success') return;
    
    try {
      const secureUrl = result.info.secure_url;
      console.log('✅ Icono subido exitosamente:', secureUrl);
      setIconUrl(secureUrl);
      onIconChange(secureUrl);
      setError('');
    } catch (error) {
      console.error('Error al procesar imagen:', error);
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
      
      <CldUploadWidget 
        onSuccess={(result, { widget }) => {
          handleSuccess(result);
          widget.close();
        }}
        onError={(error) => {
          console.error('Error de Cloudinary:', error);
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
            <label className="block text-sm font-medium text-gray-700">
              Icono {iconUrl && '(Nuevo)'}
            </label>
            
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
                    alt="Icono"
                    className="object-contain"
                  />
                </div>
              ) : currentIcon ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <Image
                    fill
                    src={currentIcon}
                    alt="Icono actual"
                    className="object-contain"
                    onError={(e) => {
                      console.error('Error al cargar el icono actual:', currentIcon);
                      // Usar icono predeterminado en caso de error
                      e.currentTarget.src = defaultIcon;
                    }}
                  />
                </div>
              ) : (
                <>
                  <Image
                    src={defaultIcon}
                    alt="Icono predeterminado"
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