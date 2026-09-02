import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Network,
  ExternalLink,
  MessageSquare,
  Bell,
  ThumbsUp,
  MapPin,
  Users,
  ChevronRight,
} from "lucide-react";
import { AiResultList } from "@/components/AiPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AiAnalysisPanel from "@/components/AiAnalysisPanel";

/* ================================================================== */
/* 共享组件                                                            */
/* ================================================================== */
const RateProgress = ({ rate }) => (
  <div className="flex items-center gap-2">
    <Progress value={Math.min(rate, 100)} className="h-2 flex-1" />
    <span className="text-xs text-gray-500 w-10 shrink-0">{rate}%</span>
  </div>
);

const getStatus = (rate) => {
  if (rate >= 100) return { label: "已达成", className: "bg-emerald-50 text-emerald-600" };
  if (rate >= 80) return { label: "进行中", className: "bg-blue-50 text-[#4080FF]" };
  return { label: "预警", className: "bg-red-50 text-red-500" };
};

const StatusBadge = ({ rate }) => {
  const status = getStatus(rate);
  return <Badge className={`border-none font-normal ${status.className}`}>{status.label}</Badge>;
};


const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

/* Sort rows by achievement rate descending; fallback to achieved amount */
const sortByRate = (rows) =>
  [...rows].sort((a, b) => {
    if (typeof a.rate === "number" && typeof b.rate === "number") return b.rate - a.rate;
    if (typeof a.rate === "number") return -1;
    if (typeof b.rate === "number") return 1;
    return parseAmount(b.achieved) - parseAmount(a.achieved);
  });

/* Ranking section: TOP5 & Bottom5 by achievement rate */
const RankingSection = ({ rows }) => {
  const sorted = sortByRate(rows);
  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  const renderRankItem = (row, index, isTop) => (
    <div
      key={row.name}
      className={`flex items-center gap-3 px-3 py-1 rounded-lg transition-colors hover:bg-gray-50 ${
        isTop ? "bg-emerald-50/40" : "bg-red-50/40"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
          isTop ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
        }`}
      >
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-800 truncate block">{row.name}</span>
        {(row.region || row.city) && (
          <span className="text-xs text-gray-400">{row.region}{row.region && row.city ? " · " : ""}{row.city}</span>
        )}
      </div>
      <div className="text-right shrink-0">
        <span className={`text-sm font-bold ${isTop ? "text-emerald-600" : "text-red-500"}`}>{row.rate}%</span>
        <span className="text-xs text-gray-400 block">{row.achieved}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <Card className="border-none shadow-sm bg-white">
<CardContent className="pt-3 pb-3">
<div className="flex items-center gap-2 mb-2">
<TrendingUp className="w-4 h-4 text-emerald-500" />
<span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span>
</div>
          <div className="space-y-1.5">{top5.map((row, i) => renderRankItem(row, i, true))}</div>
        </CardContent>
      </Card>
      <Card className="border-none shadow-sm bg-white">
<CardContent className="pt-3 pb-3">
<div className="flex items-center gap-2 mb-2">
<TrendingDown className="w-4 h-4 text-red-500" />
<span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span>
</div>
          <div className="space-y-1.5">{bottom5.map((row, i) => renderRankItem(row, i, false))}</div>
        </CardContent>
      </Card>
    </div>
  );
};

/* Diagnosis popover — choose progress reminder or praise */
const DiagnosisPopover = ({ rowName, onClose }) => {
  const [sent, setSent] = useState(null);
  const handleSend = (type) => {
    setSent(type);
    setTimeout(() => {
      onClose();
    }, 1200);
  };
  if (sent) {
    return (
      <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[220px]">
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>已向「{rowName}」发送{sent === "remind" ? "进度提醒" : "表扬通知"}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[220px]">
      <p className="text-xs font-semibold text-gray-700 mb-2">下发诊断 · {rowName}</p>
      <button
        onClick={() => handleSend("remind")}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-amber-50 text-sm text-gray-700 transition-colors"
      >
        <Bell className="w-4 h-4 text-amber-500" />
        <span>提醒进度</span>
      </button>
      <button
        onClick={() => handleSend("praise")}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-emerald-50 text-sm text-gray-700 transition-colors"
      >
        <ThumbsUp className="w-4 h-4 text-emerald-500" />
        <span>表扬</span>
      </button>
    </div>
  );
};

const SummaryCard = ({ label, value, sub, icon: Icon, color, bg }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="pt-5 pb-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
      </div>
    </CardContent>
  </Card>
);

/* Trend cell helper - renders yoy/mom style values */
const TrendCell = ({ value }) => (
  <TableCell className={value.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
    {value.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
    {value}
  </TableCell>
);

/* Month selector */
const MonthSelector = ({ month, setMonth }) => (
  <div className="flex items-center justify-end">
    <Select value={month} onValueChange={setMonth}>
      <SelectTrigger className="w-40 h-9">
        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2025-08">2025年8月</SelectItem>
        <SelectItem value="2025-07">2025年7月</SelectItem>
        <SelectItem value="2025-06">2025年6月</SelectItem>
        <SelectItem value="2025-05">2025年5月</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

/* ================================================================== */
/* Mock data helpers                                                   */
/* The helper builds a full row with all expanded fields.              */
/* mr is a percentage (e.g. 22.3%), mrYoy/mrMom in pp (e.g. +1.2pp).    */
/* profitImprovement = (profitAmount / gtv * 100).toFixed(1) + "%"     */
/* ================================================================== */
const buildRow = (r) => {
  const achievedNum = parseAmount(r.achieved);
  const gtvNum = r.gtv ? parseAmount(r.gtv) : Math.round(achievedNum * (5 + Math.random() * 3));
  const profitNum = r.profitAmount ? parseAmount(r.profitAmount) : 0;
  const profitImprovement = profitNum > 0 ? (profitNum / gtvNum * 100).toFixed(1) + "%" : "—";
  const yoyVal = r.yoy || "+0.0%";
  const momVal = r.mom || (r.yoy ? `${yoyVal.startsWith("-") ? "-" : "+"}${(Math.abs(parseFloat(yoyVal)) * 0.3).toFixed(1)}%` : "+0.0%");
  const mrVal = r.mr || `${(15 + Math.random() * 10).toFixed(1)}%`;
  return {
    ...r,
    yoy: yoyVal,
    mom: momVal,
    mr: mrVal,
    mrRate: r.mrRate || `${75 + Math.floor(Math.random() * 25)}%`,
    mrYoy: r.mrYoy || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 3).toFixed(1)}pp`,
    mrMom: r.mrMom || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 2).toFixed(1)}pp`,
    penetration: r.penetration || `${60 + Math.floor(Math.random() * 30)}%`,
    penetrationYoy: r.penetrationYoy || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 5).toFixed(1)}%`,
    penetrationMom: r.penetrationMom || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 3).toFixed(1)}%`,
    arpu: r.arpu || `${(0.5 + Math.random() * 4.5).toFixed(2)}万`,
    arpuYoy: r.arpuYoy || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 6).toFixed(1)}%`,
    arpuMom: r.arpuMom || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 3).toFixed(1)}%`,
    merchantCount: r.merchantCount || `${(1000 + Math.floor(Math.random() * 9000)).toLocaleString()}`,
    merchantYoY: r.merchantYoY || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 8).toFixed(1)}%`,
    merchantMom: r.merchantMom || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 4).toFixed(1)}%`,
    gtv: `${gtvNum}万`,
    profitAmount: r.profitAmount || `${profitNum}万`,
    profitImprovement,
  };
};

/* ================================================================== */
/* 全国汇总数据                                                        */
/* ================================================================== */
const channelSummary = {
  waimai: { totalTarget: "6,380万", totalAchieved: "5,441万", rate: 85, gap: "939万", partners: 42, regions: 5 },
  daocan: { totalTarget: "4,000万", totalAchieved: "3,020万", rate: 76, gap: "980万", partners: 35, regions: 5 },
};

/* ================================================================== */
/* 区域数据 - 无激励列                                                  */
/* ================================================================== */
const channelRegionRowsRaw = {
  waimai: [
    // 华北新区
    { name: "京津冀区域", partners: 12, cities: 4, target: "1,800万", achieved: "1,620万", rate: 90, yoy: "+12.4%", mom: "+3.1%" },
    { name: "辽吉区域", partners: 6, cities: 3, target: "780万", achieved: "439万", rate: 56, yoy: "-8.3%", mom: "-6.8%" },
    { name: "山东区域", partners: 8, cities: 3, target: "1,200万", achieved: "1,056万", rate: 88, yoy: "+6.7%", mom: "+1.8%" },
    { name: "晋蒙区域", partners: 5, cities: 2, target: "500万", achieved: "445万", rate: 89, yoy: "+4.2%", mom: "+0.6%" },
    { name: "陕宁区域", partners: 5, cities: 2, target: "480万", achieved: "408万", rate: 85, yoy: "+2.1%", mom: "-1.2%" },
    { name: "甘青新区域", partners: 4, cities: 2, target: "360万", achieved: "281万", rate: 78, yoy: "-1.5%", mom: "-3.0%" },
    { name: "黑龙江区域", partners: 4, cities: 2, target: "320万", achieved: "218万", rate: 68, yoy: "-4.8%", mom: "-5.5%" },
    // 华东新区
    { name: "江苏区域", partners: 10, cities: 3, target: "1,400万", achieved: "1,330万", rate: 95, yoy: "+8.1%", mom: "+2.4%" },
    { name: "浙江区域", partners: 9, cities: 3, target: "1,100万", achieved: "1,012万", rate: 92, yoy: "+7.5%", mom: "+1.6%" },
    { name: "安徽区域", partners: 6, cities: 2, target: "600万", achieved: "552万", rate: 92, yoy: "+5.8%", mom: "+1.0%" },
    { name: "河南区域", partners: 7, cities: 3, target: "800万", achieved: "712万", rate: 89, yoy: "+4.1%", mom: "+0.5%" },
    { name: "湖北区域", partners: 6, cities: 2, target: "560万", achieved: "493万", rate: 88, yoy: "+3.2%", mom: "-0.8%" },
    { name: "湖南区域", partners: 5, cities: 2, target: "480万", achieved: "408万", rate: 85, yoy: "+1.8%", mom: "-1.5%" },
    { name: "江西区域", partners: 4, cities: 2, target: "360万", achieved: "302万", rate: 84, yoy: "+0.5%", mom: "-2.0%" },
    // 华南新区
    { name: "粤海区域", partners: 10, cities: 3, target: "1,200万", achieved: "1,164万", rate: 97, yoy: "+15.2%", mom: "+4.6%" },
    { name: "川藏区域", partners: 6, cities: 3, target: "1,200万", achieved: "1,092万", rate: 91, yoy: "+9.6%", mom: "+2.8%" },
    { name: "黔渝区域", partners: 5, cities: 2, target: "500万", achieved: "460万", rate: 92, yoy: "+7.2%", mom: "+1.2%" },
    { name: "福建区域", partners: 5, cities: 2, target: "480万", achieved: "437万", rate: 91, yoy: "+6.0%", mom: "+0.8%" },
    { name: "广西区域", partners: 4, cities: 2, target: "360万", achieved: "317万", rate: 88, yoy: "+3.5%", mom: "-0.2%" },
    { name: "云南区域", partners: 4, cities: 2, target: "320万", achieved: "256万", rate: 80, yoy: "+1.2%", mom: "-2.5%" },
  ],
  daocan: [
    // 华北新区
    { name: "京津冀区域", partners: 10, cities: 3, target: "1,400万", achieved: "1,292万", rate: 92, yoy: "+10.1%", mom: "+2.8%" },
    { name: "辽吉区域", partners: 5, cities: 3, target: "200万", achieved: "131万", rate: 66, yoy: "-12.1%", mom: "-7.5%" },
    { name: "山东区域", partners: 7, cities: 2, target: "700万", achieved: "623万", rate: 89, yoy: "+5.2%", mom: "+1.2%" },
    { name: "晋蒙区域", partners: 4, cities: 2, target: "360万", achieved: "313万", rate: 87, yoy: "+2.8%", mom: "+0.2%" },
    { name: "陕宁区域", partners: 4, cities: 2, target: "320万", achieved: "270万", rate: 84, yoy: "+0.8%", mom: "-1.8%" },
    { name: "甘青新区域", partners: 3, cities: 2, target: "240万", achieved: "184万", rate: 77, yoy: "-2.5%", mom: "-3.8%" },
    { name: "黑龙江区域", partners: 3, cities: 2, target: "200万", achieved: "132万", rate: 66, yoy: "-6.0%", mom: "-6.2%" },
    // 华东新区
    { name: "江苏区域", partners: 8, cities: 3, target: "1,200万", achieved: "1,140万", rate: 95, yoy: "+6.5%", mom: "+1.9%" },
    { name: "浙江区域", partners: 7, cities: 2, target: "900万", achieved: "828万", rate: 92, yoy: "+5.8%", mom: "+1.2%" },
    { name: "安徽区域", partners: 5, cities: 2, target: "480万", achieved: "437万", rate: 91, yoy: "+4.2%", mom: "+0.5%" },
    { name: "河南区域", partners: 5, cities: 2, target: "560万", achieved: "493万", rate: 88, yoy: "+3.0%", mom: "-0.5%" },
    { name: "湖北区域", partners: 4, cities: 2, target: "400万", achieved: "348万", rate: 87, yoy: "+2.0%", mom: "-1.0%" },
    { name: "湖南区域", partners: 4, cities: 2, target: "320万", achieved: "270万", rate: 84, yoy: "+0.5%", mom: "-2.2%" },
    { name: "江西区域", partners: 3, cities: 2, target: "240万", achieved: "198万", rate: 83, yoy: "-0.5%", mom: "-2.8%" },
    // 华南新区
    { name: "粤海区域", partners: 8, cities: 3, target: "1,200万", achieved: "732万", rate: 61, yoy: "+2.5%", mom: "-1.5%" },
    { name: "川藏区域", partners: 5, cities: 2, target: "300万", achieved: "291万", rate: 97, yoy: "+9.8%", mom: "+3.2%" },
    { name: "黔渝区域", partners: 4, cities: 2, target: "320万", achieved: "288万", rate: 90, yoy: "+5.5%", mom: "+0.8%" },
    { name: "福建区域", partners: 4, cities: 2, target: "300万", achieved: "270万", rate: 90, yoy: "+4.2%", mom: "+0.5%" },
    { name: "广西区域", partners: 3, cities: 2, target: "240万", achieved: "206万", rate: 86, yoy: "+2.0%", mom: "-0.8%" },
    { name: "云南区域", partners: 3, cities: 2, target: "200万", achieved: "150万", rate: 75, yoy: "-1.0%", mom: "-3.2%" },
  ],
};

