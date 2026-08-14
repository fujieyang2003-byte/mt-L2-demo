import {
  LayoutDashboard,
  PieChart,
  Store,
  Network,
  ShieldCheck,
} from "lucide-react";

/**
 * 系统菜单与路由的统一配置。
 * 4个业务Tab + 管理员权限管理
 * requireAdmin: true 表示仅管理员角色可见该菜单项。
 */
export const menuConfig = [
  {
    key: "overview",
    title: "首页总览",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    key: "product",
    title: "产品",
    path: "/product",
    icon: PieChart,
  },
  {
    key: "merchant",
    title: "商家",
    path: "/merchant",
    icon: Store,
  },
  {
    key: "channel",
    title: "渠道",
    path: "/channel",
    icon: Network,
  },
  {
    key: "permission-management",
    title: "权限管理",
    path: "/permission-management",
    icon: ShieldCheck,
    requireAdmin: true,
  },
];
