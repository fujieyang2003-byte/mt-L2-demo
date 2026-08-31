import { useEffect } from "react";
import { useBizLine } from "@/contexts/BizLineContext";

const BIZ_LINE_MAP = {
  "/waimai": "waimai",
  "/daocan": "daocan",
  "/shangou": "shangou",
  "/yiyao": "yiyao",
};

/**
 * 根据当前路由前缀自动设置业务线。
 * 首页总览和权限管理不覆盖业务线，保留用户上次选择。
 */
export default function BizLineRouteWrapper({ children }) {
  const { changeBizLine } = useBizLine();

  useEffect(() => {
    const pathname = window.location.hash.replace("#", "") || "/";
    for (const [prefix, bizLine] of Object.entries(BIZ_LINE_MAP)) {
      if (pathname.startsWith(prefix)) {
        changeBizLine(bizLine);
        return;
      }
    }
  }, [changeBizLine]);

  return children;
}
