import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { menuConfig } from "@/config/menuConfig";
import { useUser } from "@/contexts/UserContext";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Megaphone, ChevronDown, ChevronRight, LogOut, Clock } from "lucide-react";
import PermissionGate from "@/components/PermissionGate";

const PRIMARY_COLOR = "#4080FF";

/* ---------- 菜单辅助函数 ---------- */
const hasActiveLeaf = (item, pathname) => {
  if (!item.children) return false;
  return item.children.some((c) => {
    if (c.path && (pathname === c.path || pathname.startsWith(c.path + "/"))) return true;
    if (c.children) return hasActiveLeaf(c, pathname);
    return false;
  });
};

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useUser();
  const role = currentUser?.role;

  const [openKeys, setOpenKeys] = React.useState(() => {
    const init = {};
    menuConfig.forEach((item) => {
      if (!item.children) return;
      // 一级展开
      init[item.key] = hasActiveLeaf(item, location.pathname);
      // 二级模块分组展开
      item.children.forEach((child, idx) => {
        if (child.children && hasActiveLeaf(child, location.pathname)) {
          init[`${item.key}-${idx}`] = true;
        }
      });
    });
    return init;
  });

  const toggle = (key) => setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const visibleItems = menuConfig.filter(
    (item) => !item.requireAdmin || role === "platform_admin"
  );

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <Megaphone className="text-white" size={18} />
        </div>
        <div className="leading-tight overflow-hidden">
          <p className="text-sm font-semibold text-gray-900 truncate">
            广告经营管理系统
          </p>
          <p className="text-[11px] text-gray-400 truncate">Ads Operation Console</p>
        </div>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openKeys[item.key];

          if (!hasChildren) {
            const active =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.key}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                style={active ? { backgroundColor: PRIMARY_COLOR } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.title}</span>
                {item.requireAdmin && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-auto text-[10px] px-1.5 py-0 h-4 border-none",
                      active ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500"
                    )}
                  >
                    管理员
                  </Badge>
                )}
              </Link>
            );
          }

          const parentActive = hasActiveLeaf(item, location.pathname);

          return (
            <div key={item.key}>
              <button
                onClick={() => toggle(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  parentActive
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                style={parentActive ? { backgroundColor: PRIMARY_COLOR } : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{item.title}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}
              </button>
              {isOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-0.5">
                  {item.children.map((child, idx) => {
                    if (child.children) {
                      /* 三级模块分组（产品 / 商家 / 渠道） */
                      const modKey = `${item.key}-${idx}`;
                      const modOpen = openKeys[modKey];
                      const modActive = hasActiveLeaf(child, location.pathname);
                      return (
                        <div key={modKey}>
                          <button
                            onClick={() => toggle(modKey)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                              modActive
                                ? "text-[#4080FF] font-medium"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            <span className="truncate flex-1 text-left">{child.title}</span>
                            {modOpen ? (
                              <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
                            ) : (
                              <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                            )}
                          </button>
                          {modOpen && (
                            <div className="mt-0.5 ml-3 pl-3 border-l border-gray-100 space-y-0.5">
                              {child.children.map((leaf) => {
                                const leafActive = location.pathname === leaf.path;
                                return (
                                  <Link
                                    key={leaf.path}
                                    to={leaf.path}
                                    className={cn(
                                      "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                                      leafActive
                                        ? "text-[#4080FF] bg-blue-50 font-medium"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                  >
                                    <span className="truncate">{leaf.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    /* 二级叶子节点（经营总览等） */
                    const leafActive = location.pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                          leafActive
                            ? "text-[#4080FF] bg-blue-50 font-medium"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <span className="truncate">{child.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-gray-100 text-[11px] text-gray-400">
        © 2024 广告经营管理系统
      </div>
    </aside>
  );
};

const UserMenu = () => {
  const { currentUser, logout } = useUser();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === "platform_admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name?.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="text-left leading-tight hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
          </div>
          <Badge
            className={cn(
              "text-[11px] font-normal border-none hidden sm:inline-flex",
              isAdmin ? "bg-blue-50 text-[#4080FF]" : "bg-gray-100 text-gray-500"
            )}
          >
            {currentUser.roleLabel}
          </Badge>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
          <p className="text-xs text-gray-400 font-normal mt-0.5">
            当前角色：{currentUser.roleLabel}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-500 focus:text-red-500"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ---------- 面包屑辅助函数 ---------- */
function findMenuPath(config, pathname) {
  for (const item of config) {
    if (item.path === pathname) return [item];
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) return [item, child];
        if (child.children) {
          for (const leaf of child.children) {
            if (leaf.path === pathname) return [item, child, leaf];
          }
        }
      }
    }
  }
  return [];
}

const AppBreadcrumb = () => {
  const location = useLocation();
  const path = findMenuPath(menuConfig, location.pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">首页</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {path.map((item, idx) => (
          <React.Fragment key={item.title}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {idx === path.length - 1 || !item.path ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

/**
 * 待审批状态下的全屏提示页：不展示侧边栏和正常页面内容，
 * 仅提示用户当前角色待审批，并提供申请角色权限 / 退出登录入口。
 */
const PendingApprovalView = () => {
  const { currentUser, logout } = useUser();

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#f0f2f5" }}>
      <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <Megaphone className="text-white" size={18} />
          </div>
          <p className="text-sm font-semibold text-gray-900">广告经营管理系统</p>
        </div>
        <UserMenu />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="w-7 h-7 text-[#4080FF]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">账号待审批</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            您的账号（{currentUser?.mis_id}）已创建成功，当前角色为「待审批」状态。请联系平台管理员为您分配系统角色后即可使用所有功能。
          </p>

          <div className="w-full mt-1">
            <PermissionGate permissionKey="role_request" featureName="系统角色">
              <div className="h-24" />
            </PermissionGate>
          </div>

          <Button variant="outline" className="w-full" onClick={logout}>
            退出登录
          </Button>
        </div>
      </main>
    </div>
  );
};

const AdminLayout = () => {
  const { currentUser } = useUser();
  const location = useLocation();

  if (currentUser?.role === "pending") {
    return <PendingApprovalView />;
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f0f2f5" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <AppBreadcrumb />
          </div>
          <UserMenu />
        </header>
        {/* 路由切换时以 pathname 为 key 重挂载，触发苹果式页面入场动画 */}
        <main key={location.pathname} className="flex-1 p-6 nk-page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
