import { getLayoutConfig } from "@/config/layout";
import type { LayoutConfig } from "@/config/layout";

export const useLayout = (pathname: string): LayoutConfig => {
    return getLayoutConfig(pathname);
};
