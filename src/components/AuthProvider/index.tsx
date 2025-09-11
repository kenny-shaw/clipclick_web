"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 如果有token，尝试验证其有效性
        if (token) {
          console.log("检测到本地token，正在验证有效性...");
          await fetchUser();
        } else {
          console.log("未检测到本地token");
        }
      } catch (error) {
        console.error("token验证失败:", error);
        // token无效时，fetchUser内部会清除状态
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [token, fetchUser]);

  // 如果还没初始化完成，显示加载状态
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProvider;
