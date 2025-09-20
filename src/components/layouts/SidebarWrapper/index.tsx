"use client";
import React from "react";
import StudioSidebar from "@/components/StudioSidebar";
import styles from "./index.module.scss";

export type SidebarType = "studio" | "assets" | "admin";

interface SidebarWrapperProps {
  type: SidebarType;
}

const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ type }) => {
  // 目前所有类型都使用同一个 StudioSidebar
  // 未来可以扩展不同的侧边栏
  console.log("Sidebar type:", type);
  return (
    <div className={styles.sidebarWrapper}>
      <StudioSidebar />
    </div>
  );
};

export default SidebarWrapper;
