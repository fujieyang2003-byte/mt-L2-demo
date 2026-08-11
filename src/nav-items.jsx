import Overview from "./pages/Overview.jsx";
import GoalManagement from "./pages/GoalManagement.jsx";
import IncentiveCalculation from "./pages/IncentiveCalculation.jsx";
import BusinessDiagnosis from "./pages/BusinessDiagnosis.jsx";
import PermissionManagement from "./pages/PermissionManagement.jsx";

/**
 * 各业务页面与路由路径的映射，用于在 AdminLayout 内渲染子路由。
 * 菜单展示相关的标题/图标/权限配置统一维护在 src/config/menuConfig.js。
 */
export const navItems = [
  {
    to: "/",
    page: <Overview />,
  },
  {
    to: "/goal-management",
    page: <GoalManagement />,
  },
  {
    to: "/incentive-calculation",
    page: <IncentiveCalculation />,
  },
  {
    to: "/business-diagnosis",
    page: <BusinessDiagnosis />,
  },
  {
    to: "/permission-management",
    page: <PermissionManagement />,
  },
];
