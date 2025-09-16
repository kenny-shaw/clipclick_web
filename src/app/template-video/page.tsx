"use client";
import { useEffect } from "react";
import { Form, message } from "antd";
import { useVideoStore } from "@/store/videoStore";
import type { VideoItem, CreateVideoParams } from "@/api";
import FullScreenLayout from "@/components/FullScreenLayout";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import styles from "./index.module.scss";

// 扩展VideoItem类型，添加status状态
interface VideoItemWithStatus extends VideoItem {
  status: string;
}

const TemplateVideoPage = () => {
  const [form] = Form.useForm();
  const { videos, loadingTasks, isCreating, fetchVideoList, createVideo } =
    useVideoStore();

  // 组件加载时获取视频列表
  useEffect(() => {
    fetchVideoList();
  }, [fetchVideoList]);

  // 生成视频的提交处理
  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();

      const params: CreateVideoParams = {
        tile: values.tile,
        templateId: values.templateId,
        resourceUrl: values.resourceUrl,
      };

      await createVideo(params);
      form.resetFields();
    } catch (error) {
      console.error("生成视频失败:", error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("生成视频失败，请重试");
      }
    }
  };

  // 合并视频列表和loading任务，确保符合VideoItemWithStatus接口
  const allVideos: VideoItemWithStatus[] = [
    ...videos.map((video) => ({
      ...video,
      status: "done",
    })),
    ...loadingTasks.map((task) => ({
      id: Number(task.id.replace("loading_", "")),
      tile: task.tile,
      templateId: task.templateId,
      resourceUrl: task.resourceUrl,
      videoUrl: null,
      coverUrl: null,
      createTime: task.createTime,
      updateTime: null,
      status: "loading",
      industryType: null,
      taskId: null,
      remark: null,
      extendInfo: null,
      createBy: null,
      updateBy: null,
      deleted: 0,
    })),
  ];

  return (
    <FullScreenLayout>
      <div className={styles.templateVideoContainer}>
        <LeftPanel
          form={form}
          loading={isCreating}
          onGenerate={handleGenerate}
        />
        <RightPanel videos={allVideos} />
      </div>
    </FullScreenLayout>
  );
};

export default TemplateVideoPage;
