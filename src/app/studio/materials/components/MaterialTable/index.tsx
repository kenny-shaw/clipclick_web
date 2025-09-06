import React from "react";
import { Table, Tag, Button, Tooltip } from "antd";
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { MaterialInfo } from "@/api";
import styles from "./index.module.scss";

interface MaterialTableProps {
  materials: MaterialInfo[];
  loading: boolean;
  current: number;
  pageSize: number;
  total: number;
  onUploadMaterial: () => void;
  onMaterialClick?: (material: MaterialInfo) => void;
  onPageChange?: (current: number, pageSize: number) => void;
}

const MaterialTable: React.FC<MaterialTableProps> = ({
  materials,
  loading,
  current,
  pageSize,
  total,
  onUploadMaterial,
  onMaterialClick,
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

  // 获取素材类型图标
  const getMaterialIcon = (url: string, category: number) => {
    const extension = url.split(".").pop()?.toLowerCase();

    // 根据文件扩展名判断类型
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return <FileImageOutlined style={{ color: "#52c41a" }} />;
    } else if (
      ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension || "")
    ) {
      return <VideoCameraOutlined style={{ color: "#1890ff" }} />;
    } else if (["mp3", "wav", "aac", "ogg", "flac"].includes(extension || "")) {
      return <AudioOutlined style={{ color: "#faad14" }} />;
    } else {
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

  const columns = [
    {
      title: "素材名称",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: MaterialInfo) => (
        <div className={styles.materialName}>
          {getMaterialIcon(record.url, record.category)}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "类型",
      dataIndex: "url",
      key: "type",
      width: 100,
      render: (url: string) => {
        const extension = url.split(".").pop()?.toLowerCase() || "";
        return <Tag>{extension.toUpperCase()}</Tag>;
      },
    },
    {
      title: "审核状态",
      dataIndex: "isApproved",
      key: "isApproved",
      width: 120,
      render: (isApproved: number) => getApprovalStatus(isApproved),
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
      <CloudUploadOutlined className={styles.emptyIcon} />
      <p>暂无素材</p>
      <Button type="primary" icon={<PlusOutlined />} onClick={onUploadMaterial}>
        上传第一个素材
      </Button>
    </div>
  );

  if (materials.length === 0 && !loading) {
    return emptyState;
  }

  return (
    <Table
      columns={columns}
      dataSource={materials}
      rowKey="id"
      loading={loading}
      pagination={{
        current,
        pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `第 ${range[0]}-${range[1]} 项，共 ${total} 个素材`,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      onRow={(record) => ({
        onClick: () => onMaterialClick?.(record),
        className: styles.tableRow,
      })}
      locale={{
        emptyText: emptyState,
      }}
    />
  );
};

export default MaterialTable;
