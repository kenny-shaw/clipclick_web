"use client";
import React from "react";
import HeaderBar from "@/components/HeaderBar";
import SidebarWrapper from "../SidebarWrapper";
import { useStudioStore } from "@/store/studioStore";
import { LAYOUT_CONSTANTS } from "@/constants/layout";
import styles from "./index.module.scss";

export type LayoutVariant = "default" | "sidebar" | "fullscreen";
export type SidebarType = "studio" | "assets" | "admin";

interface BaseLayoutProps {
  children: React.ReactNode;
  variant?: LayoutVariant;
  sidebarType?: SidebarType;
  pageTitle?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  variant = "default",
  sidebarType,
  pageTitle,
}) => {
  const { sidebarCollapsed } = useStudioStore();

  // 计算主内容区域的 margin-left
  const getMainContentStyle = () => {
    if (variant === "sidebar") {
      return {
        marginLeft: sidebarCollapsed
          ? LAYOUT_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH
          : LAYOUT_CONSTANTS.SIDEBAR_WIDTH,
      };
    }
    return {};
  };

  return (
    <div className={styles.baseLayout}>
      <HeaderBar variant={variant} pageTitle={pageTitle} />
      <div className={styles.contentArea}>
        {variant === "sidebar" && sidebarType && (
          <SidebarWrapper type={sidebarType} />
        )}
        <main className={styles.mainContent} style={getMainContentStyle()}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
