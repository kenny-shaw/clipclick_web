import React from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined, FolderOutlined } from "@ant-design/icons";
import { BreadcrumbItem } from "@/store/materialStore";
import styles from "./index.module.scss";

interface MaterialBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (id: number) => void;
}

const MaterialBreadcrumb: React.FC<MaterialBreadcrumbProps> = ({
  breadcrumbs,
  onBreadcrumbClick,
}) => {
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
              <span className={styles.breadcrumbText}>{item.name}</span>
            </span>
          ),
        }))}
      />
    </div>
  );
};

export default MaterialBreadcrumb;
