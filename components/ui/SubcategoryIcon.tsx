import Image from "next/image";

interface SubcategoryIconProps {
  iconPath?: string;
  name: string;
  size?: number;
}

export default function SubcategoryIcon({ iconPath, name, size = 24 }: SubcategoryIconProps) {
  return (
    <div 
      className="relative"
      style={{ width: size, height: size }}
    >
      <Image
        src={iconPath || '/subcategories/default.svg'}
        alt={`Icono de ${name}`}
        fill
        className="object-contain"
      />
    </div>
  );
} 