"use client";
import React, { useEffect, useState } from "react";
import { Typography, Button, Space, Card, message } from "antd";
import {
  FolderOutlined,
  CloudUploadOutlined,
  FolderOpenOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { useMaterialStore } from "@/store/materialStore";
import { FolderInfo, MaterialInfo, CreateFolderParams } from "@/api";

// 组件导入
import MaterialBreadcrumb from "./components/MaterialBreadcrumb";
import FolderTable from "./components/FolderTable";
import MaterialTable from "./components/MaterialTable";
import CreateFolderModal from "./components/CreateFolderModal";
import MaterialPreviewModal from "./components/MaterialPreviewModal";
import UploadFilesDrawer from "./components/upload/UploadFilesDrawer";
import UploadFolderDrawer from "./components/upload/UploadFolderDrawer";
import BackgroundTasksSidebar from "./components/BackgroundTasksSidebar";

import styles from "./index.module.scss";

const { Title } = Typography;

const MaterialsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  const {
    currentFolderId,
    getBreadcrumbsForFolder,
    folders,
    foldersLoading,
    foldersTotal,
    foldersCurrent,
    foldersPageSize,
    materials,
    materialsLoading,
    materialsTotal,
    materialsCurrent,
    materialsPageSize,
    isCreatingFolder,
    setCurrentFolder,
    navigateToRoot,
    fetchFolderList,
    fetchMaterialList,
    createFolder,
    // 后台任务相关
    getTasksByLocation,
    isUploading,
    toggleBackgroundTasksVisible,
  } = useMaterialStore();

  // 获取后台任务
  const backgroundTasks = getTasksByLocation("background");

  // 创建文件夹弹窗状态
  const [createFolderVisible, setCreateFolderVisible] = useState(false);

  // 素材预览弹窗状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialInfo | null>(
    null
  );

  // 上传抽屉状态
  const [uploadFilesVisible, setUploadFilesVisible] = useState(false);
  const [uploadFolderVisible, setUploadFolderVisible] = useState(false);

  // 根据URL参数设置当前文件夹
  useEffect(() => {
    const folderIdNum = folderId ? parseInt(folderId, 10) : null;

    if (folderIdNum !== currentFolderId) {
      if (folderIdNum) {
        setCurrentFolder(folderIdNum);
      } else {
        navigateToRoot();
      }
    }
  }, [folderId, currentFolderId, folders, setCurrentFolder, navigateToRoot]);

  // 加载文件夹列表（仅在根目录）
  useEffect(() => {
    if (currentFolderId === null) {
      fetchFolderList();
    }
  }, [currentFolderId, fetchFolderList]);

  // 加载素材列表（仅在文件夹内）
  useEffect(() => {
    if (currentFolderId !== null) {
      fetchMaterialList({ folderId: currentFolderId });
    }
  }, [currentFolderId, fetchMaterialList]);

  // 面包屑点击处理
  const handleBreadcrumbClick = (id: number) => {
    if (id === 0) {
      // 点击根目录
      router.push("/assets/materials");
    } else {
      // 点击其他文件夹
      router.push(`/assets/materials?folderId=${id}`);
    }
  };

  // 文件夹单击处理
  const handleFolderClick = (folder: FolderInfo) => {
    // 更新面包屑导航
    setCurrentFolder(folder.id);
    // 跳转到文件夹页面
    router.push(`/assets/materials?folderId=${folder.id}`);
  };

  // 创建文件夹相关处理
  const handleCreateFolder = () => {
    setCreateFolderVisible(true);
  };

  const handleCreateFolderSubmit = async (params: CreateFolderParams) => {
    try {
      await createFolder(params);
      setCreateFolderVisible(false);
      message.success("文件夹创建成功！");
    } catch (error) {
      console.error("创建文件夹失败:", error);
      if (error instanceof Error) {
        message.error(error.message);
      }
      throw error; // 重新抛出错误，让Modal组件处理
    }
  };

  const handleCreateFolderCancel = () => {
    setCreateFolderVisible(false);
  };

  // 上传素材处理
  const handleUploadMaterial = () => {
    setUploadFilesVisible(true);
  };

  // 上传文件夹处理
  const handleUploadFolder = () => {
    setUploadFolderVisible(true);
  };

  // 素材点击处理（用于预览）
  const handleMaterialClick = (material: MaterialInfo) => {
    setPreviewMaterial(material);
    setPreviewVisible(true);
  };

  // 关闭预览弹窗
  const handlePreviewClose = () => {
    setPreviewVisible(false);
    setPreviewMaterial(null);
  };

  // 上传抽屉处理
  const handleUploadFilesClose = () => {
    setUploadFilesVisible(false);
  };

  const handleUploadFolderClose = () => {
    setUploadFolderVisible(false);
  };

  const handleUploadSuccess = () => {
    // 刷新当前页面的数据
    if (currentFolderId === null) {
      fetchFolderList();
    } else {
      fetchMaterialList({ folderId: currentFolderId });
    }
  };

  const handleUploadFolderSuccess = () => {
    // 文件夹上传成功后刷新文件夹列表
    fetchFolderList();
  };

  // 文件夹分页处理
  const handleFolderPageChange = (pageNum: number, pageSize: number) => {
    fetchFolderList({ pageNum, pageSize });
  };

  // 素材分页处理
  const handleMaterialPageChange = (pageNum: number, pageSize: number) => {
    fetchMaterialList({
      pageNum,
      pageSize,
      folderId: currentFolderId || undefined,
    });
  };

  // 判断是否在根目录
  const isRoot = currentFolderId === null;

  return (
    <div className={styles.materialsPage}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <Title level={2} className={styles.pageTitle}>
            {isRoot ? "素材库" : "文件夹"}
          </Title>
          <p className={styles.pageDescription}>
            {isRoot
              ? "管理您的创作素材，包括图片、视频、音频等"
              : "文件夹内的素材内容"}
          </p>
        </div>

        <Space>
          {/* 后台任务按钮 - 只在有后台任务时显示 */}
          {backgroundTasks.length > 0 && (
            <Button
              type="primary"
              icon={<BellOutlined />}
              onClick={toggleBackgroundTasksVisible}
              style={{
                position: "relative",
                ...(isUploading() ? { animation: "pulse 1.5s infinite" } : {}),
              }}
            >
              后台任务
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: "#ff4d4f",
                  color: "white",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 18,
                }}
              >
                {backgroundTasks.length > 99 ? "99+" : backgroundTasks.length}
              </span>
            </Button>
          )}
          {/* 根目录显示创建文件夹和上传文件夹按钮 */}
          {isRoot && (
            <>
              <Button icon={<FolderOutlined />} onClick={handleCreateFolder}>
                创建文件夹
              </Button>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={handleUploadFolder}
              >
                上传文件夹
              </Button>
            </>
          )}

          {/* 文件夹内显示上传素材和上传文件夹按钮 */}
          {!isRoot && (
            <>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={handleUploadMaterial}
              >
                上传素材
              </Button>
              <Button
                icon={<FolderOpenOutlined />}
                onClick={handleUploadFolder}
              >
                上传文件夹
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* 面包屑导航 */}
      <MaterialBreadcrumb
        currentFolderId={currentFolderId}
        onBreadcrumbClick={handleBreadcrumbClick}
        getBreadcrumbsForFolder={getBreadcrumbsForFolder}
      />

      {/* 内容区域 */}
      <Card className={styles.contentCard}>
        {isRoot ? (
          <FolderTable
            folders={folders}
            loading={foldersLoading}
            current={foldersCurrent}
            pageSize={foldersPageSize}
            total={foldersTotal}
            onFolderClick={handleFolderClick}
            onCreateFolder={handleCreateFolder}
            onPageChange={handleFolderPageChange}
          />
        ) : (
          <MaterialTable
            materials={materials}
            loading={materialsLoading}
            current={materialsCurrent}
            pageSize={materialsPageSize}
            total={materialsTotal}
            onUploadMaterial={handleUploadMaterial}
            onMaterialClick={handleMaterialClick}
            onPageChange={handleMaterialPageChange}
          />
        )}
      </Card>

      {/* 创建文件夹弹窗 */}
      <CreateFolderModal
        visible={createFolderVisible}
        loading={isCreatingFolder}
        onSubmit={handleCreateFolderSubmit}
        onCancel={handleCreateFolderCancel}
      />

      {/* 素材预览弹窗 */}
      <MaterialPreviewModal
        visible={previewVisible}
        material={previewMaterial}
        onClose={handlePreviewClose}
      />

      {/* 上传文件抽屉 */}
      <UploadFilesDrawer
        visible={uploadFilesVisible}
        currentFolderId={currentFolderId}
        onClose={handleUploadFilesClose}
        onSuccess={handleUploadSuccess}
      />

      {/* 上传文件夹抽屉 */}
      <UploadFolderDrawer
        visible={uploadFolderVisible}
        onClose={handleUploadFolderClose}
        onSuccess={handleUploadFolderSuccess}
      />

      {/* 后台任务侧边栏 */}
      <BackgroundTasksSidebar />
    </div>
  );
};

export default MaterialsPage;
