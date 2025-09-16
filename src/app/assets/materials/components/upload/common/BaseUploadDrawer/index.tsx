import React from "react";
import { Drawer, Button, Space } from "antd";
import styles from "./index.module.scss";

interface BaseUploadDrawerProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  showConfirm?: boolean;
  children: React.ReactNode;
  width?: number;
}

const BaseUploadDrawer: React.FC<BaseUploadDrawerProps> = ({
  title,
  visible,
  onClose,
  onConfirm,
  confirmText = "确定",
  confirmDisabled = false,
  confirmLoading = false,
  showConfirm = true,
  children,
  width = 600,
}) => {
  return (
    <Drawer
      title={title}
      placement="right"
      width={width}
      open={visible}
      onClose={onClose}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            {showConfirm && (
              <Button
                type="primary"
                onClick={onConfirm}
                disabled={confirmDisabled}
                loading={confirmLoading}
              >
                {confirmText}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div className={styles.drawerContent}>{children}</div>
    </Drawer>
  );
};

export default BaseUploadDrawer;
