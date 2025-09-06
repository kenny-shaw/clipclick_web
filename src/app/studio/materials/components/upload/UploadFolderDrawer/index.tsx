import React, { useState, useRef } from "react";
import { Button, Typography, Divider, message, Modal } from "antd";
import { FolderOpenOutlined, InboxOutlined } from "@ant-design/icons";
import { useMaterialStore } from "@/store/materialStore";
import type { UploadFileInfo } from "@/store/materialStore";
import BaseUploadDrawer from "../common/BaseUploadDrawer";
import FileList from "../common/FileList";
import ProgressBar from "../common/ProgressBar";
import UploadActions from "../common/UploadActions";
import styles from "./index.module.scss";

const { Title, Text } = Typography;

interface UploadFolderDrawerProps {
  visible: boolean;
  currentFolderId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadFolderDrawer: React.FC<UploadFolderDrawerProps> = ({
  visible,
  currentFolderId,
  onClose,
  onSuccess,
}) => {
  const {
    isUploading,
    uploadFilesToTOS,
    createFolderStructure,
    batchCreateMaterialsWithFolders,
    startBackgroundUpload,
  } = useMaterialStore();

  // 文件列表（本地状态）
  const [fileList, setFileList] = useState<UploadFileInfo[]>([]);

  // 文件夹结构信息
  const [folderStructure, setFolderStructure] = useState<{
    rootFolderName: string;
    fileCount: number;
    folderPaths: string[]; // 所有需要创建的文件夹路径
    maxDepth: number; // 最大层级深度
  } | null>(null);

  // 文件输入引用
  const folderInputRef = useRef<HTMLInputElement>(null);

  // 生成文件ID
  const generateFileId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 生成TOS路径（文件夹上传）
  const generateTOSPath = (relativePath: string, folderTosPath: string) => {
    return `${folderTosPath}/${relativePath}`;
  };

  // 检查是否所有文件都上传完成
  const checkAllCompleted = () => {
    return fileList.every(
      (file) => file.tosStatus === "completed" || file.tosStatus === "error"
    );
  };

  const allTOSCompleted = checkAllCompleted();

  // 解析文件夹结构
  const parseFileStructure = (files: FileList) => {
    const folderTosPath = `folders/${Date.now()}`;
    const newFileList: UploadFileInfo[] = [];
    const folderPathsSet = new Set<string>();

    // 获取根文件夹名称
    const firstFile = files[0];
    const firstRelativePath = (
      firstFile as File & { webkitRelativePath?: string }
    ).webkitRelativePath;
    const rootFolderName = firstRelativePath
      ? firstRelativePath.split("/")[0]
      : "Unknown";

    let maxDepth = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileRelativePath =
        (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
        file.name;

      // 提取文件夹路径（去掉文件名）
      const pathParts = fileRelativePath.split("/");
      const depth = pathParts.length;
      maxDepth = Math.max(maxDepth, depth);

      // 收集所有需要创建的文件夹路径
      if (pathParts.length > 1) {
        // 生成所有中间路径
        for (let j = 1; j < pathParts.length; j++) {
          const folderPath = pathParts.slice(0, j).join("/");
          folderPathsSet.add(folderPath);
        }
      }

      const fileInfo: UploadFileInfo = {
        id: generateFileId(),
        file,
        relativePath: fileRelativePath,
        targetFolderId: currentFolderId || undefined,
        tosPath: generateTOSPath(fileRelativePath, folderTosPath),
        tosStatus: "pending",
        tosProgress: 0,
        materialStatus: "pending",
      };
      newFileList.push(fileInfo);
    }

    const folderPaths = Array.from(folderPathsSet).sort();

    return {
      fileList: newFileList,
      folderInfo: {
        rootFolderName,
        fileCount: files.length,
        folderPaths,
        maxDepth,
      },
    };
  };

  // 处理文件夹选择
  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const { fileList: newFileList, folderInfo } = parseFileStructure(files);

    setFileList(newFileList);
    setFolderStructure(folderInfo);

    // 清空input值
    event.target.value = "";
  };

