"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [form] = Form.useForm<LoginForm>();

  // 获取重定向URL
  const redirectUrl = searchParams.get("redirect");

  React.useEffect(() => {
    if (isAuthenticated) {
      // 如果有重定向URL，跳转到原始页面，否则跳转到首页
      if (redirectUrl) {
        const decodedUrl = decodeURIComponent(redirectUrl);
        router.replace(decodedUrl);
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, router, redirectUrl]);

  const onFinish = async (values: LoginForm) => {
    try {
      await login(values.username, values.password);
      message.success("登录成功");
      // 登录成功后，useEffect会处理重定向
    } catch (e: unknown) {
      if (e instanceof Error) {
        message.error(e.message);
      } else {
        message.error("登录失败");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #f3e6f5 100%)",
      }}
    >
      <Card
        style={{
          width: 360,
          boxShadow: "0 4px 24px #a4508b22",
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Image
            src="/next.svg"
            alt="logo"
            width={40}
            height={40}
            style={{ marginBottom: 8 }}
          />
          <Typography.Title level={3} style={{ margin: 0, color: "#a4508b" }}>
            ClipClick AI 登录
          </Typography.Title>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input size="large" placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password size="large" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              size="large"
              style={{
                background: "linear-gradient(90deg, #a4508b 0%, #ff61d2 100%)",
                border: "none",
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          没有账号？ <a onClick={() => router.push("/register")}>注册</a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