/* ================================================================== */
/* 总商数据 - 含激励列                                                  */
/* ================================================================== */
const channelPartnerRowsRaw = {
  waimai: [
    { name: "上海总商A", region: "江苏区域", cities: 2, bds: 5, target: "1,100万", achieved: "1,020万", rate: 93, yoy: "+11.2%", mom: "+2.8%", profitAmount: "18.4万" },
    { name: "杭州总商B", region: "江苏区域", cities: 1, bds: 3, target: "500万", achieved: "480万", rate: 96, yoy: "+8.1%", mom: "+1.5%", profitAmount: "8.6万" },
    { name: "广州总商E", region: "粤海区域", cities: 1, bds: 4, target: "500万", achieved: "490万", rate: 98, yoy: "+10.5%", mom: "+2.0%", profitAmount: "8.8万" },
    { name: "深圳总商F", region: "粤海区域", cities: 1, bds: 3, target: "500万", achieved: "450万", rate: 90, yoy: "+3.2%", mom: "-0.5%", profitAmount: "8.1万" },
    { name: "北京总商H", region: "京津冀区域", cities: 1, bds: 5, target: "500万", achieved: "380万", rate: 76, yoy: "-3.6%", mom: "-4.1%", profitAmount: "4.6万" },
    { name: "成都总商K", region: "川藏区域", cities: 1, bds: 3, target: "500万", achieved: "490万", rate: 98, yoy: "+15.2%", mom: "+3.8%", profitAmount: "8.8万" },
    { name: "重庆总商L", region: "川藏区域", cities: 1, bds: 2, target: "400万", achieved: "384万", rate: 96, yoy: "+10.5%", mom: "+2.2%", profitAmount: "6.9万" },
    { name: "沈阳总商N", region: "辽吉区域", cities: 1, bds: 2, target: "300万", achieved: "180万", rate: 60, yoy: "-8.3%", mom: "-6.0%", profitAmount: "1.8万" },
    { name: "大连总商O", region: "辽吉区域", cities: 1, bds: 2, target: "280万", achieved: "160万", rate: 57, yoy: "-9.1%", mom: "-5.5%", profitAmount: "1.6万" },
    { name: "天津总商I", region: "京津冀区域", cities: 1, bds: 2, target: "400万", achieved: "280万", rate: 70, yoy: "-5.2%", mom: "-3.8%", profitAmount: "3.4万" },
  ],
  daocan: [
    { name: "上海餐联A", region: "江苏区域", cities: 1, bds: 4, target: "500万", achieved: "470万", rate: 94, yoy: "+9.6%", mom: "+2.2%", profitAmount: "7.5万" },
    { name: "杭州餐联B", region: "江苏区域", cities: 1, bds: 3, target: "500万", achieved: "450万", rate: 90, yoy: "+6.2%", mom: "+1.0%", profitAmount: "7.2万" },
    { name: "广州餐联D", region: "粤海区域", cities: 1, bds: 3, target: "500万", achieved: "480万", rate: 96, yoy: "+8.5%", mom: "+1.8%", profitAmount: "7.7万" },
    { name: "深圳餐联E", region: "粤海区域", cities: 1, bds: 2, target: "400万", achieved: "380万", rate: 95, yoy: "+5.1%", mom: "+0.8%", profitAmount: "6.1万" },
    { name: "北京餐联G", region: "京津冀区域", cities: 1, bds: 3, target: "400万", achieved: "290万", rate: 73, yoy: "-5.1%", mom: "-3.2%", profitAmount: "2.9万" },
    { name: "成都餐联J", region: "川藏区域", cities: 1, bds: 2, target: "200万", achieved: "195万", rate: 98, yoy: "+10.8%", mom: "+3.0%", profitAmount: "3.1万" },
    { name: "沈阳餐联L", region: "辽吉区域", cities: 1, bds: 1, target: "100万", achieved: "68万", rate: 68, yoy: "-10.5%", mom: "-6.8%", profitAmount: "0.5万" },
    { name: "天津餐联H", region: "京津冀区域", cities: 1, bds: 2, target: "300万", achieved: "210万", rate: 70, yoy: "-6.3%", mom: "-4.0%", profitAmount: "2.1万" },
  ],
};

/* Build expanded rows: region (no incentive), partner (with incentive) */
const channelRegionRows = {
  waimai: channelRegionRowsRaw.waimai.map(buildRow),
  daocan: channelRegionRowsRaw.daocan.map(buildRow),
};

const channelPartnerRows = {
  waimai: channelPartnerRowsRaw.waimai.map(buildRow),
  daocan: channelPartnerRowsRaw.daocan.map(buildRow),
};

/* ================================================================== */
/* 全国城市数据 - 无激励列                                              */
/* ================================================================== */
const channelCityRowsRaw = {
  waimai: [
    { name: "上海", region: "江苏区域", partners: 3, bds: 8, target: "600万", achieved: "540万", rate: 90, yoy: "+12.4%", mom: "+3.1%" },
    { name: "杭州", region: "江苏区域", partners: 2, bds: 5, target: "500万", achieved: "480万", rate: 96, yoy: "+8.1%", mom: "+1.5%" },
    { name: "南京", region: "江苏区域", partners: 2, bds: 4, target: "400万", achieved: "360万", rate: 90, yoy: "+6.5%", mom: "+0.8%" },
    { name: "苏州", region: "江苏区域", partners: 1, bds: 3, target: "300万", achieved: "240万", rate: 80, yoy: "+4.2%", mom: "-1.0%" },
    { name: "广州", region: "粤海区域", partners: 2, bds: 5, target: "500万", achieved: "490万", rate: 98, yoy: "+10.5%", mom: "+2.0%" },
    { name: "深圳", region: "粤海区域", partners: 2, bds: 4, target: "500万", achieved: "450万", rate: 90, yoy: "+3.2%", mom: "-0.5%" },
    { name: "北京", region: "京津冀区域", partners: 2, bds: 6, target: "500万", achieved: "380万", rate: 76, yoy: "-3.6%", mom: "-4.1%" },
    { name: "天津", region: "京津冀区域", partners: 1, bds: 3, target: "400万", achieved: "280万", rate: 70, yoy: "-5.2%", mom: "-3.8%" },
    { name: "成都", region: "川藏区域", partners: 1, bds: 4, target: "500万", achieved: "490万", rate: 98, yoy: "+15.2%", mom: "+3.8%" },
    { name: "重庆", region: "川藏区域", partners: 1, bds: 3, target: "400万", achieved: "384万", rate: 96, yoy: "+10.5%", mom: "+2.2%" },
    { name: "沈阳", region: "辽吉区域", partners: 1, bds: 2, target: "300万", achieved: "180万", rate: 60, yoy: "-8.3%", mom: "-6.0%" },
    { name: "大连", region: "辽吉区域", partners: 1, bds: 2, target: "280万", achieved: "160万", rate: 57, yoy: "-9.1%", mom: "-5.5%" },
  ],
  daocan: [
    { name: "上海", region: "江苏区域", partners: 2, bds: 6, target: "500万", achieved: "470万", rate: 94, yoy: "+9.6%", mom: "+2.2%" },
    { name: "杭州", region: "江苏区域", partners: 2, bds: 5, target: "500万", achieved: "450万", rate: 90, yoy: "+6.2%", mom: "+1.0%" },
    { name: "南京", region: "江苏区域", partners: 1, bds: 4, target: "400万", achieved: "372万", rate: 93, yoy: "+4.8%", mom: "+0.5%" },
    { name: "广州", region: "粤海区域", partners: 1, bds: 4, target: "500万", achieved: "480万", rate: 96, yoy: "+8.5%", mom: "+1.8%" },
    { name: "深圳", region: "粤海区域", partners: 1, bds: 3, target: "400万", achieved: "380万", rate: 95, yoy: "+5.1%", mom: "+0.8%" },
    { name: "北京", region: "京津冀区域", partners: 1, bds: 4, target: "400万", achieved: "290万", rate: 73, yoy: "-5.1%", mom: "-3.2%" },
    { name: "天津", region: "京津冀区域", partners: 1, bds: 2, target: "300万", achieved: "210万", rate: 70, yoy: "-6.3%", mom: "-4.0%" },
    { name: "成都", region: "川藏区域", partners: 1, bds: 2, target: "200万", achieved: "195万", rate: 98, yoy: "+10.8%", mom: "+3.0%" },
    { name: "沈阳", region: "辽吉区域", partners: 1, bds: 1, target: "100万", achieved: "68万", rate: 68, yoy: "-10.5%", mom: "-6.8%" },
  ],
};

const channelCityRows = {
  waimai: channelCityRowsRaw.waimai.map(buildRow),
  daocan: channelCityRowsRaw.daocan.map(buildRow),
};

