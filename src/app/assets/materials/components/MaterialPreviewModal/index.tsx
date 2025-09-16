import React from "react";
import { Modal, Image, Typography, Tag } from "antd";
import {
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { MaterialInfo } from "@/api";
import styles from "./index.module.scss";

const { Text, Title } = Typography;

interface MaterialPreviewModalProps {
  visible: boolean;
  material: MaterialInfo | null;
  onClose: () => void;
}

const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({
  visible,
  material,
  onClose,
}) => {
  if (!material) return null;

  // 获取文件扩展名
  const getFileExtension = (url: string) => {
    return url.split(".").pop()?.toLowerCase() || "";
  };

  // 判断文件类型
  const getFileType = (url: string) => {
    const extension = getFileExtension(url);

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
      return "image";
    } else if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension)
    ) {
      return "video";
    } else if (["mp3", "wav", "aac", "ogg", "flac"].includes(extension)) {
      return "audio";
    } else {
      return "other";
    }
  };

  // 获取素材类型图标
  const getMaterialIcon = (url: string) => {
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

  // 获取审核状态
  const getApprovalStatus = (isApproved: number) => {
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

  // 格式化时间
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fileType = getFileType(material.url);
  const extension = getFileExtension(material.url);

  // 渲染预览内容
  const renderPreviewContent = () => {
    switch (fileType) {
      case "image":
        return (
          <div className={styles.imagePreview}>
            <Image
              src={material.url}
              alt={material.name}
              style={{ maxWidth: "100%", maxHeight: "400px" }}
              placeholder={
                <div className={styles.imagePlaceholder}>
                  <FileImageOutlined />
                  <span>加载中...</span>
                </div>
              }
            />
          </div>
        );

      case "video":
        return (
          <div className={styles.videoPreview}>
            <video
              controls
              style={{ width: "100%", maxHeight: "400px" }}
              preload="metadata"
            >
              <source src={material.url} type={`video/${extension}`} />
              您的浏览器不支持视频播放。
            </video>
          </div>
        );

      case "audio":
        return (
          <div className={styles.audioPreview}>
            <div className={styles.audioIcon}>
              <AudioOutlined />
            </div>
            <audio controls style={{ width: "100%" }}>
              <source src={material.url} type={`audio/${extension}`} />
              您的浏览器不支持音频播放。
            </audio>
          </div>
        );

      default:
        return (
          <div className={styles.filePreview}>
            <div className={styles.fileIcon}>
              <FileOutlined />
            </div>
            <Text type="secondary">无法预览此文件类型</Text>
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              点击下载文件
            </a>
          </div>
        );
    }
  };

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          {getMaterialIcon(material.url)}
          <span>{material.name}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className={styles.previewModal}
    >
      <div className={styles.previewContent}>
        {/* 预览区域 */}
        <div className={styles.previewArea}>{renderPreviewContent()}</div>

        {/* 素材信息 */}
        <div className={styles.materialInfo}>
          <Title level={5}>素材信息</Title>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Text strong>文件类型：</Text>
              <Tag>{extension.toUpperCase()}</Tag>
            </div>

            <div className={styles.infoItem}>
              <Text strong>审核状态：</Text>
              {getApprovalStatus(material.isApproved)}
            </div>

            <div className={styles.infoItem}>
              <Text strong>可见性：</Text>
              <Tag
                color={material.isPublic === 1 ? "green" : "orange"}
                icon={
                  material.isPublic === 1 ? (
                    <EyeOutlined />
                  ) : (
                    <EyeInvisibleOutlined />
                  )
                }
              >
                {material.isPublic === 1 ? "公开" : "私有"}
              </Tag>
            </div>

            <div className={styles.infoItem}>
              <Text strong>所有者：</Text>
              <Text>{material.ownerId}</Text>
            </div>

            <div className={styles.infoItem}>
              <Text strong>创建时间：</Text>
              <Text>{formatTime(material.createdAt)}</Text>
            </div>

            <div className={styles.infoItem}>
              <Text strong>更新时间：</Text>
              <Text>{formatTime(material.updatedAt)}</Text>
            </div>
          </div>

          {/* 描述信息 */}
          {material.caption && (
            <div className={styles.infoItem}>
              <Text strong>描述：</Text>
              <Text>{material.caption}</Text>
            </div>
          )}

          {/* 文件URL */}
          <div className={styles.infoItem}>
            <Text strong>文件地址：</Text>
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fileUrl}
            >
              {material.url}
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialPreviewModal;
