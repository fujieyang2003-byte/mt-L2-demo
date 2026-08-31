import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useBizLine } from "@/contexts/BizLineContext";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Send, Download, Upload, Filter } from "lucide-react";

/* ========== Demo Data ========== */
const DEMO_MONTH = "2024-08";
const DEMO_BASE = [
  { biz: "外卖", gm: "利辛县总商", city: "利辛", owner: "华东一区", bigArea: "华东", region: "安徽", gtv: 125000, revenue: 8200, mr: 6.56, target: 10000 },
  { biz: "外卖", gm: "利辛县总商", city: "蒙城", owner: "华东一区", bigArea: "华东", region: "安徽", gtv: 98000, revenue: 6500, mr: 6.63, target: 8000 },
  { biz: "外卖", gm: "南阳总商", city: "南阳", owner: "华中一区", bigArea: "华中", region: "河南", gtv: 210000, revenue: 15200, mr: 7.24, target: 18000 },
  { biz: "外卖", gm: "南阳总商", city: "邓州", owner: "华中一区", bigArea: "华中", region: "河南", gtv: 85000, revenue: 5800, mr: 6.82, target: 7000 },
  { biz: "外卖", gm: "团风总商", city: "黄冈", owner: "华中二区", bigArea: "华中", region: "湖北", gtv: 156000, revenue: 11200, mr: 7.18, target: 13000 },
  { biz: "外卖", gm: "孟州总商", city: "孟州", owner: "华中二区", bigArea: "华中", region: "河南", gtv: 72000, revenue: 4900, mr: 6.81, target: 6000 },
  { biz: "外卖", gm: "安徽筑仁", city: "合肥", owner: "华东二区", bigArea: "华东", region: "安徽", gtv: 320000, revenue: 24500, mr: 7.66, target: 28000 },
  { biz: "到餐", gm: "安阳秒达鲜", city: "安阳", owner: "华北一区", bigArea: "华北", region: "河南", gtv: 95000, revenue: 6800, mr: 7.16, target: 8000 },
  { biz: "到餐", gm: "安阳秒达鲜", city: "汤阴", owner: "华北一区", bigArea: "华北", region: "河南", gtv: 42000, revenue: 3100, mr: 7.38, target: 3500 },
  { biz: "到餐", gm: "岳西总商", city: "安庆", owner: "华东三区", bigArea: "华东", region: "安徽", gtv: 78000, revenue: 5600, mr: 7.18, target: 6500 },
  { biz: "到餐", gm: "嵩县瑞祥", city: "洛阳", owner: "华中三区", bigArea: "华中", region: "河南", gtv: 65000, revenue: 4800, mr: 7.38, target: 5500 },
  { biz: "到餐", gm: "广州磐新", city: "广州", owner: "华南一区", bigArea: "华南", region: "广东", gtv: 280000, revenue: 21000, mr: 7.50, target: 24000 },
];

// 由基础数据推导出年框看板所需的全部派生字段（pace 折算目标 / YTD 达成 / 年框总目标等）
function buildDemoIdx() {
  const idx = {};
  DEMO_BASE.forEach(b => {
    const curPaceTgt = Math.round(b.target * 0.8);            // 当月按时间进度折算目标
    const projTarget = b.target * 8;                           // YTD 目标（1-8月）
    const ytdPaceTgt = Math.round(projTarget * 0.64);          // YTD 按时间进度折算目标
    const ytdRev = Math.round(b.revenue * 7.2);                // YTD 实际达成
    const frameTgt = Math.round(b.target * 12);                // 年框总目标
    const fullPaceTgt = Math.round(frameTgt * 0.645);          // 全量按时间进度折算目标
    idx[`${b.biz}__${b.gm}__${b.city}__${DEMO_MONTH}`] = {
      gtv: b.gtv, revenue: b.revenue, mr: b.mr, mrYoy: 0.21,
      target: b.target,
      fr: curPaceTgt > 0 ? b.revenue / curPaceTgt : null,
      gap: curPaceTgt > 0 ? Math.max(0, curPaceTgt - b.revenue) : null,
      projTarget, projectFr: ytdPaceTgt > 0 ? ytdRev / ytdPaceTgt : null,
      frameTarget: frameTgt, projectFrFull: fullPaceTgt > 0 ? ytdRev / fullPaceTgt : null,
      totalGap: ytdPaceTgt > 0 ? Math.max(0, ytdPaceTgt - ytdRev) : null,
      profitTier: "第一档",
      yoyGrowthRate: 0.3,
      _curPaceTgt: curPaceTgt, _ytdPaceTgt: ytdPaceTgt, _ytdRev: ytdRev,
      _frameTgt: frameTgt, _fullYtdPaceTgt: fullPaceTgt, _fullYtdRev: ytdRev,
    };
  });
  return idx;
}

// 去年同期（业务线__城市 → { gtv, ad_revenue }），用于 MR YoY
function buildDemoLy() {
  const ly = {};
  DEMO_BASE.forEach(b => {
    ly[`${b.biz}__${b.city}`] = { gtv: Math.round(b.gtv * 0.92), ad_revenue: Math.round(b.revenue * 0.88) };
  });
  return ly;
}

// 月目标累计警告：每个总商 1-8 月逐月明细，履约率 <90% 记警告
function buildDemoWarn() {
  const warnState = {};
  const warnDetail = {};
  const gmMap = {};
  DEMO_BASE.forEach(b => { gmMap[`${b.biz}__${b.gm}`] = b; });
  Object.entries(gmMap).forEach(([key, b], gi) => {
    const detail = [];
    let warns = 0;
    for (let mo = 1; mo <= 8; mo++) {
      const month = `2024-${String(mo).padStart(2, "0")}`;
      const factor = 0.82 + ((gi * 7 + mo * 13) % 30) / 100; // 0.82~1.11 确定性伪随机
      const actual = Math.round(b.target * factor);
      const fr = b.target > 0 ? actual / b.target : null;
      const warn = fr != null && fr < 0.9;
      if (warn) warns++;
      detail.push({ month, target: b.target, actual, fr, warn });
    }
    warnState[key] = warns;
    warnDetail[key] = detail;
  });
  return { warnState, warnDetail };
}

// 上传目标表字段说明（Demo 弹窗展示用）
const TARGET_FIELDS = [
  { key: "owner",            label: "负责大区", required: true },
  { key: "business",         label: "年框业务", required: true },
  { key: "entity",           label: "主体",     required: false },
  { key: "general_merchant", label: "总商",     required: true },
  { key: "city",             label: "城市",     required: true },
  { key: "region",           label: "区域",     required: true },
  { key: "big_area",         label: "大区",     required: false },
  { key: "month",            label: "月份",     required: true },
  { key: "monthly_target",   label: "月度目标", required: true },
  { key: "ad_sales_target",  label: "广告销售目标", required: false },
  { key: "profit_share_tier",label: "分润档位", required: false },
  { key: "yoy_growth_rate",  label: "yoy增幅要求", required: false },
];

// 通用排序比较：文本列按字典序，数值列按大小；空值始终置底
const compareSortable = (a, b, asc, isText) => {
  const aEmpty = a == null || a === "";
  const bEmpty = b == null || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;
  if (isText) {
    const r = String(a).localeCompare(String(b), "zh-CN");
    return asc ? r : -r;
  }
  const na = parseFloat(a);
  const nb = parseFloat(b);
  const r = (isNaN(na) ? -Infinity : na) - (isNaN(nb) ? -Infinity : nb);
  return asc ? r : -r;
};

const DEMO_OVERALL = { 外卖: 58200, 到餐: 37000 };

const NK_BIZ_LIST = ["外卖", "到餐"];
const NK_BIZ_COLORS = { 外卖: "bg-indigo-50 text-indigo-600", 到餐: "bg-purple-50 text-purple-600" };

const formatMoney = (n) => (n == null ? "--" : Number(n).toLocaleString());
const fmtFr = (v) => (v == null ? "--" : Number(v).toFixed(1) + "%");
const fmtMoM = (v) => (v == null ? "--" : (v >= 0 ? "+" : "") + Number(v).toFixed(1) + "%");

