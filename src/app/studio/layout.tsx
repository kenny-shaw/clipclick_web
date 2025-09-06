"use client";
import React from "react";
import { Layout } from "antd";
import StudioSidebar from "@/components/StudioSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useStudioStore } from "@/store/studioStore";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import styles from "./layout.module.scss";

const { Content } = Layout;

interface StudioLayoutProps {
  children: React.ReactNode;
}

const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
  const { sidebarCollapsed } = useStudioStore();

  return (
    <ProtectedRoute>
      <div className={styles.studioLayout} data-studio-layout>
        <StudioSidebar />
        <Layout
          className={styles.contentLayout}
          style={{
            marginLeft: sidebarCollapsed
              ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH
              : LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
          }}
        >
          <Content className={styles.content}>{children}</Content>
        </Layout>
      </div>
    </ProtectedRoute>
  );
};

export default StudioLayout;
