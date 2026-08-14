import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useBizLine } from "@/contexts/BizLineContext";
import PageHeader from "@/components/dashboard/PageHeader";
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
} from "lucide-react";

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

const AiDiagnosisCard = ({ items }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader>
      <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#4080FF]" />
        AI 智能分析
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
            <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
            <div className="min-w-0">
              {item.title && <p className="font-semibold text-gray-800 mb-0.5">{item.title}</p>}
              <p className="leading-relaxed">{item.text || item}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

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
    arpu: r.arpu || `${(0.5 + Math.random() * 4.5).toFixed(2)}万`,
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
    { name: "华东区", partners: 12, cities: 4, target: "1,800万", achieved: "1,620万", rate: 90, yoy: "+12.4%", mom: "+3.1%" },
    { name: "华南区", partners: 10, cities: 3, target: "1,400万", achieved: "1,330万", rate: 95, yoy: "+8.1%", mom: "+2.4%" },
    { name: "华北区", partners: 8, cities: 3, target: "1,200万", achieved: "888万", rate: 74, yoy: "-3.6%", mom: "-5.2%" },
    { name: "西南区", partners: 6, cities: 3, target: "1,200万", achieved: "1,164万", rate: 97, yoy: "+15.2%", mom: "+4.6%" },
    { name: "东北区", partners: 6, cities: 3, target: "780万", achieved: "439万", rate: 56, yoy: "-8.3%", mom: "-6.8%" },
  ],
  daocan: [
    { name: "华东区", partners: 10, cities: 3, target: "1,400万", achieved: "1,292万", rate: 92, yoy: "+10.1%", mom: "+2.8%" },
    { name: "华南区", partners: 8, cities: 3, target: "1,200万", achieved: "1,140万", rate: 95, yoy: "+6.5%", mom: "+1.9%" },
    { name: "华北区", partners: 7, cities: 3, target: "900万", achieved: "666万", rate: 74, yoy: "-5.2%", mom: "-4.3%" },
    { name: "西南区", partners: 5, cities: 2, target: "300万", achieved: "291万", rate: 97, yoy: "+9.8%", mom: "+3.2%" },
    { name: "东北区", partners: 5, cities: 3, target: "200万", achieved: "131万", rate: 66, yoy: "-12.1%", mom: "-7.5%" },
  ],
};

