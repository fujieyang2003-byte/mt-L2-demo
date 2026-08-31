import {
  LayoutDashboard,
  Flame,
  UtensilsCrossed,
  Zap,
  Pill,
  ShieldCheck,
} from "lucide-react";

/**
 * 系统菜单与路由的统一配置。
 * 一级按业务线拆分：首页总览、外卖、到餐、闪购、医药 + 权限管理
 * 支持三级嵌套：业务线 → 模块（产品/商家/渠道）→ 具体页面
 */
export const menuConfig = [
  {
    key: "overview",
    title: "首页总览",
    path: "/",
    icon: LayoutDashboard,
    children: [
      { title: "核心业绩", path: "/" },
      { title: "区域业绩", path: "/overview/region" },
      { title: "合作商业绩", path: "/overview/city" },
      { title: "人员业绩", path: "/overview/staff" },
    ],
  },
  {
    key: "waimai",
    title: "外卖",
    path: "/waimai/overview",
    icon: Flame,
    children: [
      { title: "经营总览", path: "/waimai/overview" },
      {
        title: "产品",
        children: [
          { title: "产品总览", path: "/waimai/product/overview" },
          { title: "产品分区域", path: "/waimai/product/region" },
          { title: "产品分客群", path: "/waimai/product/segment" },
          { title: "单产品明细", path: "/waimai/product/detail" },
        ],
      },
      {
        title: "商家",
        children: [
          { title: "商家总览", path: "/waimai/merchant/overview" },
          { title: "分客群", path: "/waimai/merchant/segment" },
          { title: "商家变化", path: "/waimai/merchant/change" },
          { title: "品类", path: "/waimai/merchant/category" },
        ],
      },
      {
        title: "渠道",
        children: [
          { title: "区域明细", path: "/waimai/channel/region" },
          { title: "总商明细", path: "/waimai/channel/partner" },
          { title: "城市明细", path: "/waimai/channel/city" },
          { title: "BD/运营明细", path: "/waimai/channel/bd" },
          { title: "合作商年框", path: "/waimai/channel/annual" },
          { title: "区域广告代理商", path: "/waimai/channel/agent" },
        ],
      },
    ],
  },
  {
    key: "daocan",
    title: "到餐",
    path: "/daocan/overview",
    icon: UtensilsCrossed,
    children: [
      { title: "经营总览", path: "/daocan/overview" },
      {
        title: "产品",
        children: [
          { title: "产品总览", path: "/daocan/product/overview" },
          { title: "产品分区域", path: "/daocan/product/region" },
          { title: "产品分客群", path: "/daocan/product/segment" },
          { title: "单产品明细", path: "/daocan/product/detail" },
        ],
      },
      {
        title: "商家",
        children: [
          { title: "商家总览", path: "/daocan/merchant/overview" },
          { title: "商家分客群", path: "/daocan/merchant/segment" },
          { title: "商家变化", path: "/daocan/merchant/change" },
        ],
      },
      {
        title: "渠道",
        children: [
          { title: "区域明细", path: "/daocan/channel/region" },
          { title: "总商明细", path: "/daocan/channel/partner" },
          { title: "城市明细", path: "/daocan/channel/city" },
          { title: "BD/运营明细", path: "/daocan/channel/bd" },
          { title: "合作商年框", path: "/daocan/channel/annual" },
          { title: "区域广告代理商", path: "/daocan/channel/agent" },
        ],
      },
    ],
  },
  {
    key: "shangou",
    title: "闪购",
    path: "/shangou/overview",
    icon: Zap,
    children: [
      { title: "经营总览", path: "/shangou/overview" },
      { title: "品类", path: "/shangou/category" },
      { title: "商家", path: "/shangou/merchant" },
      { title: "区域", path: "/shangou/region" },
    ],
  },
  {
    key: "yiyao",
    title: "医药",
    path: "/yiyao/overview",
    icon: Pill,
    children: [
      { title: "经营总览", path: "/yiyao/overview" },
      { title: "品类", path: "/yiyao/category" },
      { title: "商家", path: "/yiyao/merchant" },
      { title: "区域", path: "/yiyao/region" },
    ],
  },
  {
    key: "permission-management",
    title: "权限管理",
    path: "/permission-management",
    icon: ShieldCheck,
    requireAdmin: true,
  },
];