  // 开始上传
  const handleStartUpload = async () => {
    if (fileList.length === 0) {
      message.warning("请先选择要上传的文件夹");
      return;
    }

    try {
      await uploadFilesToTOS(fileList);
    } catch (error) {
      console.error("上传失败:", error);
      message.error("上传失败，请重试");
    }
  };

  // 确定按钮点击
  const handleConfirm = async () => {
    if (!allTOSCompleted) {
      message.warning("还有文件正在上传中，请等待完成");
      return;
    }

    if (!folderStructure) {
      message.error("文件夹信息缺失");
      return;
    }

    try {
      // 1. 递归创建文件夹结构
      message.loading("正在创建文件夹结构...", 0);
      const folderIdMap = await createFolderStructure(
        folderStructure.folderPaths,
        currentFolderId
      );

      message.destroy(); // 清除loading消息

      console.log("文件夹创建完成，ID映射:", folderIdMap);

      // 2. 批量创建素材，关联到对应的文件夹
      message.loading("正在创建素材...", 0);
      await batchCreateMaterialsWithFolders(fileList, folderIdMap);
      message.destroy();

      message.success(
        `文件夹结构创建完成！共创建了 ${folderStructure.folderPaths.length} 个文件夹和 ${fileList.length} 个素材`
      );
      onSuccess();
      handleClose();
    } catch (error) {
      message.destroy(); // 清除可能的loading消息
      console.error("创建失败:", error);
      const errorMessage = error instanceof Error ? error.message : "创建失败";
      message.error(errorMessage);
    }
  };

  // 关闭抽屉
  const handleClose = () => {
    const uploadingFiles = fileList.filter((f) => f.tosStatus === "uploading");
    const pendingFiles = fileList.filter((f) => f.tosStatus === "pending");
    const completedFiles = fileList.filter(
      (f) => f.tosStatus === "completed" && f.materialStatus === "pending"
    );

    // 如果有文件正在上传或等待上传，需要确认
    if (uploadingFiles.length > 0 || pendingFiles.length > 0) {
      Modal.confirm({
        title: "确认关闭？",
        content: `还有 ${
          uploadingFiles.length + pendingFiles.length
        } 个文件未完成上传，关闭后将先创建文件夹结构，然后这些文件转为后台上传。`,
        okText: "转为后台上传",
        cancelText: "继续等待",
        onOk: async () => {
          try {
            // 1. 先创建文件夹结构
            let folderIdMap: Map<string, number> | undefined;
            if (folderStructure && folderStructure.folderPaths.length > 0) {
              message.loading("正在创建文件夹结构...", 0);
              folderIdMap = await createFolderStructure(
                folderStructure.folderPaths,
                currentFolderId
              );
              message.destroy();
            }

            // 2. 处理已完成上传但未创建素材的文件
            if (completedFiles.length > 0) {
              if (folderIdMap) {
                await batchCreateMaterialsWithFolders(
                  completedFiles,
                  folderIdMap
                );
              } else {
                // 如果没有文件夹结构，使用普通的批量创建
                const { batchCreateMaterials } = useMaterialStore.getState();
                await batchCreateMaterials(completedFiles);
              }
            }

            // 3. 将未完成的文件转为后台任务
            const backgroundTasks = [...uploadingFiles, ...pendingFiles];
            if (backgroundTasks.length > 0) {
              startBackgroundUpload(backgroundTasks, folderIdMap);
              message.info(
                `文件夹结构已创建，${backgroundTasks.length} 个文件已转为后台上传`
              );
            }

            onSuccess(); // 刷新页面数据
            doClose();
          } catch (error) {
            message.destroy();
            console.error("处理关闭失败:", error);
            message.error("处理失败，请重试");
          }
        },
      });
    } else {
      doClose();
    }
  };

