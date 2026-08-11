import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";

const UserContext = createContext(null);

const ROLE_LABELS = {
  platform_admin: "平台管理员",
  biz_manager: "广告业务经理",
  partner: "合作商",
  bd: "BD/运营",
  pending: "待审批",
};

/**
 * 获取当前登录用户信息（MIS 号、姓名、头像）。
 * 依次尝试：1) NoCode SDK 的 getUserInfo；2) URL 查询参数 ?mis=xxx；
 * 3) 都取不到则生成一个访客身份。此函数永远不返回 null，保证 login 可以成功进入系统。
 */
const resolveCurrentUser = async () => {
  try {
    const sdkUser = (await window.NoCode?.getUserInfo?.()) ?? null;
    const misId = sdkUser?.misId;
    if (misId) {
      return { mis: misId, name: sdkUser?.name || misId, avatar: sdkUser?.avatarUrl || null };
    }
  } catch (error) {
    console.warn("获取 NoCode 登录用户信息失败", error);
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const urlMis = params.get("mis");
    if (urlMis) {
      return { mis: urlMis, name: urlMis, avatar: null };
    }
  } catch (error) {
    console.warn("从 URL 参数获取 mis 失败", error);
  }

  return { mis: `guest_${Date.now()}`, name: "访客用户", avatar: null };
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadPermissions = useCallback(async (mis) => {
    const { data, error } = await supabase
      .from("ad_user_permissions")
      .select("permission_key")
      .eq("user_mis", mis)
      .eq("status", "approved");

    if (error) {
      console.error("查询用户权限失败", error);
      return [];
    }
    return (data || []).map((item) => item.permission_key);
  }, []);

  /**
   * 触发登录：获取 MIS 号 -> 查询/创建用户 -> 查询已获批权限 -> 标记已登录。
   */
  const login = useCallback(async () => {
    setLoading(true);
    try {
      const sdkUser = await resolveCurrentUser();

      const { mis, name } = sdkUser;

      const { data: existingUser, error: queryError } = await supabase
        .from("ad_users")
        .select("*")
        .eq("mis_id", mis)
        .maybeSingle();

      if (queryError) {
        console.error("查询用户信息失败", queryError);
      }

      let user = existingUser;

      if (!user) {
        const { data: createdUser, error: insertError } = await supabase
          .from("ad_users")
          .insert({ mis_id: mis, name, role: "pending" })
          .select()
          .single();

        if (insertError) {
          console.error("创建用户记录失败", insertError);
        } else {
          user = createdUser;
        }
      }

      if (user) {
        setCurrentUser({
          ...user,
          roleLabel: ROLE_LABELS[user.role] || user.role,
        });
        const approvedKeys = await loadPermissions(user.mis_id);
        setPermissions(approvedKeys);
        setIsAuthenticated(true);
      }
    } finally {
      setLoading(false);
    }
  }, [loadPermissions]);

  /**
   * 退出登录：清空当前用户与权限信息，回到未认证状态。
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    setPermissions([]);
    setIsAuthenticated(false);
  }, []);

  /**
   * 判断当前用户是否拥有某个功能权限。
   * platform_admin 默认拥有全部权限；其余角色需已获批对应 permission_key。
   */
  const hasPermission = useCallback(
    (key) => {
      if (!currentUser) return false;
      if (currentUser.role === "platform_admin") return true;
      return permissions.includes(key);
    },
    [currentUser, permissions]
  );

  /**
   * 向 permission_requests 表提交一条权限申请记录。
   */
  const requestPermission = useCallback(
    async (key, reason) => {
      if (!currentUser) {
        return { success: false, error: "当前用户信息未加载" };
      }

      const { error } = await supabase.from("ad_permission_requests").insert({
        user_mis: currentUser.mis_id,
        user_name: currentUser.name,
        permission_key: key,
        request_reason: reason || null,
      });

      if (error) {
        console.error("提交权限申请失败", error);
        return { success: false, error: error.message };
      }
      return { success: true };
    },
    [currentUser]
  );

  const value = {
    currentUser,
    permissions,
    hasPermission,
    requestPermission,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser 必须在 UserProvider 内部使用");
  }
  return ctx;
};
