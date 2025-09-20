import React, { useState } from "react";
import { Typography, Divider, message, Alert } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import type { MaterialUploadTask } from "@/store/materialStore";
import { getTaskStats } from "@/utils/taskManager";
import BaseUploadDrawer from "../common/BaseUploadDrawer";
import FileTable from "../common/FileTable";
import UploadArea from "../common/UploadArea";
import styles from "./index.module.scss";

const { Title } = Typography;

interface UploadFilesDrawerProps {
  visible: boolean;
  currentFolderId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadFilesDrawer: React.FC<UploadFilesDrawerProps> = ({
  visible,
  currentFolderId,
  onClose,
  onSuccess,
}) => {
  const {
    addTasks,
    startUpload,
    getTasksByLocation,
    clearTask,
    addTaskFromFile,
    clearForegroundTasks,
    confirmForegroundTasks,
  } = useMaterialStore();
  const [confirmLoading, setConfirmLoading] = useState(false);

  // 只获取前台任务用于显示
  const foregroundTasks = getTasksByLocation("foreground");

  // 处理文件选择
  const handleFilesSelect = async (files: File[]) => {
    // 使用新的任务创建方法
    const newTasks: MaterialUploadTask[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const task = addTaskFromFile(file, {
        targetFolderId: currentFolderId || undefined,
        location: "foreground",
      });
      newTasks.push(task);
    }

    addTasks(newTasks);

    // 自动开始上传
    try {
      await startUpload();
    } catch (error) {
      console.error("自动上传失败:", error);
      message.error("自动上传失败，请重试");
    }
  };

  // 确定按钮点击
  const handleConfirm = async () => {
    setConfirmLoading(true);
    const foregroundTasks = getTasksByLocation("foreground");

    if (foregroundTasks.length === 0) {
      message.warning("没有可操作的文件");
      setConfirmLoading(false);
      return;
    }
    try {
      // 使用 store 方法处理前台任务确认
      const { completedCount, transferredCount } =
        await confirmForegroundTasks();

      // 显示结果消息
      if (completedCount > 0) {
        message.success(`成功创建 ${completedCount} 个素材`);
      }
      if (transferredCount > 0) {
        message.info(`${transferredCount} 个文件已转为后台上传`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败，请重试");
    } finally {
      setConfirmLoading(false);
    }
  };

  // 关闭抽屉
  const handleClose = () => {
    // 停止上传 + 删除任务（完全清理前台任务）
    clearForegroundTasks();
    // 关闭抽屉
    onClose();
  };

  // 删除文件
  const handleRemoveFile = (fileId: string) => {
    // 删除任务（包括停止上传）
    clearTask(fileId);
  };

  // 计算确定按钮状态 - 只基于前台任务
  const getConfirmButtonState = () => {
    const foregroundTasks = getTasksByLocation("foreground");
    const foregroundStats = getTaskStats(foregroundTasks);

    const hasFiles =
      foregroundTasks?.filter(
        (task) => task.status === "uploading" || task.status === "completed"
      ).length > 0;

    return {
      disabled: !hasFiles, // 只要有文件就可以点击
      text: `确定 (${foregroundStats.completed}/${foregroundTasks.length})`,
    };
  };

  const confirmButtonState = getConfirmButtonState();

  // 计算进度信息
  const progressInfo = {
    completed: foregroundTasks.filter((task) => task.status === "completed")
      .length,
    total: foregroundTasks.length,
  };

  return (
    <BaseUploadDrawer
      title="上传素材文件"
      visible={visible}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmText={confirmButtonState.text}
      confirmDisabled={confirmButtonState.disabled}
      confirmLoading={confirmLoading}
      progressInfo={progressInfo}
    >
      <div className={styles.uploadFilesDrawer}>
        {/* 提示信息 */}
        <Alert
          message="确定后，未完成的文件会自动转为后台任务继续上传"
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          className={styles.tipAlert}
        />

        {/* 文件选择区域 */}
        <div className={styles.selectSection}>
          <Title level={4}>选择文件</Title>
          <UploadArea
            mode="files"
            onFilesSelect={handleFilesSelect}
            disabled={false}
            accept="image/*,video/*,audio/*"
          />
        </div>

        {/* 文件列表区域 */}
        {foregroundTasks.length > 0 && (
          <>
            <Divider />
            <div className={styles.fileListSection}>
              <Title level={5}>文件列表 ({foregroundTasks.length})</Title>

              {/* 文件列表 - 只显示前台任务 */}
              <FileTable
                fileList={foregroundTasks}
                onRemoveFile={handleRemoveFile}
                disabled={false}
                showPath={false}
              />
            </div>
          </>
        )}
      </div>
    </BaseUploadDrawer>
  );
};

export default UploadFilesDrawer;
