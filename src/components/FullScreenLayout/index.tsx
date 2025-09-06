"use client";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import styles from "./index.module.scss";

interface FullScreenLayoutProps {
  children: React.ReactNode;
}

const FullScreenLayout: React.FC<FullScreenLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className={styles.fullScreenLayout}>{children}</div>
    </ProtectedRoute>
  );
};

export default FullScreenLayout;
