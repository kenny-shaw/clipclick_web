import React, { useRef, useState } from "react";
import { Button, Typography, Divider, message, Alert } from "antd";
import {
  CloudUploadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import type { MaterialUploadTask } from "@/store/materialStore";
import { getTaskStats } from "@/utils/taskManager";
import BaseUploadDrawer from "../common/BaseUploadDrawer";
import FileList from "../common/FileList";
import ProgressBar from "../common/ProgressBar";
import UploadActions from "../common/UploadActions";
import styles from "./index.module.scss";

const { Title, Text } = Typography;

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
    isUploading,
    isForegroundUploading,
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

  // 文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

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

    // 清空input值，允许重复选择相同文件
    event.target.value = "";
  };

  // 开始上传
  const handleStartUpload = async () => {
    const foregroundTasks = getTasksByLocation("foreground");

    if (foregroundTasks.length === 0) {
      message.warning("请先选择要上传的文件");
      return;
    }

    // 检查是否有待上传的任务
    const pendingTasks = foregroundTasks.filter(
      (task) => task.status === "pending"
    );
    if (pendingTasks.length === 0) {
      message.warning("没有待上传的文件");
      return;
    }

    try {
      // 使用新的统一上传方法，明确指定只上传前台任务
      await startUpload();
    } catch (error) {
      console.error("上传失败:", error);
      message.error("上传失败，请重试");
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

  // 取消单个文件上传
  const handleCancelFile = (fileId: string) => {
    // 停止上传 + 删除任务（完全清理）
    clearTask(fileId);
  };

  // 移除文件
  const handleRemoveFile = (fileId: string) => {
    // 仅删除任务（不停止上传，用于后台上传场景）
    clearTask(fileId);
  };

  // 选择文件按钮点击
  const handleSelectFiles = () => {
    fileInputRef.current?.click();
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

  return (
    <BaseUploadDrawer
      title="上传素材文件"
      visible={visible}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmText={confirmButtonState.text}
      confirmDisabled={confirmButtonState.disabled}
      confirmLoading={confirmLoading}
    >
      <div className={styles.uploadFilesDrawer}>
        {/* 提示信息 */}
        <Alert
          description="确定后，未完成的文件会自动转为后台任务继续上传"
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          className={styles.tipAlert}
        />

        {/* 文件选择区域 */}
        <div className={styles.selectSection}>
          <Title level={4}>选择文件</Title>
          <Button
            size="large"
            icon={<CloudUploadOutlined />}
            onClick={handleSelectFiles}
            disabled={isForegroundUploading()}
            block
          >
            选择文件
          </Button>
          <Text type="secondary" className={styles.hint}>
            支持多选，可选择图片、视频、音频等文件
          </Text>

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*"
          />
        </div>

        {/* 文件列表区域 */}
        {foregroundTasks.length > 0 ? (
          <>
            <Divider />
            <div className={styles.fileListSection}>
              <Title level={5}>文件列表 ({foregroundTasks.length})</Title>

              {/* 进度条 - 只显示前台任务进度 */}
              <ProgressBar
                fileList={foregroundTasks}
                isUploading={isUploading()}
              />

              {/* 上传操作按钮 */}
              <UploadActions
                isUploading={isForegroundUploading()}
                hasFiles={foregroundTasks.length > 0}
                onStartUpload={handleStartUpload}
              />

              {/* 文件列表 - 只显示前台任务 */}
              <FileList
                fileList={foregroundTasks}
                onRemoveFile={handleRemoveFile}
                onCancelFile={handleCancelFile}
                disabled={isUploading()}
                showPath={false}
              />
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <InboxOutlined className={styles.emptyIcon} />
            <Text type="secondary">请选择要上传的文件</Text>
          </div>
        )}
      </div>
    </BaseUploadDrawer>
  );
};

export default UploadFilesDrawer;
