"use client";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (mounted) {
      // 如果已经认证，不需要做任何事
      if (isAuthenticated) {
        return;
      }

      // 如果正在加载，等待加载完成
      if (isLoading) {
        return;
      }

      // 尝试从localStorage恢复用户状态
      const token = localStorage.getItem("token");
      if (token) {
        // 有token但状态未恢复，尝试获取用户信息
        fetchUser().then(() => {
          if (!useAuthStore.getState().isAuthenticated) {
            // 保存当前路径到URL参数
            const redirectUrl = encodeURIComponent(pathname);
            router.replace(`/login?redirect=${redirectUrl}`);
          }
        });
      } else {
        // 没有token，保存当前路径到URL参数
        const redirectUrl = encodeURIComponent(pathname);
        router.replace(`/login?redirect=${redirectUrl}`);
      }
    }
  }, [mounted, isAuthenticated, isLoading, fetchUser, router, pathname]);

  // 如果还没挂载或者正在加载，显示加载状态
  if (!mounted || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>加载中...</div>
      </div>
    );
  }

  // 如果未认证，不显示内容（会跳转到登录页）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