/* ================================================================== */
/* 全国BD/运营数据 - 含激励列                                           */
/* ================================================================== */
const channelBdRowsRaw = {
  waimai: [
    { name: "刘洋", mis: "liuyang04", region: "江苏区域", city: "上海", stores: 8, target: "200万", achieved: "185万", rate: 93, yoy: "+7.5%", mom: "+1.2%", profitAmount: "2.97万" },
    { name: "陈静", mis: "chenjing05", region: "江苏区域", city: "上海", stores: 6, target: "180万", achieved: "160万", rate: 89, yoy: "+5.1%", mom: "+0.8%", profitAmount: "2.56万" },
    { name: "赵刚", mis: "zhaogang06", region: "江苏区域", city: "杭州", stores: 7, target: "220万", achieved: "195万", rate: 89, yoy: "+6.3%", mom: "+1.5%", profitAmount: "3.12万" },
    { name: "王磊", mis: "wanglei01", region: "江苏区域", city: "南京", stores: 5, target: "160万", achieved: "140万", rate: 88, yoy: "+3.8%", mom: "-0.5%", profitAmount: "2.24万" },
    { name: "李娜", mis: "lina02", region: "江苏区域", city: "苏州", stores: 4, target: "140万", achieved: "115万", rate: 82, yoy: "+1.5%", mom: "-1.2%", profitAmount: "1.84万" },
    { name: "张伟", mis: "zhangwei03", region: "粤海区域", city: "广州", stores: 6, target: "180万", achieved: "175万", rate: 97, yoy: "+9.0%", mom: "+2.5%", profitAmount: "2.80万" },
    { name: "陈秀", mis: "chenxiu07", region: "粤海区域", city: "深圳", stores: 5, target: "160万", achieved: "155万", rate: 97, yoy: "+8.2%", mom: "+2.0%", profitAmount: "2.48万" },
    { name: "孙强", mis: "sunqiang08", region: "京津冀区域", city: "北京", stores: 7, target: "200万", achieved: "150万", rate: 75, yoy: "-4.0%", mom: "-3.5%", profitAmount: "1.50万" },
    { name: "周明", mis: "zhouming09", region: "京津冀区域", city: "天津", stores: 4, target: "140万", achieved: "100万", rate: 71, yoy: "-5.8%", mom: "-4.2%", profitAmount: "1.20万" },
    { name: "吴丽", mis: "wuli10", region: "川藏区域", city: "成都", stores: 6, target: "180万", achieved: "176万", rate: 98, yoy: "+12.0%", mom: "+3.5%", profitAmount: "2.82万" },
    { name: "郑辉", mis: "zhenghui11", region: "川藏区域", city: "重庆", stores: 5, target: "160万", achieved: "154万", rate: 96, yoy: "+9.5%", mom: "+2.8%", profitAmount: "2.46万" },
    { name: "马超", mis: "machao12", region: "辽吉区域", city: "沈阳", stores: 3, target: "120万", achieved: "72万", rate: 60, yoy: "-8.0%", mom: "-6.5%", profitAmount: "0.72万" },
  ],
  daocan: [
    { name: "刘洋", mis: "liuyang04", region: "江苏区域", city: "上海", stores: 5, target: "260万", achieved: "245万", rate: 94, yoy: "+8.2%", mom: "+1.8%", profitAmount: "3.92万" },
    { name: "陈静", mis: "chenjing05", region: "江苏区域", city: "上海", stores: 4, target: "240万", achieved: "225万", rate: 94, yoy: "+7.0%", mom: "+1.2%", profitAmount: "3.60万" },
    { name: "孙丽", mis: "sunli07", region: "江苏区域", city: "杭州", stores: 3, target: "200万", achieved: "180万", rate: 90, yoy: "+5.5%", mom: "+0.5%", profitAmount: "2.88万" },
    { name: "周强", mis: "zhouqiang08", region: "江苏区域", city: "南京", stores: 3, target: "200万", achieved: "170万", rate: 85, yoy: "+3.0%", mom: "-0.8%", profitAmount: "2.55万" },
    { name: "张伟", mis: "zhangwei03", region: "粤海区域", city: "广州", stores: 4, target: "220万", achieved: "210万", rate: 95, yoy: "+7.5%", mom: "+1.5%", profitAmount: "3.36万" },
    { name: "陈秀", mis: "chenxiu07", region: "粤海区域", city: "深圳", stores: 3, target: "180万", achieved: "170万", rate: 94, yoy: "+6.0%", mom: "+1.0%", profitAmount: "2.72万" },
    { name: "孙强", mis: "sunqiang08", region: "京津冀区域", city: "北京", stores: 4, target: "200万", achieved: "145万", rate: 73, yoy: "-5.0%", mom: "-3.5%", profitAmount: "1.45万" },
    { name: "吴丽", mis: "wuli10", region: "川藏区域", city: "成都", stores: 3, target: "160万", achieved: "156万", rate: 98, yoy: "+11.0%", mom: "+3.2%", profitAmount: "2.50万" },
    { name: "马超", mis: "machao12", region: "辽吉区域", city: "沈阳", stores: 2, target: "80万", achieved: "54万", rate: 68, yoy: "-10.0%", mom: "-7.0%", profitAmount: "0.43万" },
  ],
};

const channelBdRows = {
  waimai: channelBdRowsRaw.waimai.map(buildRow),
  daocan: channelBdRowsRaw.daocan.map(buildRow),
};

/* ================================================================== */
/* biz_manager - 城市数据 (江苏区域，无激励) + 总商数据 (江苏区域，含激励) */
/* ================================================================== */
const bizManagerCityRowsRaw = {
  waimai: [
    { name: "上海", bdCount: 3, merchantCount: 1280, target: "600万", achieved: "540万", rate: 90, yoy: "+12.4%", mom: "+3.1%" },
    { name: "杭州", bdCount: 2, merchantCount: 860, target: "500万", achieved: "480万", rate: 96, yoy: "+8.1%", mom: "+1.5%" },
    { name: "南京", bdCount: 2, merchantCount: 620, target: "400万", achieved: "360万", rate: 90, yoy: "+6.5%", mom: "+0.8%" },
    { name: "苏州", bdCount: 2, merchantCount: 480, target: "300万", achieved: "240万", rate: 80, yoy: "+4.2%", mom: "-1.0%" },
  ],
  daocan: [
    { name: "上海", bdCount: 2, merchantCount: 620, target: "500万", achieved: "470万", rate: 94, yoy: "+9.6%", mom: "+2.2%" },
    { name: "杭州", bdCount: 2, merchantCount: 580, target: "500万", achieved: "450万", rate: 90, yoy: "+6.2%", mom: "+1.0%" },
    { name: "南京", bdCount: 2, merchantCount: 440, target: "400万", achieved: "372万", rate: 93, yoy: "+4.8%", mom: "+0.5%" },
  ],
};

const bizManagerPartnerRowsRaw = {
  waimai: [
    { name: "上海总商A", region: "江苏区域", cities: 2, bds: 5, target: "1,100万", achieved: "1,020万", rate: 93, yoy: "+11.2%", mom: "+2.8%", profitAmount: "18.4万" },
    { name: "杭州总商B", region: "江苏区域", cities: 1, bds: 3, target: "500万", achieved: "480万", rate: 96, yoy: "+8.1%", mom: "+1.5%", profitAmount: "8.6万" },
  ],
  daocan: [
    { name: "上海餐联A", region: "江苏区域", cities: 1, bds: 4, target: "500万", achieved: "470万", rate: 94, yoy: "+9.6%", mom: "+2.2%", profitAmount: "7.5万" },
    { name: "杭州餐联B", region: "江苏区域", cities: 1, bds: 3, target: "500万", achieved: "450万", rate: 90, yoy: "+6.2%", mom: "+1.0%", profitAmount: "7.2万" },
  ],
};

const bizManagerCityRows = {
  waimai: bizManagerCityRowsRaw.waimai.map(buildRow),
  daocan: bizManagerCityRowsRaw.daocan.map(buildRow),
};

const bizManagerPartnerRows = {
  waimai: bizManagerPartnerRowsRaw.waimai.map(buildRow),
  daocan: bizManagerPartnerRowsRaw.daocan.map(buildRow),
};

/* ================================================================== */
/* partner - BD数据 (上海，含激励)                                      */
/* ================================================================== */
const partnerBdRowsRaw = {
  waimai: [
    { name: "刘洋", mis: "liuyang04", stores: 8, target: "200万", achieved: "185万", rate: 93, yoy: "+7.5%", mom: "+1.2%", profitAmount: "2.97万" },
    { name: "陈静", mis: "chenjing05", stores: 6, target: "180万", achieved: "160万", rate: 89, yoy: "+5.1%", mom: "+0.8%", profitAmount: "2.56万" },
    { name: "赵刚", mis: "zhaogang06", stores: 7, target: "220万", achieved: "195万", rate: 89, yoy: "+6.3%", mom: "+1.5%", profitAmount: "3.12万" },
    { name: "王磊", mis: "wanglei01", stores: 5, target: "160万", achieved: "140万", rate: 88, yoy: "+3.8%", mom: "-0.5%", profitAmount: "2.24万" },
    { name: "李娜", mis: "lina02", stores: 4, target: "140万", achieved: "115万", rate: 82, yoy: "+1.5%", mom: "-1.2%", profitAmount: "1.84万" },
  ],
  daocan: [
    { name: "刘洋", mis: "liuyang04", stores: 5, target: "260万", achieved: "245万", rate: 94, yoy: "+8.2%", mom: "+1.8%", profitAmount: "3.92万" },
    { name: "陈静", mis: "chenjing05", stores: 4, target: "240万", achieved: "225万", rate: 94, yoy: "+7.0%", mom: "+1.2%", profitAmount: "3.60万" },
    { name: "孙丽", mis: "sunli07", stores: 3, target: "200万", achieved: "180万", rate: 90, yoy: "+5.5%", mom: "+0.5%", profitAmount: "2.88万" },
    { name: "周强", mis: "zhouqiang08", stores: 3, target: "200万", achieved: "170万", rate: 85, yoy: "+3.0%", mom: "-0.8%", profitAmount: "2.55万" },
  ],
};

const partnerBdRows = {
  waimai: partnerBdRowsRaw.waimai.map(buildRow),
  daocan: partnerBdRowsRaw.daocan.map(buildRow),
};

/* ================================================================== */
/* partner 城市汇总                                                    */
/* ================================================================== */
const partnerCitySummary = {
  waimai: { target: "900万", achieved: "795万", rate: 88, profitAmount: "12.73万", bds: 5, penetration: "78%" },
  daocan: { target: "700万", achieved: "640万", rate: 91, profitAmount: "10.25万", bds: 4, penetration: "82%" },
};

