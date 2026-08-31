import Overview from "./pages/Overview.jsx";
import OverviewRegion from "./pages/OverviewRegion.jsx";
import OverviewCity from "./pages/OverviewCity.jsx";
import ProductOverview from "./pages/ProductOverview.jsx";
import ProductRegion from "./pages/ProductRegion.jsx";
import ProductSegment from "./pages/ProductSegment.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import MerchantTierAnalysis from "./pages/MerchantTierAnalysis.jsx";
import PermissionManagement from "./pages/PermissionManagement.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import MerchantDetail from "./pages/MerchantDetail.jsx";
import MerchantSegment from "./pages/MerchantSegment.jsx";
import ChannelAnnual from "./pages/ChannelAnnual.jsx";
import BizLineRouteWrapper from "./components/BizLineRouteWrapper.jsx";
import {
  ChannelRegionView,
  ChannelPartnerView,
  ChannelCityView,
  ChannelBdView,
} from "./pages/Channel.jsx";

/* ---------- 快捷包装 ---------- */
const W = ({ children }) => <BizLineRouteWrapper>{children}</BizLineRouteWrapper>;

/**
 * 全量路由映射（菜单 + 独立页面）。
 * 静态路由统一在这里注册，动态路由（如 /channel/region/:regionName）留在 App.jsx。
 */
export const navItems = [
  /* ====== 首页总览 ====== */
  { to: "/", page: <Overview /> },
  { to: "/overview/region", page: <OverviewRegion /> },
  { to: "/overview/city", page: <OverviewCity /> },
  { to: "/overview/staff", page: <PlaceholderPage title="人员业绩" /> },

  /* ====== 外卖 ====== */
  { to: "/waimai/overview", page: <W><Overview /></W> },
  { to: "/waimai/product/overview", page: <W><ProductOverview /></W> },
  { to: "/waimai/product/region", page: <W><ProductRegion /></W> },
  { to: "/waimai/product/segment", page: <W><ProductSegment /></W> },
  { to: "/waimai/product/detail", page: <W><ProductDetail /></W> },
  { to: "/waimai/merchant/overview", page: <W><MerchantTierAnalysis /></W> },
  { to: "/waimai/merchant/segment", page: <W><MerchantSegment /></W> },
  { to: "/waimai/merchant/change", page: <W><PlaceholderPage title="外卖 — 商家变化" /></W> },
  { to: "/waimai/merchant/category", page: <W><PlaceholderPage title="外卖 — 品类" /></W> },
  { to: "/waimai/channel/region", page: <W><ChannelRegionView /></W> },
  { to: "/waimai/channel/partner", page: <W><ChannelPartnerView /></W> },
  { to: "/waimai/channel/city", page: <W><ChannelCityView /></W> },
  { to: "/waimai/channel/bd", page: <W><ChannelBdView /></W> },
  { to: "/waimai/channel/annual", page: <W><ChannelAnnual /></W> },
  { to: "/waimai/channel/agent", page: <W><PlaceholderPage title="外卖 — 区域广告代理商" /></W> },

  /* ====== 到餐 ====== */
  { to: "/daocan/overview", page: <W><Overview /></W> },
  { to: "/daocan/product/overview", page: <W><ProductOverview /></W> },
  { to: "/daocan/product/region", page: <W><ProductRegion /></W> },
  { to: "/daocan/product/segment", page: <W><ProductSegment /></W> },
  { to: "/daocan/product/detail", page: <W><ProductDetail /></W> },
  { to: "/daocan/merchant/overview", page: <W><MerchantTierAnalysis /></W> },
  { to: "/daocan/merchant/segment", page: <W><MerchantDetail /></W> },
  { to: "/daocan/merchant/change", page: <W><PlaceholderPage title="到餐 — 商家变化" /></W> },
  { to: "/daocan/channel/region", page: <W><ChannelRegionView /></W> },
  { to: "/daocan/channel/partner", page: <W><ChannelPartnerView /></W> },
  { to: "/daocan/channel/city", page: <W><ChannelCityView /></W> },
  { to: "/daocan/channel/bd", page: <W><ChannelBdView /></W> },
  { to: "/daocan/channel/annual", page: <W><ChannelAnnual /></W> },
  { to: "/daocan/channel/agent", page: <W><PlaceholderPage title="到餐 — 区域广告代理商" /></W> },

  /* ====== 闪购 ====== */
  { to: "/shangou/overview", page: <PlaceholderPage title="闪购 — 经营总览" /> },
  { to: "/shangou/category", page: <PlaceholderPage title="闪购 — 品类" /> },
  { to: "/shangou/merchant", page: <PlaceholderPage title="闪购 — 商家" /> },
  { to: "/shangou/region", page: <PlaceholderPage title="闪购 — 区域" /> },

  /* ====== 医药 ====== */
  { to: "/yiyao/overview", page: <PlaceholderPage title="医药 — 经营总览" /> },
  { to: "/yiyao/category", page: <PlaceholderPage title="医药 — 品类" /> },
  { to: "/yiyao/merchant", page: <PlaceholderPage title="医药 — 商家" /> },
  { to: "/yiyao/region", page: <PlaceholderPage title="医药 — 区域" /> },

  /* ====== 权限管理 ====== */
  { to: "/permission-management", page: <PermissionManagement /> },
];
