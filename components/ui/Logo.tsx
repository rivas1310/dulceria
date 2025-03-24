"use client"
import useSWR from "swr";
import Image from "next/image";


export default function Logo() {
  return (
    <div className="flex justify-center mt-5">
        <div className="relative w-44 h-44">
            <Image
            fill
            alt="fresh coffe"
            src='/logo.png'
            />
             </div>


    </div>
  )
}
