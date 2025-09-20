import React from "react";
import { Table, Progress, Button, Tag, Tooltip, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { MaterialUploadTask } from "@/store/materialStore";
import MaterialThumbnail from "@/components/MaterialThumbnail";
import styles from "./index.module.scss";

const { Text } = Typography;

interface FileTableProps {
  fileList: MaterialUploadTask[];
  onRemoveFile?: (fileId: string) => void;
  disabled?: boolean;
  showPath?: boolean;
}

const FileTable: React.FC<FileTableProps> = ({
  fileList,
  onRemoveFile,
  disabled = false,
  showPath = false,
}) => {
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

  const columns = [
    {
      title: "文件",
      key: "file",
      width: "40%",
      render: (record: MaterialUploadTask) => (
        <div className={styles.fileCell}>
          <div className={styles.fileInfo}>
            <MaterialThumbnail
              file={record.file}
              size="small"
              onClick={(material, file) => {
                // 处理文件预览
                if (file) {
                  console.log("Preview file:", file.name);
                }
              }}
            />
            <div className={styles.fileDetails}>
              <div className={styles.fileName}>
                <Text strong ellipsis={{ tooltip: record.file.name }}>
                  {record.file.name}
                </Text>
              </div>
              <div className={styles.progressContainer}>
                <Progress
                  percent={record.progress}
                  status={getProgressStatus(record)}
                  size="default"
                  showInfo={true}
                />
              </div>
            </div>
          </div>
          {showPath && record.relativePath && (
            <div className={styles.filePath}>
              <Text type="secondary" className={styles.relativePath}>
                {record.relativePath}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "状态",
      key: "status",
      width: "15%",
      render: (record: MaterialUploadTask) => getStatusTag(record),
    },
    {
      title: "大小",
      key: "size",
      width: "15%",
      render: (record: MaterialUploadTask) => (
        <Text type="secondary">{formatFileSize(record.file.size)}</Text>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: "15%",
      render: (record: MaterialUploadTask) => (
        <Space size="small">
          {/* 删除按钮（所有状态都显示） */}
          {onRemoveFile && !disabled && (
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemoveFile(record.id)}
                danger
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (fileList.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text type="secondary">暂无文件</Text>
      </div>
    );
  }

  return (
    <div className={styles.fileTable}>
      <Table
        dataSource={fileList}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        className={styles.table}
        showHeader={true}
      />
    </div>
  );
};

export default FileTable;
