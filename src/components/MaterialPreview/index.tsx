import React from "react";
import { Modal, Typography } from "antd";
import { MaterialInfo } from "@/api";
import {
  isVideoFile,
  isAudioFile,
  isImageFile,
  getMaterialTypeLabel,
} from "@/utils/materialUtils";
import VideoPreview from "../VideoPreview";
import styles from "./index.module.scss";

const { Text } = Typography;

export interface MaterialPreviewProps {
  /** 是否显示预览弹窗 */
  visible: boolean;
  /** 素材信息 */
  material: MaterialInfo | null;
  /** 关闭预览 */
  onClose: () => void;
  /** 预览模式 */
  mode?: "video" | "audio" | "auto";
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const MaterialPreview: React.FC<MaterialPreviewProps> = ({
  visible,
  material,
  onClose,
  mode = "auto",
  className,
  style,
}) => {
  if (!material) return null;

  // 判断预览模式
  const getPreviewMode = () => {
    if (mode !== "auto") return mode;
    if (isImageFile(material.url)) return null; // 图片情况直接返回null
    if (isVideoFile(material.url)) return "video";
    if (isAudioFile(material.url)) return "audio";
    return null; // 默认返回null
  };

  const previewMode = getPreviewMode();

  // 如果是图片或无法预览的文件类型，直接返回null
  if (!previewMode) {
    return null;
  }

  // 根据文件类型渲染不同的预览组件
  const renderPreviewContent = () => {
    if (previewMode === "video" || previewMode === "audio") {
      return <VideoPreview material={material} mode={previewMode} />;
    }
    return null;
  };

  // 根据预览模式设置弹窗宽度
  const getModalWidth = () => {
    if (previewMode === "video") return 800;
    if (previewMode === "audio") return 600;
    return 600;
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          <Text strong>{material.name}</Text>
          <Text type="secondary" className={styles.fileType}>
            {getMaterialTypeLabel(material.url)}
          </Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={getModalWidth()}
      className={`${styles.previewModal} ${className || ""}`}
      style={style}
      destroyOnHidden
    >
      <div className={styles.previewContainer}>
        {renderPreviewContent()}

        {/* 素材信息 */}
        <div className={styles.materialInfo}>
          <div className={styles.infoItem}>
            <Text strong>文件地址：</Text>
            <Text code className={styles.fileUrl}>
              {material.url}
            </Text>
          </div>
          {material.caption && (
            <div className={styles.infoItem}>
              <Text strong>描述：</Text>
              <Text>{material.caption}</Text>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MaterialPreview;
