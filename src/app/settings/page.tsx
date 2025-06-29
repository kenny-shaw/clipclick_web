"use client";
import React from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Switch,
  Space,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/ProtectedRoute";

const { Title } = Typography;

const SettingsPage = () => {
  const [form] = Form.useForm();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    console.log("设置保存:", values);
    message.success("设置已保存");
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <Title level={2}>设置</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            emailNotification: true,
            pushNotification: false,
            autoSave: true,
            theme: "light",
          }}
        >
          <Card title="账户设置" style={{ marginBottom: 24 }}>
            <Form.Item
              label="邮箱通知"
              name="emailNotification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="推送通知"
              name="pushNotification"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item label="自动保存" name="autoSave" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>

          <Card title="安全设置" style={{ marginBottom: 24 }}>
            <Form.Item label="当前密码" name="currentPassword">
              <Input.Password placeholder="请输入当前密码" />
            </Form.Item>
            <Form.Item label="新密码" name="newPassword">
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item label="确认新密码" name="confirmPassword">
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
          </Card>

          <Card title="偏好设置" style={{ marginBottom: 24 }}>
            <Form.Item label="主题" name="theme">
              <Input placeholder="选择主题" />
            </Form.Item>
            <Form.Item label="语言" name="language">
              <Input placeholder="选择语言" />
            </Form.Item>
          </Card>

          <div style={{ textAlign: "center" }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                保存设置
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </div>
        </Form>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
