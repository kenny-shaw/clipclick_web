"use client";
import React, { useState } from "react";
import { Button, Image, Modal, Typography } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { MaterialInfo } from "@/api";
import MaterialSelector from "../MaterialSelector";
import styles from "./index.module.scss";

const { Text } = Typography;

interface MaterialDisplayProps {
  materials: MaterialInfo[];
  onMaterialsChange: (materials: MaterialInfo[]) => void;
  placeholder: string;
  multiple?: boolean;
  materialType?: "video" | "image" | "all";
  required?: boolean;
  loading?: boolean;
  availableMaterials?: MaterialInfo[]; // 可选择的素材列表
}

const MaterialDisplay: React.FC<MaterialDisplayProps> = ({
  materials,
  onMaterialsChange,
  placeholder,
  multiple = false,
  materialType = "all",
  loading = false,
  availableMaterials = [],
}) => {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState<MaterialInfo | null>(null);

  // 处理添加素材
  const handleAdd = () => {
    setSelectorVisible(true);
  };

  // 处理素材选择确认
  const handleSelectConfirm = (selectedMaterials: MaterialInfo[]) => {
    if (multiple) {
      onMaterialsChange(selectedMaterials);
    } else {
      onMaterialsChange(selectedMaterials.slice(0, 1));
    }
    setSelectorVisible(false);
  };

  // 处理删除素材
  const handleRemove = (materialId: number) => {
    const newMaterials = materials.filter((m) => m.id !== materialId);
    onMaterialsChange(newMaterials);
  };

  // 处理预览
  const handlePreview = (material: MaterialInfo) => {
    // 对于图片，使用 Ant Design Image 组件的预览功能
    // 对于视频，仍然使用自定义预览弹窗
    if (material.category === 1) {
      // 图片预览由 Image 组件自己处理
      return;
    }
    setPreviewItem(material);
    setPreviewVisible(true);
  };

  // 渲染素材项
  const renderMaterialItem = (material: MaterialInfo) => {
    const isVideo = material.category === 2;
    const isImage = material.category === 1;

    return (
      <div key={material.id} className={styles.materialItem}>
        <div
          className={styles.materialPreview}
          onClick={() => handlePreview(material)}
        >
          {isVideo ? (
            <div className={styles.videoPreview}>
              <PlayCircleOutlined className={styles.playIcon} />
            </div>
          ) : isImage ? (
            <Image
              src={material.url}
              alt={material.name}
              className={styles.imagePreview}
              fallback="/next.svg"
              preview={{
                mask: <EyeOutlined />,
              }}
            />
          ) : (
            <div className={styles.filePreview}>
              <Text type="secondary">文件</Text>
            </div>
          )}
        </div>

        <div className={styles.materialInfo}>
          <Text
            className={styles.materialName}
            ellipsis={{ tooltip: material.name }}
          >
            {material.name}
          </Text>
          <Text type="secondary" className={styles.materialType}>
            {isVideo ? "视频" : isImage ? "图片" : "文件"}
          </Text>
        </div>

        <div className={styles.materialActions}>
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(material.id)}
            className={styles.actionBtn}
            danger
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles.materialDisplay}>
        {materials.length > 0 ? (
          <div className={styles.materialsList}>
            {materials.map(renderMaterialItem)}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Text type="secondary">{placeholder}</Text>
          </div>
        )}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          loading={loading}
          className={styles.addButton}
          block
        >
          选择素材
        </Button>
      </div>

      {/* 素材选择器 */}
      <MaterialSelector
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        onConfirm={handleSelectConfirm}
        materials={availableMaterials}
        loading={loading}
        title={`选择${
          materialType === "video"
            ? "视频"
            : materialType === "image"
            ? "图片"
            : "素材"
        }`}
        multiple={multiple}
        materialType={materialType}
        selectedItems={materials}
      />

      {/* 预览模态框 */}
      <Modal
        title={`预览 - ${previewItem?.name}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
      >
        {previewItem && (
          <div className={styles.previewContainer}>
            {previewItem.category === 2 ? (
              <video
                src={previewItem.url}
                controls
                className={styles.previewVideo}
                style={{ width: "100%", maxHeight: "400px" }}
              />
            ) : previewItem.category === 1 ? (
              <Image
                src={previewItem.url}
                alt={previewItem.name}
                className={styles.previewImage}
                style={{ width: "100%", maxHeight: "400px" }}
              />
            ) : (
              <div className={styles.previewFile}>
                <Text>无法预览此文件类型</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default MaterialDisplay;
