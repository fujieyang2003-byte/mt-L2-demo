import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { UserProvider, useUser } from "@/contexts/UserContext";
import AdminLayout from "@/layouts/AdminLayout";
import Login from "@/pages/Login";
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
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <UserProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
