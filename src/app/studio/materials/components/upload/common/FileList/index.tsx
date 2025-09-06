import React from "react";
import { List, Progress, Button, Tag, Tooltip, Typography, Space } from "antd";
import {
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type { MaterialUploadTask } from "@/store/materialStore";
import styles from "./index.module.scss";

const { Text } = Typography;

interface FileListProps {
  fileList: MaterialUploadTask[];
  onRemoveFile?: (fileId: string) => void;
  onCancelFile?: (fileId: string) => void; // 新增：取消上传回调
  disabled?: boolean;
  showPath?: boolean; // 是否显示文件路径（文件夹上传时显示）
}

const FileList: React.FC<FileListProps> = ({
  fileList,
  onRemoveFile,
  onCancelFile,
  disabled = false,
  showPath = false,
}) => {
  // 获取文件类型图标
  const getFileIcon = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return <FileImageOutlined style={{ color: "#52c41a", fontSize: 16 }} />;
    } else if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension || "")
    ) {
      return <VideoCameraOutlined style={{ color: "#1890ff", fontSize: 16 }} />;
    } else if (["mp3", "wav", "aac", "ogg", "flac"].includes(extension || "")) {
      return <AudioOutlined style={{ color: "#faad14", fontSize: 16 }} />;
    } else {
      return <FileOutlined style={{ color: "#8c8c8c", fontSize: 16 }} />;
    }
  };

  // 获取文件大小显示
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 获取上传状态标签
  const getStatusTag = (task: MaterialUploadTask) => {
    switch (task.status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="default">
            等待上传
          </Tag>
        );
      case "uploading":
        return (
          <Tag icon={<LoadingOutlined />} color="processing">
            上传中
          </Tag>
        );
      case "completed":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            上传完成
          </Tag>
        );
      case "error":
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            上传失败
          </Tag>
        );
      case "cancelled":
        return (
          <Tag icon={<CloseCircleOutlined />} color="default">
            已取消
          </Tag>
        );
      default:
        return null;
    }
  };

  // 获取进度条状态
  const getProgressStatus = (task: MaterialUploadTask) => {
    switch (task.status) {
      case "completed":
        return "success";
      case "error":
        return "exception";
      case "cancelled":
        return "exception";
      case "uploading":
        return "active";
      default:
        return "normal";
    }
  };

  if (fileList.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text type="secondary">暂无文件</Text>
      </div>
    );
  }

  return (
    <div className={styles.fileList}>
      <List
        dataSource={fileList}
        renderItem={(task) => (
          <List.Item
            key={task.id}
            className={styles.fileItem}
            actions={[
              // 取消上传按钮（仅在上传中时显示）
              onCancelFile && task.status === "uploading" && !disabled && (
                <Tooltip title="取消上传">
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => onCancelFile(task.id)}
                    danger
                  />
                </Tooltip>
              ),
              // 移除文件按钮
              onRemoveFile && !disabled && (
                <Tooltip title="移除文件">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveFile(task.id)}
                    disabled={task.status === "uploading"}
                    danger
                  />
                </Tooltip>
              ),
            ].filter(Boolean)}
          >
            <div className={styles.fileContent}>
              {/* 文件信息行 */}
              <div className={styles.fileInfo}>
                <div className={styles.fileBasicInfo}>
                  {getFileIcon(task.file)}
                  <div className={styles.fileName}>
                    <Text strong>{task.file.name}</Text>
                    {showPath && task.relativePath && (
                      <Text type="secondary" className={styles.relativePath}>
                        {task.relativePath}
                      </Text>
                    )}
                  </div>
                </div>

                <div className={styles.fileMetadata}>
                  <Space size="small">
                    <Text type="secondary">
                      {formatFileSize(task.file.size)}
                    </Text>
                    {getStatusTag(task)}
                  </Space>
                </div>
              </div>

              {/* 进度条 */}
              {(task.status === "uploading" ||
                task.status === "completed" ||
                task.status === "cancelled") && (
                <div className={styles.progressSection}>
                  <Progress
                    percent={task.progress}
                    status={getProgressStatus(task)}
                    size="small"
                    showInfo={true}
                    format={(percent) => `${percent}%`}
                  />
                </div>
              )}

              {/* 错误信息 */}
              {task.error && (
                <div className={styles.errorSection}>
                  <Text type="danger" className={styles.errorText}>
                    <ExclamationCircleOutlined /> {task.error}
                  </Text>
                </div>
              )}

              {/* TOS URL（调试用） */}
              {task.tosUrl && process.env.NODE_ENV === "development" && (
                <div className={styles.debugInfo}>
                  <Text type="secondary" className={styles.tosUrl}>
                    TOS URL: {task.tosUrl}
                  </Text>
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default FileList;
