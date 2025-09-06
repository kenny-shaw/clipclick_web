import React from "react";
import {
  Drawer,
  Typography,
  Button,
  List,
  Progress,
  Tag,
  Space,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import type { MaterialUploadTask } from "@/store/materialStore";
import styles from "./index.module.scss";

const { Title, Text } = Typography;

const BackgroundTasksSidebar: React.FC = () => {
  const {
    backgroundTasksVisible,
    toggleBackgroundTasksVisible,
    removeTask,
    getTasksByLocation,
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

  // 获取任务状态标签
  const getTaskStatusTag = (task: MaterialUploadTask) => {
    if (task.materialStatus === "completed") {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          完成
        </Tag>
      );
    } else if (task.materialStatus === "error" || task.status === "error") {
      return (
        <Tag color="error" icon={<ExclamationCircleOutlined />}>
          失败
        </Tag>
      );
    } else if (task.materialStatus === "creating") {
      return (
        <Tag color="processing" icon={<LoadingOutlined />}>
          创建中
        </Tag>
      );
    } else if (task.status === "uploading") {
      return (
        <Tag color="processing" icon={<LoadingOutlined />}>
          上传中
        </Tag>
      );
    } else {
      return (
        <Tag color="default" icon={<ClockCircleOutlined />}>
          等待
        </Tag>
      );
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
      width={400}
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
        {/* 整体进度 */}
        {localStats.total > 0 && (
          <div className={styles.overallProgress}>
            <Text strong>整体进度</Text>
            <Progress
              percent={Math.round(
                (localStats.completed / localStats.total) * 100
              )}
              status={localStats.failed > 0 ? "exception" : "active"}
              strokeColor={localStats.failed > 0 ? "#ff4d4f" : "#1890ff"}
            />
            <Text type="secondary">
              进行中: {localStats.inProgress} • 等待: {localStats.pending}
            </Text>
          </div>
        )}

        {/* 任务列表 */}
        {backgroundTasks.length === 0 ? (
          <div className={styles.emptyState}>
            <Text type="secondary">暂无后台任务</Text>
          </div>
        ) : (
          <List
            className={styles.taskList}
            dataSource={backgroundTasks}
            renderItem={(task: MaterialUploadTask) => (
              <List.Item
                key={task.id}
                className={styles.taskItem}
                actions={[
                  <Tooltip key="remove" title="移除任务">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeTask(task.id)}
                      disabled={
                        task.status === "uploading" ||
                        task.materialStatus === "creating"
                      }
                      danger
                    />
                  </Tooltip>,
                ]}
              >
                <div className={styles.taskContent}>
                  {/* 任务信息 */}
                  <div className={styles.taskInfo}>
                    <div className={styles.taskName}>
                      <Text strong>{task.file.name}</Text>
                      {task.relativePath && (
                        <Text type="secondary" className={styles.taskPath}>
                          {task.relativePath}
                        </Text>
                      )}
                    </div>
                    <div className={styles.taskMeta}>
                      <Text type="secondary" className={styles.taskSize}>
                        {formatFileSize(task.file.size)}
                      </Text>
                      {getTaskStatusTag(task)}
                    </div>
                  </div>

                  {/* 进度条 */}
                  {(task.status === "uploading" ||
                    task.status === "completed") && (
                    <div className={styles.taskProgress}>
                      <Progress
                        percent={task.progress}
                        size="small"
                        status={
                          task.status === "error"
                            ? "exception"
                            : task.status === "completed"
                            ? "success"
                            : "active"
                        }
                        showInfo={false}
                      />
                    </div>
                  )}

                  {/* 错误信息 */}
                  {task.error && (
                    <div className={styles.taskError}>
                      <Text type="danger" className={styles.errorText}>
                        <ExclamationCircleOutlined /> {task.error}
                      </Text>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Drawer>
  );
};

export default BackgroundTasksSidebar;
