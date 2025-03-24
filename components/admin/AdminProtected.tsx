"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminProtected({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.includes('/admin/orders')) {
      const isAuthenticated = localStorage.getItem("isAdminAutzhenticated");
      
      if (!isAuthenticated) {
        router.push("/admin/login");
      }
    }
  }, [router, pathname]);

  return <>{children}</>;
}
