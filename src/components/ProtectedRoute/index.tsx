"use client";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // 如果已经认证，不需要做任何事
    if (isAuthenticated) {
      return;
    }

    // 未认证，重定向到登录页
    const redirectUrl = encodeURIComponent(pathname);
    router.replace(`/login?redirect=${redirectUrl}`);
  }, [isAuthenticated, router, pathname]);

  // 如果未认证，不显示内容（会跳转到登录页）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
