"use client";
import { Form, message } from "antd";
import { useFineCutStore } from "@/store/fineCutStore";
import type { FineCutVideoItem } from "@/store/fineCutStore";
// FullScreenLayout 现在由 AppLayout 自动处理
import FineCutLeftPanel from "./components/FineCutLeftPanel";
import FineCutRightPanel from "./components/FineCutRightPanel";
import styles from "./index.module.scss";

// 扩展FineCutVideoItem类型，添加status状态
interface VideoItemWithStatus extends FineCutVideoItem {
  status: "completed" | "loading" | "error";
}

const FineCutPage = () => {
  const [form] = Form.useForm();
  const {
    generatedVideos,
    loadingTasks,
    isGenerating,
    selectedProduct,
    selectedMainVideos,
    selectedPrefixVideos,
    selectedMaskImages,
    generateVideo,
  } = useFineCutStore();

  // 生成视频的提交处理
  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedProduct) {
        message.error("请先选择商品");
        return;
      }

      if (!selectedMainVideos || selectedMainVideos.length === 0) {
        message.error("请先选择主视频");
        return;
      }

      if (!selectedMaskImages || selectedMaskImages.length === 0) {
        message.error("请先选择蒙层图片");
        return;
      }

      const params = {
        productId: selectedProduct.id,
        mainVideoIds: selectedMainVideos.map((v) => v.id),
        prefixVideoIds:
          selectedPrefixVideos.length > 0 ? [selectedPrefixVideos[0].id] : [],
        maskImageIds:
          selectedMaskImages.length > 0 ? [selectedMaskImages[0].id] : [],
        title: values.title || `精剪成片_${selectedProduct.name}`,
      };

      await generateVideo(params);
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

  // 转换视频数据格式，合并生成的视频和loading任务
  const allVideos: VideoItemWithStatus[] = [
    ...generatedVideos.map((video) => ({
      ...video,
      status: video.status,
    })),
    ...loadingTasks.map((task) => ({
      id: Number(task.id.replace("loading_", "")),
      title: task.title,
      videoUrl: "",
      coverUrl: "",
      createTime: task.createTime,
      status: "loading" as const,
      productName: task.productName,
      mainVideoNames: task.mainVideoNames,
      prefixVideoNames: task.prefixVideoNames,
      maskImageNames: task.maskImageNames,
    })),
  ];

  return (
    <div className={styles.fineCutContainer}>
      <FineCutLeftPanel
        form={form}
        loading={isGenerating}
        onGenerate={handleGenerate}
      />
      <FineCutRightPanel videos={allVideos} />
    </div>
  );
};

export default FineCutPage;
