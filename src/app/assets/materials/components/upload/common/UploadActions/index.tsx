import React from "react";
import { Button, Space } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import styles from "./index.module.scss";

interface UploadActionsProps {
  isUploading: boolean;
  hasFiles: boolean;
  onStartUpload: () => void;
  uploadButtonText?: string;
  children?: React.ReactNode;
}

const UploadActions: React.FC<UploadActionsProps> = ({
  isUploading,
  hasFiles,
  onStartUpload,
  uploadButtonText = "开始上传",
  children,
}) => {
  if (!hasFiles) {
    return null;
  }

  return (
    <div className={styles.uploadActions}>
      <Space>
        {!isUploading && (
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={onStartUpload}
          >
            {uploadButtonText}
          </Button>
        )}
        {children}
      </Space>
    </div>
  );
};

export default UploadActions;
