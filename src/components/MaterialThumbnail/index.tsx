import React from "react";
import { Image } from "antd";
import {
  PlayCircleOutlined,
  EyeOutlined,
  AudioOutlined,
  FileOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { MaterialInfo } from "@/api";
import { isImageFile, isVideoFile, isAudioFile } from "@/utils/materialUtils";
import styles from "./index.module.scss";

export interface MaterialThumbnailProps {
  /** 素材信息 */
  material?: MaterialInfo;
  /** 文件对象 */
  file?: File;
  /** 缩略图尺寸 */
  size?: "small" | "medium" | "large";
  /** 自定义宽度 */
  width?: number | string;
  /** 自定义高度 */
  height?: number | string;
  /** 图标大小 */
  iconSize?: number | string;
  /** 点击事件 */
  onClick?: (material?: MaterialInfo, file?: File) => void;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const MaterialThumbnail: React.FC<MaterialThumbnailProps> = ({
  material,
  file,
  size = "medium",
  width,
  height,
  iconSize,
  onClick,
  className,
  style,
}) => {
  // 确定数据源
  const dataSource = material || file;
  if (!dataSource) return null;

  // 文件类型判断
  const isImage = material
    ? isImageFile(material.url)
    : file && isImageFile(file.name);
  const isVideo = material
    ? isVideoFile(material.url)
    : file && isVideoFile(file.name);
  const isAudio = material
    ? isAudioFile(material.url)
    : file && isAudioFile(file.name);

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(material, file);
    }
  };

  // 计算实际尺寸
  const getThumbnailSize = () => {
    if (width && height) {
      return { width, height };
    }

    // 默认正方形尺寸
    const defaultSizes = {
      small: 60,
      medium: 100,
      large: 150,
    };

    const sizeValue = defaultSizes[size];
    return { width: sizeValue, height: sizeValue };
  };

  // 计算图标大小
  const getIconSize = () => {
    if (iconSize) {
      return iconSize;
    }

    // 根据缩略图尺寸计算图标大小
    const iconSizes = {
      small: 20,
      medium: 32,
      large: 48,
    };

    return iconSizes[size];
  };

  const thumbnailSize = getThumbnailSize();
  const iconSizeValue = getIconSize();

  return (
    <div
      className={`${styles.materialThumbnail} ${className || ""}`}
      style={{
        width: thumbnailSize.width,
        height: thumbnailSize.height,
        ...style,
      }}
      onClick={handleClick}
    >
      {isImage ? (
        // 图片：MaterialInfo使用真实图片，File使用图标+背景色
        material ? (
          <Image
            src={material.url}
            alt={material.name}
            className={styles.imageThumbnail}
            fallback="/next.svg"
            preview={{
              mask: <EyeOutlined />,
            }}
          />
        ) : (
          <div
            className={`${styles.imageThumbnail} ${styles.fileImageThumbnail}`}
          >
            <FileImageOutlined
              className={styles.fileIcon}
              style={{ fontSize: iconSizeValue }}
            />
          </div>
        )
      ) : isVideo ? (
        <div className={styles.videoThumbnail}>
          <PlayCircleOutlined
            className={styles.playIcon}
            style={{ fontSize: iconSizeValue }}
          />
        </div>
      ) : isAudio ? (
        <div className={styles.audioThumbnail}>
          <AudioOutlined
            className={styles.audioIcon}
            style={{ fontSize: iconSizeValue }}
          />
        </div>
      ) : (
        <div className={styles.fileThumbnail}>
          <FileOutlined
            className={styles.fileIcon}
            style={{ fontSize: iconSizeValue }}
          />
        </div>
      )}
    </div>
  );
};

export default MaterialThumbnail;