const subtractOneDay = (d) => {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  dt.setDate(dt.getDate() - 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* ===== 移动端断点判断（默认 <1024px 视为移动端，可传入自定义断点） ===== */
const useIsMobile = (breakpoint = 1024) => {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
};

/* ========== Component ========== */
export default function ChannelAnnual() {
  const { bizLine } = useBizLine();
  const label = bizLine === "waimai" ? "外卖" : "到餐";

  // 移动端：冻结列只保留 业务线 + 总商，且各列更紧凑
  const isNkMobile = useIsMobile(640);
// idx key: "biz__gm__city__month" → { gtv, revenue, mr, target, fr }
  const [idx, setIdx] = useState({});
  // allGMItems: [{ biz, shortName, city }]，按 biz 分组排序
  const [allGMItems, setAllGMItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // 加载倒计时（预计 20 秒）：loading 期间每秒 -1，最低停在 1，避免归零后仍在转
  const [countdown, setCountdown] = useState(20);
  // 加载倒计时（预计 20 秒）：loading 期间每秒 -1，最低停在 1，避免归零后仍在转
  useEffect(() => {
    if (!loading) return;
    setCountdown(20);
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  // 业务线 Tab：全部 / 外卖 / 到餐
  const [activeBiz, setActiveBiz] = useState("全部");
  // 总商搜索/筛选
  const [gmSearch, setGmSearch] = useState("");
  const [gmFilter, setGmFilter] = useState(null); // { biz, shortName } | null
  const [lyBizCityMaxState, setLyBizCityMaxState] = useState({});
  const [gmWarnState, setGmWarnState] = useState({}); // biz__gm → 月目标累计警告次数
  const [gmWarnDetailState, setGmWarnDetailState] = useState({}); // biz__gm → 逐月明细数组
  const [warnModal, setWarnModal] = useState(null); // { biz, gm, owner, firstMonth, lastMonth, warnCount, detail } | null
  const [warnModalFull, setWarnModalFull] = useState(false); // 明细弹窗是否全屏
  const [visibleCols, setVisibleCols] = useState(() => new Set([
    "frameTarget", "projectFrFull", "projTarget", "projectFr", "totalGap",
    "gtv", "revenue", "mr", "mrYoy", "target", "fr", "gap", "warnCount",
  ]));
  const [colPanelOpen, setColPanelOpen] = useState(false);
  const colPanelRef = useRef(null);
  // 年框汇总 ref（供 AI 分析使用，Demo 中仅存储）
  const nkSummaryRef = useRef(null);
  const [nkView, setNkView] = useState("city"); // "city" | "gm"
  // 总商看板表头排序：key + 升/降序（默认按广告收入降序）
  const [gmSortKey, setGmSortKey] = useState("revenue");
  const [gmSortAsc, setGmSortAsc] = useState(false);
  // 总商群推送状态
  const [pushingGm, setPushingGm] = useState(null);
  const [pushingAll, setPushingAll] = useState(null);
  const [regionPushGroupId, setRegionPushGroupId] = useState("70639736780");
  const [pushingRegionPerformance, setPushingRegionPerformance] = useState(false);
  const [gmGroupMap, setGmGroupMap] = useState({
    '利辛县总商': '70136678440',
    '南阳总商': '70850159874',
    '团风总商': '70873751207',
    '孟州总商': '70668995438',
    '安徽筑仁': '70845581343',
    '安阳秒达鲜': '70479595578',
    '岳西总商': '70863396708',
    '嵩县瑞祥': '70924636268',
    '广州磐新': '70929505441',
  });
  // 城市明细表表头排序：key + 升/降序（null=保持原始顺序）
  const [citySortKey, setCitySortKey] = useState(null);
  const [citySortAsc, setCitySortAsc] = useState(false);
  // 整体广告收入：外卖=CKA+城商，到餐=全部区域
  const [overallRev, setOverallRev] = useState({ 外卖: null, 到餐: null });
  // 城市数点击弹窗：{ biz, gm, cities: [...] } | null
  const [cityListModal, setCityListModal] = useState(null);
  // 上传数据弹窗状态（Demo：界面保留，不接数据库）
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState("select"); // "select" | "mapping" | "preview" | "uploading" | "done"
  const [uploadParsedRows, setUploadParsedRows] = useState([]);
  const [uploadHeaders, setUploadHeaders] = useState([]);
  const [uploadMapping, setUploadMapping] = useState({});
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadWideFormat, setUploadWideFormat] = useState(false);
  const [uploadAnalyzing, setUploadAnalyzing] = useState(false);
  const [uploadParsing, setUploadParsing] = useState(false);
  const [uploadAiFields, setUploadAiFields] = useState([]);
  const uploadFileRef = useRef(null);

  // Demo 初始化：不接数据库，用本地演示数据构建全部状态
  useEffect(() => {
    const { warnState, warnDetail } = buildDemoWarn();
    setIdx(buildDemoIdx());
    setAllGMItems(DEMO_BASE.map(b => ({
      biz: b.biz, shortName: b.gm, city: b.city, owner: b.owner,
      bigArea: b.bigArea, region: b.region, firstMonth: "2024-01", lastMonth: "2024-12",
    })));
    setOverallRev(DEMO_OVERALL);
    setLyBizCityMaxState(buildDemoLy());
    setGmWarnState(warnState);
    setGmWarnDetailState(warnDetail);
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const curMonth = '2024-08-25' ? (subtractOneDay('2024-08-25') || '2024-08-25').slice(0, 7) : "";
  const hasData  = Object.keys(idx).length > 0;

  // 格式化
  const isBlank = (v) => v == null || isNaN(v) || v === 0;
  const fmtWan  = (v) => isBlank(v) ? "--" : (v / 10000).toFixed(1);
  const fmtMr   = (v) => (v == null || isNaN(v)) ? "--" : `${parseFloat(v).toFixed(2)}%`;
  const fmtFr   = (v) => (v == null || isNaN(v)) ? "--" : `${(parseFloat(v) * 100).toFixed(1)}%`;

  const getCell = (r, key) => {
    if (!r) return "--";
    if (key === "gtv")     return r.gtv == null ? "--" : parseFloat(r.gtv).toFixed(0);
    if (key === "revenue") return r.revenue == null ? "--" : parseFloat(r.revenue).toFixed(0);
    if (key === "mr")      return fmtMr(r.mr);
    if (key === "mrYoy")   return r.mrYoy !== null && r.mrYoy !== undefined ? (r.mrYoy >= 0 ? "+" : "") + r.mrYoy.toFixed(2) : "--";
    if (key === "target")  return r.target == null ? "--" : parseFloat(r.target).toFixed(0);
    if (key === "fr")        return fmtFr(r.fr);
    if (key === "gap")       return r.gap == null ? "--" : parseFloat(r.gap).toFixed(0);
    if (key === "frameTarget") return r.frameTarget == null ? "--" : parseFloat(r.frameTarget).toFixed(0);
    if (key === "projectFrFull") return fmtFr(r.projectFrFull);
    if (key === "projTarget") return r.projTarget == null ? "--" : parseFloat(r.projTarget).toFixed(0);
    if (key === "projectFr") return fmtFr(r.projectFr);
    if (key === "totalGap")  return r.totalGap == null ? "--" : parseFloat(r.totalGap).toFixed(0);
    if (key === "ytd")       return fmtWan(r.ytd);
    return "--";
  };

  const getCellGM = (r, key) => {
    if (!r) return "--";
    if (key === "cityCount") return r.cityCount != null ? r.cityCount : "--";
    if (key === "warnCount") return r.warnCount != null ? r.warnCount : "--";
    return getCell(r, key);
  };

  // 分润档位展示：文本字段（如"第一档"），直接输出。
  const fmtProfitTier = (v) => {
    if (v === null || v === undefined || v === "") return "--";
    return String(v);
  };
  // 签框YoY增幅展示：库中存小数（0.05），展示为百分比（5%）。
  // 总商行在多档位并存时会传入形如 "30%~40%" 的字符串，此时原样输出。
  const fmtYoyGrowthRate = (v) => {
    if (v === null || v === undefined || v === "") return "--";
    if (typeof v === "string") return v;
    const n = Number(v);
    if (isNaN(n)) return "--";
    const pct = n > 1 ? n : n * 100;
    return `${parseFloat(pct.toFixed(2))}%`;
  };

  // ===== 推送模板辅助函数 =====
  const _daysInMonth = (ym) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(Date.UTC(y, m, 0)).getUTCDate();
  };
  const _daysBetweenInclusive = (a, b) => {
    const da = new Date(a + "T00:00:00Z");
    const db = new Date(b + "T00:00:00Z");
    return Math.floor((db - da) / 86400000) + 1;
  };
  // 格式化总商行为结构化 Markdown 消息
  const formatGmRowText = (r) => {
    const lines = ["**📊 年框数据推送 - " + r.gm + "**", ""];
    lines.push("业务线: " + r.biz);
    lines.push("城市数: " + (r.cityCount || "--"));
    lines.push("签约期间: " + (r.firstMonth || "--") + " ~ " + (r.lastMonth || "--"));
    lines.push("");

    // 【履约进度】
    lines.push("**【履约进度】**");
    const curMonth = '2024-08-25' ? '2024-08-25'.slice(0, 7) : "";
    const monthTotalDays = curMonth ? _daysInMonth(curMonth) : 0;
    const monthDay = curMonth ? parseInt('2024-08-25'.slice(8, 10), 10) : 0;
    const monthTimePct = monthTotalDays > 0 ? (monthDay / monthTotalDays * 100).toFixed(1) : "--";
    const monthTaskPct = (r.target != null && r.target > 0 && r.revenue != null) ? (r.revenue / r.target * 100).toFixed(1) : "--";
    const monthFrPct = (r.fr != null && !isNaN(r.fr)) ? (r.fr * 100).toFixed(1) : "--";
    const monthRemainDays = Math.max(0, monthTotalDays - monthDay);
    const dailyGap = (r.gap != null && r.gap > 0 && monthRemainDays > 0) ? (r.gap / monthRemainDays).toFixed(0) : "0";
    let totalTimePct = "--";
    if (r.firstMonth && r.lastMonth) {
      const firstDay = r.firstMonth + "-01";
      const lastDay = `${r.lastMonth}-${String(_daysInMonth(r.lastMonth)).padStart(2, "0")}`;
      const totalDays = _daysBetweenInclusive(firstDay, lastDay);
      const elapsedDays = '2024-08-25' ? _daysBetweenInclusive(firstDay, '2024-08-25') : 0;
      totalTimePct = totalDays > 0 ? (elapsedDays / totalDays * 100).toFixed(1) : "--";
    }
    const totalFrPct = (r.projectFrFull != null && !isNaN(r.projectFrFull)) ? (r.projectFrFull * 100).toFixed(1) : "--";
    let monthlyGap = "0";
    if (r.totalGap != null && r.totalGap > 0 && r.firstMonth && r.lastMonth && '2024-08-25') {
      const lastDay = `${r.lastMonth}-${String(_daysInMonth(r.lastMonth)).padStart(2, "0")}`;
      const remainMonths = Math.max(1, Math.ceil(_daysBetweenInclusive('2024-08-25', lastDay) / 30));
      monthlyGap = (r.totalGap / remainMonths).toFixed(0);
    }
    lines.push("| 月时间进度 | 月任务进度 | 月履约率 | 日均差额 | 总时间进度 | 总履约率 | 月均差额 |");
    lines.push("|---|---|---|---|---|---|---|");
    lines.push("| " + monthTimePct + "% | " + monthTaskPct + "% | " + monthFrPct + "% | " + dailyGap + "元 | " + totalTimePct + "% | " + totalFrPct + "% | " + monthlyGap + "元 |");
    lines.push("");

    // 【警告次数】
    lines.push("**【警告次数】**");
    const wc = r.warnCount != null ? r.warnCount : 0;
    lines.push("未达成月度目标警告触发 " + wc + " 次");
    if (wc > 0 && Array.isArray(r.warnDetail) && r.warnDetail.length > 0) {
      const warningRows = r.warnDetail.filter(item => item.warn === true);
      if (warningRows.length > 0) {
        lines.push("| 未达标月份 | 当月履约率 |");
        lines.push("|---|---|");
        warningRows.forEach(item => {
          const rate = item.fr != null && !isNaN(item.fr) ? (item.fr * 100).toFixed(1) + "%" : "--";
          lines.push("| " + (item.month || "--") + " | " + rate + " |");
        });
      }
    }
    lines.push("");
    lines.push("注：月度履约率连续3次低于90%或累计3个月低于70%触发清退");
    lines.push("");

    // 【城市分析】
    lines.push("**【城市分析】**");
    if (r.cities && r.cities.length > 0) {
      const leadingCities = r.cities.filter(c => c.fr != null && !isNaN(c.fr) && c.fr >= 1.0);
      lines.push("领先城市：");
      if (leadingCities.length > 0) {
        lines.push("| 城市 | 广告收入 | 当月履约率 |");
        lines.push("|---|---|---|");
        leadingCities.forEach(c => {
          const revenue = c.revenue != null ? Number(c.revenue).toFixed(0) : "--";
          const fr = (c.fr * 100).toFixed(1);
          lines.push("| " + (c.city || "--") + " | " + revenue + "元 | " + fr + "% |");
        });
      } else {
        lines.push("无");
      }

      lines.push("");
      const laggingCities = r.cities.filter(c => c.fr == null || isNaN(c.fr) || c.fr < 1.0);
      lines.push("落后城市：");
      if (laggingCities.length > 0) {
        lines.push("| 城市 | 广告收入 | 当月履约率 |");
        lines.push("|---|---|---|");
        laggingCities.forEach(c => {
          const revenue = c.revenue != null ? Number(c.revenue).toFixed(0) : "--";
          const fr = c.fr != null && !isNaN(c.fr) ? (c.fr * 100).toFixed(1) : "--";
          lines.push("| " + (c.city || "--") + " | " + revenue + "元 | " + fr + "% |");
        });
      } else {
        lines.push("无");
      }
    } else {
      lines.push("领先城市: --");
      lines.push("落后城市: --");
    }
    lines.push("");
    return lines.join("\n");
  };

  // generateAnalysis 已废弃
  const generateAnalysis = (r) => "";

  // 调用 CatX Agent 进行 SSE 流式分析，返回完整分析文本
  const analyzeGmForPush = async (promptText) => {
    // Demo: 不接入 CatX，返回占位分析文本
    return "【Demo 分析】该总商本月履约率整体符合预期，建议关注低履约城市并提前规划月末冲刺；年框整体进度正常，按当前节奏可达成全年目标。";
  };

  // 推送总商数据到大象（前端 CatX SSE 分析 + pushmsg 推送）
  const handlePushGm = async (r, isBatch = false) => {
    const gmKey = `${r.biz}__${r.gm}`;
    setPushingGm(gmKey);
    const formattedText = formatGmRowText(r);
    try {
      // 查询该业务线整体MTD MR（外卖/到餐）Demo：直接使用 DEMO_OVERALL
      let overallMr = null;
      try {
        const totalRev = DEMO_OVERALL[r.biz];
        overallMr = totalRev != null ? (totalRev / 1000000 * 100).toFixed(2) : null;
      } catch (e) {
        console.warn("Overall MR query failed:", e);
      }

      const cityDetail = (r.cities || []).map(c =>
        `${c.city}(履约率${c.fr != null && !isNaN(c.fr) ? (c.fr * 100).toFixed(1) : "--"}%,广告收入${c.revenue != null ? c.revenue.toFixed(0) : "0"}元,GTV${c.gtv != null ? c.gtv.toFixed(0) : "0"}元)`
      ).join("；");
      const analysisPrompt = [
        "你是一位资深商业数据分析师。请仅基于下方提供的经营数据进行分析，严禁臆造数据。",
        "",
        "请直接输出【履约建议】的最终内容，严禁输出分析过程、中间计算、思考步骤、引导性语句（如我来分析、先梳理一下等）。包含以下内容：",
        "（1）城市角度分析：优先做工大体量城市",
        "（2）重点关注GTV规模高但广告收入低的城市，指出具体城市名称，建议提升空间和追踪方向",
        "（3）其他针对性的履约建议1-2条",
        "",
        "重要约束：",
        "0. 直接输出最终建议，严禁输出分析过程、中间计算、思考步骤、引导性语句。不要输出各城市MR的逐一计算过程。",
        "1. 不要分析以下字段：分润档位、签框YoY增幅",
        "2. 货币化率（MR）的高低判断，对比固定基准：外卖3.5%，到餐2.5%。",
        "3. 建议需具体可落地，不要空话套话",
        "4. 【履约建议】部分不超过400字，简洁有力。",
        "5. 履约率超过100%的城市属于领先城市，不要说有提升空间或需要提升，应肯定其表现并总结经验。",
        "6. 判断城市广告收入低需要同时满足：广告收入目标未达成或MR低于固定基准（外卖3.5%，到餐2.5%）。履约率超过100%且MR高于固定基准的城市不属于收入低，不应列入GTV高但收入低的分析中。",
        "7. 播报MR时用简洁表述，如MR仅1.44%（低于基准3.5%）。严格比较MR数值与基准数值的大小：只有MR数值小于基准才算低于基准，MR数值大于基准属于高于基准。例如MR为3.58%基准为3.5%时，3.58大于3.5属于高于基准，不应说低于或接近基准需提升。",
        "",
        "经营数据：",
        `业务线: ${r.biz}, 总商: ${r.gm}, 负责大区: ${r.owner}`,
        `签约期间: ${r.firstMonth || "--"} ~ ${r.lastMonth || "--"}`,
        `月广告收入: ${r.revenue != null ? r.revenue.toFixed(0) : "0"}元, 月目标: ${r.target != null ? r.target.toFixed(0) : "0"}元, 月履约率: ${r.fr != null ? (r.fr * 100).toFixed(1) : "--"}%`,
        `年框总目标: ${r.frameTarget != null ? r.frameTarget.toFixed(0) : "0"}元, 总履约率: ${r.projectFrFull != null ? (r.projectFrFull * 100).toFixed(1) : "--"}%`,
        `MTD差额: ${r.gap != null ? r.gap.toFixed(0) : "0"}元, 累计差额: ${r.totalGap != null ? r.totalGap.toFixed(0) : "0"}元`,
        `GTV: ${r.gtv != null ? r.gtv.toFixed(0) : "0"}元, 货币化率: ${r.mr != null ? r.mr.toFixed(2) : "--"}%`,
        `警告次数: ${r.warnCount != null ? r.warnCount : 0}`,
        `城市明细: ${cityDetail}`,
      ].join("\n");

      // 步骤1：前端 CatX Agent SSE 分析
      console.log("Starting CatX AI analysis...");
      const aiAnalysis = await analyzeGmForPush(analysisPrompt);
      console.log("AI analysis completed:", aiAnalysis);

      // 步骤2：组装完整消息
      const fullMessage = formattedText + "\n\n---\n\n🤖 **AI 履约建议**\n\n" + aiAnalysis;

      // 步骤3：调用 pushmsg Edge Function Demo：不发送，仅提示
      alert(`【Demo】推送功能未接入，以下为消息预览：\n\n${fullMessage.slice(0, 300)}...`);
      return true;
      /* eslint-disable no-unreachable */
    } catch (err) {
      console.error("Push failed:", err);
      try { await navigator.clipboard.writeText(formattedText); } catch (e) {}
      if (!isBatch) {
        alert(`⚠️ 推送异常：${err.message?.slice(0, 200) || "未知错误"}\n\n原始数据已复制到剪贴板，请手动发送。`);
      }
      return false;
    } finally {
      setPushingGm(null);
    }
  };

  // 区域履约提醒推送：按总商主要区域分组，筛选落后总商，计算追收金额并推送到大象群
  const handlePushRegionPerformance = async () => {
    if (pushingRegionPerformance) return;
    const groupId = regionPushGroupId.trim();
    if (!groupId) {
      alert("请输入推送群号");
      return;
    }
    const rows = sortedGmRows || [];
    if (rows.length === 0) {
      alert("暂无可推送的区域履约数据");
      return;
    }
    setPushingRegionPerformance(true);
    try {
      const curMonth = '2024-08-25' ? '2024-08-25'.slice(0, 7) : "";
      const monthTotalDays = curMonth ? _daysInMonth(curMonth) : 0;
      const monthDay = curMonth ? parseInt('2024-08-25'.slice(8, 10), 10) : 0;
      const remainDays = Math.max(1, monthTotalDays - monthDay); // 当月剩余天数
      // 签约剩余月数：当前月 → 签约末月（含两端）
      const remainMonthsOf = (lastMonth) => {
        if (!lastMonth || !curMonth) return 1;
        const [cy, cm] = curMonth.split("-").map(Number);
        const [ly, lm] = lastMonth.split("-").map(Number);
        return Math.max(1, (ly - cy) * 12 + (lm - cm) + 1);
      };
      const wan = v => Number((Number(v || 0) / 10000).toFixed(1)).toLocaleString("zh-CN");
      const pctText = v => (v != null && !isNaN(v)) ? (v * 100).toFixed(1) + "%" : "--";
      const bizLabel = biz => (biz || "").includes("外卖") ? "外卖" : "到餐";

      // 1. 按「总商月收入最高城市」所在 region 分组。
      const regionMap = {};
      rows.forEach(row => {
        let mainRegion = "";
        let maxRevenue = -1;
        (row.cities || []).forEach(c => {
          const revenue = Number(c.revenue || 0);
          if (revenue > maxRevenue) {
            maxRevenue = revenue;
            mainRegion = c.region || "";
          }
        });
        if (!mainRegion) mainRegion = row.cities?.[0]?.region || "其他";
        if (!regionMap[mainRegion]) regionMap[mainRegion] = [];
        regionMap[mainRegion].push(row);
      });

      // 2. 逐区域筛选月履约率、年框履约率均低于 100% 的总商，并按业务线组装 Markdown 表格
      const lines = [
        "**📊 区域履约提醒**", "",
        "数据截至 " + '2024-08-25' + "（本月剩余 " + remainDays + " 天）", "",
      ];
      const amountText = value => value != null && Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString("zh-CN") + "元" : "--";
      const revenueText = value => value != null && Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString("zh-CN") : "--";
      let laggingTotal = 0;
      Object.keys(regionMap).sort().forEach(region => {
        // 月履约率、年框履约率任一低于 100% 即纳入落后总商。
        const lagging = regionMap[region].filter(r =>
          (r.fr != null && !isNaN(r.fr) && r.fr < 1) ||
          (r.projectFrFull != null && !isNaN(r.projectFrFull) && r.projectFrFull < 1)
        );
        if (lagging.length === 0) return;
        laggingTotal += lagging.length;

        lines.push("**" + region + "**（落后总商" + lagging.length + "个）", "");
        const diningRows = lagging.filter(r => bizLabel(r.biz) === "到餐");
        const deliveryRows = lagging.filter(r => bizLabel(r.biz) === "外卖");
        const appendBusinessTable = (bizName, bizRows) => {
          if (bizRows.length === 0) return;
          lines.push(
            bizName + "：",
            "| 总商 | 城市数 | 月广告收入 | 月履约率 | 日均差额 | 年框履约率 | 年框月均差额 |",
            "| --- | --- | --- | --- | --- | --- | --- |"
          );
          bizRows.forEach(r => {
            const dailyGap = r.gap != null && r.gap > 0 ? r.gap / remainDays : 0;
            const monthlyGap = r.totalGap != null && r.totalGap > 0 ? r.totalGap / remainMonthsOf(r.lastMonth) : 0;
            lines.push("| " + r.gm + " | " + (r.cityCount ?? "--") + " | " + revenueText(r.revenue) + " | " + pctText(r.fr) + " | " + amountText(dailyGap) + " | " + pctText(r.projectFrFull) + " | " + amountText(monthlyGap) + " |");
          });
        };
        appendBusinessTable("到餐", diningRows);
        if (diningRows.length > 0 && deliveryRows.length > 0) lines.push("");
        appendBusinessTable("外卖", deliveryRows);
        // 不同区域之间用一个空行分隔。
        lines.push("");
      });
      if (laggingTotal === 0) {
        alert("✅ 当前没有履约率落后的总商，无需推送区域履约提醒。");
        return;
      }
      lines.push("数据来源：广告业绩达成系统·年框总商看板");

      // 3. Demo：不发送，仅提示
      alert("【Demo】区域履约提醒推送功能未接入，共涉及 " + laggingTotal + " 个落后总商。");
    } catch (error) {
      console.error("区域履约提醒推送失败", error);
      alert("⚠️ 区域履约提醒推送失败：" + (error?.message || "未知错误"));
    } finally {
      setPushingRegionPerformance(false);
    }
  };

  const handlePushAll = async () => { alert("Demo: 全部推送占位"); };

  const COLS = [
    { key: "biz",        label: "业务线",      align: "left" },
    { key: "owner",      label: "负责大区",     align: "left" },
    { key: "gm",         label: "总商",         align: "left" },
    { key: "bigArea",    label: "大区",         align: "left" },
    { key: "region",     label: "区域",         align: "left" },
    { key: "city",       label: "城市",         align: "left" },
    { key: "profitTier", label: "分润档位",     align: "right" },
    { key: "yoyGrowthRate", label: "签框YoY增幅", align: "right" },  // 0.05 → 5%
    { key: "firstMonth", label: "签约首月",     align: "left" },
    { key: "lastMonth",  label: "签约末月",     align: "left" },
    { key: "frameTarget",   label: "年框总目标(元)",   align: "right" },
    { key: "projectFrFull", label: "年框总履约率", align: "right" },
    { key: "projTarget", label: "YTD广告目标(元)",       align: "right" },
    { key: "projectFr", label: "YTD履约率",        align: "right" },
    { key: "totalGap",  label: "YTD目标差额(元)",          align: "right" },
    { key: "gtv",        label: "GTV(元)",      align: "right" },
    { key: "revenue",    label: "广告收入(元)", align: "right" },
    { key: "mr",         label: "MR(%)",        align: "right" },
    { key: "mrYoy",      label: "MR YoY(pp)",   align: "right" },
    { key: "target",     label: "广告目标(元)", align: "right" },
    { key: "fr",         label: "月度履约率",           align: "right" },
    { key: "gap",        label: "月目标差额(元)",       align: "right" },
  ];
  const DATA_COLS = ["frameTarget", "projectFrFull", "projTarget", "projectFr", "totalGap", "gtv", "revenue", "mr", "mrYoy", "target", "fr", "gap"];
  const INFO_COLS_KEYS = ["biz", "owner", "gm", "bigArea", "region", "city", "profitTier", "yoyGrowthRate", "firstMonth", "lastMonth"];

  // 总商看板列定义（去掉大区/区域/城市，加城市数）
  const GM_INFO_KEYS = ["biz", "owner", "gm", "cityCount", "profitTier", "yoyGrowthRate", "firstMonth", "lastMonth"];
  const GM_COLS = [
    { key: "biz",        label: "业务线",      align: "left" },
    { key: "owner",      label: "负责大区",     align: "left" },
    { key: "gm",         label: "总商",         align: "left" },
    { key: "cityCount",  label: "城市数",       align: "right" },
    { key: "profitTier", label: "分润档位",     align: "right" },
    { key: "yoyGrowthRate", label: "签框YoY增幅", align: "right" },
    { key: "firstMonth", label: "签约首月",     align: "left" },
    { key: "lastMonth",  label: "签约末月",     align: "left" },
    ...COLS.filter(c => DATA_COLS.includes(c.key)),
    { key: "warnCount",  label: "月目标累计警告次数", align: "right" },
  ];
// 总商看板数据列 = 共享数据列 + 总商专属 warnCount（保持表头/数据行同步）
const GM_DATA_COLS = [...DATA_COLS, "warnCount"];

// 冻结列配置：从左侧起冻结列（left 偏移 = 前序列宽度累加），固定宽度保证 sticky left 偏移精确
// 桌面端冻结 业务线/负责大区/总商 三列；移动端仅冻结 业务线/总商 两列并收窄，避免占满屏宽
const NK_PIN_WIDTH = isNkMobile
  ? { biz: 44, gm: 96 }
  : { biz: 64, owner: 84, gm: 150 };
const NK_PIN_LEFT  = isNkMobile
  ? { biz: 0, gm: 44 }
  : { biz: 0, owner: 64, gm: 148 };

  // 当前月、业务线过滤后的 GM 列表（只显示当月有 target 记录的行）
  const m = curMonth;
  const filteredItems = allGMItems.filter(item => {
    const r = idx[`${item.biz}__${item.shortName}__${item.city}__${m}`];
    if (!r || r.target == null) return false;
    if (activeBiz !== "全部" && item.biz !== activeBiz) return false;
    if (gmFilter) return item.shortName === gmFilter.shortName;
    if (gmSearch) return item.shortName.includes(gmSearch) || item.biz.includes(gmSearch) || (item.city && item.city.includes(gmSearch));
    return true;
  });

  // 城市明细表排序：文本列按字典序，数值列按大小，空值置底；未选择排序列时保持原始顺序
  const CITY_TEXT_KEYS = ["biz", "owner", "gm", "bigArea", "region", "city", "firstMonth", "lastMonth"];
  const cityCellValue = (item, key) => {
    if (key === "gm") return item.shortName;
    if (INFO_COLS_KEYS.includes(key)) return item[key];
    const r = idx[`${item.biz}__${item.shortName}__${item.city}__${m}`];
    return r ? r[key] : null;
  };
  const sortedItems = citySortKey == null ? filteredItems : [...filteredItems].sort((a, b) =>
    compareSortable(cityCellValue(a, citySortKey), cityCellValue(b, citySortKey), citySortAsc, CITY_TEXT_KEYS.includes(citySortKey))
  );

  // 总商聚合：按 biz+shortName 分组
  // 仅在「总商看板」视图激活时才计算，避免在「城市明细表」视图下做无谓的聚合运算
  const gmAggMap = {};
  if (nkView === "gm") filteredItems.forEach(item => {
    const r = idx[`${item.biz}__${item.shortName}__${item.city}__${m}`];
    if (!r) return;
    const gkey = `${item.biz}__${item.shortName}`;
    if (!gmAggMap[gkey]) {
      gmAggMap[gkey] = {
        biz: item.biz, owner: item.owner, gm: item.shortName,
        firstMonth: item.firstMonth, lastMonth: item.lastMonth,
        cityCount: 0, sumGtv: 0, sumRev: 0, sumTgt: 0,
        sumProjTgt: 0, lyGtv: 0, lyRev: 0,
        sumCurPaceTgt: 0, sumYtdPaceTgt: 0, sumYtdRev: 0,
        sumFrameTgt: 0, sumFullPaceTgt: 0, sumFullRev: 0,
        cities: [],
      };
    }
    const g = gmAggMap[gkey];
    g.cityCount++;
    // 记录该总商负责的城市明细（供“城市数”点击查看）
    g.cities.push({
      bigArea: item.bigArea, region: item.region, city: item.city,
      gtv: parseFloat(r.gtv) || 0, revenue: parseFloat(r.revenue) || 0,
      fr: r.fr, projectFr: r.projectFr,
    });
    g.sumGtv += parseFloat(r.gtv) || 0;
    g.sumRev += parseFloat(r.revenue) || 0;
    g.sumTgt += parseFloat(r.target) || 0;
    const lyRow = lyBizCityMaxState[`${item.biz}__${item.city}`];
    if (lyRow) { g.lyGtv += parseFloat(lyRow.gtv) || 0; g.lyRev += parseFloat(lyRow.ad_revenue) || 0; }
    if (r.projTarget != null && r.projTarget > 0) g.sumProjTgt += parseFloat(r.projTarget) || 0;
    // pace 口径累加：折算目标（分母）与 YTD 达成（分子）在城市间线性可加
    g.sumCurPaceTgt += (r._curPaceTgt != null ? r._curPaceTgt : 0);
    g.sumYtdPaceTgt += (r._ytdPaceTgt != null ? r._ytdPaceTgt : 0);
    g.sumYtdRev     += (r._ytdRev != null ? r._ytdRev : 0);
    // 跨年全量口径累加（城市项目履约率 + 年框总目标）
    g.sumFrameTgt    += (r._frameTgt != null ? r._frameTgt : 0);
    g.sumFullPaceTgt += (r._fullYtdPaceTgt != null ? r._fullYtdPaceTgt : 0);
    g.sumFullRev     += (r._fullYtdRev != null ? r._fullYtdRev : 0);
    if (item.firstMonth && (!g.firstMonth || item.firstMonth < g.firstMonth)) g.firstMonth = item.firstMonth;
    if (item.lastMonth && (!g.lastMonth || item.lastMonth > g.lastMonth)) g.lastMonth = item.lastMonth;
    // 分润档位：同一总商下各城市理论上一致，去重收集；若确有多档则展示区间
    if (r && r.profitTier != null) {
      if (!g.tierSet) g.tierSet = new Set();
      g.tierSet.add(r.profitTier);
    }
    // 签框YoY增幅：同理去重收集
    if (r && r.yoyGrowthRate != null && !isNaN(r.yoyGrowthRate)) {
      if (!g.yoySet) g.yoySet = new Set();
      g.yoySet.add(r.yoyGrowthRate);
    }
  });
  const gmRows = Object.values(gmAggMap).map(g => {
    const mr = g.sumGtv > 0 ? g.sumRev / g.sumGtv * 100 : null;
    const lyMr = g.lyGtv > 0 ? g.lyRev / g.lyGtv * 100 : null;
    return {
      biz: g.biz, owner: g.owner, gm: g.gm,
      firstMonth: g.firstMonth, lastMonth: g.lastMonth, cityCount: g.cityCount,
      // 单一档位直接给数值；存在多个不同档位时给区间字符串，避免误导
      profitTier: (() => {
        const ts = g.tierSet ? [...g.tierSet] : [];
        if (ts.length === 0) return null;
        if (ts.length === 1) return ts[0];
        return ts.join(" / ");
      })(),
      yoyGrowthRate: (() => {
        const ys = g.yoySet ? [...g.yoySet].sort((a, b) => a - b) : [];
        if (ys.length === 0) return null;
        if (ys.length === 1) return ys[0];
        return `${(ys[0] * 100).toFixed(0)}%~${(ys[ys.length - 1] * 100).toFixed(0)}%`;
      })(),
      gtv: g.sumGtv, revenue: g.sumRev,
      mr, mrYoy: (mr !== null && lyMr !== null) ? mr - lyMr : null,
      target: g.sumTgt,
      // 月度 pace 口径：分母 = Σ月度折算目标，分子 = Σ当月MTD收入
      fr: g.sumCurPaceTgt > 0 ? g.sumRev / g.sumCurPaceTgt : null,
      gap: g.sumCurPaceTgt > 0 ? Math.max(0, g.sumCurPaceTgt - g.sumRev) : null,
      frameTarget: g.sumFrameTgt > 0 ? g.sumFrameTgt : null,
      // 城市项目履约率（跨年全量口径）：分母 = Σ全量YTD折算目标，分子 = Σ全量YTD达成
      projectFrFull: g.sumFullPaceTgt > 0 ? g.sumFullRev / g.sumFullPaceTgt : null,
      projTarget: g.sumProjTgt > 0 ? g.sumProjTgt : null,
      // YTD pace 口径：分母 = ΣYTD折算目标，分子 = ΣYTD达成
      projectFr: g.sumYtdPaceTgt > 0 ? g.sumYtdRev / g.sumYtdPaceTgt : null,
      totalGap: g.sumYtdPaceTgt > 0 ? Math.max(0, g.sumYtdPaceTgt - g.sumYtdRev) : null,
      warnCount: gmWarnState[`${g.biz}__${g.gm}`] || 0,
      warnDetail: gmWarnDetailState[`${g.biz}__${g.gm}`] || [],
      cities: g.cities,
    };
  });

  // 总商看板排序：文本列按拼音/字典序，其余按数值；空值始终排在末尾
  const GM_TEXT_KEYS = ["biz", "owner", "gm", "firstMonth", "lastMonth"];
  const sortedGmRows = [...gmRows].sort((a, b) =>
    compareSortable(a[gmSortKey], b[gmSortKey], gmSortAsc, GM_TEXT_KEYS.includes(gmSortKey))
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        <p className="mt-4 text-sm text-gray-400">数据量较大，预计还需 <span className="font-semibold text-indigo-500">{countdown}</span> 秒</p>
      </div>
    );
  }

  // KPI 汇总（按当前 biz 过滤，只含当月有 target 记录的行）
  const kpiItems = allGMItems.filter(item => {
    const r = idx[`${item.biz}__${item.shortName}__${item.city}__${m}`];
    if (!r || r.target == null) return false;
    return activeBiz === "全部" || item.biz === activeBiz;
  });
  const kpiEntries = kpiItems.map(({ biz, shortName, city }) => idx[`${biz}__${shortName}__${city}__${m}`]).filter(Boolean);
  const sumGtv = kpiEntries.reduce((s, r) => s + (parseFloat(r.gtv) || 0), 0);
  const sumRev = kpiEntries.reduce((s, r) => s + (parseFloat(r.revenue) || 0), 0);
  const sumTgt = kpiEntries.reduce((s, r) => s + (parseFloat(r.target) || 0), 0);
  const sumProjTgtT   = kpiEntries.reduce((s, r) => s + (r.projTarget != null ? parseFloat(r.projTarget) || 0 : 0), 0);
  const sumCurPaceT   = kpiEntries.reduce((s, r) => s + (r._curPaceTgt != null ? r._curPaceTgt : 0), 0);
  const sumYtdPaceT   = kpiEntries.reduce((s, r) => s + (r._ytdPaceTgt != null ? r._ytdPaceTgt : 0), 0);
  const sumYtdRevT    = kpiEntries.reduce((s, r) => s + (r._ytdRev != null ? r._ytdRev : 0), 0);
  const sumFrameTgtT   = kpiEntries.reduce((s, r) => s + (r._frameTgt != null ? r._frameTgt : 0), 0);
  const sumFullPaceT   = kpiEntries.reduce((s, r) => s + (r._fullYtdPaceTgt != null ? r._fullYtdPaceTgt : 0), 0);
  const sumFullRevT    = kpiEntries.reduce((s, r) => s + (r._fullYtdRev != null ? r._fullYtdRev : 0), 0);
  const total = {
    gtv:     sumGtv > 0 ? sumGtv : null,
    revenue: sumRev > 0 ? sumRev : null,
    target:  sumTgt > 0 ? sumTgt : null,
    mr:      sumGtv > 0 ? sumRev / sumGtv * 100 : null,
    fr:      sumCurPaceT > 0 ? sumRev / sumCurPaceT : null,
    gap:     sumCurPaceT > 0 ? Math.max(0, sumCurPaceT - sumRev) : null,
    frameTarget:   sumFrameTgtT > 0 ? sumFrameTgtT : null,
    projectFrFull: sumFullPaceT > 0 ? sumFullRevT / sumFullPaceT : null,
    projTarget: sumProjTgtT > 0 ? sumProjTgtT : null,
    projectFr:  sumYtdPaceT > 0 ? sumYtdRevT / sumYtdPaceT : null,
    totalGap:   sumYtdPaceT > 0 ? Math.max(0, sumYtdPaceT - sumYtdRevT) : null,
  };

  const lyKpiEntries = kpiItems.map(({ biz, city }) => lyBizCityMaxState[`${biz}__${city}`]).filter(Boolean);
  const lySumGtv = lyKpiEntries.reduce((s, r) => s + (parseFloat(r.gtv) || 0), 0);
  const lySumRev = lyKpiEntries.reduce((s, r) => s + (parseFloat(r.ad_revenue) || 0), 0);
  const lyMr = lySumGtv > 0 ? lySumRev / lySumGtv * 100 : null;
  const mrYoy = (total.mr !== null && lyMr !== null) ? (total.mr - lyMr) : null;

  // ── 计算年框汇总（供 AI 智能分析使用），不受当前 activeBiz 过滤影响 ──
  // 全量条目（当月有 target 记录），不受 activeBiz 过滤
  const nkAllEntries = allGMItems
    .map(item => idx[`${item.biz}__${item.shortName}__${item.city}__${m}`])
    .filter(r => r && r.target != null);
  let nkSummaryObj = null;
  if (nkAllEntries.length > 0) {
    const allGtv = nkAllEntries.reduce((s, r) => s + (parseFloat(r.gtv) || 0), 0);
    const allRev = nkAllEntries.reduce((s, r) => s + (parseFloat(r.revenue) || 0), 0);
    const allCurPace = nkAllEntries.reduce((s, r) => s + (r._curPaceTgt != null ? r._curPaceTgt : 0), 0);
    const allMr = allGtv > 0 ? allRev / allGtv * 100 : null;
    const allFr = allCurPace > 0 ? allRev / allCurPace * 100 : null;
    // 按业务线拆分
    const bizAgg = {};
    allGMItems.forEach(item => {
      const r = idx[`${item.biz}__${item.shortName}__${item.city}__${m}`];
      if (!r || r.target == null) return;
      const b = bizAgg[item.biz] || (bizAgg[item.biz] = { gtv: 0, rev: 0, curPace: 0, cities: new Set(), gms: new Set() });
      b.gtv += parseFloat(r.gtv) || 0;
      b.rev += parseFloat(r.revenue) || 0;
      b.curPace += r._curPaceTgt != null ? r._curPaceTgt : 0;
      b.cities.add(item.city);
      b.gms.add(item.shortName);
    });
    const bizList = Object.entries(bizAgg).map(([biz, b]) => ({
      biz,
      revenueWan: +(b.rev / 10000).toFixed(1),
      gtvWan: +(b.gtv / 10000).toFixed(1),
      mr: b.gtv > 0 ? +(b.rev / b.gtv * 100).toFixed(2) : null,
      fr: b.curPace > 0 ? +(b.rev / b.curPace * 100).toFixed(1) : null,
      cityCount: b.cities.size,
      gmCount: b.gms.size,
    }));
    // Top 总商（全量，按收入）
    const topGms = [...gmRows]
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 8)
      .map(g => ({
        gm: g.gm, biz: g.biz, owner: g.owner,
        revenueWan: +((g.revenue || 0) / 10000).toFixed(1),
        cityCount: g.cityCount,
        mr: g.mr != null ? +g.mr.toFixed(2) : null,
        fr: g.fr != null ? +(g.fr * 100).toFixed(1) : null,
      }));
    nkSummaryObj = {
      overallRevWan: overallRev,
      totalRevenueWan: +(allRev / 10000).toFixed(1),
      totalGtvWan: +(allGtv / 10000).toFixed(1),
      avgMr: allMr != null ? +allMr.toFixed(2) : null,
      mrYoy: mrYoy != null ? +mrYoy.toFixed(2) : null,
      monthlyFr: allFr != null ? +allFr.toFixed(1) : null,
      gmCount: gmRows.length,
      cityCount: nkAllEntries.length,
      bizList,
      topGms,
    };
  }
  // 将最新汇总存入 ref，供顶层无条件 effect 上报（避免在早返回后调用 hook）
  nkSummaryRef.current = nkSummaryObj;

  // 单选外卖/到餐时，在最左侧展示该业务线整体广告收入（daily_revenue MTD 合计）
const singleBizOverall = (activeBiz === "外卖" || activeBiz === "到餐") ? overallRev[activeBiz] : null;
// 整体广告收入卡片标签：外卖=CKA+城商总收入，到餐=不含激励金总收入
const overallRevLabel = activeBiz === "外卖" ? "CKA+城商总收入" : activeBiz === "到餐" ? "不含激励金总收入" : "整体广告收入";
const KPI_CARDS = [
...(singleBizOverall != null ? [{
label: overallRevLabel,
      value: (parseFloat(singleBizOverall) / 10000).toFixed(1) + " 万",
      color: "border-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700",
    }] : []),
    { label: "年框总广告收入", value: total.revenue == null ? "--" : (parseFloat(total.revenue) / 10000).toFixed(1) + " 万", color: "border-blue-500",    bg: "bg-blue-50",    text: "text-blue-700" },
    { label: "总GTV",         value: total.gtv == null ? "--" : (parseFloat(total.gtv) / 10000).toFixed(1) + " 万",     color: "border-cyan-500",    bg: "bg-cyan-50",    text: "text-cyan-700" },
    { label: "平均MR",        value: fmtMr(total.mr),                                               color: "border-violet-500",  bg: "bg-violet-50",  text: "text-violet-700" },
    { label: "MR YoY",        value: mrYoy !== null ? (mrYoy >= 0 ? "+" : "") + mrYoy.toFixed(2) + "pp" : "--", color: "border-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
    { label: "整体月度履约率", value: fmtFr(total.fr),                                               color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  ];

  // 下拉搜索选项：按总商名称（shortName）去重——同一总商即使跨业务线/多城市也只出现一次
  const gmSearchOptions = (() => {
    const seen = new Set();
    const opts = [];
    allGMItems.forEach(item => {
      if (activeBiz !== "全部" && item.biz !== activeBiz) return;
      const match = !gmSearch || item.shortName.includes(gmSearch) || item.biz.includes(gmSearch) || (item.owner && item.owner.includes(gmSearch)) || (item.bigArea && item.bigArea.includes(gmSearch)) || (item.region && item.region.includes(gmSearch));
      if (!match) return;
      if (seen.has(item.shortName)) return;
      seen.add(item.shortName);
      // 记录该总商涉及的业务线（用于下拉里展示标签）
      const bizList = Array.from(new Set(allGMItems.filter(x => x.shortName === item.shortName).map(x => x.biz)));
      opts.push({ shortName: item.shortName, owner: item.owner, bizList });
    });
    return opts;
  })();

  const downloadTemplate = () => { alert("【Demo】模板下载未接入，仅演示界面"); };
  const closeUpload = () => {
    setUploadOpen(false);
    setUploadStep("select");
    setUploadParsing(false);
  };
  const handleUploadFile = (e) => {
    e.preventDefault();
    setUploadParsing(true);
    setTimeout(() => {
      setUploadParsing(false);
      alert("【Demo】数据上传未接入，仅演示界面");
    }, 600);
  };
  const handleUploadConfirm = async () => {
    alert("【Demo】数据上传未接入，仅演示界面");
  };
  const getPreviewData = () => uploadParsedRows.slice(0, 20);
  const handleDownloadNK = () => { alert("Demo: 下载Excel占位"); };

  return (
    <div className="space-y-4">
      {/* KPI 汇总卡片 */}
      <div className={`grid gap-3 grid-cols-2 md:grid-cols-3 ${KPI_CARDS.length === 6 ? "xl:grid-cols-6" : "xl:grid-cols-5"}`}>
        {KPI_CARDS.map(k => (
          <div key={k.label} className={`bg-white rounded-xl shadow-sm p-3 border-l-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-default ${k.color}`}>
            <div className="text-xs text-gray-500 mb-1">{k.label}</div>
            <div className={`text-lg font-bold ${k.text}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* 数据表格 */}
      <div className="shadow-sm rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-white rounded-t-2xl border-b border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">{nkView === "city" ? "年框城市明细" : "年框总商看板"}</span>
            <div className="flex items-center gap-1">
              {["全部", ...NK_BIZ_LIST].map(biz => (
                <button
                  key={biz}
                  onClick={() => { setActiveBiz(biz); setGmFilter(null); setGmSearch(""); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeBiz === biz
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {biz}
                </button>
              ))}
            </div>
            <div className="relative flex-shrink-0" style={{ minWidth: 140 }}>
              <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1 bg-white gap-1">
                <input
                  type="text"
                  value={gmFilter ? gmFilter.shortName : gmSearch}
                  onChange={e => { setGmSearch(e.target.value); setGmFilter(null); }}
                  placeholder="筛选总商…"
                  className="text-xs text-gray-700 outline-none flex-1 bg-transparent w-20"
                />
                {(gmFilter || gmSearch) && (
                  <button onClick={() => { setGmFilter(null); setGmSearch(""); }} className="text-gray-400 hover:text-gray-600 text-xs leading-none">✕</button>
                )}
              </div>
              {gmSearch && !gmFilter && gmSearchOptions.length > 0 && (
                <div className="absolute z-[100] top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {gmSearchOptions.map(item => (
                  <div
                    key={item.shortName}
                    className="px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                    onClick={() => { setGmFilter({ shortName: item.shortName }); setGmSearch(""); }}
                  >
                    {item.bizList.map(b => (
                      <span key={b} className={`px-1.5 py-0.5 rounded text-xs font-medium ${NK_BIZ_COLORS[b] || "bg-gray-100 text-gray-600"}`}>{b}</span>
                    ))}
                    {item.shortName}
                  </div>
                ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
{[{ key: "gm", label: "总商看板" }, { key: "city", label: "城市明细表" }].map(v => (
<button key={v.key} onClick={() => setNkView(v.key)} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${nkView === v.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{v.label}</button>
))}
</div>
<button onClick={downloadTemplate} title="下载带必填项标色的年框目标上传模板" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors shadow-sm">⤓ 下载模板</button>
<button onClick={() => { setUploadStep("select"); setUploadOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors shadow-sm">↑ 上传年框目标</button>
          </div>
          <div className="flex items-center gap-2">
            {/* 列筛选 */}
            <div className="relative" ref={colPanelRef}>
              <button onClick={() => setColPanelOpen(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors border border-gray-200">
                列筛选
              </button>
              {colPanelOpen && (
                <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[180px]">
                  <p className="text-xs font-semibold text-gray-500 mb-2">显示/隐藏列</p>
                  {DATA_COLS.map(ck => {
                    const col = COLS.find(c => c.key === ck);
                    return (
                      <label key={ck} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                        <input
                          type="checkbox"
                          checked={visibleCols.has(ck)}
                          onChange={() => {
                            setVisibleCols(prev => {
                              const next = new Set(prev);
                              if (next.has(ck)) next.delete(ck); else next.add(ck);
                              return next;
                            });
                          }}
                          className="accent-indigo-500"
                        />
                        <span className="text-xs text-gray-700">{col?.label || ck}</span>
                      </label>
                    );
                  })}
                  {nkView === "gm" && (
                    <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                      <input
                        type="checkbox"
                        checked={visibleCols.has("warnCount")}
                        onChange={() => {
                          setVisibleCols(prev => {
                            const next = new Set(prev);
                            if (next.has("warnCount")) next.delete("warnCount"); else next.add("warnCount");
                            return next;
                          });
                        }}
                        className="accent-indigo-500"
                      />
                      <span className="text-xs text-gray-700">月目标累计警告次数</span>
                    </label>
                  )}
                </div>
              )}
            </div>
            <button onClick={handleDownloadNK} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">下载Excel</button>
                      </div>

          {/* 城市数点击 → 城市列表弹窗 */}
          {cityListModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{background: 'rgba(0,0,0,0.4)'}} onClick={() => setCityListModal(null)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium mr-2 ${NK_BIZ_COLORS[cityListModal.biz] || "bg-gray-100 text-gray-600"}`}>{cityListModal.biz}</span>
                      {cityListModal.gm} · 负责城市（{cityListModal.cities.length}）
                    </p>
                  </div>
                  <button onClick={() => setCityListModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600">大区</th>
                        <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600">区域</th>
                        <th className="py-2 px-4 text-left text-xs font-semibold text-gray-600">城市</th>
                        <th className="py-2 px-4 text-right text-xs font-semibold text-gray-600">MTD广告收入(元)</th>
                        <th className="py-2 px-4 text-right text-xs font-semibold text-gray-600">月度履约率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cityListModal.cities.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).map((c, i) => (
                        <tr key={`${c.city}__${i}`} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                          <td className="py-2 px-4 text-xs text-gray-600">{c.bigArea || "--"}</td>
                          <td className="py-2 px-4 text-xs text-gray-600">{c.region || "--"}</td>
                          <td className="py-2 px-4 text-xs font-medium text-gray-800">{c.city}</td>
                          <td className="py-2 px-4 text-xs text-right text-gray-700 tabular-nums">{c.revenue != null ? parseFloat(c.revenue).toFixed(0) : "--"}</td>
                          <td className="py-2 px-4 text-xs text-right text-gray-700">{fmtFr(c.fr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 上传数据弹窗 */}
          {uploadOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{background: 'rgba(0,0,0,0.4)'}}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
                {/* 弹窗头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800">上传年框月度目标数据</h3>
                  <button onClick={closeUpload} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                </div>

                <div className="px-6 py-4 overflow-y-auto flex-1">
                  {/* Step 1: 选择文件 */}
{uploadStep === "select" && (
<div className="text-center py-8">
<div className="text-4xl mb-3">📁</div>
<p className="text-sm text-gray-600 mb-1">支持 .xlsx / .xls / .csv 格式</p>
<p className="text-xs text-gray-400 mb-5">系统会自动识别表头并匹配数据库字段</p>
{uploadParsing ? (
<div className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-100 text-indigo-600 rounded-xl text-sm font-semibold shadow-sm cursor-wait">
<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
解析中，请稍候…
</div>
) : (
<label className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors cursor-pointer shadow-sm">
选择文件
<input ref={uploadFileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleUploadFile} className="hidden" />
</label>
)}
                      <div className="mt-6 text-left bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-600 mb-2">目标表字段说明：</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {TARGET_FIELDS.map(f => (
                            <span key={f.key} className="text-xs text-gray-500">
                              {f.required ? <span className="text-red-400 mr-0.5">*</span> : null}
                              {f.label} ({f.key})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: 字段映射 */}
                  {uploadStep === "mapping" && (
                    <div>
                      {uploadWideFormat && (
                        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                          <span className="text-sm">🔄</span>
                          <span className="text-xs text-amber-700">检测到宽表格式（月份为横向列），已自动展开为 <span className="font-semibold">{uploadParsedRows.length}</span> 行长表数据</span>
                        </div>
                      )}
                      {uploadAnalyzing && (
                        <div className="mb-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-500" />
                          <span className="text-xs text-indigo-700">AI 正在智能分析字段，请稍候…</span>
                        </div>
                      )}
                      {!uploadAnalyzing && uploadAiFields.length > 0 && (
                        <div className="mb-3 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                          <span className="text-sm">✨</span>
                          <span className="text-xs text-purple-700">AI 补充识别了 <span className="font-semibold">{uploadAiFields.length}</span> 个字段，请务必核对后再上传</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3">已解析 <span className="font-semibold text-indigo-600">{uploadParsedRows.length}</span> 行数据，请确认字段映射（自动识别，可手动修改）：</p>
                      <div className="grid grid-cols-1 gap-2">
                        {TARGET_FIELDS.map(f => {
                          const isAutoWide = uploadWideFormat && (f.key === "month" || f.key === "monthly_target");
                          return (
                          <div key={f.key} className="flex items-center gap-3 py-1.5">
                            <span className="text-xs font-medium text-gray-700 w-24 shrink-0">
                              {f.required && <span className="text-red-400 mr-0.5">*</span>}
                              {f.label}
                            </span>
                            <span className="text-xs text-gray-400 w-5">→</span>
                            {isAutoWide ? (
                              <span className="flex-1 text-xs px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-700">✓ 已从宽表月份列自动识别</span>
                            ) : (
                            <select
                              value={uploadMapping[f.key] || ""}
                              onChange={e => setUploadMapping(prev => ({ ...prev, [f.key]: e.target.value || undefined }))}
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                              <option value="">-- 不映射 --</option>
                              {uploadHeaders.filter(h => h && !h.startsWith("__")).map((h, idx) => (
                                <option key={h + idx} value={h}>{h}</option>
                              ))}
                            </select>
                            )}
                            {!isAutoWide && uploadMapping[f.key] && !uploadAiFields.includes(f.key) && <span className="text-green-500 text-xs">✓</span>}
                            {!isAutoWide && uploadAiFields.includes(f.key) && <span className="text-purple-500 text-xs whitespace-nowrap" title="由 AI 补充识别，请核对">✨AI</span>}
                          </div>
                          );
                        })}
                      </div>
                      {/* 预览 */}
                      <div className="mt-4 border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">数据预览（共 {uploadParsedRows.length} 行）：</p>
                        <div className="overflow-auto max-h-72 border border-gray-100 rounded-lg">
                          <table className="text-xs border-collapse w-full">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-gray-50">
                                {TARGET_FIELDS.filter(f => uploadMapping[f.key]).map(f => (
                                  <th key={f.key} className="px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200 bg-gray-50">{f.label}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {getPreviewData().map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  {TARGET_FIELDS.filter(f => uploadMapping[f.key]).map(f => (
                                    <td key={f.key} className="px-2 py-1 text-gray-700 whitespace-nowrap border-b border-gray-100">{String(row[f.key] ?? '')}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end gap-3">
                        <button onClick={() => { setUploadStep("select"); setUploadParsedRows([]); setUploadHeaders([]); }} className="px-4 py-2 text-xs text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">重新选择</button>
                        <button
                          onClick={handleUploadConfirm}
                          disabled={uploadAnalyzing || !uploadMapping.city || (!uploadWideFormat && (!uploadMapping.month || !uploadMapping.monthly_target))}
                          className="px-5 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          {uploadAnalyzing ? "分析中…" : `确认上传 (${uploadParsedRows.length} 行)`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: 上传中 */}
                  {uploadStep === "uploading" && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">正在上传数据...</p>
                    </div>
                  )}

                  {/* Step 4: 完成 */}
                  {uploadStep === "done" && uploadResult && (() => {
                    const skipped = uploadResult.skipped || [];
                    const hasProblem = uploadResult.failed > 0 || skipped.length > 0;
                    return (
                    <div className="py-6">
                      <div className="text-center">
                        <div className="text-4xl mb-3">{!hasProblem ? '✅' : '⚠️'}</div>
                        <p className="text-base font-semibold text-gray-800 mb-2">上传完成</p>
                        <p className="text-sm text-gray-600">
                          解析出 {uploadResult.rawTotal ?? uploadResult.total} 条记录，
                          成功 <span className="text-green-600 font-semibold">{uploadResult.success}</span> 条
                          {uploadResult.failed > 0 && <span>，失败 <span className="text-red-500 font-semibold">{uploadResult.failed}</span> 条</span>}
                          {uploadResult.skippedRows > 0 && <span>，跳过 <span className="text-amber-600 font-semibold">{uploadResult.skippedRows}</span> 条</span>}
                        </p>
                      </div>

                      {uploadResult.errorMsg && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-left">
                          <p className="text-xs font-semibold text-red-700 mb-1">数据库返回错误</p>
                          <p className="text-xs text-red-600 break-all">{uploadResult.errorMsg}</p>
                        </div>
                      )}

                      {skipped.length > 0 && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden text-left">
                          <div className="px-4 py-2.5 bg-amber-100/70 border-b border-amber-200 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-amber-800">
                              以下 {skipped.length} 处因必填项缺失被跳过
                              {uploadResult.skippedRows > skipped.length && `（共 ${uploadResult.skippedRows} 条记录）`}
                            </span>
                            <button
                              onClick={() => {
                                const txt = skipped.map(s =>
                                  `第${s.row}行：缺少 ${s.missing.join("、")}` +
                                  (s.months && s.months.length ? `（影响 ${s.months.length} 个月：${s.months.join("、")}）` : "")
                                ).join("\n");
                                navigator.clipboard?.writeText(txt);
                              }}
                              className="text-[11px] px-2 py-1 rounded-lg bg-white/80 text-amber-700 hover:bg-white transition-colors border border-amber-300 flex-shrink-0"
                            >复制清单</button>
                          </div>
                          <div className="max-h-52 overflow-y-auto divide-y divide-amber-100">
                            {skipped.slice(0, 200).map((s, i) => (
                              <div key={i} className="px-4 py-2 flex items-start gap-3 text-xs">
                                <span className="font-mono font-semibold text-amber-800 flex-shrink-0 w-16">第 {s.row} 行</span>
                                <span className="flex-1 text-gray-600">
                                  缺少：<span className="text-red-600 font-medium">{s.missing.join("、")}</span>
                                  {s.city && <span className="text-gray-400 ml-2">（{s.city}）</span>}
                                  {s.months && s.months.length > 1 && (
                                    <span className="text-gray-400 ml-1">影响 {s.months.length} 个月</span>
                                  )}
                                  {s.months && s.months.length === 1 && (
                                    <span className="text-gray-400 ml-1">{s.months[0]}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                            {skipped.length > 200 && (
                              <div className="px-4 py-2 text-xs text-gray-400 text-center">仅显示前 200 条，其余请用「复制清单」查看</div>
                            )}
                          </div>
                          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
                            <p className="text-[11px] text-amber-700">行号对应 Excel 中的实际行（已计入表头行）。补全缺失字段后重新上传即可。</p>
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <button onClick={closeUpload} className="mt-5 px-6 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors shadow-sm">关闭</button>
                      </div>
                    </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
        {nkView === "city" && (
        <div className="bg-white rounded-b-2xl overflow-auto max-h-[70vh]">
        <table className="text-sm border-collapse w-max min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLS.filter(c => INFO_COLS_KEYS.includes(c.key) || visibleCols.has(c.key)).map(c => {
                const pin = NK_PIN_LEFT[c.key];
                const w = NK_PIN_WIDTH[c.key];
                const active = citySortKey === c.key;
                return (
                <th
                  key={c.key}
                  onClick={() => { if (citySortKey === c.key) setCitySortAsc(!citySortAsc); else { setCitySortKey(c.key); setCitySortAsc(false); } }}
                  title="点击排序"
                  className={`py-2 sm:py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap sticky top-0 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors ${c.align === "right" ? "text-right" : "text-left"} ${active ? "text-indigo-700" : "text-gray-600"} ${pin != null ? "z-30 border-r border-gray-200" : "z-20"}`}
                  style={pin != null ? { left: pin, minWidth: w, maxWidth: w } : undefined}>
                  {c.label}{active ? (citySortAsc ? " ↑" : " ↓") : ""}
                </th>
              );})}
            </tr>
          </thead>
          <tbody>
            {!hasData ? (
              <tr>
                <td colSpan={COLS.length} className="py-8 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            ) : (
              sortedItems.map((item, ri) => {
                const r = idx[`${item.biz}__${item.shortName}__${item.city}__${m}`];
                const rowBg = ri % 2 === 0 ? "bg-white" : "bg-gray-50";
                return (
                  <tr key={`${item.biz}__${item.shortName}__${item.city}`} className={`border-b border-gray-50 ${rowBg} hover:bg-blue-50 transition-colors`}>
                    <td className={`py-2 px-1.5 sm:px-3 sticky left-0 z-10 ${rowBg}`} style={{ minWidth: NK_PIN_WIDTH.biz, maxWidth: NK_PIN_WIDTH.biz }}>
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${NK_BIZ_COLORS[item.biz] || "bg-gray-100 text-gray-600"}`}>{item.biz}</span>
                    </td>
                    <td className={`py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-600 ${isNkMobile ? "" : `sticky z-10 ${rowBg}`}`} style={isNkMobile ? undefined : { left: NK_PIN_LEFT.owner, minWidth: NK_PIN_WIDTH.owner, maxWidth: NK_PIN_WIDTH.owner }}>{item.owner || "--"}</td>
                    <td className={`py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs font-medium text-gray-700 sticky z-10 border-r border-gray-200 ${rowBg}`} style={{ left: NK_PIN_LEFT.gm, minWidth: NK_PIN_WIDTH.gm, maxWidth: NK_PIN_WIDTH.gm }}>{item.shortName}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-600">{item.bigArea || "--"}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-600">{item.region || "--"}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-600">{item.city}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs text-gray-600">{fmtProfitTier(r?.profitTier)}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs text-gray-600">{fmtYoyGrowthRate(r?.yoyGrowthRate)}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-500">{item.firstMonth || "--"}</td>
                    <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-500">{item.lastMonth  || "--"}</td>
                    {DATA_COLS.filter(ck => visibleCols.has(ck)).map(ck => (
                      <td key={ck} className="py-2 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs text-gray-600">{getCell(r, ck)}</td>
                    ))}
                  </tr>
                );
              })
            )}
            {/* 合计行 */}
            {(() => {
              const totalWithMrYoy2 = { ...total, mrYoy };
              return (
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold text-gray-800 sticky left-0 z-10 bg-gray-50 border-r border-gray-200" colSpan={INFO_COLS_KEYS.length}>合计</td>
                  {DATA_COLS.filter(ck => visibleCols.has(ck)).map(ck => (
                    <td key={ck} className="py-2.5 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs font-bold text-gray-800">
                      {hasData ? getCell(totalWithMrYoy2, ck) : "--"}
                    </td>
                  ))}
                </tr>
              );
            })()}
          </tbody>
        </table>
        </div>
        )}
        {nkView === "gm" && (
        <React.Fragment>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 bg-orange-50 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Send size={15} className="text-orange-500" />
            <span>推送区域履约提醒到群</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={regionPushGroupId}
              onChange={(event) => setRegionPushGroupId(event.target.value)}
              disabled={pushingRegionPerformance}
              aria-label="区域履约提醒推送群号"
              className="w-[130px] rounded-lg border border-orange-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 outline-none transition-colors focus:border-orange-400 focus:ring-1 focus:ring-orange-100 disabled:bg-gray-50"
            />
            <button
              type="button"
              onClick={handlePushRegionPerformance}
              disabled={pushingRegionPerformance}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${pushingRegionPerformance ? "cursor-wait bg-orange-200 text-orange-400" : "bg-orange-500 text-white hover:bg-orange-600"}`}
            >
              {pushingRegionPerformance ? "推送中…" : "立即推送"}
            </button>
          </div>
        </div>
        {(pushingAll || (!pushingAll && sortedGmRows && sortedGmRows.length > 0)) && (
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 border-t border-indigo-100 rounded-b-none">
            <div className="text-sm text-gray-700 font-medium">
              {pushingAll ? `正在推送 ${pushingAll.current}/${pushingAll.total}…` : `共 ${sortedGmRows.length} 个总商待推送`}
            </div>
            <button
              type="button"
              onClick={handlePushAll}
              disabled={!!pushingAll}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${pushingAll ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-indigo-500 text-white hover:bg-indigo-600"}`}
            >
              {pushingAll ? `推送中 ${pushingAll.current}/${pushingAll.total}` : "一键推送全部"}
            </button>
          </div>
        )}
        <div className="bg-white rounded-b-2xl overflow-auto max-h-[70vh]">
        <table className="text-sm border-collapse w-max min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {GM_COLS.filter(c => GM_INFO_KEYS.includes(c.key) || visibleCols.has(c.key)).map(c => {
                const pin = NK_PIN_LEFT[c.key];
                const w = NK_PIN_WIDTH[c.key];
                const active = gmSortKey === c.key;
                return (
                <th
                  key={c.key}
                  onClick={() => { if (gmSortKey === c.key) setGmSortAsc(!gmSortAsc); else { setGmSortKey(c.key); setGmSortAsc(false); } }}
                  title="点击排序"
                  className={`py-2 sm:py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap sticky top-0 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors ${c.align === "right" ? "text-right" : "text-left"} ${active ? "text-indigo-700" : "text-gray-600"} ${pin != null ? "z-30 border-r border-gray-200" : "z-20"}`}
                  style={pin != null ? { left: pin, minWidth: w, maxWidth: w } : undefined}>
                  {c.label}{active ? (gmSortAsc ? " ↑" : " ↓") : ""}
                </th>
              );})}
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap sticky top-0 bg-gray-50 z-20 text-center" style={{ minWidth: 76 }}>推送</th>
              <th className="py-2 sm:py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold whitespace-nowrap sticky top-0 bg-gray-50 z-20 text-center">群聊ID</th>
            </tr>
          </thead>
          <tbody>
            {!hasData || gmRows.length === 0 ? (
              <tr>
                <td colSpan={GM_COLS.filter(c => GM_INFO_KEYS.includes(c.key) || visibleCols.has(c.key)).length + 2} className="py-8 text-center text-sm text-gray-400">暂无数据</td>
              </tr>
            ) : (
              sortedGmRows.map((r, ri) => {
                const rowBg = ri % 2 === 0 ? "bg-white" : "bg-gray-50";
                const pushKey = `${r.biz}__${r.gm}`;
                const isPushing = pushingGm === pushKey;
                const buttonLabel = isPushing ? "推送中…" : "推送";
                const buttonClass = isPushing
                  ? "bg-gray-100 text-gray-400 cursor-wait"
                  : "bg-indigo-500 text-white hover:bg-indigo-600";
                return (
                <tr key={pushKey} className={`border-b border-gray-50 ${rowBg} hover:bg-blue-50 transition-colors`}>
                    <td className={`py-2 px-1.5 sm:px-3 sticky left-0 z-10 ${rowBg}`} style={{ minWidth: NK_PIN_WIDTH.biz, maxWidth: NK_PIN_WIDTH.biz }}>
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium ${NK_BIZ_COLORS[r.biz] || "bg-gray-100 text-gray-600"}`}>{r.biz}</span>
                    </td>
                    <td className={`py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-600 ${isNkMobile ? "" : `sticky z-10 ${rowBg}`}`} style={isNkMobile ? undefined : { left: NK_PIN_LEFT.owner, minWidth: NK_PIN_WIDTH.owner, maxWidth: NK_PIN_WIDTH.owner }}>{r.owner || "--"}</td>
                    <td className={`py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs font-medium text-gray-700 sticky z-10 border-r border-gray-200 ${rowBg}`} style={{ left: NK_PIN_LEFT.gm, minWidth: NK_PIN_WIDTH.gm, maxWidth: NK_PIN_WIDTH.gm }}>{r.gm}</td>
                  <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-right text-gray-600">
                    {r.cityCount > 0 && r.cities && r.cities.length > 0 ? (
                      <button
                        onClick={() => setCityListModal({ biz: r.biz, gm: r.gm, cities: r.cities })}
                        className="text-indigo-600 hover:text-indigo-800 font-medium underline decoration-dotted underline-offset-2 hover:bg-indigo-50 rounded px-1 transition-colors"
                        title="点击查看该总商负责的城市"
                      >
                        {r.cityCount}
                      </button>
                    ) : r.cityCount}
                  </td>
                  <td className="py-2 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs text-gray-600">{fmtProfitTier(r.profitTier)}</td>
                  <td className="py-2 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs text-gray-600">{fmtYoyGrowthRate(r.yoyGrowthRate)}</td>
                  <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-500">{r.firstMonth || "--"}</td>
                  <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-gray-500">{r.lastMonth || "--"}</td>
                  {GM_DATA_COLS.filter(ck => visibleCols.has(ck)).map(ck => {
                    if (ck === "warnCount") {
                      const wc = r.warnCount || 0;
                      return (
                        <td key={ck} className="py-2 px-3 text-right text-xs">
                          {wc > 0 ? (
                            <button
                              type="button"
                              onClick={() => { setWarnModalFull(false); setWarnModal({ biz: r.biz, gm: r.gm, owner: r.owner, firstMonth: r.firstMonth, lastMonth: r.lastMonth, warnCount: wc, detail: gmWarnDetailState[`${r.biz}__${r.gm}`] || [] }); }}
                              className="text-red-600 font-semibold underline decoration-dotted underline-offset-2 hover:text-red-700 cursor-pointer"
                            >
                              {wc}
                            </button>
                          ) : (
                            <span className="text-gray-600">{wc}</span>
                          )}
                        </td>
                      );
                    }
                    return (
                      <td key={ck} className="py-2 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs text-gray-600">{getCellGM(r, ck)}</td>
                    );
                  })}
                  <td className="py-2 px-1.5 sm:px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handlePushGm(r)}
                      disabled={isPushing}
                      className={`min-w-[64px] px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors ${buttonClass}`}
                    >
                      {buttonLabel}
                    </button>
                  </td>
                  <td className="py-2 px-1.5 sm:px-3 text-center">
                    <input
                      type="text"
                      value={gmGroupMap[r.gm] || "70639736780"}
                      onChange={(e) => setGmGroupMap(current => ({ ...current, [r.gm]: e.target.value }))}
                      className="w-[110px] rounded border border-gray-200 bg-white px-1.5 py-1 text-center text-[10px] sm:text-xs text-gray-500 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                    />
                  </td>
                </tr>
              );})
            )}
            {/* 合计行 */}
            {(() => {
              const totalWithMrYoy2 = { ...total, mrYoy };
              return (
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-2.5 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold text-gray-800 sticky left-0 z-10 bg-gray-50 border-r border-gray-200" colSpan={GM_INFO_KEYS.length}>合计</td>
                  {GM_DATA_COLS.filter(ck => visibleCols.has(ck)).map(ck => (
                    <td key={ck} className="py-2.5 px-1.5 sm:px-3 text-right text-[11px] sm:text-xs font-bold text-gray-800">
                      {hasData ? getCellGM(totalWithMrYoy2, ck) : "--"}
                    </td>
                  ))}
                  <td className="py-2.5 px-1.5 sm:px-3 bg-gray-50"></td>
                  <td className="py-2.5 px-1.5 sm:px-3 bg-gray-50"></td>
                </tr>
              );
            })()}
          </tbody>
        </table>
        </div>
        </React.Fragment>
        )}
      </div>

      {/* 月目标累计警告次数——逐月明细弹窗 */}
      {warnModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setWarnModal(null)}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${warnModalFull ? "w-full h-full max-w-none" : "w-full max-w-2xl max-h-[80vh]"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${NK_BIZ_COLORS[warnModal.biz] || "bg-gray-100 text-gray-600"}`}>{warnModal.biz}</span>
                  <span className="text-base font-semibold text-gray-800">{warnModal.gm}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  负责人：{warnModal.owner || "--"}　·　签约：{warnModal.firstMonth || "--"} ~ {warnModal.lastMonth || "--"}　·　累计警告 <span className="text-red-600 font-semibold">{warnModal.warnCount}</span> 次
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWarnModalFull(f => !f)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  {warnModalFull ? "小窗" : "全屏"}
                </button>
                <button
                  type="button"
                  onClick={() => setWarnModal(null)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  关闭
                </button>
              </div>
            </div>
            {/* 明细表 */}
            <div className="flex-1 overflow-auto px-5 py-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-3 text-xs font-semibold text-gray-600 text-left">月份</th>
                    <th className="py-2 px-3 text-xs font-semibold text-gray-600 text-right">月度目标(元)</th>
                    <th className="py-2 px-3 text-xs font-semibold text-gray-600 text-right">月末MTD实际收入(元)</th>
                    <th className="py-2 px-3 text-xs font-semibold text-gray-600 text-right">月度履约率</th>
                    <th className="py-2 px-3 text-xs font-semibold text-gray-600 text-center">是否警告</th>
                  </tr>
                </thead>
                <tbody>
                  {warnModal.detail.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">暂无完整月明细</td></tr>
                  ) : (
                    warnModal.detail.map((d, i) => (
                      <tr key={d.month} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="py-2 px-3 text-xs text-gray-700">{d.month}</td>
                        <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-right text-gray-600">{Math.round(d.target).toLocaleString()}</td>
                        <td className="py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs text-right text-gray-600">{Math.round(d.actual).toLocaleString()}</td>
                        <td className={`py-2 px-3 text-xs text-right font-medium ${d.warn ? "text-red-600" : "text-green-600"}`}>{(d.fr * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-xs text-center">
                          {d.warn
                            ? <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">警告</span>
                            : <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">达标</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}