/* ================================================================== */
/* bd - 门店数据 (含激励)                                              */
/* ================================================================== */
const bdStoreRowsRaw = {
  waimai: [
    { name: "望京旗舰店", type: "信息流广告", target: "12万", achieved: "12.6万", rate: 105, yoy: "+8.5%", mom: "+2.1%", profitAmount: "0.63万", totalStores: 320, adStores: 280, adPenetration: "87.5%" },
    { name: "国贸店", type: "搜索广告", target: "9万", achieved: "8.1万", rate: 90, yoy: "+5.2%", mom: "+1.0%", profitAmount: "0.41万", totalStores: 260, adStores: 190, adPenetration: "73.1%" },
    { name: "三里屯店", type: "品牌广告", target: "15万", achieved: "10.4万", rate: 69, yoy: "-2.1%", mom: "-3.5%", profitAmount: "0.52万", totalStores: 410, adStores: 150, adPenetration: "36.6%" },
    { name: "西单店", type: "信息流广告", target: "8万", achieved: "7.9万", rate: 99, yoy: "+6.8%", mom: "+1.5%", profitAmount: "0.40万", totalStores: 220, adStores: 195, adPenetration: "88.6%" },
    { name: "中关村店", type: "搜索广告", target: "10万", achieved: "10.5万", rate: 105, yoy: "+9.0%", mom: "+2.3%", profitAmount: "0.53万", totalStores: 280, adStores: 250, adPenetration: "89.3%" },
    { name: "亦庄店", type: "信息流广告", target: "6万", achieved: "4.2万", rate: 70, yoy: "-1.5%", mom: "-2.0%", profitAmount: "0.21万", totalStores: 180, adStores: 90, adPenetration: "50.0%" },
    { name: "回龙观店", type: "品牌广告", target: "7万", achieved: "6.3万", rate: 90, yoy: "+4.2%", mom: "+0.8%", profitAmount: "0.32万", totalStores: 200, adStores: 150, adPenetration: "75.0%" },
    { name: "通州店", type: "搜索广告", target: "5万", achieved: "5.4万", rate: 108, yoy: "+10.5%", mom: "+2.8%", profitAmount: "0.27万", totalStores: 160, adStores: 145, adPenetration: "90.6%" },
  ],
  daocan: [
    { name: "陆家嘴店", type: "信息流广告", target: "14万", achieved: "13.2万", rate: 94, yoy: "+7.0%", mom: "+1.5%", profitAmount: "0.66万", totalStores: 180, adStores: 145, adPenetration: "80.6%" },
    { name: "徐汇店", type: "搜索广告", target: "10万", achieved: "9.5万", rate: 95, yoy: "+6.0%", mom: "+1.2%", profitAmount: "0.48万", totalStores: 150, adStores: 120, adPenetration: "80.0%" },
    { name: "静安店", type: "品牌广告", target: "12万", achieved: "11.0万", rate: 92, yoy: "+5.5%", mom: "+0.8%", profitAmount: "0.55万", totalStores: 200, adStores: 90, adPenetration: "45.0%" },
    { name: "浦东店", type: "信息流广告", target: "8万", achieved: "7.6万", rate: 95, yoy: "+4.8%", mom: "+0.5%", profitAmount: "0.38万", totalStores: 120, adStores: 105, adPenetration: "87.5%" },
    { name: "闵行店", type: "搜索广告", target: "6万", achieved: "5.1万", rate: 85, yoy: "+2.0%", mom: "-0.5%", profitAmount: "0.26万", totalStores: 100, adStores: 70, adPenetration: "70.0%" },
  ],
};

const bdStoreRows = {
  waimai: bdStoreRowsRaw.waimai.map(buildRow),
  daocan: bdStoreRowsRaw.daocan.map(buildRow),
};

/* ================================================================== */
/* AI 分析数据                                                          */
/* ================================================================== */
const aiData = {
  waimai: [
    { title: "低达成率区域跟进", text: "京津冀区域达成率74%低于预警线，剩余缺口312万。辽吉区域达成率仅56%，远低于全国均值，建议紧急调配资源支持。" },
    { title: "MR达成率分析", text: "全国平均MR达成率85%，川藏区域88%最高，辽吉区域65%最低。辽吉区域MR渗透不足，建议加大广告产品推广力度。" },
    { title: "渗透率与ARPU对比", text: "江苏区域渗透率82%+ARPU值4.55万为全国最优组合，辽吉区域渗透率61%+ARPU值1.20万需重点提升。" },
    { title: "环比趋势预警", text: "京津冀区域MoM-5.2%、辽吉区域MoM-6.8%连续下滑，建议关注这两个区域的合作商执行节奏。" },
  ],
  daocan: [
    { title: "低达成率区域跟进", text: "到餐业务整体达成率76%，主要拖累来自京津冀区域（74%）和辽吉区域（66%），建议排查合作商执行力和商户覆盖情况。" },
    { title: "MR达成率分析", text: "到餐全国平均MR达成率79%，低于外卖线。川藏区域85%表现最好，辽吉区域58%远低于大盘。" },
    { title: "渗透率与ARPU对比", text: "江苏区域渗透率80%+ARPU值3.20万领先，辽吉区域渗透率58%+ARPU值0.85万需重点改进。" },
    { title: "环比趋势预警", text: "辽吉区域MoM-7.5%为全国最差，建议关注到餐广告产品的投放结构和覆盖节奏。" },
  ],
  bizManagerWaimai: [
    { title: "区域整体表现优秀", text: "江苏区域整体达成率90%，4个城市中3个达成率超90%。杭州96%表现突出，建议提炼经验复制到苏州（达成率80%为区域内最低）。" },
    { title: "MR达成率亮点", text: "上海MR达成率88%、杭州MR达成率91%，均高于全国均值85%。苏州MR达成率76%需重点提升。" },
    { title: "总商分润分析", text: "上海总商A分润18.4万位居江苏区域第一，盈亏改善1.7%表现突出。杭州总商B分润8.6万，盈亏改善1.8%。" },
  ],
  bizManagerDaocan: [
    { title: "区域整体表现良好", text: "江苏区域整体达成率92%，3个城市全部达成率超90%。上海94%和南京93%表现稳健。" },
    { title: "MR达成率分析", text: "上海到餐MR达成率82%、南京81%，高于到餐全国均值79%。建议加大广告产品渗透力度。" },
    { title: "总商分润分析", text: "上海餐联A分润7.5万，盈亏改善1.5%；杭州餐联B分润7.2万，盈亏改善1.6%。" },
  ],
  partnerWaimai: [
    { title: "BD团队表现", text: "刘洋达成率93%为团队最高，李娜达成率82%为最低。建议安排刘洋分享拜访SOP经验给李娜。" },
    { title: "分润与盈亏分析", text: "上海总商A总分润12.73万，团队平均盈亏改善1.8%。赵刚分润3.12万贡献最大。" },
    { title: "MR渗透率提升", text: "上海区域MR渗透率78%，建议加大品牌广告推广，目标提升至85%以上。" },
  ],
  partnerDaocan: [
    { title: "BD团队表现", text: "刘洋和陈静达成率均为94%，团队整体执行力均衡。周强达成率85%需重点关注。" },
    { title: "分润与盈亏分析", text: "总分润10.25万，平均盈亏改善1.5%。刘洋分润3.92万为团队最高。" },
    { title: "MR渗透率提升", text: "到餐MR渗透率82%高于外卖线，建议保持当前推广节奏。" },
  ],
  bdWaimai: [
    { title: "门店达成分析", text: "望京店和中关村店达成率105%超额完成，三里屯店69%和亦庄店70%需要优先拜访。" },
    { title: "分润贡献", text: "个人分润总额3.29万，望京店贡献0.63万排名第一。建议总结望京店CPC投放经验。" },
    { title: "MR与渗透率", text: "8家门店平均MR达成率86%，渗透率73%。三里屯店MR达成率61%需重点提升。" },
  ],
  bdDaocan: [
    { title: "门店达成分析", text: "陆家嘴店94%和静安店92%表现稳健。闵行店85%为团队最低，建议本周优先拜访。" },
    { title: "分润贡献", text: "个人分润总额2.33万，陆家嘴店贡献0.66万排名第一。" },
    { title: "MR与渗透率", text: "5家门店平均MR达成率83%，渗透率79%。建议加大品牌广告覆盖。" },
  ],
};

/* ================================================================== */
/* Table column set: expanded columns (no incentive)                  */
/* ================================================================== */
const ExpandedTableHeader = ({ showIncentive, showOpAction, showStorePool }) => (
  <TableHeader>
    <TableRow>
      <TableHead className="min-w-[120px]">名称</TableHead>
      <TableHead>目标收入</TableHead>
      <TableHead>收入</TableHead>
      <TableHead className="w-32">达成率</TableHead>
      <TableHead>收入YoY</TableHead>
      <TableHead>收入MoM</TableHead>
      <TableHead>MR</TableHead>
      <TableHead>MR达成率</TableHead>
      <TableHead>MR YoY</TableHead>
      <TableHead>MR MoM</TableHead>
      <TableHead>渗透率</TableHead>
      <TableHead>ARPU值</TableHead>
      {showStorePool && <TableHead>交易门店池</TableHead>}
      {showStorePool && <TableHead>广告门店池</TableHead>}
      {showStorePool && <TableHead>广告渗透率</TableHead>}
      {showIncentive && <TableHead>分润金额</TableHead>}
      {showIncentive && <TableHead>GTV</TableHead>}
      {showIncentive && <TableHead>盈亏改善</TableHead>}
      <TableHead>状态</TableHead>
      {showOpAction && <TableHead className="w-24">操作</TableHead>}
    </TableRow>
  </TableHeader>
);

