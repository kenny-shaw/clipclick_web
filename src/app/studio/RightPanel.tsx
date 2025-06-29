"use client";
import React, { useEffect, useRef, useState } from "react";
import { Typography, Tooltip, Button, Modal, Tag, message } from "antd";
import {
  PlayCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  LinkOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import styles from "./studio.module.scss";
import { VideoItem } from "@/api/video";

const { Text } = Typography;

// 扩展VideoItem类型，添加status状态
interface VideoItemWithStatus extends VideoItem {
  status: string;
}

interface RightPanelProps {
  videos: VideoItemWithStatus[];
}

const RightPanel: React.FC<RightPanelProps> = ({ videos }) => {
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
      const fileName = `${video.tile || "video"}_${timestamp}.mp4`;
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
        <img
          src={video.coverUrl || "/next.svg"}
          alt={video.tile}
          className={styles.videoCover}
        />
        <Tooltip title="预览">
          <PlayCircleOutlined
            className={styles.playBtn}
            onClick={() => handleVideoPreview(video)}
          />
        </Tooltip>
      </div>
      <div className={styles.videoInfo}>
        <div className={styles.videoTitle}>{video.tile}</div>

        {/* 备注信息 */}
        {video.remark && (
          <div className={styles.videoMeta}>
            <Text type="secondary">
              <FileTextOutlined style={{ marginRight: 4 }} />
              备注: {video.remark}
            </Text>
          </div>
        )}

        {/* 商品链接 */}
        {video.resourceUrl && (
          <div className={styles.videoMeta}>
            <Text type="secondary">
              <LinkOutlined style={{ marginRight: 4 }} />
              商品链接:
              <a
                href={video.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: 4 }}
              >
                {video.resourceUrl.length > 30
                  ? video.resourceUrl.substring(0, 30) + "..."
                  : video.resourceUrl}
              </a>
            </Text>
          </div>
        )}

        {/* 使用模板 */}
        <div className={styles.videoMeta}>
          <Text type="secondary">
            使用模板: <Tag color="purple">{video.templateId}</Tag>
          </Text>
        </div>

        {/* 行业类型 */}
        {video.industryType && (
          <div className={styles.videoMeta}>
            <Text type="secondary">
              行业类型: <Tag color="blue">{video.industryType}</Tag>
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
          ? "正在为你生成视频，请稍候..."
          : "我已为你生成 1 个视频，你可以选择视频保存"}
      </div>
      {video.status === "loading" ? (
        <div className={styles.videoCard}>
          <div className={styles.videoPreview}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingCircle}></div>
              <div className={styles.loadingText}>视频生成中...</div>
            </div>
          </div>
          <div className={styles.videoInfo}>
            <div className={styles.videoTitle}>{video.tile}</div>
            <div className={styles.videoMeta}>
              <Text type="secondary">请耐心等待，视频生成需要一些时间</Text>
            </div>
            {/* 显示模板信息 */}
            <div className={styles.videoMeta}>
              <Text type="secondary">
                使用模板: <Tag color="purple">{video.templateId}</Tag>
              </Text>
            </div>
            {/* 显示商品链接 */}
            {video.resourceUrl && (
              <div className={styles.videoMeta}>
                <Text type="secondary">
                  <LinkOutlined style={{ marginRight: 4 }} />
                  商品链接:
                  <a
                    href={video.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: 4 }}
                  >
                    {video.resourceUrl.length > 30
                      ? video.resourceUrl.substring(0, 30) + "..."
                      : video.resourceUrl}
                  </a>
                </Text>
              </div>
            )}
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
              视频预览 - {previewVideo.tile}
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

export default RightPanel;
