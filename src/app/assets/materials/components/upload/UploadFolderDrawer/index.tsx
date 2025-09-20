import React, { useState } from "react";
import { Typography, Divider, message, Alert, Tag } from "antd";
import { FolderOpenOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import type { MaterialUploadTask } from "@/store/materialStore";
import { getTaskStats } from "@/utils/taskManager";
import BaseUploadDrawer from "../common/BaseUploadDrawer";
import FileTable from "../common/FileTable";
import UploadArea from "../common/UploadArea";
import styles from "./index.module.scss";

const { Title } = Typography;

interface UploadFolderDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadFolderDrawer: React.FC<UploadFolderDrawerProps> = ({
  visible,
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
    createFolderForUpload,
    updateTasksTargetFolder,
  } = useMaterialStore();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [folderName, setFolderName] = useState<string>("");

  // 只获取前台任务用于显示
  const foregroundTasks = getTasksByLocation("foreground");

  // 处理文件夹选择
  const handleFolderSelect = async (files: File[], folderName: string) => {
    setFolderName(folderName);

    // 使用新的任务创建方法
    const newTasks: MaterialUploadTask[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const task = addTaskFromFile(file, {
        targetFolderId: undefined, // 先不设置，等创建文件夹后再设置
        location: "foreground",
        folderName: folderName, // 添加文件夹名标识
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

    if (!folderName) {
      message.warning("请先选择要上传的文件夹");
      setConfirmLoading(false);
      return;
    }

    try {
      // 1. 先创建文件夹
      const folderId = await createFolderForUpload(folderName);

      // 2. 更新所有任务的 targetFolderId
      updateTasksTargetFolder(folderId, folderName);

      // 3. 调用现有的 confirmForegroundTasks 方法
      const { completedCount, transferredCount } =
        await confirmForegroundTasks();

      // 显示结果消息
      if (completedCount > 0) {
        message.success(
          `成功创建文件夹"${folderName}"和 ${completedCount} 个素材`
        );
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
    // 重置文件夹名
    setFolderName("");
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
      disabled: !hasFiles || !folderName, // 需要有文件且已选择文件夹
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
      title="上传文件夹"
      visible={visible}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmText={confirmButtonState.text}
      confirmDisabled={confirmButtonState.disabled}
      confirmLoading={confirmLoading}
      progressInfo={progressInfo}
    >
      <div className={styles.uploadFolderDrawer}>
        {/* 提示信息 */}
        <Alert
          description="确定后，未完成的文件会自动转为后台任务继续上传"
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          className={styles.tipAlert}
        />

        {/* 文件夹选择区域 */}
        <div className={styles.selectSection}>
          <Title level={4}>选择文件夹</Title>
          <UploadArea
            mode="folder"
            onFolderSelect={handleFolderSelect}
            disabled={false}
          />
        </div>

        {/* 文件夹信息显示 */}
        {folderName && (
          <div className={styles.folderInfo}>
            <Title level={5}>选择的文件夹</Title>
            <Tag color="blue" className={styles.folderTag}>
              <FolderOpenOutlined /> {folderName}
            </Tag>
          </div>
        )}

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
                showPath={true} // 文件夹上传时显示相对路径
              />
            </div>
          </>
        )}
      </div>
    </BaseUploadDrawer>
  );
};

export default UploadFolderDrawer;
