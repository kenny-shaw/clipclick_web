import React from "react";
import { Drawer, Typography, Button, Space, Tooltip } from "antd";
import { ClearOutlined } from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import FileTable from "../upload/common/FileTable";
import styles from "./index.module.scss";

const { Title, Text } = Typography;

const BackgroundTasksSidebar: React.FC = () => {
  const {
    backgroundTasksVisible,
    toggleBackgroundTasksVisible,
    removeTask,
    getTasksByLocation,
    cancelTask,
  } = useMaterialStore();

  // 获取后台任务
  const backgroundTasks = getTasksByLocation("background");

  // 获取任务状态统计
  const getLocalTaskStats = () => {
    const completed = backgroundTasks.filter(
      (t) => t.materialStatus === "completed"
    ).length;
    const failed = backgroundTasks.filter(
      (t) => t.materialStatus === "error" || t.status === "error"
    ).length;
    const inProgress = backgroundTasks.filter(
      (t) => t.status === "uploading" || t.materialStatus === "creating"
    ).length;
    const pending = backgroundTasks.filter(
      (t) =>
        t.status === "pending" ||
        (t.status === "completed" && t.materialStatus === "pending")
    ).length;

    return {
      completed,
      failed,
      inProgress,
      pending,
      total: backgroundTasks.length,
    };
  };

  const localStats = getLocalTaskStats();

  // 处理删除任务（先取消上传再删除）
  const handleRemoveTask = (taskId: string) => {
    const task = backgroundTasks.find((t) => t.id === taskId);
    if (
      task &&
      (task.status === "uploading" || task.materialStatus === "creating")
    ) {
      // 如果任务正在上传或创建素材，先取消
      cancelTask(taskId);
    }
    // 删除任务
    removeTask(taskId);
  };

  return (
    <Drawer
      title={
        <div className={styles.drawerHeader}>
          <Title level={4} style={{ margin: 0 }}>
            后台任务
          </Title>
          <div className={styles.taskStats}>
            <Text type="secondary">
              {localStats.total > 0 && (
                <>
                  总计 {localStats.total} • 完成 {localStats.completed} • 失败{" "}
                  {localStats.failed}
                </>
              )}
            </Text>
          </div>
        </div>
      }
      placement="right"
      width={800}
      open={backgroundTasksVisible}
      onClose={toggleBackgroundTasksVisible}
      maskClosable={true}
      extra={
        <Space>
          {localStats.completed > 0 && (
            <Tooltip title="清除已完成任务">
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={() => {
                  // 清除已完成的后台任务
                  const completedTasks = backgroundTasks.filter(
                    (task) => task.materialStatus === "completed"
                  );
                  completedTasks.forEach((task) => removeTask(task.id));
                }}
              >
                清除完成
              </Button>
            </Tooltip>
          )}
        </Space>
      }
    >
      <div className={styles.backgroundTasksSidebar}>
        {/* 任务列表 */}
        {backgroundTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <Text type="secondary">暂无后台任务</Text>
          </div>
        ) : (
          <FileTable
            fileList={backgroundTasks}
            onRemoveFile={handleRemoveTask}
            disabled={false}
            showPath={true}
          />
        )}
      </div>
    </Drawer>
  );
};

export default BackgroundTasksSidebar;
