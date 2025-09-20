import React from "react";
import { Drawer, Button, Space, Typography } from "antd";
import styles from "./index.module.scss";

const { Text } = Typography;

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
  progressInfo?: {
    completed: number;
    total: number;
  };
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
  width = 800,
  progressInfo,
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
          <div className={styles.footerLeft}>
            {progressInfo && progressInfo.total > 0 && (
              <Text type="secondary" className={styles.progressText}>
                已上传成功 {progressInfo.completed}/{progressInfo.total}
              </Text>
            )}
          </div>
          <div className={styles.footerRight}>
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
        </div>
      }
    >
      <div className={styles.drawerContent}>{children}</div>
    </Drawer>
  );
};

export default BaseUploadDrawer;
