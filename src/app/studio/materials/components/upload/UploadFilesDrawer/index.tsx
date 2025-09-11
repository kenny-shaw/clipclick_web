import React, { useRef } from "react";
import { Button, Typography, Divider, message, Modal } from "antd";
import { CloudUploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import type { MaterialUploadTask } from "@/store/materialStore";
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
    uploadTasks,
    addTasks,
    startUpload,
    getTasksByLocation,
    getTaskStats,
    cancelTask,
    removeTask,
    addTaskFromFile,
  } = useMaterialStore();

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

    try {
      // 使用新的统一上传方法
      await startUpload();
    } catch (error) {
      console.error("上传失败:", error);
      message.error("上传失败，请重试");
    }
  };

  // 确定按钮点击
  const handleConfirm = async () => {
    const stats = getTaskStats();

    // 检查是否有文件正在上传或等待上传
    if (stats.uploading > 0 || stats.pending > 0) {
      message.warning("还有文件正在上传中，请等待完成");
      return;
    }

    // 检查是否有上传失败的文件
    if (stats.error > 0) {
      message.warning(`有 ${stats.error} 个文件上传失败，请检查后重试`);
      return;
    }

    // 检查是否有可创建素材的文件
    if (stats.completed === 0) {
      message.warning("没有可创建素材的文件");
      return;
    }

    try {
      // 批量创建素材
      const foregroundTasks = getTasksByLocation("foreground");
      const completedTasks = foregroundTasks.filter(
        (task) =>
          task.status === "completed" && task.materialStatus === "pending"
      );

      if (completedTasks.length > 0) {
        // 并行创建所有素材
        const createPromises = completedTasks.map(async (task) => {
          try {
            const { createMaterialForTask } = useMaterialStore.getState();
            await createMaterialForTask(task.id);
          } catch (error) {
            console.error(`创建素材失败 [${task.file.name}]:`, error);
            throw error;
          }
        });

        await Promise.allSettled(createPromises);
        message.success(`成功创建 ${completedTasks.length} 个素材`);
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error("创建素材失败:", error);
      message.error(
        `创建素材失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  // 关闭抽屉
  const handleClose = () => {
    const foregroundTasks = getTasksByLocation("foreground");

    const uploadingTasks = foregroundTasks.filter(
      (t) => t.status === "uploading"
    );
    const pendingTasks = foregroundTasks.filter((t) => t.status === "pending");
    const completedTasks = foregroundTasks.filter(
      (t) => t.status === "completed" && t.materialStatus === "pending"
    );

    // 如果有文件正在上传或等待上传，需要确认
    if (uploadingTasks.length > 0 || pendingTasks.length > 0) {
      Modal.confirm({
        title: "确认关闭？",
        content: (
          <div>
            <p>
              还有 {uploadingTasks.length + pendingTasks.length}{" "}
              个文件未完成上传。
            </p>
            <p>选择操作：</p>
            <ul>
              <li>
                <strong>取消上传</strong>：停止所有上传，已上传的文件不会保存
              </li>
              <li>
                <strong>转为后台上传</strong>：继续在后台完成上传和素材创建
              </li>
            </ul>
          </div>
        ),
        okText: "转为后台上传",
        cancelText: "取消上传",
        onOk: () => {
          // 转为后台上传的逻辑
          handleTransferToBackground(
            uploadingTasks,
            pendingTasks,
            completedTasks
          );
        },
        onCancel: () => {
          // 取消所有上传
          handleCancelAllUploads(uploadingTasks, pendingTasks, completedTasks);
        },
      });
    } else {
      doClose();
    }
  };

  const doClose = () => {
    // 只清空前台上传任务
    const foregroundTasks = getTasksByLocation("foreground");
    foregroundTasks.forEach((task) => removeTask(task.id));
    onClose();
  };

  // 转为后台上传
  const handleTransferToBackground = async (
    uploadingTasks: MaterialUploadTask[],
    pendingTasks: MaterialUploadTask[],
    completedTasks: MaterialUploadTask[]
  ) => {
    try {
      // 1. 处理已完成上传但未创建素材的文件
      if (completedTasks.length > 0) {
        console.log(`开始处理 ${completedTasks.length} 个已完成上传的任务`);

        // 先将这些任务转移到后台
        completedTasks.forEach((task) => {
          const { transferTaskToBackground } = useMaterialStore.getState();
          transferTaskToBackground(task.id);
        });

        // 并行创建素材记录
        const createMaterialPromises = completedTasks.map(async (task) => {
          try {
            const { createMaterialForTask } = useMaterialStore.getState();
            await createMaterialForTask(task.id);
            console.log(`素材创建成功: ${task.file.name}`);
          } catch (error) {
            console.error(`创建素材失败 [${task.file.name}]:`, error);
            // 更新任务状态为错误
            const { updateTask } = useMaterialStore.getState();
            updateTask(task.id, {
              materialStatus: "error",
              error: error instanceof Error ? error.message : "创建素材失败",
            });
          }
        });

        // 等待所有素材创建完成（不阻塞UI）
        Promise.allSettled(createMaterialPromises).then((results) => {
          const successCount = results.filter(
            (r) => r.status === "fulfilled"
          ).length;
          const failCount = results.filter(
            (r) => r.status === "rejected"
          ).length;

          if (successCount > 0) {
            message.success(`成功创建 ${successCount} 个素材`);
          }
          if (failCount > 0) {
            message.error(`${failCount} 个素材创建失败`);
          }
        });
      }

      // 2. 将正在上传和等待上传的文件转为后台任务
      const tasksToTransfer = [...uploadingTasks, ...pendingTasks];
      if (tasksToTransfer.length > 0) {
        tasksToTransfer.forEach((task) => {
          const { transferTaskToBackground } = useMaterialStore.getState();
          transferTaskToBackground(task.id);
        });

        message.info(`${tasksToTransfer.length} 个文件已转为后台上传`);
        // 注意：不需要重新调用 startUpload，因为：
        // - 正在上传的任务会继续上传，上传完成后会自动创建素材（因为 location 已变为 'background'）
        // - 等待上传的任务会在下次调用 startUpload 时被处理
      }

      // 3. 关闭抽屉
      doClose();
    } catch (error) {
      console.error("转移任务到后台失败:", error);
      message.error("转移任务失败，请重试");
    }
  };

  // 取消所有上传
  const handleCancelAllUploads = (
    uploadingTasks: MaterialUploadTask[],
    pendingTasks: MaterialUploadTask[],
    completedTasks: MaterialUploadTask[]
  ) => {
    // 取消所有正在上传的文件
    const { cancelAllTasks } = useMaterialStore.getState();
    cancelAllTasks();

    // 处理已完成上传但未创建素材的文件
    if (completedTasks.length > 0) {
      // 使用新的统一方法创建素材
      completedTasks.forEach((task) => {
        console.log("处理已完成的任务:", task.id);
      });
    }

    message.info(`已取消 ${uploadingTasks.length} 个正在上传的文件`);
    doClose();
  };

  // 取消单个文件上传
  const handleCancelFile = (fileId: string) => {
    cancelTask(fileId);
  };

  // 移除文件
  const handleRemoveFile = (fileId: string) => {
    removeTask(fileId);
  };

  // 选择文件按钮点击
  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  // 计算确定按钮状态
  const getConfirmButtonState = () => {
    const foregroundTasks = getTasksByLocation("foreground");
    const stats = getTaskStats();

    const hasUploading = stats.uploading > 0 || stats.pending > 0;
    const hasErrors = stats.error > 0;
    const hasCompleted = stats.completed > 0;
    const hasFiles = foregroundTasks.length > 0;

    return {
      disabled: !hasFiles || hasUploading || hasErrors || !hasCompleted,
      text: hasErrors
        ? `确定 (${stats.completed}/${foregroundTasks.length}, ${stats.error}个失败)`
        : `确定 (${stats.completed}/${foregroundTasks.length})`,
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
      confirmLoading={isUploading}
    >
      <div className={styles.uploadFilesDrawer}>
        {/* 文件选择区域 */}
        <div className={styles.selectSection}>
          <Title level={4}>选择文件</Title>
          <Button
            size="large"
            icon={<CloudUploadOutlined />}
            onClick={handleSelectFiles}
            disabled={isUploading}
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
        {uploadTasks.length > 0 ? (
          <>
            <Divider />
            <div className={styles.fileListSection}>
              <Title level={5}>文件列表 ({uploadTasks.length})</Title>

              {/* 进度条 */}
              <ProgressBar fileList={uploadTasks} isUploading={isUploading} />

              {/* 上传操作按钮 */}
              <UploadActions
                isUploading={isUploading}
                hasFiles={uploadTasks.length > 0}
                onStartUpload={handleStartUpload}
              />

              {/* 文件列表 */}
              <FileList
                fileList={uploadTasks}
                onRemoveFile={handleRemoveFile}
                onCancelFile={handleCancelFile}
                disabled={isUploading}
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
