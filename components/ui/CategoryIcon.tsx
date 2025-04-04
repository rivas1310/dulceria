"use client"
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Category, Subcategory } from "@prisma/client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SubcategoryIcon from "./SubcategoryIcon";

type CategoryIconProps = {
  category: Category & {
    subcategories?: Subcategory[];
  };
};

export default function CategoryIcon({ category }: CategoryIconProps) {
  const params = useParams<{ category: string; subcategory: string }>();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!params) {
    return null;
  }

  const isActive = category.slug === params.category;

  return (
    <div className="mb-4 w-full">
      <motion.div
        initial={false}
        animate={{ backgroundColor: isActive ? "rgba(0, 0, 0, 0.8)" : "transparent" }}
        className={`
          relative overflow-hidden
          flex items-center gap-4 w-full 
          border-l-4 border-white/20 hover:border-white
          text-white p-4 cursor-pointer
          transition-all duration-300 ease-in-out
          hover:bg-black/30
          ${isActive ? "border-white" : ""}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-16 h-16 relative">
          <Image 
            fill 
            src={category.iconPath || '/icons/default-category.svg'}
            alt={`Imagen categoría ${category.name}`}
            className="transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              console.error(`Error al cargar icono para categoría ${category.name}:`, category.iconPath);
              const target = e.target as HTMLImageElement;
              target.src = '/icons/default-category.svg';
            }}
          />
        </div>

        <div className="flex-1">
          <span className="text-xl font-bold block">
            {category.name}
          </span>
          {category.subcategories && (
            <span className="text-sm text-gray-300">
              {category.subcategories.length} subcategorías
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-white text-2xl"
        >
          ▼
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && category.subcategories && category.subcategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-2 space-y-2 border-l-2 border-white/10 pl-4">
              {category.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/order/${category.slug}/${subcategory.slug}`}
                  className={`${
                    params.subcategory === subcategory.slug
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  } flex items-center gap-2 px-3 py-2 rounded-lg transition-colors`}
                >
                  <SubcategoryIcon
                    iconPath={subcategory.iconPath || '/icons/default-subcategory.svg'}
                    name={subcategory.name}
                    size={20}
                  />
                  <span className="text-sm">{subcategory.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}