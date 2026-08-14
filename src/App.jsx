import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { BizLineProvider } from "@/contexts/BizLineContext";
import AdminLayout from "@/layouts/AdminLayout";
import Login from "@/pages/Login";
import ChannelDetail from "@/pages/ChannelDetail";
import PartnerDetail from "@/pages/PartnerDetail";
import MerchantTierDrilldown from "@/pages/MerchantTierDrilldown";
import { navItems } from "./nav-items";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {navItems.map(({ to, page }) => (
          <Route key={to} path={to} element={page} />
        ))}
        {/* 渠道透视详情页：区域 → 城市 */}
        <Route path="/channel/region/:regionName" element={<ChannelDetail />} />
        {/* 渠道透视详情页：城市 → BD */}
        <Route path="/channel/region/:regionName/city/:cityName" element={<ChannelDetail />} />
        {/* 总商透视详情页 */}
        <Route path="/channel/partner/:partnerName" element={<PartnerDetail />} />
        {/* 总商透视：城市 → BD */}
        <Route path="/channel/partner/:partnerName/city/:cityName" element={<PartnerDetail />} />
        {/* 商家分层透视详情页 */}
        <Route path="/merchant/drilldown" element={<MerchantTierDrilldown />} />
        {/* 兼容旧路由重定向 */}
        <Route path="/goal-incentive" element={<Navigate to="/channel" replace />} />
        <Route path="/product-segmentation" element={<Navigate to="/product" replace />} />
        <Route path="/merchant-tier-analysis" element={<Navigate to="/merchant" replace />} />
        <Route path="/business-diagnosis" element={<Navigate to="/channel" replace />} />
        <Route path="/incentive-calculation" element={<Navigate to="/channel" replace />} />
        <Route path="/goal-management" element={<Navigate to="/channel" replace />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <UserProvider>
        <BizLineProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </BizLineProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
