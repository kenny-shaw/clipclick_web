import React, { useState } from "react";
import { Table, Tag, Button, Tooltip, Typography } from "antd";
import {
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { MaterialInfo } from "@/api";
import MaterialThumbnail from "@/components/MaterialThumbnail";
import MaterialPreview from "@/components/MaterialPreview";
import {
  getMaterialTypeLabel,
  getApprovalStatus,
  getVisibilityStatus,
  formatTime,
} from "@/utils/materialUtils";
import styles from "./index.module.scss";

const { Text } = Typography;

interface MaterialTableProps {
  materials: MaterialInfo[];
  loading: boolean;
  current: number;
  pageSize: number;
  total: number;
  onUploadMaterial: () => void;
  onMaterialClick?: (material: MaterialInfo) => void;
  onPageChange?: (pageNum: number, pageSize: number) => void;
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
  // 预览状态管理
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialInfo | null>(
    null
  );

  // 处理预览
  const handlePreview = (material?: MaterialInfo, _file?: File) => {
    if (material) {
      setPreviewMaterial(material);
      setPreviewVisible(true);
    }
  };

  // 处理行点击
  const handleRowClick = (record: MaterialInfo) => {
    onMaterialClick?.(record);
  };

  const columns = [
    {
      title: "素材名称",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string, record: MaterialInfo) => (
        <div className={styles.materialName}>
          <MaterialThumbnail
            material={record}
            size="small"
            onClick={handlePreview}
            className={styles.materialThumbnail}
          />
          <div className={styles.materialInfo}>
            <Text className={styles.materialTitle} ellipsis={{ tooltip: text }}>
              {text}
            </Text>
            <Text type="secondary" className={styles.materialId}>
              ID: {record.id}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "类型",
      dataIndex: "url",
      key: "type",
      width: 100,
      render: (url: string) => {
        return <Tag>{getMaterialTypeLabel(url)}</Tag>;
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
      render: (isPublic: number) => getVisibilityStatus(isPublic),
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
      width: 200,
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
    <>
      <Table
        columns={columns}
        dataSource={materials}
        rowKey="id"
        loading={loading}
        scroll={{ x: "max-content", y: 55 * 10 }}
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
          onClick: () => handleRowClick(record),
          className: styles.tableRow,
        })}
        locale={{
          emptyText: emptyState,
        }}
      />

      {/* 预览组件 */}
      <MaterialPreview
        visible={previewVisible}
        material={previewMaterial}
        onClose={() => setPreviewVisible(false)}
      />
    </>
  );
};

export default MaterialTable;
