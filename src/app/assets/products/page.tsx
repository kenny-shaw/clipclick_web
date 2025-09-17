"use client";
import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Space,
  Card,
  Table,
  Input,
  message,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useProductStore } from "@/store/productStore";
import { Product } from "@/api/services/product/types";
import ProductFormDrawer from "./components/ProductFormDrawer";
import { useRouter } from "next/navigation";
import styles from "./index.module.scss";

const { Title } = Typography;
const { Search } = Input;

const ProductsPage = () => {
  const router = useRouter();
  const {
    products,
    productsLoading,
    productsTotal,
    productsCurrent,
    productsPageSize,
    searchKeyword,
    isDeleting,
    fetchProductList,
    setSearchKeyword,
    setPagination,
    openCreateDrawer,
    openEditDrawer,
    deleteProduct,
    formDrawerVisible,
    closeFormDrawer,
  } = useProductStore();

  // 搜索防抖
  const [searchValue, setSearchValue] = useState(searchKeyword);

  // 初始化加载商品列表
  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setSearchValue(value);
    fetchProductList({ name: value });
  };

  // 搜索框变化处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // 创建商品
  const handleCreateProduct = () => {
    openCreateDrawer();
  };

  // 编辑商品
  const handleEditProduct = (product: Product) => {
    openEditDrawer(product);
  };

  // 删除商品
  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      message.success("商品删除成功！");
    } catch (error) {
      console.error("删除商品失败:", error);
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  // 跳转到文件夹
  const handleFolderClick = (folderId: number) => {
    router.push(`/assets/materials?folderId=${folderId}`);
  };

  // 分页处理
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(page, pageSize);
    fetchProductList({
      pageNum: page,
      pageSize,
      name: searchKeyword || undefined,
    });
  };

  // 表格列定义
  const columns = [
    {
      title: "商品名称",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (text: string) => (
        <div className={styles.productName}>
          <ShoppingOutlined className={styles.productIcon} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "主视频文件夹",
      dataIndex: "mainFolderId",
      key: "mainFolderId",
      width: 140,
      render: (id: number) => (
        <Tag
          color="blue"
          className={styles.clickableTag}
          onClick={() => handleFolderClick(id)}
        >
          <FolderOutlined /> {id}
        </Tag>
      ),
    },
    {
      title: "分镜文件夹",
      dataIndex: "captionFolderId",
      key: "captionFolderId",
      width: 140,
      render: (id: number) => (
        <Tag
          color="green"
          className={styles.clickableTag}
          onClick={() => handleFolderClick(id)}
        >
          <FolderOutlined /> {id}
        </Tag>
      ),
    },
    {
      title: "前贴文件夹",
      dataIndex: "prefixFolderId",
      key: "prefixFolderId",
      width: 140,
      render: (id: number) => (
        <Tag
          color="orange"
          className={styles.clickableTag}
          onClick={() => handleFolderClick(id)}
        >
          <FolderOutlined /> {id}
        </Tag>
      ),
    },
    {
      title: "图片文件夹",
      dataIndex: "picFolderId",
      key: "picFolderId",
      width: 140,
      render: (id: number) => (
        <Tag
          color="purple"
          className={styles.clickableTag}
          onClick={() => handleFolderClick(id)}
        >
          <FolderOutlined /> {id}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDeleteProduct(record)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ loading: isDeleting }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={isDeleting}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.productsPage}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Title level={2} className={styles.pageTitle}>
            商品库
          </Title>
          <p className={styles.pageDescription}>
            管理您的商品配置，包括文件夹关联和商品信息
          </p>
        </div>

        <Space>
          <Search
            placeholder="搜索商品名称..."
            value={searchValue}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProduct}
          >
            创建商品
          </Button>
        </Space>
      </div>

      {/* 商品列表 */}
      <Card className={styles.contentCard}>
        <Table
          columns={columns}
          dataSource={products}
          loading={productsLoading}
          rowKey="id"
          scroll={{ x: "max-content", y: 55 * 10 }}
          pagination={{
            current: productsCurrent,
            pageSize: productsPageSize,
            total: productsTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
          }}
        />
      </Card>

      {/* 商品表单抽屉 */}
      <ProductFormDrawer
        visible={formDrawerVisible}
        onClose={closeFormDrawer}
      />
    </div>
  );
};

export default ProductsPage;
