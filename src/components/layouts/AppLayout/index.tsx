"use client";
import React from "react";
import BaseLayout from "../BaseLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLayout } from "@/hooks/useLayout";

interface AppLayoutProps {
  children: React.ReactNode;
  pathname: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, pathname }) => {
  const layout = useLayout(pathname);

  if (layout.protected) {
    return (
      <ProtectedRoute>
        <BaseLayout
          variant={layout.variant}
          sidebarType={layout.sidebarType}
          pageTitle={layout.pageTitle}
        >
          {children}
        </BaseLayout>
      </ProtectedRoute>
    );
  }

  return (
    <BaseLayout
      variant={layout.variant}
      sidebarType={layout.sidebarType}
      pageTitle={layout.pageTitle}
    >
      {children}
    </BaseLayout>
  );
};

export default AppLayout;
