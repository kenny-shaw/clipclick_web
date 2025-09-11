import React from "react";
import { Table, Tag, Button, Tooltip } from "antd";
import {
  FolderOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { FolderInfo } from "@/api";
import styles from "./index.module.scss";

interface FolderTableProps {
  folders: FolderInfo[];
  loading: boolean;
  current: number;
  pageSize: number;
  total: number;
  onFolderDoubleClick: (folder: FolderInfo) => void;
  onCreateFolder: () => void;
  onPageChange?: (pageNum: number, pageSize: number) => void;
}

const FolderTable: React.FC<FolderTableProps> = ({
  folders,
  loading,
  current,
  pageSize,
  total,
  onFolderDoubleClick,
  onCreateFolder,
  onPageChange,
}) => {
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

  const columns = [
    {
      title: "文件夹名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div className={styles.folderName}>
          <FolderOutlined className={styles.folderIcon} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "可见性",
      dataIndex: "isPublic",
      key: "isPublic",
      width: 100,
      render: (isPublic: number) => (
        <Tag
          color={isPublic === 1 ? "green" : "orange"}
          icon={isPublic === 1 ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        >
          {isPublic === 1 ? "公开" : "私有"}
        </Tag>
      ),
    },
    {
      title: "所有者",
      dataIndex: "ownerId",
      key: "ownerId",
      width: 120,
      render: (ownerId: string) => (
        <div className={styles.ownerInfo}>
          <UserOutlined className={styles.ownerIcon} />
          <span>{ownerId}</span>
        </div>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (createdAt: string) => (
        <Tooltip title={createdAt}>
          <div className={styles.timeInfo}>
            <CalendarOutlined className={styles.timeIcon} />
            <span>{formatTime(createdAt)}</span>
          </div>
        </Tooltip>
      ),
    },
  ];

  const emptyState = (
    <div className={styles.emptyState}>
      <FolderOutlined className={styles.emptyIcon} />
      <p>暂无文件夹</p>
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateFolder}>
        创建第一个文件夹
      </Button>
    </div>
  );

  if (folders.length === 0 && !loading) {
    return emptyState;
  }

  return (
    <Table
      columns={columns}
      dataSource={folders}
      rowKey="id"
      loading={loading}
      pagination={{
        current,
        pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `第 ${range[0]}-${range[1]} 项，共 ${total} 个文件夹`,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      onRow={(record) => ({
        onDoubleClick: () => onFolderDoubleClick(record),
        className: styles.tableRow,
      })}
      locale={{
        emptyText: emptyState,
      }}
    />
  );
};

export default FolderTable;
