import {
  LayoutDashboard,
  Target,
  Calculator,
  Activity,
  ShieldCheck,
} from "lucide-react";

/**
 * 系统菜单与路由的统一配置。
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
    key: "goal-management",
    title: "目标管理",
    path: "/goal-management",
    icon: Target,
  },
  {
    key: "incentive-calculation",
    title: "激励测算",
    path: "/incentive-calculation",
    icon: Calculator,
  },
  {
    key: "business-diagnosis",
    title: "经营诊断",
    path: "/business-diagnosis",
    icon: Activity,
  },
  {
    key: "permission-management",
    title: "权限管理",
    path: "/permission-management",
    icon: ShieldCheck,
    requireAdmin: true,
  },
];
