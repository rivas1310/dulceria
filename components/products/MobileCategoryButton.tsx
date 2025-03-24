"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MobileCategoryButton() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-4 left-4 bg-customBlue text-white p-4 rounded-full md:hidden z-50"
        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
      >
        Categorías
      </button>

      {isCategoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden">
          <div className="fixed left-0 top-0 h-full w-64 bg-customBlue overflow-y-auto">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-2xl font-bold text-white">Categorías</h2>
              <button
                onClick={() => setIsCategoryOpen(false)}
                className="text-2xl  text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2">
              <Link
                href="/order/bebidas"
                className="flex items-center gap-4 bg-white p-4 rounded-lg"
                onClick={() => setIsCategoryOpen(false)}
              >
                <Image
                  src="/icon_bebidas.svg"
                  alt="Bebidas"
                  width={30}
                  height={30}
                />
                <span className="text-black font-bold  text-lg">Bebidas</span>
              </Link>

              <Link
                href="/order/comidas"
                className="flex items-center gap-4 bg-white p-4 rounded-lg"
                onClick={() => setIsCategoryOpen(false)}
              >
                <Image
                  src="/icon_comidas.svg"
                  alt="Comidas"
                  width={30}
                  height={30}
                />
                <span className="text-black font-bold text-lg">Comidas</span>
              </Link>

              <Link
                href="/order/desayunos"
                className="flex items-center gap-4 bg-white p-4 rounded-lg"
                onClick={() => setIsCategoryOpen(false)}
              >
                <Image
                  src="/icon_desayunos.svg"
                  alt="Desayunos"
                  width={30}
                  height={30}
                />
                <span className="text-black font-bold  text-lg">Desayunos</span>
              </Link>

              <Link
                href="/order/snacks"
                className="flex items-center gap-4 bg-white p-4 rounded-lg"
                onClick={() => setIsCategoryOpen(false)}
              >
                <Image
                  src="/icon_snacks.svg"
                  alt="Snacks"
                  width={30}
                  height={30}
                />
                <span className="text-black font-bold  text-lg">Snacks</span>
              </Link>

              <Link
                href="/order/dulces"
                className="flex items-center gap-4 bg-white p-4 rounded-lg"
                onClick={() => setIsCategoryOpen(false)}
              >
                <Image
                  src="/icon_dulces.svg"
                  alt="Dulces"
                  width={30}
                  height={30}
                />
                <span className="text-black font-bold  text-lg">Dulces</span>
              </Link>

              <Link
                href="/order/importados"
                className="flex items-center gap-4 bg-white p-4 rounded-lg"
                onClick={() => setIsCategoryOpen(false)}
              >
                <Image
                  src="/icon_importados.svg"
                  alt="Importación"
                  width={30}
                  height={30}
                />
                <span className="text-black font-bold  text-lg">
                  Importación
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
