import React from "react";
import { useUser } from "@/contexts/UserContext";
import { ShieldAlert } from "lucide-react";

/**
 * 权限守卫：仅 platform_admin 角色可访问被包裹的页面内容，
 * 非管理员访问时展示无权限提示，避免直接通过 URL 绕过菜单可见性限制。
 */
const RequireAdmin = ({ children }) => {
  const { currentUser } = useUser();

  if (!currentUser || currentUser.role !== "platform_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-gray-100">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-base font-medium text-gray-800">暂无访问权限</p>
        <p className="text-sm text-gray-400 mt-1.5">
          当前账号角色为「{currentUser?.roleLabel || "未知"}」，无法查看权限管理页面
        </p>
      </div>
    );
  }

  return children;
};

export default RequireAdmin;
