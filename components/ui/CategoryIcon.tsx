"use client"
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Category } from "@prisma/client";

type CategoryIconProps = {
  category: Category;
};

export default function Categoryicon({ category }: CategoryIconProps) {
  const params = useParams<{ category: string }>();
  
  if (!params) {
    return null; // Manejar el caso de null apropiadamente
  }

  return (
    <div
      className={`${
        category.slug === params.category ? "bg-black " : ""
      } flex items-center gap-7 w-full border-t-4
      border-white text-white p-4 last-of-type:border-b rounded-full`}
    >
      <div className="w-20 h-20 relative">
        <Image fill src={`/icon_${category.slug}.png`} alt="Imagen categoria" />
      </div>
      <Link className="text-xl font-bold" href={`/order/${category.slug}`}>
        {category.name}
      </Link>
    </div>
  );
}
