"use client";
import React, { useState, useCallback } from "react";
import {
  Button,
  Input,
  Spin,
  Empty,
  Typography,
  message,
  Modal,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useRequest } from "ahooks";
import { MaterialInfo } from "@/api";
import { getMaterialList } from "@/api/services/material";
import MaterialThumbnail from "@/components/MaterialThumbnail";
import MaterialPreview from "@/components/MaterialPreview";
import styles from "./index.module.scss";

const { Search } = Input;
const { Text } = Typography;

export interface MaterialPickerProps {
  /** 当前选中的素材数组 */
  value: MaterialInfo[];
  /** 素材变化回调 */
  onChange: (materials: MaterialInfo[]) => void;
  /** 文件夹ID */
  folderId: number;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否必填 */
  required?: boolean;
  /** 选择器标题 */
  selectorTitle?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const MaterialPicker: React.FC<MaterialPickerProps> = ({
  value = [],
  onChange,
  folderId,
  placeholder = "请选择素材",
  multiple = false,
  required = false,
  selectorTitle = "选择素材",
  className,
  style,
}) => {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialInfo | null>(
    null
  );
  const [searchKeyword, setSearchKeyword] = useState("");
  const [tempSelectedMaterials, setTempSelectedMaterials] = useState<
    MaterialInfo[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 18; // 内部常量

  // 使用 useRequest 管理素材列表请求 - 直接依赖 folderId, currentPage, searchKeyword
  const { data: materialData, loading } = useRequest(
    async () => {
      if (!folderId || !selectorVisible) return { rows: [], total: 0 };

      const params = {
        folderId,
        pageNum: currentPage,
        pageSize,
        ...(searchKeyword && { name: searchKeyword }),
      };

      const response = await getMaterialList(params);
      if (response.code === 200 && response.rows) {
        return {
          rows: response.rows,
          total: response.total,
        };
      } else {
        throw new Error(response.msg || "获取素材列表失败");
      }
    },
    {
      ready: !!folderId && selectorVisible, // 只有当 folderId 存在且选择器打开时才请求
      refreshDeps: [folderId, currentPage, searchKeyword, selectorVisible], // 依赖这些参数
      onError: (error) => {
        console.error("获取素材列表失败:", error);
        message.error("获取素材列表失败");
      },
    }
  );

  const availableMaterials = materialData?.rows || [];
  const total = materialData?.total || 0;

  // 搜索素材
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1); // 搜索时重置到第一页
  }, []);

  // 分页变化
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 处理添加素材
  const handleAdd = () => {
    setTempSelectedMaterials(value); // 初始化临时选择为当前已选择的素材
    setCurrentPage(1); // 重置到第一页
    setSearchKeyword(""); // 清空搜索关键词
    setSelectorVisible(true); // 打开选择器，这会触发 useRequest 自动请求
  };

  // 处理素材选择（在选择器中的临时选择）
  const handleSelect = (material: MaterialInfo) => {
    if (multiple) {
      const isSelected = tempSelectedMaterials.some(
        (item) => item.id === material.id
      );
      if (isSelected) {
        setTempSelectedMaterials(
          tempSelectedMaterials.filter((item) => item.id !== material.id)
        );
      } else {
        setTempSelectedMaterials([...tempSelectedMaterials, material]);
      }
    } else {
      setTempSelectedMaterials([material]);
    }
  };

  // 处理选择确认
  const handleSelectConfirm = () => {
    if (tempSelectedMaterials.length === 0 && required) {
      message.warning("请至少选择一个素材");
      return;
    }
    onChange(tempSelectedMaterials);
    setSelectorVisible(false);
  };

  // 处理删除素材
  const handleRemove = (materialId: number) => {
    const newMaterials = value.filter((material) => material.id !== materialId);
    onChange(newMaterials);
  };

  // 处理预览
  const handlePreview = (material: MaterialInfo) => {
    setPreviewMaterial(material);
    setPreviewVisible(true);
  };

  // 处理选择器关闭
  const handleSelectorClose = () => {
    setTempSelectedMaterials(value); // 重置为当前已选择的素材
    setSearchKeyword(""); // 清空搜索关键词
    setCurrentPage(1); // 重置到第一页
    setSelectorVisible(false); // 关闭选择器，这会停止 useRequest 请求
  };

  console.log("value", value);

  return (
    <>
      <div
        className={`${styles.materialPicker} ${className || ""}`}
        style={style}
      >
        {/* 已选素材显示区域 */}
        <div className={styles.displayArea}>
          {value.length === 0 ? (
            <div className={styles.emptyState}>
              <Text type="secondary">{placeholder}</Text>
            </div>
          ) : (
            <div className={styles.selectedMaterials}>
              {value.map((material) => (
                <div key={material.id} className={styles.selectedItem}>
                  <MaterialThumbnail
                    material={material}
                    size="small"
                    onClick={() => handlePreview(material)}
                  />
                  <div className={styles.materialInfo}>
                    <Text
                      className={styles.materialName}
                      ellipsis={{ tooltip: material.name }}
                    >
                      {material.name}
                    </Text>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(material.id)}
                    className={styles.removeBtn}
                    danger
                  />
                </div>
              ))}
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
      </div>

      {/* 素材选择器 */}
      <Modal
        title={selectorTitle}
        open={selectorVisible}
        onCancel={handleSelectorClose}
        width={900}
        className={styles.selectorModal}
        footer={[
          <Button key="cancel" onClick={handleSelectorClose}>
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleSelectConfirm}>
            确认选择 ({tempSelectedMaterials.length})
          </Button>,
        ]}
      >
        <div className={styles.selectorContent}>
          {/* 搜索栏 */}
          <div className={styles.searchBar}>
            <Search
              placeholder="搜索素材名称..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
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
            ) : availableMaterials.length === 0 ? (
              <div className={styles.loadingContainer}>
                <Empty description="暂无素材" />
              </div>
            ) : (
              <div className={styles.materialGrid}>
                {availableMaterials.map((material) => {
                  const isSelected = tempSelectedMaterials.some(
                    (item) => item.id === material.id
                  );

                  return (
                    <div
                      key={material.id}
                      className={`${styles.selectorItem} ${
                        isSelected ? styles.selected : ""
                      }`}
                      onClick={() => handleSelect(material)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <MaterialThumbnail
                          material={material}
                          size="medium"
                          onClick={() => handlePreview(material)}
                        />
                      </div>

                      {isSelected && (
                        <div className={styles.selectedOverlay}>
                          <CheckOutlined className={styles.checkIcon} />
                        </div>
                      )}

                      <div className={styles.selectorItemInfo}>
                        <Text
                          className={styles.selectorItemName}
                          ellipsis={{ tooltip: material.name }}
                        >
                          {material.name}
                        </Text>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 分页组件 - 移到素材列表外部 */}
          {!loading && availableMaterials.length > 0 && total > pageSize && (
            <div className={styles.paginationContainer}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
                }
              />
            </div>
          )}
        </div>
      </Modal>

      {/* 预览组件 */}
      <MaterialPreview
        visible={previewVisible}
        material={previewMaterial}
        onClose={() => setPreviewVisible(false)}
      />
    </>
  );
};

export default MaterialPicker;
