import React, { useEffect, useState } from "react";
import { Breadcrumb, Spin } from "antd";
import {
  HomeOutlined,
  FolderOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { BreadcrumbItem } from "@/store/materialStore";
import styles from "./index.module.scss";

interface MaterialBreadcrumbProps {
  currentFolderId: number | null;
  onBreadcrumbClick: (id: number) => void;
  getBreadcrumbsForFolder: (folderId: number) => Promise<BreadcrumbItem[]>;
}

const MaterialBreadcrumb: React.FC<MaterialBreadcrumbProps> = ({
  currentFolderId,
  onBreadcrumbClick,
  getBreadcrumbsForFolder,
}) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 加载面包屑路径
  useEffect(() => {
    if (currentFolderId === null) {
      // 根目录
      setBreadcrumbs([{ id: 0, name: "素材库" }]);
      return;
    }

    setIsLoading(true);
    getBreadcrumbsForFolder(currentFolderId)
      .then((path) => {
        setBreadcrumbs(path);
      })
      .catch((error) => {
        console.error("加载面包屑失败:", error);
        // 显示错误状态
        setBreadcrumbs([
          { id: 0, name: "素材库" },
          { id: currentFolderId, name: "加载失败" },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentFolderId, getBreadcrumbsForFolder]);

  return (
    <div className={styles.breadcrumbWrapper}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={breadcrumbs.map((item, index) => ({
          key: item.id,
          title: (
            <span
              className={
                index === breadcrumbs.length - 1
                  ? styles.currentCrumb
                  : styles.clickableCrumb
              }
              onClick={() =>
                index !== breadcrumbs.length - 1 && onBreadcrumbClick(item.id)
              }
            >
              {index === 0 && <HomeOutlined />}
              {index > 0 && <FolderOutlined />}
              <span className={styles.breadcrumbText}>
                {item.name}
                {isLoading && index === breadcrumbs.length - 1 && (
                  <Spin
                    size="small"
                    indicator={
                      <LoadingOutlined style={{ fontSize: 12 }} spin />
                    }
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            </span>
          ),
        }))}
      />
    </div>
  );
};

export default MaterialBreadcrumb;
