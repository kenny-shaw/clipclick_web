import React from "react";
import { Progress, Typography } from "antd";
import type { MaterialUploadTask } from "@/store/materialStore";
import styles from "./index.module.scss";

const { Text } = Typography;

interface ProgressBarProps {
  fileList: MaterialUploadTask[];
  isUploading: boolean;
  title?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  fileList,
  isUploading,
  title = "整体进度",
}) => {
  // 计算整体进度
  const calculateOverallProgress = () => {
    if (fileList.length === 0) return 0;

    const totalProgress = fileList.reduce((sum, task) => {
      return sum + task.progress;
    }, 0);

    return Math.round(totalProgress / fileList.length);
  };

  const overallProgress = calculateOverallProgress();
  const completedCount = fileList.filter(
    (task) => task.status === "completed"
  ).length;
  const totalCount = fileList.length;

  if (!isUploading || fileList.length === 0) {
    return null;
  }

  return (
    <div className={styles.progressBar}>
      <div className={styles.progressInfo}>
        <Text type="secondary">
          {title}: {completedCount}/{totalCount}
        </Text>
      </div>
      <Progress
        percent={overallProgress}
        size="small"
        status={completedCount === totalCount ? "success" : "active"}
      />
    </div>
  );
};

export default ProgressBar;
