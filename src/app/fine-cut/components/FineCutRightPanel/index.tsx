"use client";
import React, { useEffect, useRef, useState } from "react";
import { Typography, Tooltip, Button, Modal, message } from "antd";
import {
  PlayCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  VideoCameraOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import styles from "./index.module.scss";
import type { FineCutVideoItem } from "@/store/fineCutStore";

const { Text } = Typography;

// 扩展FineCutVideoItem类型，添加status状态
interface VideoItemWithStatus extends FineCutVideoItem {
  status: "completed" | "loading" | "error";
}

interface FineCutRightPanelProps {
  videos: VideoItemWithStatus[];
}

const FineCutRightPanel: React.FC<FineCutRightPanelProps> = ({ videos }) => {
  const chatContentRef = useRef<HTMLDivElement>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<VideoItemWithStatus | null>(
    null
  );
  const [downloading, setDownloading] = useState<number | null>(null);

  // 自动滚动到最下方
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [videos]);

  // 处理modal打开时的页面滚动
  useEffect(() => {
    if (previewVisible) {
      // 防止页面滚动
      document.body.style.overflow = "hidden";
    } else {
      // 恢复页面滚动
      document.body.style.overflow = "unset";
    }

    // 清理函数
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [previewVisible]);

  // 处理视频预览
  const handleVideoPreview = (video: VideoItemWithStatus) => {
    setPreviewVideo(video);
    setPreviewVisible(true);
  };

  // 关闭预览
  const handlePreviewClose = () => {
    setPreviewVisible(false);
    setPreviewVideo(null);
  };

  // 下载视频功能
  const handleDownload = async (video: VideoItemWithStatus) => {
    // 检查视频状态
    if (video.status === "loading") {
      message.warning("视频正在生成中，请稍后再试");
      return;
    }

    if (!video.videoUrl) {
      message.error("视频链接不存在，无法下载");
      return;
    }

    try {
      setDownloading(video.id);

      // 创建一个临时的a标签来下载文件
      const link = document.createElement("a");
      link.href = video.videoUrl;

      // 生成更好的文件名：视频标题 + 时间戳
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const fileName = `${video.title || "video"}_${timestamp}.mp4`;
      link.download = fileName;
      link.target = "_blank";

      // 添加到DOM中并触发点击
      document.body.appendChild(link);
      link.click();

      // 清理DOM
      document.body.removeChild(link);

      message.success(`开始下载视频: ${fileName}`);
    } catch (error) {
      console.error("下载失败:", error);
      message.error("下载失败，请重试");
    } finally {
      setDownloading(null);
    }
  };

  const VideoCard: React.FC<{ video: VideoItemWithStatus }> = ({ video }) => (
    <div className={styles.videoCard}>
      <div className={styles.videoPreview}>
        <Image
          src={video.coverUrl || "/next.svg"}
          alt={video.title}
          className={styles.videoCover}
          fill
          sizes="120px"
          style={{ objectFit: "cover" }}
        />
        <Tooltip title="预览">
          <PlayCircleOutlined
            className={styles.playBtn}
            onClick={() => handleVideoPreview(video)}
          />
        </Tooltip>
      </div>
      <div className={styles.videoInfo}>
        <div className={styles.videoTitle}>{video.title}</div>

        {/* 商品信息 */}
        <div className={styles.videoMeta}>
          <Text type="secondary">
            <ShoppingOutlined style={{ marginRight: 4 }} />
            商品: {video.productName}
          </Text>
        </div>

        {/* 主视频信息 */}
        <div className={styles.videoMeta}>
          <Text type="secondary">
            <VideoCameraOutlined style={{ marginRight: 4 }} />
            主视频: {video.title}
          </Text>
        </div>

        {/* 前贴视频信息 */}
        {video.prefixVideoNames && video.prefixVideoNames.length > 0 && (
          <div className={styles.videoMeta}>
            <Text type="secondary">
              <VideoCameraOutlined style={{ marginRight: 4 }} />
              前贴视频: {video.prefixVideoNames.join(", ")}
            </Text>
          </div>
        )}

        {/* 蒙层图片信息 */}
        {video.maskImageNames && video.maskImageNames.length > 0 && (
          <div className={styles.videoMeta}>
            <Text type="secondary">
              <PictureOutlined style={{ marginRight: 4 }} />
              蒙层图片: {video.maskImageNames.join(", ")}
            </Text>
          </div>
        )}

        {/* 创建时间 */}
        <div className={styles.videoMeta}>
          <Text type="secondary">
            创建时间: {new Date(video.createTime).toLocaleString()}
          </Text>
        </div>
      </div>
    </div>
  );

  const VideoTask: React.FC<{ video: VideoItemWithStatus }> = ({ video }) => (
    <div className={styles.chatRecord}>
      <div className={styles.recordDesc}>
        {video.status === "loading"
          ? "正在为你生成精剪成片，请稍候..."
          : "我已为你生成 1 个精剪成片，你可以选择视频保存"}
      </div>
      {video.status === "loading" ? (
        <div className={styles.videoCard}>
          <div className={styles.videoPreview}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingCircle}></div>
              <div className={styles.loadingText}>精剪成片生成中...</div>
            </div>
          </div>
          <div className={styles.videoInfo}>
            <div className={styles.videoTitle}>{video.title}</div>
            <div className={styles.videoMeta}>
              <Text type="secondary">请耐心等待，精剪成片生成需要一些时间</Text>
            </div>
            {/* 显示商品信息 */}
            <div className={styles.videoMeta}>
              <Text type="secondary">
                <ShoppingOutlined style={{ marginRight: 4 }} />
                商品: {video.productName}
              </Text>
            </div>
            {/* 显示主视频信息 */}
            <div className={styles.videoMeta}>
              <Text type="secondary">
                <VideoCameraOutlined style={{ marginRight: 4 }} />
                主视频: {video.title}
              </Text>
            </div>
          </div>
        </div>
      ) : (
        <VideoCard video={video} />
      )}
      <div className={styles.recordActions}>
        <Tooltip
          title={video.status === "loading" ? "视频生成中，无法下载" : "下载"}
        >
          <Button
            shape="circle"
            icon={<DownloadOutlined />}
            className={styles.actionBtn}
            onClick={() => handleDownload(video)}
            loading={downloading === video.id}
            disabled={video.status === "loading"}
          />
        </Tooltip>
        <Tooltip title="再次生成">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            className={styles.actionBtn}
          />
        </Tooltip>
        {/* 可加删除等按钮 */}
      </div>
    </div>
  );

  return (
    <div className={styles.rightPanel}>
      <div className={styles.chatBox}>
        <div className={styles.chatContent} ref={chatContentRef}>
          {videos.map((video) => (
            <VideoTask key={video.id} video={video} />
          ))}
        </div>
      </div>
      {previewVisible && previewVideo && (
        <Modal
          open={previewVisible}
          onCancel={handlePreviewClose}
          footer={null}
          width={800}
          style={{
            top: "5vh",
          }}
          title={
            <div
              style={{
                background:
                  "linear-gradient(135deg, #673ab7 0%, #9c27b0 50%, #e91e63 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "1.2rem",
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              精剪成片预览 - {previewVideo.title}
            </div>
          }
          styles={{
            body: {
              padding: "0",
              maxHeight: "80vh",
              overflow: "hidden",
            },
            content: {
              borderRadius: "20px",
              overflow: "hidden",
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              position: "relative",
              maxHeight: "90vh",
            },
            mask: {
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            },
            header: {
              borderBottom: "1px solid rgba(103, 58, 183, 0.1)",
              background: "transparent",
            },
          }}
        >
          <div className={styles.videoPreviewModal}>
            <video
              src={previewVideo.videoUrl || ""}
              controls
              className={styles.videoPreviewModalVideo}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                width: "auto",
                height: "auto",
              }}
            ></video>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FineCutRightPanel;
