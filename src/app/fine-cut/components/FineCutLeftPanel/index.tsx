"use client";
import React from "react";
import { Form, Button, Typography, FormInstance } from "antd";
import { useFineCutStore } from "@/store/fineCutStore";
import ProductSelector from "../ProductSelector";
import MaterialDisplay from "../MaterialDisplay";
import { Product } from "@/api/services/product/types";
import { MaterialInfo } from "@/api";
import styles from "./index.module.scss";

const { Title } = Typography;

interface FineCutLeftPanelProps {
  form: FormInstance;
  loading: boolean;
  onGenerate: () => void;
}

const FineCutLeftPanel: React.FC<FineCutLeftPanelProps> = ({
  form,
  loading,
  onGenerate,
}) => {
  const {
    setSelectedProduct,
    mainVideos,
    prefixVideos,
    maskImages,
    materialsLoading,
    selectedMainVideos,
    selectedPrefixVideos,
    selectedMaskImages,
    setSelectedMainVideos,
    setSelectedPrefixVideos,
    setSelectedMaskImages,
  } = useFineCutStore();

  // 处理商品选择
  const handleProductChange = (productId: number, product: Product | null) => {
    setSelectedProduct(product);
    form.setFieldsValue({ productId });
  };

  // 处理主视频选择
  const handleMainVideoChange = (materials: MaterialInfo[]) => {
    setSelectedMainVideos(materials);
    form.setFieldsValue({ mainVideoIds: materials.map((m) => m.id) });
  };

  // 处理前贴视频选择
  const handlePrefixVideoChange = (materials: MaterialInfo[]) => {
    if (materials.length > 0) {
      setSelectedPrefixVideos([materials[0]]);
      form.setFieldsValue({ prefixVideoId: materials[0].id });
    } else {
      setSelectedPrefixVideos([]);
      form.setFieldsValue({ prefixVideoId: undefined });
    }
  };

  // 处理蒙层图片选择
  const handleMaskImageChange = (materials: MaterialInfo[]) => {
    if (materials.length > 0) {
      setSelectedMaskImages([materials[0]]);
      form.setFieldsValue({ maskImageId: materials[0].id });
    } else {
      setSelectedMaskImages([]);
      form.setFieldsValue({ maskImageId: undefined });
    }
  };

  return (
    <div className={styles.leftPanel}>
      <div className={styles.panelCard}>
        <Title level={4} className={styles.panelTitle}>
          精剪成片
        </Title>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className={styles.panelForm}
        >
          <div className={styles.formContent}>
            <Form.Item
              label="选择商品"
              name="productId"
              rules={[{ required: true, message: "请选择商品" }]}
            >
              <ProductSelector
                onChange={handleProductChange}
                placeholder="请选择商品"
              />
            </Form.Item>
            <Form.Item
              label="主视频"
              name="mainVideoIds"
              rules={[{ required: true, message: "请选择主视频" }]}
            >
              <MaterialDisplay
                materials={selectedMainVideos}
                onMaterialsChange={handleMainVideoChange}
                placeholder="请选择主视频"
                multiple={true}
                materialType="video"
                required={true}
                loading={materialsLoading}
                availableMaterials={mainVideos}
              />
            </Form.Item>
            <Form.Item label="前贴视频" name="prefixVideoId">
              <MaterialDisplay
                materials={selectedPrefixVideos}
                onMaterialsChange={handlePrefixVideoChange}
                placeholder="请选择前贴视频（可选）"
                multiple={false}
                materialType="video"
                required={false}
                loading={materialsLoading}
                availableMaterials={prefixVideos}
              />
            </Form.Item>
            <Form.Item
              label="蒙层图片"
              name="maskImageId"
              rules={[{ required: true, message: "请选择蒙层图片" }]}
            >
              <MaterialDisplay
                materials={selectedMaskImages}
                onMaterialsChange={handleMaskImageChange}
                placeholder="请选择蒙层图片"
                multiple={false}
                materialType="image"
                required={true}
                loading={materialsLoading}
                availableMaterials={maskImages}
              />
            </Form.Item>
          </div>
          <Form.Item>
            <Button
              type="primary"
              htmlType="button"
              className={styles.generateBtn}
              loading={loading}
              block
              size="large"
              onClick={onGenerate}
            >
              生成成片
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default FineCutLeftPanel;
