"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Input,
  Spin,
  Empty,
  Image,
  Typography,
  message,
} from "antd";
import {
  SearchOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { MaterialInfo } from "@/api";
import styles from "./index.module.scss";

const { Search } = Input;
const { Text } = Typography;

interface MaterialSelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: MaterialInfo[]) => void;
  materials: MaterialInfo[];
  loading?: boolean;
  title?: string;
  multiple?: boolean;
  materialType?: "video" | "image" | "all";
  selectedItems?: MaterialInfo[];
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  visible,
  onClose,
  onConfirm,
  materials,
  loading = false,
  title = "选择素材",
  multiple = false,
  materialType = "all",
  selectedItems = [],
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMaterials, setSelectedMaterials] =
    useState<MaterialInfo[]>(selectedItems);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState<MaterialInfo | null>(null);

  // 过滤素材
  const filteredMaterials = materials.filter((material) => {
    // 按类型过滤
    if (materialType === "video" && material.category !== 2) return false;
    if (materialType === "image" && material.category !== 1) return false;

    // 按搜索关键词过滤
    if (
      searchKeyword &&
      !material.name.toLowerCase().includes(searchKeyword.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // 处理选择
  const handleSelect = (material: MaterialInfo) => {
    if (multiple) {
      const isSelected = selectedMaterials.some(
        (item) => item.id === material.id
      );
      if (isSelected) {
        setSelectedMaterials(
          selectedMaterials.filter((item) => item.id !== material.id)
        );
      } else {
        setSelectedMaterials([...selectedMaterials, material]);
      }
    } else {
      setSelectedMaterials([material]);
    }
  };

  // 处理确认
  const handleConfirm = () => {
    if (selectedMaterials.length === 0) {
      message.warning("请至少选择一个素材");
      return;
    }
    onConfirm(selectedMaterials);
    onClose();
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

  // 重置状态
  const handleClose = () => {
    setSelectedMaterials(selectedItems);
    setSearchKeyword("");
    onClose();
  };

  // 监听外部selectedItems变化
  useEffect(() => {
    setSelectedMaterials(selectedItems);
  }, [selectedItems]);

  // 渲染素材项
  const renderMaterialItem = (material: MaterialInfo) => {
    const isSelected = selectedMaterials.some(
      (item) => item.id === material.id
    );
    const isVideo = material.category === 2;
    const isImage = material.category === 1;

    return (
      <div
        key={material.id}
        className={`${styles.materialItem} ${
          isSelected ? styles.selected : ""
        }`}
        onClick={() => handleSelect(material)}
      >
        <div
          className={styles.materialPreview}
          onClick={(e) => {
            e.stopPropagation();
            handlePreview(material);
          }}
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

          {isSelected && (
            <div className={styles.selectedOverlay}>
              <CheckOutlined className={styles.checkIcon} />
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
          <Text type="secondary" className={styles.materialMeta}>
            {isVideo ? "视频" : isImage ? "图片" : "文件"}
          </Text>
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        title={title}
        open={visible}
        onCancel={handleClose}
        width={800}
        className={styles.materialSelectorModal}
        footer={[
          <Button key="cancel" onClick={handleClose}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirm}>
            确认选择 ({selectedMaterials.length})
          </Button>,
        ]}
      >
        <div className={styles.materialSelector}>
          {/* 搜索栏 */}
          <div className={styles.searchBar}>
            <Search
              placeholder="搜索素材名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </div>

          {/* 素材列表 */}
          <div className={styles.materialList}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Spin size="large" />
                <Text type="secondary">加载中...</Text>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <Empty description="暂无素材" />
            ) : (
              <div className={styles.materialGrid}>
                {filteredMaterials.map(renderMaterialItem)}
              </div>
            )}
          </div>
        </div>
      </Modal>

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

export default MaterialSelector;