  const doClose = () => {
    setFileList([]);
    setFolderStructure(null);
    onClose();
  };

  // 移除文件
  const handleRemoveFile = (fileId: string) => {
    setFileList((prev) => prev.filter((file) => file.id !== fileId));
  };

  // 选择文件夹按钮点击
  const handleSelectFolder = () => {
    folderInputRef.current?.click();
  };

  const completedCount = fileList.filter(
    (f) => f.tosStatus === "completed"
  ).length;
  const totalCount = fileList.length;

  return (
    <BaseUploadDrawer
      title="上传文件夹"
      visible={visible}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmText={`确定 (${completedCount}/${totalCount})`}
      confirmDisabled={!allTOSCompleted || fileList.length === 0}
      confirmLoading={isUploading}
    >
      <div className={styles.uploadFolderDrawer}>
        {/* 文件夹选择区域 */}
        <div className={styles.selectSection}>
          <Title level={4}>选择文件夹</Title>
          <Button
            size="large"
            icon={<FolderOpenOutlined />}
            onClick={handleSelectFolder}
            disabled={isUploading}
            block
          >
            选择文件夹
          </Button>
          <Text type="secondary" className={styles.hint}>
            将保持原有文件夹结构，并创建到
            {currentFolderId ? "当前文件夹" : "根目录"}下
          </Text>

          {/* 隐藏的文件输入 */}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error - webkitdirectory 是非标准属性
            webkitdirectory=""
            style={{ display: "none" }}
            onChange={handleFolderSelect}
          />
        </div>

        {/* 文件夹信息 */}
        {folderStructure && (
          <div className={styles.folderInfo}>
            <div className={styles.folderInfoHeader}>
              <Text strong>文件夹：{folderStructure.rootFolderName}</Text>
              <Text type="secondary">
                {" "}
                ({folderStructure.fileCount} 个文件)
              </Text>
            </div>
            <div className={styles.folderInfoDetails}>
              <Text type="secondary" className={styles.folderDetail}>
                📁 {folderStructure.folderPaths.length} 个子文件夹
              </Text>
              <Text type="secondary" className={styles.folderDetail}>
                📊 最大层级深度：{folderStructure.maxDepth}
              </Text>
            </div>
            {/* 显示文件夹结构预览（仅显示前几个） */}
            {folderStructure.folderPaths.length > 0 && (
              <div className={styles.folderPreview}>
                <Text type="secondary" className={styles.previewTitle}>
                  文件夹结构预览：
                </Text>
                {folderStructure.folderPaths.slice(0, 3).map((path) => (
                  <Text
                    key={path}
                    type="secondary"
                    className={styles.previewPath}
                  >
                    📁 {path}
                  </Text>
                ))}
                {folderStructure.folderPaths.length > 3 && (
                  <Text type="secondary" className={styles.previewMore}>
                    ... 还有 {folderStructure.folderPaths.length - 3} 个文件夹
                  </Text>
                )}
              </div>
            )}
          </div>
        )}

        {/* 文件列表区域 */}
        {fileList.length > 0 ? (
          <>
            <Divider />
            <div className={styles.fileListSection}>
              <Title level={5}>文件夹内容 ({fileList.length})</Title>

              {/* 进度条 */}
              <ProgressBar fileList={fileList} isUploading={isUploading} />

              {/* 上传操作按钮 */}
              <UploadActions
                isUploading={isUploading}
                hasFiles={fileList.length > 0}
                onStartUpload={handleStartUpload}
                uploadButtonText="开始上传文件夹"
              />

              {/* 文件列表 */}
              <FileList
                fileList={fileList}
                onRemoveFile={handleRemoveFile}
                disabled={isUploading}
                showPath={true} // 显示文件路径
              />
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <InboxOutlined className={styles.emptyIcon} />
            <Text type="secondary">请选择要上传的文件夹</Text>
          </div>
        )}
      </div>
    </BaseUploadDrawer>
  );
};

export default UploadFolderDrawer;
