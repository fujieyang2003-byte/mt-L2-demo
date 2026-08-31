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
import BizLineRouteWrapper from "@/components/BizLineRouteWrapper";
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

        {/* 渠道/商家透视动态路由 */}
        <Route path="/channel/region/:regionName" element={<BizLineRouteWrapper><ChannelDetail /></BizLineRouteWrapper>} />
        <Route path="/channel/region/:regionName/city/:cityName" element={<BizLineRouteWrapper><ChannelDetail /></BizLineRouteWrapper>} />
        <Route path="/channel/partner/:partnerName" element={<BizLineRouteWrapper><PartnerDetail /></BizLineRouteWrapper>} />
        <Route path="/channel/partner/:partnerName/city/:cityName" element={<BizLineRouteWrapper><PartnerDetail /></BizLineRouteWrapper>} />
        <Route path="/merchant/drilldown" element={<BizLineRouteWrapper><MerchantTierDrilldown /></BizLineRouteWrapper>} />

        <Route path="/overview/partner" element={<Navigate to="/overview/city" replace />} />

        {/* 旧路由重定向（默认到外卖） */}
        <Route path="/product" element={<Navigate to="/waimai/product/overview" replace />} />
        <Route path="/product/detail" element={<Navigate to="/waimai/product/detail" replace />} />
        <Route path="/merchant" element={<Navigate to="/waimai/merchant/overview" replace />} />
        <Route path="/merchant/detail" element={<Navigate to="/waimai/merchant/segment" replace />} />
        <Route path="/channel" element={<Navigate to="/waimai/channel/region" replace />} />
        <Route path="/channel/region-detail" element={<Navigate to="/waimai/channel/region" replace />} />
        <Route path="/channel/partner-detail" element={<Navigate to="/waimai/channel/partner" replace />} />
        <Route path="/channel/city-detail" element={<Navigate to="/waimai/channel/city" replace />} />
        <Route path="/channel/bd-detail" element={<Navigate to="/waimai/channel/bd" replace />} />
        <Route path="/goal-incentive" element={<Navigate to="/waimai/channel/region" replace />} />
        <Route path="/product-segmentation" element={<Navigate to="/waimai/product/overview" replace />} />
        <Route path="/merchant-tier-analysis" element={<Navigate to="/waimai/merchant/overview" replace />} />
        <Route path="/business-diagnosis" element={<Navigate to="/waimai/channel/region" replace />} />
        <Route path="/incentive-calculation" element={<Navigate to="/waimai/channel/region" replace />} />
        <Route path="/goal-management" element={<Navigate to="/waimai/channel/region" replace />} />
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
