"use client";
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

const RegisterPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [form] = Form.useForm<RegisterForm>();

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onFinish = async (values: RegisterForm) => {
    try {
      // TODO: 实现注册功能
      message.error("注册功能暂未实现");
      // await register(values.username, values.email, values.password);
      // message.success("注册成功");
      // 注册成功后，useEffect会处理重定向
    } catch (e: unknown) {
      if (e instanceof Error) {
        message.error(e.message);
      } else {
        message.error("注册失败");
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
            ClipClick AI 注册
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
            name="email"
            label="邮箱"
            rules={[{ required: true, message: "请输入邮箱" }]}
          >
            <Input size="large" placeholder="请输入邮箱" />
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
              注册
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          已有账号？{" "}
          <a
            onClick={() => {
              // 传递重定向参数到登录页面
              const loginUrl = redirectUrl
                ? `/login?redirect=${redirectUrl}`
                : "/login";
              router.push(loginUrl);
            }}
          >
            登录
          </a>
        </div>
      </Card>
    </div>
  );
};

const RegisterPage = () => (
  <Suspense fallback={null}>
    <RegisterPageInner />
  </Suspense>
);

export default RegisterPage;
