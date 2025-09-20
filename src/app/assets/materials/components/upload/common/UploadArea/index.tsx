import React from "react";
import { Typography } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useDragDropUpload } from "@/hooks/useDragDropUpload";
import styles from "./index.module.scss";

const { Text } = Typography;

export interface UploadAreaProps {
  mode: "files" | "folder" | "both";
  onFilesSelect?: (files: File[]) => void;
  onFolderSelect?: (files: File[], folderName: string) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles?: number;
}

const UploadArea: React.FC<UploadAreaProps> = ({
  mode,
  onFilesSelect,
  onFolderSelect,
  disabled = false,
  accept = "image/*,video/*,audio/*",
  maxFiles = 100,
}) => {
  const {
    isDragOver,
    dragDropProps,
    fileInputRef,
    folderInputRef,
    handleFileSelect,
    handleFolderSelect,
    triggerFileSelect,
    triggerFolderSelect,
  } = useDragDropUpload({
    accept,
    multiple: true,
    onFilesSelect: onFilesSelect || (() => {}),
    onFolderSelect,
    maxFiles,
  });

  // 处理整个区域点击
  const handleAreaClick = () => {
    if (disabled) return;

    if (mode === "files") {
      triggerFileSelect();
    } else if (mode === "folder") {
      triggerFolderSelect();
    } else if (mode === "both") {
      // 混合模式下，优先触发文件选择
      triggerFileSelect();
    }
  };

  // 处理右键点击（混合模式下可以选择文件夹）
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled || mode !== "both") return;

    e.preventDefault();
    triggerFolderSelect();
  };

  const getFileTypeText = () => {
    switch (mode) {
      case "files":
        return "文件";
      case "folder":
        return "文件夹";
      case "both":
        return "文件/文件夹";
      default:
        return "文件";
    }
  };

  return (
    <div
      className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ""} ${
        disabled ? styles.disabled : ""
      }`}
      onClick={handleAreaClick}
      onContextMenu={handleContextMenu}
      {...dragDropProps}
    >
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
        accept={accept}
      />

      {/* 隐藏的文件夹输入 */}
      <input
        ref={folderInputRef}
        type="file"
        {...{ webkitdirectory: "" }}
        style={{ display: "none" }}
        onChange={handleFolderSelect}
      />

      <div className={styles.uploadContent}>
        <div className={styles.hintArea}>
          <CloudUploadOutlined className={styles.hintIcon} />
          <Text className={styles.hintText}>
            点击上传，或拖拽{getFileTypeText()}到此处
          </Text>
        </div>
      </div>

      {/* 拖拽遮罩 */}
      {isDragOver && (
        <div className={styles.dragOverlay}>
          <div className={styles.dragContent}>
            <CloudUploadOutlined className={styles.dragIcon} />
            <Text className={styles.dragText}>
              {mode === "files" && "拖拽文件到此处"}
              {mode === "folder" && "拖拽文件夹到此处"}
              {mode === "both" && "拖拽文件或文件夹到此处"}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
