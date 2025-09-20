import React from "react";
import {
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

/**
 * 获取文件扩展名
 */
export const getFileExtension = (url: string): string => {
  return url.split(".").pop()?.toLowerCase() || "";
};

/**
 * 判断文件类型
 */
export const getFileType = (
  url: string
): "image" | "video" | "audio" | "other" => {
  const extension = getFileExtension(url);

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return "image";
  } else if (
    ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(extension)
  ) {
    return "video";
  } else if (["mp3", "wav", "aac", "ogg", "flac", "m4a"].includes(extension)) {
    return "audio";
  } else {
    return "other";
  }
};

/**
 * 获取素材类型图标
 */
export const getMaterialIcon = (url: string): React.ReactNode => {
  const fileType = getFileType(url);

  switch (fileType) {
    case "image":
      return <FileImageOutlined style={{ color: "#52c41a" }} />;
    case "video":
      return <VideoCameraOutlined style={{ color: "#1890ff" }} />;
    case "audio":
      return <AudioOutlined style={{ color: "#faad14" }} />;
    default:
      return <FileOutlined style={{ color: "#8c8c8c" }} />;
  }
};

/**
 * 获取素材类型标签文本
 */
export const getMaterialTypeLabel = (url: string): string => {
  const fileType = getFileType(url);

  switch (fileType) {
    case "image":
      return "图片";
    case "video":
      return "视频";
    case "audio":
      return "音频";
    default:
      return "文件";
  }
};

/**
 * 获取审核状态标签
 */
export const getApprovalStatus = (isApproved: number): React.ReactNode => {
  switch (isApproved) {
    case 1:
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          已审核
        </Tag>
      );
    case 0:
      return (
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          待审核
        </Tag>
      );
    case -1:
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          审核失败
        </Tag>
      );
    default:
      return (
        <Tag color="default" icon={<ClockCircleOutlined />}>
          未知
        </Tag>
      );
  }
};

/**
 * 获取可见性状态标签
 */
export const getVisibilityStatus = (isPublic: number): React.ReactNode => {
  return (
    <Tag
      color={isPublic === 1 ? "green" : "orange"}
      icon={isPublic === 1 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
    >
      {isPublic === 1 ? "公开" : "私有"}
    </Tag>
  );
};

/**
 * 格式化时间
 */
export const formatTime = (timeString: string): string => {
  return new Date(timeString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 格式化视频时长
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
};

/**
 * 检查是否为图片文件
 */
export const isImageFile = (url: string): boolean => {
  return getFileType(url) === "image";
};

/**
 * 检查是否为视频文件
 */
export const isVideoFile = (url: string): boolean => {
  return getFileType(url) === "video";
};

/**
 * 检查是否为音频文件
 */
export const isAudioFile = (url: string): boolean => {
  return getFileType(url) === "audio";
};
