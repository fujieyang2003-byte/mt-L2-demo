import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const UserContext = createContext(null);

const ROLE_LABELS = {
  platform_admin: "平台管理员",
  biz_manager: "广告业务经理",
  partner: "合作商",
  bd: "BD/运营",
};

/**
 * Demo 模式内置用户数据 —— 4 种角色各一个预设用户，
 * 外部访问时通过登录页面选择角色即可进入系统。
 */
const DEMO_USERS = {
  platform_admin: {
    id: 1,
    mis_id: "admin_demo",
    name: "张管理",
    role: "platform_admin",
    region: null,
    team: null,
    avatar_url: null,
    is_active: true,
  },
  biz_manager: {
    id: 2,
    mis_id: "biz_demo",
    name: "李经理",
    role: "biz_manager",
    region: "华东区",
    team: null,
    avatar_url: null,
    is_active: true,
  },
  partner: {
    id: 3,
    mis_id: "partner_demo",
    name: "王合作",
    role: "partner",
    region: "华东区",
    team: "上海总商A",
    city: "上海",
    partnerName: "上海总商A",
    avatar_url: null,
    is_active: true,
  },
  bd: {
    id: 4,
    mis_id: "bd_demo",
    name: "赵运营",
    role: "bd",
    region: "华东区",
    team: "上海总商A",
    city: "上海",
    partnerName: "上海总商A",
    bdName: "赵运营",
    bdMis: "bd_demo",
    avatar_url: null,
    is_active: true,
  },
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Demo 登录：根据选择的角色直接设置用户信息，无需数据库。
   */
  const login = useCallback(async (role = "platform_admin") => {
    setLoading(true);
    try {
      const user = DEMO_USERS[role] || DEMO_USERS.platform_admin;
      setCurrentUser({
        ...user,
        roleLabel: ROLE_LABELS[user.role] || user.role,
      });
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Demo 模式下平台管理员拥有全部权限，其他角色有基础权限。
   */
  const hasPermission = useCallback(
    (key) => {
      if (!currentUser) return false;
      if (currentUser.role === "platform_admin") return true;
      return true; // Demo 模式下所有角色均可访问
    },
    [currentUser]
  );

  const requestPermission = useCallback(
    async (key, reason) => {
      // Demo 模式下权限申请直接成功
      return { success: true };
    },
    []
  );

  const value = {
    currentUser,
    permissions: [],
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
