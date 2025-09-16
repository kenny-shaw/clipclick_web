import React, { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  message,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useProductStore } from "@/store/productStore";
import {
  CreateProductParams,
  UpdateProductParams,
} from "@/api/services/product/types";
import FolderSelector from "@/components/FolderSelector";
import styles from "./index.module.scss";

const { Title, Text } = Typography;

interface ProductFormDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const ProductFormDrawer: React.FC<ProductFormDrawerProps> = ({ visible }) => {
  const [form] = Form.useForm();
  const {
    formDrawerMode,
    currentProduct,
    isCreating,
    isUpdating,
    createProduct,
    updateProduct,
    closeFormDrawer,
  } = useProductStore();

  const isEdit = formDrawerMode === "edit";
  const loading = isCreating || isUpdating;

  // 表单字段配置
  const folderFields = [
    {
      name: "mainFolder",
      label: "主视频文件夹",
      required: true,
      description: "存储主要视频素材的文件夹",
    },
    {
      name: "captionFolder",
      label: "分镜文件夹",
      required: true,
      description: "存储分镜素材的文件夹",
    },
    {
      name: "prefixFolder",
      label: "前贴文件夹",
      required: true,
      description: "存储前贴素材的文件夹",
    },
    {
      name: "picFolder",
      label: "图片文件夹",
      required: true,
      description: "存储图片素材的文件夹",
    },
  ];

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (isEdit && currentProduct) {
        // 编辑模式：填充现有数据
        form.setFieldsValue({
          name: currentProduct.name,
          // 注意：这里需要根据实际API返回的字段来设置
          // 如果API返回的是文件夹ID，需要转换为文件夹名称
        });
      } else {
        // 创建模式：重置表单
        form.resetFields();
      }
    }
  }, [visible, isEdit, currentProduct, form]);

  // 提交处理
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit && currentProduct) {
        // 编辑商品
        const updateParams: UpdateProductParams = {
          name: values.name,
          mainFolder: values.mainFolder,
          captionFolder: values.captionFolder,
          prefixFolder: values.prefixFolder,
          picFolder: values.picFolder,
        };

        await updateProduct(currentProduct.id, updateParams);
        message.success("商品更新成功！");
      } else {
        // 创建商品
        const createParams: CreateProductParams = {
          name: values.name,
          mainFolder: values.mainFolder,
          captionFolder: values.captionFolder,
          prefixFolder: values.prefixFolder,
          picFolder: values.picFolder,
        };

        await createProduct(createParams);
        message.success("商品创建成功！");
      }

      closeFormDrawer();
    } catch (error) {
      console.error("提交失败:", error);
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  // 取消处理
  const handleCancel = () => {
    form.resetFields();
    closeFormDrawer();
  };

  return (
    <Drawer
      title={
        <div className={styles.drawerTitle}>
          <Title level={4} className={styles.title}>
            {isEdit ? "编辑商品" : "创建商品"}
          </Title>
          <Text type="secondary" className={styles.subtitle}>
            {isEdit ? "修改商品配置信息" : "配置新商品的基本信息和文件夹关联"}
          </Text>
        </div>
      }
      open={visible}
      onClose={handleCancel}
      width={800}
      className={styles.productFormDrawer}
      footer={
        <div className={styles.drawerFooter}>
          <Space>
            <Button onClick={handleCancel} disabled={loading}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              {isEdit ? "更新" : "创建"}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className={styles.productForm}
        requiredMark={false}
      >
        {/* 基本信息 */}
        <div className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>
            基本信息
          </Title>
          <Form.Item
            name="name"
            label="商品名称"
            rules={[
              { required: true, message: "请输入商品名称" },
              { max: 50, message: "商品名称不能超过50个字符" },
            ]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
        </div>

        <Divider />

        {/* 文件夹配置 */}
        <div className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>
            文件夹配置
          </Title>
          <Text type="secondary" className={styles.sectionDescription}>
            为商品配置相关的文件夹，用于存储不同类型的素材
          </Text>

          <Row gutter={[16, 16]}>
            {folderFields.map((field) => (
              <Col span={12} key={field.name}>
                <Form.Item
                  name={field.name}
                  label={field.label}
                  rules={[
                    {
                      required: field.required,
                      message: `请选择${field.label}`,
                    },
                  ]}
                  tooltip={field.description}
                >
                  <FolderSelector placeholder={`请选择${field.label}`} />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </div>
      </Form>
    </Drawer>
  );
};

export default ProductFormDrawer;