/* ================================================================== */
/* 总商数据 - 含激励列                                                  */
/* ================================================================== */
const channelPartnerRowsRaw = {
  waimai: [
    { name: "上海总商A", region: "华东区", cities: 2, bds: 5, target: "1,100万", achieved: "1,020万", rate: 93, yoy: "+11.2%", mom: "+2.8%", profitAmount: "18.4万" },
    { name: "杭州总商B", region: "华东区", cities: 1, bds: 3, target: "500万", achieved: "480万", rate: 96, yoy: "+8.1%", mom: "+1.5%", profitAmount: "8.6万" },
    { name: "广州总商E", region: "华南区", cities: 1, bds: 4, target: "500万", achieved: "490万", rate: 98, yoy: "+10.5%", mom: "+2.0%", profitAmount: "8.8万" },
    { name: "深圳总商F", region: "华南区", cities: 1, bds: 3, target: "500万", achieved: "450万", rate: 90, yoy: "+3.2%", mom: "-0.5%", profitAmount: "8.1万" },
    { name: "北京总商H", region: "华北区", cities: 1, bds: 5, target: "500万", achieved: "380万", rate: 76, yoy: "-3.6%", mom: "-4.1%", profitAmount: "4.6万" },
    { name: "成都总商K", region: "西南区", cities: 1, bds: 3, target: "500万", achieved: "490万", rate: 98, yoy: "+15.2%", mom: "+3.8%", profitAmount: "8.8万" },
    { name: "重庆总商L", region: "西南区", cities: 1, bds: 2, target: "400万", achieved: "384万", rate: 96, yoy: "+10.5%", mom: "+2.2%", profitAmount: "6.9万" },
    { name: "沈阳总商N", region: "东北区", cities: 1, bds: 2, target: "300万", achieved: "180万", rate: 60, yoy: "-8.3%", mom: "-6.0%", profitAmount: "1.8万" },
    { name: "大连总商O", region: "东北区", cities: 1, bds: 2, target: "280万", achieved: "160万", rate: 57, yoy: "-9.1%", mom: "-5.5%", profitAmount: "1.6万" },
    { name: "天津总商I", region: "华北区", cities: 1, bds: 2, target: "400万", achieved: "280万", rate: 70, yoy: "-5.2%", mom: "-3.8%", profitAmount: "3.4万" },
  ],
  daocan: [
    { name: "上海餐联A", region: "华东区", cities: 1, bds: 4, target: "500万", achieved: "470万", rate: 94, yoy: "+9.6%", mom: "+2.2%", profitAmount: "7.5万" },
    { name: "杭州餐联B", region: "华东区", cities: 1, bds: 3, target: "500万", achieved: "450万", rate: 90, yoy: "+6.2%", mom: "+1.0%", profitAmount: "7.2万" },
    { name: "广州餐联D", region: "华南区", cities: 1, bds: 3, target: "500万", achieved: "480万", rate: 96, yoy: "+8.5%", mom: "+1.8%", profitAmount: "7.7万" },
    { name: "深圳餐联E", region: "华南区", cities: 1, bds: 2, target: "400万", achieved: "380万", rate: 95, yoy: "+5.1%", mom: "+0.8%", profitAmount: "6.1万" },
    { name: "北京餐联G", region: "华北区", cities: 1, bds: 3, target: "400万", achieved: "290万", rate: 73, yoy: "-5.1%", mom: "-3.2%", profitAmount: "2.9万" },
    { name: "成都餐联J", region: "西南区", cities: 1, bds: 2, target: "200万", achieved: "195万", rate: 98, yoy: "+10.8%", mom: "+3.0%", profitAmount: "3.1万" },
    { name: "沈阳餐联L", region: "东北区", cities: 1, bds: 1, target: "100万", achieved: "68万", rate: 68, yoy: "-10.5%", mom: "-6.8%", profitAmount: "0.5万" },
    { name: "天津餐联H", region: "华北区", cities: 1, bds: 2, target: "300万", achieved: "210万", rate: 70, yoy: "-6.3%", mom: "-4.0%", profitAmount: "2.1万" },
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
/* biz_manager - 城市数据 (华东区，无激励) + 总商数据 (华东区，含激励)    */
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
    { name: "上海总商A", region: "华东区", cities: 2, bds: 5, target: "1,100万", achieved: "1,020万", rate: 93, yoy: "+11.2%", mom: "+2.8%", profitAmount: "18.4万" },
    { name: "杭州总商B", region: "华东区", cities: 1, bds: 3, target: "500万", achieved: "480万", rate: 96, yoy: "+8.1%", mom: "+1.5%", profitAmount: "8.6万" },
  ],
  daocan: [
    { name: "上海餐联A", region: "华东区", cities: 1, bds: 4, target: "500万", achieved: "470万", rate: 94, yoy: "+9.6%", mom: "+2.2%", profitAmount: "7.5万" },
    { name: "杭州餐联B", region: "华东区", cities: 1, bds: 3, target: "500万", achieved: "450万", rate: 90, yoy: "+6.2%", mom: "+1.0%", profitAmount: "7.2万" },
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
    { title: "低达成率区域跟进", text: "华北区达成率74%低于预警线，剩余缺口312万。东北区达成率仅56%，远低于全国均值，建议紧急调配资源支持。" },
    { title: "MR达成率分析", text: "全国平均MR达成率85%，西南区88%最高，东北区65%最低。东北区MR渗透不足，建议加大广告产品推广力度。" },
    { title: "渗透率与ARPU对比", text: "华东区渗透率82%+ARPU值4.55万为全国最优组合，东北区渗透率61%+ARPU值1.20万需重点提升。" },
    { title: "环比趋势预警", text: "华北区MoM-5.2%、东北区MoM-6.8%连续下滑，建议关注这两个区域的合作商执行节奏。" },
  ],
  daocan: [
    { title: "低达成率区域跟进", text: "到餐业务整体达成率76%，主要拖累来自华北区（74%）和东北区（66%），建议排查合作商执行力和商户覆盖情况。" },
    { title: "MR达成率分析", text: "到餐全国平均MR达成率79%，低于外卖线。西南区85%表现最好，东北区58%远低于大盘。" },
    { title: "渗透率与ARPU对比", text: "华东区渗透率80%+ARPU值3.20万领先，东北区渗透率58%+ARPU值0.85万需重点改进。" },
    { title: "环比趋势预警", text: "东北区MoM-7.5%为全国最差，建议关注到餐广告产品的投放结构和覆盖节奏。" },
  ],
  bizManagerWaimai: [
    { title: "区域整体表现优秀", text: "华东区整体达成率90%，4个城市中3个达成率超90%。杭州96%表现突出，建议提炼经验复制到苏州（达成率80%为区域内最低）。" },
    { title: "MR达成率亮点", text: "上海MR达成率88%、杭州MR达成率91%，均高于全国均值85%。苏州MR达成率76%需重点提升。" },
    { title: "总商分润分析", text: "上海总商A分润18.4万位居华东区第一，盈亏改善1.7%表现突出。杭州总商B分润8.6万，盈亏改善1.8%。" },
  ],
  bizManagerDaocan: [
    { title: "区域整体表现良好", text: "华东区整体达成率92%，3个城市全部达成率超90%。上海94%和南京93%表现稳健。" },
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
/* platform_admin 视图                                                  */
/* ================================================================== */
const PlatformAdminView = () => {
  const { bizLine } = useBizLine();
  const navigate = useNavigate();
  const [month, setMonth] = useState("2025-08");

  const summary = channelSummary[bizLine];
  const regionRows = channelRegionRows[bizLine];
  const partnerRows = channelPartnerRows[bizLine];
  const aiItems = aiData[bizLine];

  const avgMrRate = useMemo(() => {
    const rates = regionRows.map((r) => parseInt(r.mrRate));
    return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length);
  }, [regionRows]);

  const totalProfit = useMemo(
    () => partnerRows.reduce((s, r) => s + parseAmount(r.profitAmount), 0),
    [partnerRows]
  );

  const handleRegionClick = (regionName) => {
    navigate(`/channel/region/${encodeURIComponent(regionName)}`);
  };

  const handlePartnerClick = (partnerName) => {
    navigate(`/channel/partner/${encodeURIComponent(partnerName)}`);
  };

  return (
    <div className="space-y-4">
      <MonthSelector month={month} setMonth={setMonth} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="总目标" value={summary.totalTarget} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成" value={summary.totalAchieved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="达成率" value={`${summary.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={summary.rate >= 90 ? "正常" : summary.rate >= 80 ? "有风险" : "严重滞后"} />
        <SummaryCard label="剩余缺口" value={summary.gap} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="覆盖合作商" value={`${summary.partners}`} icon={Network} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="平均MR达成率" value={`${avgMrRate}%`} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* 全国区域达成明细 - 无激励列 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">全国区域达成明细</p>
            <span className="text-xs text-gray-400">点击穿透 → 查看城市明细 · 消息图标 → 下发诊断</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <ExpandedTableHeader showIncentive={false} showOpAction />
              <TableBody>
                {regionRows.map((row) => (
                  <ExpandedTableRow
                    key={row.name}
                    row={row}
                    onOpAction={() => handleRegionClick(row.name)}
                    onDiagnosis
                    showIncentive={false}
                    showOpAction
                    nameCellExtra={`${row.partners}家合作商 · ${row.cities}个城市`}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">全国合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{summary.totalTarget}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{summary.totalAchieved}</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{summary.rate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-gray-900">{avgMrRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell><StatusBadge rate={summary.rate} /></TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 全国总商达成明细 - 含激励列 */}
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

      <AiDiagnosisCard items={aiItems} />
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
  const region = currentUser?.region || "华东区";

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

  return (
    <div className="space-y-4">
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

      <AiDiagnosisCard items={aiItems} />
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

  return (
    <div className="space-y-4">
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

      <AiDiagnosisCard items={aiItems} />
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

  return (
    <div className="space-y-4">
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

      <AiDiagnosisCard items={aiItems} />
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
      <PageHeader
        title="渠道"
        description="渠道目标达成与追踪，点击行进入透视详情"
      />
      {renderContent()}
    </div>
  );
};

export default Channel;
