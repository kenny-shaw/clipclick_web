"use client";
import React, { useEffect, useState } from "react";
import { Select, Spin, Empty } from "antd";
import { useFineCutStore } from "@/store/fineCutStore";
import { Product } from "@/api/services/product/types";
import styles from "./index.module.scss";

const { Option } = Select;

interface ProductSelectorProps {
  value?: number;
  onChange?: (value: number, product: Product | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  value,
  onChange,
  placeholder = "请选择商品",
  disabled = false,
}) => {
  const {
    products,
    productsLoading,
    productsTotal,
    productsCurrent,
    searchKeyword,
    fetchProducts,
    setSearchKeyword,
  } = useFineCutStore();

  const [open, setOpen] = useState(false);

  // 组件加载时获取商品列表
  useEffect(() => {
    if (open && products.length === 0) {
      fetchProducts();
    }
  }, [open, products.length, fetchProducts]);

  // 处理搜索
  const handleSearch = (searchValue: string) => {
    setSearchKeyword(searchValue);
    fetchProducts({ name: searchValue });
  };

  // 处理滚动加载
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { target } = e;
    const element = target as HTMLDivElement;

    if (
      element.scrollTop + element.offsetHeight === element.scrollHeight &&
      products.length < productsTotal &&
      !productsLoading
    ) {
      fetchProducts({
        pageNum: productsCurrent + 1,
        name: searchKeyword || undefined,
      });
    }
  };

  // 处理选择
  const handleSelect = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    onChange?.(productId, product || null);
  };

  // 处理清空
  const handleClear = () => {
    onChange?.(0, null);
  };

  return (
    <Select
      value={value}
      onChange={handleSelect}
      onSearch={handleSearch}
      onClear={handleClear}
      onOpenChange={setOpen}
      placeholder={placeholder}
      disabled={disabled}
      loading={productsLoading}
      showSearch
      allowClear
      filterOption={false}
      optionLabelProp="label"
      notFoundContent={
        productsLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="small" />
            <span>加载中...</span>
          </div>
        ) : (
          <Empty description="暂无商品" />
        )
      }
      popupRender={(menu) => (
        <div onScroll={handleScroll} className={styles.dropdownContainer}>
          {menu}
        </div>
      )}
      className={styles.productSelector}
    >
      {products.map((product) => (
        <Option key={product.id} value={product.id} label={product.name}>
          <div className={styles.productOption}>
            <span className={styles.productName}>{product.name}</span>
            <span className={styles.productId}>ID: {product.id}</span>
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default ProductSelector;
