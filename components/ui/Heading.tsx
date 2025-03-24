// components/ui/Heading.tsx
import Link from "next/link";


export default function Heading({ children }: { children: React.ReactNode }) {
  return (
    <header className="bg-gray-100 shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className="text-2xl text-black">{children}</h1>
        
         
        
      </div>
    </header>
  );
}
