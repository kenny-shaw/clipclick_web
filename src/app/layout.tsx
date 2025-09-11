import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import HeaderBar from "@/components/HeaderBar";
import AuthProvider from "@/components/AuthProvider";
import "@ant-design/v5-patch-for-react-19";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipClick AI - AI驱动的商品视频广告制作平台",
  description:
    "让AI为您创造引人入胜的商品视频广告，提升品牌影响力，驱动销售增长。智能视频生成，快速制作，精准定位，数据驱动。",
  keywords: "AI视频制作,商品广告,视频生成,人工智能,营销视频,广告制作",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>
          <AuthProvider>
            <HeaderBar />
            {children}
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
