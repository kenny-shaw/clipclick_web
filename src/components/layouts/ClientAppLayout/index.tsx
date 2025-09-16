"use client";
import { usePathname } from "next/navigation";
import AppLayout from "../AppLayout";

interface ClientAppLayoutProps {
  children: React.ReactNode;
}

const ClientAppLayout: React.FC<ClientAppLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return <AppLayout pathname={pathname}>{children}</AppLayout>;
};

export default ClientAppLayout;
