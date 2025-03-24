'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

type AdminRouteProps = {
    link: {
        url: string;
        text: string;
        blank: boolean;
    }
}

export default function AdminRoute({link}: AdminRouteProps) {
    const pathname = usePathname()
    const isActive = pathname !== null && pathname === link.url;
  return (
    <Link
    className={`${isActive ? 'bg-customBlue' : ''} font-bold text-lg border-t border-gray-200 p-3 last last-of-type:border-b text-black `}
    href={link.url}
    target={link.blank ? '_blank': ''}

    >{link.text}

    </Link>
  )
}