const ExpandedTableRow = ({ row, onClick, onOpAction, onDiagnosis, showIncentive, showOpAction, showStorePool, nameCellExtra }) => {
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  return (
    <TableRow
      className="hover:bg-blue-50/30"
      onClick={onClick}
    >
      <TableCell className="font-semibold text-gray-900">
        {row.name}
        {nameCellExtra && <span className="block text-xs font-normal text-gray-400 mt-0.5">{nameCellExtra}</span>}
      </TableCell>
      <TableCell>{row.target}</TableCell>
      <TableCell className="font-medium text-gray-700">{row.achieved}</TableCell>
      <TableCell><RateProgress rate={row.rate} /></TableCell>
      <TrendCell value={row.yoy} />
      <TrendCell value={row.mom} />
      <TableCell className="text-gray-600">{row.mr}</TableCell>
      <TableCell className="text-gray-600">{row.mrRate}</TableCell>
      <TrendCell value={row.mrYoy} />
      <TrendCell value={row.mrMom} />
      <TableCell className="text-gray-600">{row.penetration}</TableCell>
      <TableCell className="text-gray-600">{row.arpu}</TableCell>
      {showStorePool && <TableCell className="text-gray-600">{row.totalStores || "—"}</TableCell>}
      {showStorePool && <TableCell className="text-gray-600">{row.adStores || "—"}</TableCell>}
      {showStorePool && <TableCell className="text-gray-600">{row.adPenetration || "—"}</TableCell>}
      {showIncentive && <TableCell className="text-[#4080FF] font-medium">{row.profitAmount}</TableCell>}
      {showIncentive && <TableCell className="text-gray-600">{row.gtv}</TableCell>}
      {showIncentive && <TableCell className="text-gray-600">{row.profitImprovement}</TableCell>}
      <TableCell><StatusBadge rate={row.rate} /></TableCell>
      {showOpAction && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="relative flex items-center gap-1">
            <button
              onClick={onOpAction || onClick}
              className="p-1 rounded hover:bg-blue-100"
              title="穿透查看明细"
            >
              <ExternalLink className="w-4 h-4 text-[#4080FF]" />
            </button>
            {onDiagnosis && (
              <button
                onClick={() => setShowDiagnosis((v) => !v)}
                className="p-1 rounded hover:bg-blue-100"
                title="下发诊断"
              >
                <MessageSquare className="w-4 h-4 text-[#4080FF]" />
              </button>
            )}
            {showDiagnosis && onDiagnosis && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDiagnosis(false)} />
                <DiagnosisPopover
                  rowName={row.name}
                  onClose={() => setShowDiagnosis(false)}
                />
              </>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

/* ================================================================== */
/* platform_admin 视图 — Tab 布局                                       */
/* ================================================================== */
const PlatformAdminView = () => {
  const { bizLine } = useBizLine();
  const navigate = useNavigate();
  const [month, setMonth] = useState("2025-08");
  const [activeTab, setActiveTab] = useState("region");

  /* AI 智能分析：两个下拉 + 触发按钮 */
  const [aiScope, setAiScope] = useState("all");
  const [aiMetric, setAiMetric] = useState("all");
  const [aiTriggered, setAiTriggered] = useState(true);

  const summary = channelSummary[bizLine];
  const regionRows = useMemo(() => sortByRate(channelRegionRows[bizLine]), [bizLine]);
  const partnerRows = useMemo(() => sortByRate(channelPartnerRows[bizLine]), [bizLine]);
  const cityRows = useMemo(() => sortByRate(channelCityRows[bizLine]), [bizLine]);
  const bdRows = useMemo(() => sortByRate(channelBdRows[bizLine]), [bizLine]);
  const aiItems = aiData[bizLine];

  const avgMrRate = useMemo(() => {
    const rates = regionRows.map((r) => parseInt(r.mrRate));
    return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
  }, [regionRows]);

  const partnerTotalProfit = useMemo(
    () => partnerRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [partnerRows]
  );

  const bdTotalProfit = useMemo(
    () => bdRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [bdRows]
  );

  const handleRegionClick = (regionName) => {
    navigate(`/channel/region/${encodeURIComponent(regionName)}`);
  };

  const handlePartnerClick = (partnerName) => {
    navigate(`/channel/partner/${encodeURIComponent(partnerName)}`);
  };

  const handleCityClick = (cityName) => {
    const city = cityRows.find((r) => r.name === cityName);
    if (city) {
      navigate(`/channel/region/${encodeURIComponent(city.region)}/city/${encodeURIComponent(cityName)}`);
    }
  };

  const handleBdClick = (bdName) => {
    navigate(`/channel/bd/${encodeURIComponent(bdName)}`);
  };

  /* AI 分析：视角范围选项 */
  const aiScopeOptions = [
    { value: "all", label: "全量" },
    { value: "region", label: "区域" },
    { value: "partner", label: "总商" },
    { value: "city", label: "城市" },
    { value: "bd", label: "BD/运营" },
  ];

  /* AI 分析：指标选项 */
  const aiMetricOptions = [
    { value: "all", label: "所有指标" },
    { value: "revenue", label: "收入" },
    { value: "mr", label: "MR" },
    { value: "rate", label: "达成率" },
  ];

  /* 根据下拉选择，获取对应数据行 */
  const aiScopeRows = (() => {
    switch (aiScope) {
      case "region": return regionRows;
      case "partner": return partnerRows;
      case "city": return cityRows;
      case "bd": return bdRows;
      default: return [...regionRows, ...partnerRows, ...cityRows, ...bdRows];
    }
  })();

  const aiScopeLabel = aiScopeOptions.find((o) => o.value === aiScope)?.label || "全量";
  const aiMetricLabel = aiMetricOptions.find((o) => o.value === aiMetric)?.label || "所有指标";

  /* 根据指标选择生成分析内容 */
  const aiAnalysisItems = (() => {
    const rows = aiScopeRows;
    if (!rows || rows.length === 0) return aiData[bizLine] || [];

    const items = [];

    /* 按 rate 排序找出 TOP 和 BOTTOM */
    const sorted = [...rows].sort((a, b) => (b.rate || 0) - (a.rate || 0));
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    const metricText = (row) => {
      if (!row) return "";
      switch (aiMetric) {
        case "revenue":
          return `收入${row.achieved}（目标${row.target}），YoY ${row.yoy}，MoM ${row.mom}。`;
        case "mr":
          return `MR ${row.mr}，MR达成率${row.mrRate}，MR YoY ${row.mrYoy}，MR MoM ${row.mrMom}。`;
        case "rate":
          return `达成率${row.rate}%（${row.achieved}/${row.target}），状态：${getStatus(row.rate).label}。`;
        default:
          return `收入${row.achieved}（目标${row.target}，达成率${row.rate}%），MR ${row.mr}，MR达成率${row.mrRate}，渗透率${row.penetration}，ARPU ${row.arpu}。`;
      }
    };

    /* TOP1 分析 */
    if (top) {
      items.push({
        title: `${aiScopeLabel}达成最优：${top.name}`,
        text: `${metricText(top)} 该${aiScopeLabel === "全量" ? "对象" : aiScopeLabel}在${aiMetricLabel}维度表现突出，建议总结其运营经验并向其他${aiScopeLabel === "全量" ? "对象" : aiScopeLabel}推广。`,
      });
    }

    /* BOTTOM1 分析 */
    if (bottom && bottom !== top) {
      const gap = parseAmount(bottom.target) - parseAmount(bottom.achieved);
      items.push({
        title: `${aiScopeLabel}达成待提升：${bottom.name}`,
        text: `${metricText(bottom)} 缺口约${gap}万，建议重点关注并调配资源支持。`,
      });
    }

    /* 汇总分析 */
    const totalTarget = rows.reduce((s, r) => s + parseAmount(r.target), 0);
    const totalAchieved = rows.reduce((s, r) => s + parseAmount(r.achieved), 0);
    const avgRate = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

    if (aiMetric === "all" || aiMetric === "revenue" || aiMetric === "rate") {
      items.push({
        title: `${aiScopeLabel}整体收入达成概览`,
        text: `${aiScopeLabel === "全量" ? "全量" : aiScopeLabel}合计目标${totalTarget}万，实际完成${totalAchieved}万，整体达成率${avgRate}%。${avgRate >= 90 ? "整体达成情况良好。" : avgRate >= 80 ? "整体达成存在一定风险，需持续跟进。" : "整体达成严重滞后，建议紧急干预。"}`,
      });
    }

    if (aiMetric === "all" || aiMetric === "mr") {
      const mrRates = rows.map((r) => parseInt(r.mrRate) || 0).filter((n) => n > 0);
      const avgMr = mrRates.length > 0 ? Math.round(mrRates.reduce((s, n) => s + n, 0) / mrRates.length) : 0;
      items.push({
        title: `${aiScopeLabel}MR 货币化率分析`,
        text: `平均MR达成率${avgMr}%。${avgMr >= 85 ? "MR整体达标，建议保持。" : "MR偏低，建议加大广告产品推广力度，提升货币化水平。"}`,
      });
    }

    return items.length > 0 ? items : (aiData[bizLine] || []);
  })();

  return (
    <div className="space-y-4">
      {/* AI 智能分析 — 两个下拉 */}
      <div className="mb-1">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #faf5ff 0%, #f0e7ff 40%, #e8f0ff 100%)",
            border: "1px solid #e9d5ff",
          }}
        >
          {/* 标题行 */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">AI 智能分析</h2>
            <span className="text-xs text-gray-400 font-normal ml-1">| 选择视角范围与指标，让 AI 解读渠道数据</span>
          </div>

          {/* 两个下拉选择器 + 分析按钮 */}
          <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium shrink-0">视角范围</span>
              <Select value={aiScope} onValueChange={(v) => { setAiScope(v); setAiTriggered(false); }}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiScopeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium shrink-0">分析指标</span>
              <Select value={aiMetric} onValueChange={(v) => { setAiMetric(v); setAiTriggered(false); }}>
                <SelectTrigger className="w-[120px] h-8 text-xs bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiMetricOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => setAiTriggered(true)}
              className="flex items-center gap-1 h-8 px-4 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              开始分析
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 分割线 */}
          <div className="mx-5 border-t border-purple-100/60" />

          {/* 分析结果：统一默认第一条 + 苹果式展开 */}
          {!aiTriggered ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-400 nk-stagger">
              请选择维度后点击「开始分析」
            </div>
          ) : (
            <AiResultList items={aiAnalysisItems} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="总目标" value={summary.totalTarget} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成" value={summary.totalAchieved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="达成率" value={`${summary.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={summary.rate >= 90 ? "正常" : summary.rate >= 80 ? "有风险" : "严重滞后"} />
        <SummaryCard label="剩余缺口" value={summary.gap} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="覆盖合作商" value={`${summary.partners}`} icon={Network} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="平均MR达成率" value={`${avgMrRate}%`} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="region">
              <Network className="w-3.5 h-3.5 mr-1" />
              区域
            </TabsTrigger>
            <TabsTrigger value="partner">
              <Store className="w-3.5 h-3.5 mr-1" />
              总商
            </TabsTrigger>
            <TabsTrigger value="city">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              城市
            </TabsTrigger>
            <TabsTrigger value="bd">
              <Users className="w-3.5 h-3.5 mr-1" />
              BD/运营
            </TabsTrigger>
          </TabsList>
          <MonthSelector month={month} setMonth={setMonth} />
        </div>

        {/* ====== 区域 Tab ====== */}
<TabsContent value="region">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 左侧2/3：排行列表 */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">区域达成排行</span>
                  <Badge className="bg-blue-50 text-[#4080FF] border-none text-xs font-normal">{regionRows.length}个</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {regionRows.map((row, idx) => (
                      <div
                        key={row.name}
                        onClick={() => handleRegionClick(row.name)}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* 排名徽章 */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            idx === 0
                              ? "bg-amber-100 text-amber-600"
                              : idx === 1
                              ? "bg-gray-200 text-gray-600"
                              : idx === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {/* 名称 + 进度条 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#4080FF]" style={{ width: `${Math.min(row.rate, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-9 text-right">{row.rate}%</span>
                          </div>
                        </div>
                        {/* 收入 + 同比 */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{row.achieved}</p>
                          <p className="text-xs text-gray-400">
                            {row.partners}商 ·{" "}
                            <span className={row.yoy && row.yoy.startsWith("-") ? "text-red-400" : "text-emerald-500"}>{row.yoy}</span>
                          </p>
                        </div>
                        {/* 状态 */}
                        <div className="shrink-0">
                          <StatusBadge rate={row.rate} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧1/3：辅助卡片 */}
            <div className="space-y-5">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span>
                  </div>
                  <div className="space-y-1.5">
                    {sortByRate(regionRows).slice(0, 5).map((row, i) => (
                      <div key={row.region} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                        <span className="text-xs text-gray-700 flex-1 truncate">{row.region}</span>
                        <span className="text-xs font-medium text-emerald-600">{row.rate}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span>
                  </div>
                  <div className="space-y-1.5">
                    {sortByRate(regionRows).slice(-5).reverse().map((row, i) => (
                      <div key={row.region} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                        <span className="text-xs text-gray-700 flex-1 truncate">{row.region}</span>
                        <span className="text-xs font-medium text-red-500">{row.rate}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* TOP 3 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">TOP 3 表现</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {regionRows.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-200 text-gray-600" : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                        <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.partners}商</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 待关注（达成率<80%） */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">待关注（达成率偏低）</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {regionRows
                    .filter((r) => r.rate < 80)
                    .slice(0, 3)
                    .map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-500">!</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <p className="text-xs text-gray-400">达成率 {row.rate}% · {getStatus(row.rate).label}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* 关键指标 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">关键指标</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">达标区域</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {regionRows.filter((r) => r.rate >= 90).length}/{regionRows.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">平均达成率</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {regionRows.length > 0 ? Math.round(regionRows.reduce((s, r) => s + r.rate, 0) / regionRows.length) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">总合作商</span>
                    <span className="text-sm font-semibold text-gray-900">{regionRows.reduce((s, r) => s + (r.partners || 0), 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ====== 总商 Tab ====== */}
<TabsContent value="partner">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 左侧2/3：排行列表 */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">总商达成排行</span>
                  <Badge className="bg-blue-50 text-[#4080FF] border-none text-xs font-normal">{partnerRows.length}个</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {partnerRows.map((row, idx) => (
                      <div
                        key={row.name}
                        onClick={() => handlePartnerClick(row.name)}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* 排名徽章 */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            idx === 0
                              ? "bg-amber-100 text-amber-600"
                              : idx === 1
                              ? "bg-gray-200 text-gray-600"
                              : idx === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {/* 名称 + 进度条 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#4080FF]" style={{ width: `${Math.min(row.rate, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-9 text-right">{row.rate}%</span>
                          </div>
                        </div>
                        {/* 收入 + 同比 */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{row.achieved}</p>
                          <p className="text-xs text-gray-400">
                            {row.bds}BD ·{" "}
                            <span className={row.yoy && row.yoy.startsWith("-") ? "text-red-400" : "text-emerald-500"}>{row.yoy}</span>
                          </p>
                        </div>
                        {/* 状态 */}
                        <div className="shrink-0">
                          <StatusBadge rate={row.rate} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧1/3：辅助卡片 */}
            <div className="space-y-5">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span></div>
                  <div className="space-y-1.5">{sortByRate(partnerRows).slice(0, 5).map((row, i) => (<div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span><span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span><span className="text-xs font-medium text-emerald-600">{row.rate}%</span></div>))}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span></div>
                  <div className="space-y-1.5">{sortByRate(partnerRows).slice(-5).reverse().map((row, i) => (<div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span><span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span><span className="text-xs font-medium text-red-500">{row.rate}%</span></div>))}</div>
                </CardContent>
              </Card>
              {/* TOP 3 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">TOP 3 表现</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {partnerRows.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-200 text-gray-600" : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                        <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.region}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 待关注（达成率<80%） */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">待关注（达成率偏低）</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {partnerRows
                    .filter((r) => r.rate < 80)
                    .slice(0, 3)
                    .map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-500">!</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.region}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* 关键指标 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">关键指标</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">达标总商</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {partnerRows.filter((r) => r.rate >= 90).length}/{partnerRows.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">平均达成率</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {partnerRows.length > 0 ? Math.round(partnerRows.reduce((s, r) => s + r.rate, 0) / partnerRows.length) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">总激励</span>
                    <span className="text-sm font-semibold text-[#4080FF]">{partnerTotalProfit.toFixed(1)}万</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ====== 城市 Tab ====== */}
<TabsContent value="city">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 左侧2/3：排行列表 */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">城市达成排行</span>
                  <Badge className="bg-blue-50 text-[#4080FF] border-none text-xs font-normal">{cityRows.length}个</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {cityRows.map((row, idx) => (
                      <div
                        key={row.name}
                        onClick={() => handleCityClick(row.name)}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* 排名徽章 */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            idx === 0
                              ? "bg-amber-100 text-amber-600"
                              : idx === 1
                              ? "bg-gray-200 text-gray-600"
                              : idx === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {/* 名称 + 进度条 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#4080FF]" style={{ width: `${Math.min(row.rate, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-9 text-right">{row.rate}%</span>
                          </div>
                        </div>
                        {/* 收入 + 同比 */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{row.achieved}</p>
                          <p className="text-xs text-gray-400">
                            {row.partners}商 ·{" "}
                            <span className={row.yoy && row.yoy.startsWith("-") ? "text-red-400" : "text-emerald-500"}>{row.yoy}</span>
                          </p>
                        </div>
                        {/* 状态 */}
                        <div className="shrink-0">
                          <StatusBadge rate={row.rate} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧1/3：辅助卡片 */}
            <div className="space-y-5">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span></div>
                  <div className="space-y-1.5">{sortByRate(cityRows).slice(0, 5).map((row, i) => (<div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span><span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span><span className="text-xs font-medium text-emerald-600">{row.rate}%</span></div>))}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span></div>
                  <div className="space-y-1.5">{sortByRate(cityRows).slice(-5).reverse().map((row, i) => (<div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span><span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span><span className="text-xs font-medium text-red-500">{row.rate}%</span></div>))}</div>
                </CardContent>
              </Card>
              {/* TOP 3 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">TOP 3 表现</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {cityRows.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-200 text-gray-600" : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                        <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.region}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 待关注（达成率<80%） */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">待关注（达成率偏低）</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {cityRows
                    .filter((r) => r.rate < 80)
                    .slice(0, 3)
                    .map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-500">!</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.region}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* 关键指标 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">关键指标</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">达标城市</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {cityRows.filter((r) => r.rate >= 90).length}/{cityRows.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">平均达成率</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {cityRows.length > 0 ? Math.round(cityRows.reduce((s, r) => s + r.rate, 0) / cityRows.length) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">总合作商</span>
                    <span className="text-sm font-semibold text-gray-900">{cityRows.reduce((s, r) => s + (r.partners || 0), 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ====== BD/运营 Tab ====== */}
<TabsContent value="bd">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 左侧2/3：排行列表 */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">BD/运营达成排行</span>
                  <Badge className="bg-blue-50 text-[#4080FF] border-none text-xs font-normal">{bdRows.length}个</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {bdRows.map((row, idx) => (
                      <div key={row.name} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        {/* 排名徽章 */}
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            idx === 0
                              ? "bg-amber-100 text-amber-600"
                              : idx === 1
                              ? "bg-gray-200 text-gray-600"
                              : idx === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        {/* 名称 + 进度条 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {row.name}
                            <span className="text-xs text-gray-400 font-normal ml-1.5">{row.city}</span>
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#4080FF]" style={{ width: `${Math.min(row.rate, 100)}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-9 text-right">{row.rate}%</span>
                          </div>
                        </div>
                        {/* 收入 + 同比 */}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-gray-900">{row.achieved}</p>
                          <p className="text-xs text-gray-400">
                            {row.stores}店 ·{" "}
                            <span className={row.yoy && row.yoy.startsWith("-") ? "text-red-400" : "text-emerald-500"}>{row.yoy}</span>
                          </p>
                        </div>
                        {/* 状态 */}
                        <div className="shrink-0">
                          <StatusBadge rate={row.rate} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧1/3：辅助卡片 */}
            <div className="space-y-5">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span></div>
                  <div className="space-y-1.5">{sortByRate(bdRows).slice(0, 5).map((row, i) => (<div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span><span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span><span className="text-xs font-medium text-emerald-600">{row.rate}%</span></div>))}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span></div>
                  <div className="space-y-1.5">{sortByRate(bdRows).slice(-5).reverse().map((row, i) => (<div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50"><span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span><span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span><span className="text-xs font-medium text-red-500">{row.rate}%</span></div>))}</div>
                </CardContent>
              </Card>
              {/* TOP 3 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">TOP 3 表现</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {bdRows.slice(0, 3).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-gray-200 text-gray-600" : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                        <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.city}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 待关注（达成率<80%） */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">待关注（达成率偏低）</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  {bdRows
                    .filter((r) => r.rate < 80)
                    .slice(0, 3)
                    .map((row, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-sm font-bold text-red-500">!</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                          <p className="text-xs text-gray-400">达成率 {row.rate}% · {row.city}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* 关键指标 */}
              <Card className="border-none shadow-sm bg-white">
                <div className="px-5 py-4 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">关键指标</span>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">达标BD/运营</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {bdRows.filter((r) => r.rate >= 90).length}/{bdRows.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">平均达成率</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {bdRows.length > 0 ? Math.round(bdRows.reduce((s, r) => s + r.rate, 0) / bdRows.length) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">总激励</span>
                    <span className="text-sm font-semibold text-[#4080FF]">{bdTotalProfit.toFixed(1)}万</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ================================================================== */
/* biz_manager 视图                                                    */
/* ================================================================== */
const BizManagerView = () => {
  const { currentUser } = useUser();
  const { bizLine } = useBizLine();
  const navigate = useNavigate();
  const [month, setMonth] = useState("2025-08");
  const region = currentUser?.region || "江苏区域";

  const cityRows = bizManagerCityRows[bizLine];
  const partnerRows = bizManagerPartnerRows[bizLine];
  const aiItems = bizLine === "waimai" ? aiData.bizManagerWaimai : aiData.bizManagerDaocan;

  const regionTarget = cityRows.reduce((s, r) => s + parseAmount(r.target), 0);
  const regionAchieved = cityRows.reduce((s, r) => s + parseAmount(r.achieved), 0);
  const regionRate = Math.round((regionAchieved / regionTarget) * 100);
  const regionGap = (regionTarget - regionAchieved).toFixed(0) + "万";
  const avgMrRate = useMemo(() => {
    const rates = cityRows.map((r) => parseInt(r.mrRate));
    return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
  }, [cityRows]);
  const totalProfit = useMemo(
    () => partnerRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [partnerRows]
  );

  const handleCityClick = (cityName) => {
    navigate(`/channel/region/${encodeURIComponent(region)}/city/${encodeURIComponent(cityName)}`);
  };

  const bizManagerAiItems = bizLine === "waimai" ? aiData.bizManagerWaimai : aiData.bizManagerDaocan;
  const aiModules = [
    { key: "city", label: "城市达成", items: bizManagerAiItems },
    { key: "partner", label: "总商分润", items: bizManagerAiItems },
  ];

  return (
    <div className="space-y-4">
      <AiAnalysisPanel modules={aiModules} subtitle="选择板块，让 AI 帮你解读区域数据" />
      <MonthSelector month={month} setMonth={setMonth} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="区域目标" value={`${regionTarget.toFixed(0)}万`} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成" value={`${regionAchieved.toFixed(0)}万`} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="区域达成率" value={`${regionRate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={regionRate >= 90 ? "正常" : regionRate >= 80 ? "有风险" : "严重滞后"} />
        <SummaryCard label="剩余缺口" value={regionGap} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="覆盖城市" value={`${cityRows.length}`} icon={Network} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="平均MR达成率" value={`${avgMrRate}%`} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* 城市达成明细 - 无激励列 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">{region} · 城市达成明细</p>
            <span className="text-xs text-gray-400">点击穿透 → 查看BD/运营明细 · 消息图标 → 下发诊断</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <ExpandedTableHeader showIncentive={false} showOpAction />
              <TableBody>
                {cityRows.map((row) => (
                  <ExpandedTableRow
                    key={row.name}
                    row={row}
                    onOpAction={() => handleCityClick(row.name)}
                    onDiagnosis
                    showIncentive={false}
                    showOpAction
                    nameCellExtra={`${row.bdCount}BD · ${row.merchantCount}商户`}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">区域合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{regionTarget.toFixed(0)}万</TableCell>
                  <TableCell className="font-semibold text-gray-900">{regionAchieved.toFixed(0)}万</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{regionRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-gray-900">{avgMrRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell><StatusBadge rate={regionRate} /></TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 总商达成明细 - 含激励列 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">{region} · 总商达成明细</p>
            <span className="text-xs text-gray-400">点击穿透 → 查看BD/运营明细 · 消息图标 → 下发诊断</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <ExpandedTableHeader showIncentive showOpAction />
              <TableBody>
                {partnerRows.map((row) => (
                  <ExpandedTableRow
                    key={row.name}
                    row={row}
                    onOpAction={() => navigate(`/channel/partner/${encodeURIComponent(row.name)}`)}
                    onDiagnosis
                    showIncentive
                    showOpAction
                    nameCellExtra={`${row.cities}城 · ${row.bds}BD`}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{(partnerRows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{(partnerRows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{partnerRows.length > 0 ? Math.round(partnerRows.reduce((s, r) => s + r.rate, 0) / partnerRows.length) : 0}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(1)}万</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* partner 视图                                                        */
/* ================================================================== */
const PartnerView = () => {
  const { bizLine } = useBizLine();
  const navigate = useNavigate();
  const [month, setMonth] = useState("2025-08");

  const bdRows = partnerBdRows[bizLine];
  const citySummary = partnerCitySummary[bizLine];
  const aiItems = bizLine === "waimai" ? aiData.partnerWaimai : aiData.partnerDaocan;

  const totalProfit = useMemo(
    () => bdRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [bdRows]
  );

  const handleBdClick = (bdName) => {
    navigate(`/channel/bd/${encodeURIComponent(bdName)}`);
  };

  const partnerAiItems = bizLine === "waimai" ? aiData.partnerWaimai : aiData.partnerDaocan;
  const aiModules = [
    { key: "bd", label: "BD团队", items: partnerAiItems },
    { key: "profit", label: "分润分析", items: partnerAiItems },
  ];

  return (
    <div className="space-y-4">
      <AiAnalysisPanel modules={aiModules} subtitle="选择板块，让 AI 帮你解读合作商数据" />
      <MonthSelector month={month} setMonth={setMonth} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="城市目标" value={citySummary.target} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成" value={citySummary.achieved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="城市达成率" value={`${citySummary.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={citySummary.rate >= 90 ? "正常" : "有风险"} />
        <SummaryCard label="分润金额" value={citySummary.profitAmount} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
        <SummaryCard label="覆盖BD" value={`${citySummary.bds}`} icon={Network} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="渗透率" value={citySummary.penetration} icon={Store} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* BD达成明细 - 含激励列 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">BD/运营达成明细</p>
            <span className="text-xs text-gray-400">点击穿透 → 查看门店明细 · 消息图标 → 下发诊断</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <ExpandedTableHeader showIncentive showStorePool showOpAction />
              <TableBody>
                {bdRows.map((row) => (
                  <ExpandedTableRow
                    key={row.name}
                    row={row}
                    onOpAction={() => handleBdClick(row.name)}
                    onDiagnosis
                    showIncentive
                    showStorePool
                    showOpAction
                    nameCellExtra={`${row.mis} · ${row.stores}家门店`}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{(bdRows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{(bdRows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{bdRows.length > 0 ? Math.round(bdRows.reduce((s, r) => s + r.rate, 0) / bdRows.length) : 0}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(2)}万</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* bd 视图                                                             */
/* ================================================================== */
const BdView = () => {
  const { bizLine } = useBizLine();
  const [month, setMonth] = useState("2025-08");

  const storeRows = bdStoreRows[bizLine];
  const aiItems = bizLine === "waimai" ? aiData.bdWaimai : aiData.bdDaocan;

  const total = storeRows.length;
  const achievedCount = storeRows.filter((row) => row.rate >= 100).length;
  const overallRate = (storeRows.reduce((sum, row) => sum + row.rate, 0) / total).toFixed(1);
  const totalProfit = useMemo(
    () => storeRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [storeRows]
  );

  const bdAiItems = bizLine === "waimai" ? aiData.bdWaimai : aiData.bdDaocan;
  const aiModules = [
    { key: "store", label: "门店达成", items: bdAiItems },
    { key: "profit", label: "分润贡献", items: bdAiItems },
  ];

  return (
    <div className="space-y-4">
      <AiAnalysisPanel modules={aiModules} subtitle="选择板块，让 AI 帮你解读门店数据" />
      <MonthSelector month={month} setMonth={setMonth} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="门店数" value={`${total}`} icon={Store} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="已达标" value={`${achievedCount}`} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="个人达成率" value={`${overallRate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" />
        <SummaryCard label="分润金额" value={`${totalProfit.toFixed(2)}万`} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">门店目标达成明细</p>
          <div className="overflow-x-auto">
            <Table>
              <ExpandedTableHeader showIncentive showStorePool showOpAction={false} />
              <TableBody>
                {storeRows.map((row) => (
                  <ExpandedTableRow
                    key={row.name}
                    row={row}
                    showIncentive
                    showStorePool
                    showOpAction={false}
                    nameCellExtra={row.type}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{(storeRows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{(storeRows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{overallRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="text-gray-600">{storeRows.reduce((s, r) => s + (r.totalStores || 0), 0)}</TableCell>
                  <TableCell className="text-gray-600">{storeRows.reduce((s, r) => s + (r.adStores || 0), 0)}</TableCell>
                  <TableCell className="text-gray-600">{Math.round(storeRows.reduce((s, r) => s + (r.adStores || 0), 0) / storeRows.reduce((s, r) => s + (r.totalStores || 1), 0) * 100)}%</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(2)}万</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* 独立导出的四个明细视图（供明细页使用）                                */
/* ================================================================== */
/* ================================================================== */
/* 区域明细表格 —— 按设计图2                                            */
/* ================================================================== */
const RegionDetailTable = ({ rows, onRegionClick }) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[100px]">区域</TableHead>
          <TableHead>城市数</TableHead>
          <TableHead>目标收入</TableHead>
          <TableHead>收入</TableHead>
          <TableHead>收入YoY</TableHead>
          <TableHead>收入MoM</TableHead>
          <TableHead className="w-28">达成率</TableHead>
          <TableHead>渗透率</TableHead>
          <TableHead>渗透率YoY</TableHead>
          <TableHead>渗透率MoM</TableHead>
          <TableHead>ARPU</TableHead>
          <TableHead>ARPU YoY</TableHead>
          <TableHead>ARPU MoM</TableHead>
          <TableHead>商家数</TableHead>
          <TableHead>商家数YoY</TableHead>
          <TableHead>商家数MoM</TableHead>
          <TableHead>GTV</TableHead>
          <TableHead className="w-24">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name} className="hover:bg-blue-50/30">
            <TableCell className="font-semibold text-gray-900">
              {row.name}
              <span className="block text-xs font-normal text-gray-400 mt-0.5">{row.partners}家合作商</span>
            </TableCell>
            <TableCell>{row.cities}</TableCell>
            <TableCell>{row.target}</TableCell>
            <TableCell className="font-medium text-gray-700">{row.achieved}</TableCell>
            <TrendCell value={row.yoy} />
            <TrendCell value={row.mom} />
            <TableCell><RateProgress rate={row.rate} /></TableCell>
            <TableCell className="text-gray-600">{row.penetration}</TableCell>
            <TrendCell value={row.penetrationYoy} />
            <TrendCell value={row.penetrationMom} />
            <TableCell className="text-gray-600">{row.arpu}</TableCell>
            <TrendCell value={row.arpuYoy} />
            <TrendCell value={row.arpuMom} />
            <TableCell className="text-gray-600">{row.merchantCount}</TableCell>
            <TrendCell value={row.merchantYoY} />
            <TrendCell value={row.merchantMom} />
            <TableCell className="text-gray-600">{row.gtv}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <button onClick={() => onRegionClick && onRegionClick(row.name)} className="p-1 rounded hover:bg-blue-100" title="下钻到城市">
                  <ExternalLink className="w-4 h-4 text-[#4080FF]" />
                </button>
                <button className="p-1 rounded hover:bg-blue-100" title="下发城市诊断到大象">
                  <MessageSquare className="w-4 h-4 text-[#4080FF]" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="font-semibold text-gray-900">全国合计</TableCell>
          <TableCell className="font-semibold text-gray-900">{rows.reduce((s, r) => s + (r.cities || 0), 0)}</TableCell>
          <TableCell className="font-semibold text-gray-900">{(rows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
          <TableCell className="font-semibold text-gray-900">{(rows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
          <TableCell /><TableCell />
          <TableCell className="font-semibold text-[#4080FF]">{rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.rate, 0) / rows.length) : 0}%</TableCell>
          <TableCell /><TableCell /><TableCell />
          <TableCell /><TableCell /><TableCell />
          <TableCell className="font-semibold text-gray-900">{rows.reduce((s, r) => s + parseInt((r.merchantCount || "0").replace(/,/g, "")), 0).toLocaleString()}</TableCell>
          <TableCell /><TableCell />
          <TableCell /><TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  </div>
);

export const ChannelRegionView = () => {
  const { bizLine } = useBizLine();
  const navigate = useNavigate();

  const regionRows = useMemo(() => sortByRate(channelRegionRows[bizLine]), [bizLine]);

  const handleRegionClick = (regionName) => {
    navigate(`/channel/region/${encodeURIComponent(regionName)}`);
  };

  return (
    <div className="space-y-5">
      <AiAnalysisBlock rows={regionRows} scopeLabel="区域" />
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">全国区域达成明细</p>
            <span className="text-xs text-gray-400">可用范围：平台管理员、广告业务经理（仅自己区域）</span>
          </div>
          <RegionDetailTable rows={regionRows} onRegionClick={handleRegionClick} />
        </CardContent>
      </Card>
    </div>
  );
};

export const ChannelPartnerView = () => {
  const { bizLine } = useBizLine();
  const navigate = useNavigate();

  const partnerRows = useMemo(() => sortByRate(channelPartnerRows[bizLine]), [bizLine]);

  const partnerTotalProfit = useMemo(
    () => partnerRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [partnerRows]
  );

  const handlePartnerClick = (partnerName) => {
    navigate(`/channel/partner/${encodeURIComponent(partnerName)}`);
  };

  const partnerTop5 = partnerRows.slice(0, 5);
  const partnerBottom5 = partnerRows.slice(-5).reverse();

  return (
    <>
      <AiAnalysisBlock rows={partnerRows} scopeLabel="总商" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-semibold text-gray-900">全国总商达成明细</p>
                <span className="text-xs text-gray-400">点击穿透 → 查看BD/运营明细 · 消息图标 → 下发诊断</span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <ExpandedTableHeader showIncentive showOpAction />
                  <TableBody>
                    {partnerRows.map((row) => (
                      <ExpandedTableRow
                        key={row.name}
                        row={row}
                        onOpAction={() => handlePartnerClick(row.name)}
                        onDiagnosis
                        showIncentive
                        showOpAction
                        nameCellExtra={`${row.region} · ${row.cities}城 · ${row.bds}BD`}
                      />
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-900">合计</TableCell>
                      <TableCell className="font-semibold text-gray-900">{(partnerRows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{(partnerRows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
                      <TableCell className="font-semibold text-[#4080FF]">{partnerRows.length > 0 ? Math.round(partnerRows.reduce((s, r) => s + r.rate, 0) / partnerRows.length) : 0}%</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell className="font-semibold text-[#4080FF]">{partnerTotalProfit.toFixed(1)}万</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span>
              </div>
              <div className="space-y-1.5">
                {partnerTop5.map((row, i) => (
                  <div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                    <span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span>
                    <span className="text-xs font-medium text-emerald-600">{row.rate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span>
              </div>
              <div className="space-y-1.5">
                {partnerBottom5.map((row, i) => (
                  <div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                    <span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span>
                    <span className="text-xs font-medium text-red-500">{row.rate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <div className="px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">关键指标</span>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">总商数量</span>
                <span className="text-sm font-semibold text-gray-900">{partnerRows.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">平均达成率</span>
                <span className="text-sm font-semibold text-emerald-600">{partnerRows.length > 0 ? Math.round(partnerRows.reduce((s, r) => s + r.rate, 0) / partnerRows.length) : 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">总利润</span>
                <span className="text-sm font-semibold text-gray-900">{partnerTotalProfit.toFixed(1)}万</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

/* ================================================================== */
/* 城市明细表格 —— 按设计图1                                            */
/* ================================================================== */
const CityDetailTable = ({ rows, onCityClick }) => (
  <div className="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[80px]">区域</TableHead>
          <TableHead className="min-w-[80px]">城市</TableHead>
          <TableHead>目标收入</TableHead>
          <TableHead>收入</TableHead>
          <TableHead>收入YoY</TableHead>
          <TableHead>收入MoM</TableHead>
          <TableHead className="w-28">达成率</TableHead>
          <TableHead>渗透率</TableHead>
          <TableHead>渗透率YoY</TableHead>
          <TableHead>渗透率MoM</TableHead>
          <TableHead>ARPU</TableHead>
          <TableHead>ARPU YoY</TableHead>
          <TableHead>ARPU MoM</TableHead>
          <TableHead>商家数</TableHead>
          <TableHead>商家数YoY</TableHead>
          <TableHead>商家数MoM</TableHead>
          <TableHead>GTV</TableHead>
          <TableHead className="w-24">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name} className="hover:bg-blue-50/30">
            <TableCell className="text-gray-600">{row.region}</TableCell>
            <TableCell className="font-semibold text-gray-900">
              {row.name}
              <span className="block text-xs font-normal text-gray-400 mt-0.5">{row.partners}家合作商 · {row.bds}BD</span>
            </TableCell>
            <TableCell>{row.target}</TableCell>
            <TableCell className="font-medium text-gray-700">{row.achieved}</TableCell>
            <TrendCell value={row.yoy} />
            <TrendCell value={row.mom} />
            <TableCell><RateProgress rate={row.rate} /></TableCell>
            <TableCell className="text-gray-600">{row.penetration}</TableCell>
            <TrendCell value={row.penetrationYoy} />
            <TrendCell value={row.penetrationMom} />
            <TableCell className="text-gray-600">{row.arpu}</TableCell>
            <TrendCell value={row.arpuYoy} />
            <TrendCell value={row.arpuMom} />
            <TableCell className="text-gray-600">{row.merchantCount}</TableCell>
            <TrendCell value={row.merchantYoY} />
            <TrendCell value={row.merchantMom} />
            <TableCell className="text-gray-600">{row.gtv}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <button onClick={() => onCityClick && onCityClick(row.name)} className="p-1 rounded hover:bg-blue-100" title="下钻到BD">
                  <ExternalLink className="w-4 h-4 text-[#4080FF]" />
                </button>
                <button className="p-1 rounded hover:bg-blue-100" title="下发城市诊断到大象">
                  <MessageSquare className="w-4 h-4 text-[#4080FF]" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell /><TableCell className="font-semibold text-gray-900">全国合计</TableCell>
          <TableCell className="font-semibold text-gray-900">{(rows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
          <TableCell className="font-semibold text-gray-900">{(rows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
          <TableCell /><TableCell />
          <TableCell className="font-semibold text-[#4080FF]">{rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.rate, 0) / rows.length) : 0}%</TableCell>
          <TableCell /><TableCell /><TableCell />
          <TableCell /><TableCell /><TableCell />
          <TableCell className="font-semibold text-gray-900">{rows.reduce((s, r) => s + parseInt((r.merchantCount || "0").replace(/,/g, "")), 0).toLocaleString()}</TableCell>
          <TableCell /><TableCell />
          <TableCell /><TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  </div>
);

export const ChannelCityView = () => {
  const { bizLine } = useBizLine();
  const navigate = useNavigate();

  const cityRows = useMemo(() => sortByRate(channelCityRows[bizLine]), [bizLine]);

  const totalAchieved = useMemo(() => cityRows.reduce((s, r) => s + parseAmount(r.achieved), 0), [cityRows]);
  const avgMr = useMemo(() => {
    const vals = cityRows.map((r) => parseFloat(r.mr)).filter((n) => !isNaN(n));
    return vals.length > 0 ? (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(2) : "0.00";
  }, [cityRows]);
  const momTrend = useMemo(() => {
    const up = cityRows.filter((r) => !r.mom.startsWith("-")).length;
    return `${up}/${cityRows.length}`;
  }, [cityRows]);

  const handleCityClick = (cityName) => {
    const city = cityRows.find((r) => r.name === cityName);
    if (city) {
      navigate(`/channel/region/${encodeURIComponent(city.region)}/city/${encodeURIComponent(cityName)}`);
    }
  };

  return (
    <div className="space-y-5">
      <AiAnalysisBlock rows={cityRows} scopeLabel="城市" />

      {/* 3个KPI卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{(totalAchieved / 10000).toFixed(0)}万</div>
                <div className="text-xs text-gray-500 mt-0.5">广告收入 | MoM {momTrend}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-50">
                <Gauge className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgMr}%</div>
                <div className="text-xs text-gray-500 mt-0.5">MR | MoM {momTrend}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{cityRows.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">负责城市数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 城市明细表格 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">全国城市达成明细</p>
            <span className="text-xs text-gray-400">可用范围：平台管理员、广告业务经理（仅自己区域）、城市经理（仅自己区域）</span>
          </div>
          <CityDetailTable rows={cityRows} onCityClick={handleCityClick} />
        </CardContent>
      </Card>
    </div>
  );
};

export const ChannelBdView = () => {
  const { bizLine } = useBizLine();

  const bdRows = useMemo(() => sortByRate(channelBdRows[bizLine]), [bizLine]);

  const bdTotalProfit = useMemo(
    () => bdRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [bdRows]
  );

  const bdTop5 = bdRows.slice(0, 5);
  const bdBottom5 = bdRows.slice(-5).reverse();

  return (
    <>
      <AiAnalysisBlock rows={bdRows} scopeLabel="BD/运营" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-semibold text-gray-900">全国BD/运营达成明细</p>
                <span className="text-xs text-gray-400">消息图标 → 下发诊断</span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <ExpandedTableHeader showIncentive showOpAction />
                  <TableBody>
                    {bdRows.map((row) => (
                      <ExpandedTableRow
                        key={row.name}
                        row={row}
                        onDiagnosis
                        showIncentive
                        showOpAction
                        nameCellExtra={`${row.mis} · ${row.region} · ${row.city} · ${row.stores}家门店`}
                      />
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-900">合计</TableCell>
                      <TableCell className="font-semibold text-gray-900">{(bdRows.reduce((s, r) => s + parseAmount(r.target), 0) / 10000).toFixed(0) + "万"}</TableCell>
                      <TableCell className="font-semibold text-gray-900">{(bdRows.reduce((s, r) => s + parseAmount(r.achieved), 0) / 10000).toFixed(0) + "万"}</TableCell>
                      <TableCell className="font-semibold text-[#4080FF]">{bdRows.length > 0 ? Math.round(bdRows.reduce((s, r) => s + r.rate, 0) / bdRows.length) : 0}%</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell className="font-semibold text-[#4080FF]">{bdTotalProfit.toFixed(1)}万</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-gray-900">收入达成率 TOP 5</span>
              </div>
              <div className="space-y-1.5">
                {bdTop5.map((row, i) => (
                  <div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                    <span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span>
                    <span className="text-xs font-medium text-emerald-600">{row.rate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-gray-900">收入达成率 Bottom 5</span>
              </div>
              <div className="space-y-1.5">
                {bdBottom5.map((row, i) => (
                  <div key={row.name} className="flex items-center gap-3 px-3 py-1 rounded-lg hover:bg-gray-50">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < 3 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                    <span className="text-xs text-gray-700 flex-1 truncate">{row.name}</span>
                    <span className="text-xs font-medium text-red-500">{row.rate}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white">
            <div className="px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">关键指标</span>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">BD/运营数量</span>
                <span className="text-sm font-semibold text-gray-900">{bdRows.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">平均达成率</span>
                <span className="text-sm font-semibold text-emerald-600">{bdRows.length > 0 ? Math.round(bdRows.reduce((s, r) => s + r.rate, 0) / bdRows.length) : 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">总利润</span>
                <span className="text-sm font-semibold text-gray-900">{bdTotalProfit.toFixed(1)}万</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

/* ================================================================== */
/* AI 智能分析面板（明细页面专用）                                        */
/* ================================================================== */
const AiAnalysisBlock = ({ rows, scopeLabel }) => {
  const { bizLine } = useBizLine();
  const [aiScope, setAiScope] = useState("all");
  const [aiMetric, setAiMetric] = useState("all");
  const [aiTriggered, setAiTriggered] = useState(true);

  const aiMetricOptions = [
    { value: "all", label: "所有指标" },
    { value: "revenue", label: "收入" },
    { value: "mr", label: "MR" },
    { value: "rate", label: "达成率" },
  ];

  const aiScopeOptions = [{ value: "all", label: "全量" }, ...rows.map((r) => ({ value: r.name, label: r.name }))];
  const aiScopeLabel = aiScopeOptions.find((o) => o.value === aiScope)?.label || "全量";
  const aiMetricLabel = aiMetricOptions.find((o) => o.value === aiMetric)?.label || "所有指标";

  const filteredRows = aiScope === "all" ? rows : rows.filter((r) => r.name === aiScope);

  const aiAnalysisItems = (() => {
    const scopeRows = filteredRows;
    if (!scopeRows || scopeRows.length === 0) return [];

    const items = [];
    const sorted = [...scopeRows].sort((a, b) => (b.rate || 0) - (a.rate || 0));
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    const metricText = (row) => {
      if (!row) return "";
      switch (aiMetric) {
        case "revenue":
          return `收入${row.achieved}（目标${row.target}），YoY ${row.yoy}，MoM ${row.mom}。`;
        case "mr":
          return `MR ${row.mr}，MR达成率${row.mrRate}，MR YoY ${row.mrYoy}，MR MoM ${row.mrMom}。`;
        case "rate":
          return `达成率${row.rate}%（${row.achieved}/${row.target}），状态：${getStatus(row.rate).label}。`;
        default:
          return `收入${row.achieved}（目标${row.target}，达成率${row.rate}%），MR ${row.mr}，MR达成率${row.mrRate}，渗透率${row.penetration}，ARPU ${row.arpu}。`;
      }
    };

    /* 多对象时才有 TOP/BOTTOM */
    if (scopeRows.length > 1) {
      if (top) {
        items.push({
          title: `${aiScopeLabel}达成最优：${top.name}`,
          text: `${metricText(top)} 该${scopeLabel}在${aiMetricLabel}维度表现突出，建议总结其运营经验并向其他${scopeLabel}推广。`,
        });
      }
      if (bottom && bottom !== top) {
        const gap = parseAmount(bottom.target) - parseAmount(bottom.achieved);
        items.push({
          title: `${aiScopeLabel}达成待提升：${bottom.name}`,
          text: `${metricText(bottom)} 缺口约${gap}万，建议重点关注并调配资源支持。`,
        });
      }
    }

    /* 单对象时输出单项解读 */
    if (scopeRows.length === 1 && top) {
      const row = top;
      items.push({
        title: `${row.name} 关键指标解读`,
        text: `${metricText(row)} 该${scopeLabel}整体${row.rate >= 90 ? "表现优秀" : row.rate >= 80 ? "表现良好" : "存在提升空间"}，建议${row.rate >= 90 ? "保持当前策略并探索增长机会" : row.rate >= 80 ? "持续关注并优化投放策略" : "紧急制定改进方案，提升达成水平"}。`,
      });
    }

    /* 汇总分析 */
    const totalTarget = scopeRows.reduce((s, r) => s + parseAmount(r.target), 0);
    const totalAchieved = scopeRows.reduce((s, r) => s + parseAmount(r.achieved), 0);
    const avgRate = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

    if (aiMetric === "all" || aiMetric === "revenue" || aiMetric === "rate") {
      items.push({
        title: `${aiScopeLabel}整体收入达成概览`,
        text: `${aiScopeLabel === "全量" ? "全量" : aiScopeLabel}合计目标${totalTarget}万，实际完成${totalAchieved}万，整体达成率${avgRate}%。${avgRate >= 90 ? "整体达成情况良好。" : avgRate >= 80 ? "整体达成存在一定风险，需持续跟进。" : "整体达成严重滞后，建议紧急干预。"}`,
      });
    }

    const hasMr = scopeRows.some((r) => r.mrRate);
    if ((aiMetric === "all" || aiMetric === "mr") && hasMr) {
      const mrRates = scopeRows.map((r) => parseInt(r.mrRate) || 0).filter((n) => n > 0);
      const avgMr = mrRates.length > 0 ? Math.round(mrRates.reduce((s, n) => s + n, 0) / mrRates.length) : 0;
      items.push({
        title: `${aiScopeLabel}MR 货币化率分析`,
        text: `平均MR达成率${avgMr}%。${avgMr >= 85 ? "MR整体达标，建议保持。" : "MR偏低，建议加大广告产品推广力度，提升货币化水平。"}`,
      });
    }

    return items;
  })();

  return (
    <div className="mb-5">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #faf5ff 0%, #f0e7ff 40%, #e8f0ff 100%)",
          border: "1px solid #e9d5ff",
        }}
      >
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-gray-900">AI 智能分析</h2>
          <span className="text-xs text-gray-400 font-normal ml-1">| 选择{scopeLabel}视角与指标，让 AI 解读数据</span>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium shrink-0">视角范围</span>
            <Select value={aiScope} onValueChange={(v) => { setAiScope(v); setAiTriggered(false); }}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiScopeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium shrink-0">分析指标</span>
            <Select value={aiMetric} onValueChange={(v) => { setAiMetric(v); setAiTriggered(false); }}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiMetricOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => setAiTriggered(true)}
            className="flex items-center gap-1 h-8 px-4 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            开始分析
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mx-5 border-t border-purple-100/60" />

        {!aiTriggered ? (
          <div className="flex items-center justify-center py-6 text-sm text-gray-400 nk-stagger">
            请选择维度后点击「开始分析」
          </div>
        ) : (
          <AiResultList items={aiAnalysisItems} />
        )}
      </div>
    </div>
  );
};

/* ================================================================== */
/* 主组件                                                              */
/* ================================================================== */
const Channel = () => {
  const { currentUser } = useUser();
  const role = currentUser?.role;

  const renderContent = () => {
    if (role === "partner") return <PartnerView />;
    if (role === "bd") return <BdView />;
    if (role === "biz_manager") return <BizManagerView />;
    return <PlatformAdminView />;
  };

  return (
    <div className="space-y-5">
      {renderContent()}
    </div>
  );
};

export default Channel;
