import Overview from "./pages/Overview.jsx";
import ProductSegmentation from "./pages/ProductSegmentation.jsx";
import MerchantTierAnalysis from "./pages/MerchantTierAnalysis.jsx";
import Channel from "./pages/Channel.jsx";
import PermissionManagement from "./pages/PermissionManagement.jsx";

/**
 * 各业务页面与路由路径的映射，用于在 AdminLayout 内渲染子路由。
 * 菜单展示相关的标题/图标/权限配置统一维护在 src/config/menuConfig.js。
 * 4个业务Tab + 管理员权限管理
 */
export const navItems = [
  {
    to: "/",
    page: <Overview />,
  },
  {
    to: "/product",
    page: <ProductSegmentation />,
  },
  {
    to: "/merchant",
    page: <MerchantTierAnalysis />,
  },
  {
    to: "/channel",
    page: <Channel />,
  },
  {
    to: "/permission-management",
    page: <PermissionManagement />,
  },
];
