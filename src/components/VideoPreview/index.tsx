import React, { useEffect, useRef, useState, useCallback } from "react";
import { Typography, Spin } from "antd";
import { MaterialInfo } from "@/api";
import { isVideoFile, isAudioFile } from "@/utils/materialUtils";
import Player from "xgplayer";
import styles from "./index.module.scss";

const { Text } = Typography;

export interface VideoPreviewProps {
  /** 素材信息 */
  material: MaterialInfo;
  /** 预览模式 */
  mode?: "video" | "audio" | "auto";
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  material,
  mode = "auto",
  className,
  style,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 判断预览模式
  const getPreviewMode = () => {
    if (mode !== "auto") return mode;
    if (isVideoFile(material.url)) return "video";
    if (isAudioFile(material.url)) return "audio";
    return "video"; // 默认视频模式
  };

  const previewMode = getPreviewMode();

  // 初始化播放器
  const initPlayer = useCallback(() => {
    if (!material || !playerRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // 销毁之前的播放器实例
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }

      // 确保DOM元素存在并设置ID
      const playerElement = playerRef.current;
      if (!playerElement.id) {
        playerElement.id = `player-${Date.now()}`;
      }

      // 按照官方文档最简单的配置
      const config = {
        id: playerElement.id,
        url: material.url,
        height: "100%",
        width: "100%",
        autoplay: false,
        lang: "zh-cn",
      };

      playerInstanceRef.current = new Player(config);

      // 播放器事件监听
      playerInstanceRef.current.on("ready", () => {
        setLoading(false);
      });

      playerInstanceRef.current.on("error", (err: any) => {
        console.error("播放器错误:", err);
        setError("播放失败，请检查文件格式或网络连接");
        setLoading(false);
      });
    } catch (err) {
      console.error("初始化播放器失败:", err);
      setError("播放器初始化失败");
      setLoading(false);
    }
  }, [material]);

  // 销毁播放器
  const destroyPlayer = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.destroy();
      playerInstanceRef.current = null;
    }
  };

  // 监听material变化
  useEffect(() => {
    if (material) {
      initPlayer();
      return () => {
        destroyPlayer();
      };
    }

    return () => {
      destroyPlayer();
    };
  }, [material, initPlayer]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, []);

  return (
    <div
      className={`${styles.videoPreviewContainer} ${className || ""}`}
      style={style}
    >
      {loading && (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text type="secondary">加载中...</Text>
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <Text type="danger">{error}</Text>
        </div>
      )}

      <div
        ref={playerRef}
        id={`player-container-${material.id}`}
        className={`${styles.playerContainer} ${
          previewMode === "audio" ? styles.audioContainer : ""
        }`}
      />
    </div>
  );
};

export default VideoPreview;
