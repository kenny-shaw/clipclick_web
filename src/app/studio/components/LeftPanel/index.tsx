"use client";
import React from "react";
import { Form, Input, Button, Typography, FormInstance } from "antd";
import styles from "./index.module.scss";

const { Title } = Typography;

interface LeftPanelProps {
  form: FormInstance;
  loading: boolean;
  onGenerate: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ form, loading, onGenerate }) => (
  <div className={styles.leftPanel}>
    <div className={styles.panelCard}>
      <Title level={4} className={styles.panelTitle}>
        创作视频
      </Title>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className={styles.panelForm}
      >
        <div>
          <Form.Item
            label="商品链接"
            name="resourceUrl"
            rules={[{ required: true, message: "请输入商品链接" }]}
          >
            <Input
              size="large"
              placeholder="请输入商品链接（如抖音、淘宝、京东等）"
            />
          </Form.Item>
          <Form.Item
            label="视频主题"
            name="tile"
            rules={[{ required: true, message: "请输入视频主题" }]}
          >
            <Input size="large" placeholder="请输入视频主题" />
          </Form.Item>
          <Form.Item
            label="视频模板"
            name="templateId"
            initialValue="模版1"
            rules={[{ required: true, message: "请输入视频模板" }]}
          >
            <Input size="large" placeholder="请输入视频模板或选择预设模板" />
          </Form.Item>
        </div>
        <Form.Item>
          <Button
            type="primary"
            htmlType="button"
            className={styles.generateBtn}
            loading={loading}
            block
            size="large"
            onClick={onGenerate}
          >
            立即生成
          </Button>
        </Form.Item>
      </Form>
    </div>
  </div>
);

export default LeftPanel;
