import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Store,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Sparkles,
  Target,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Network,
  ExternalLink,
} from "lucide-react";

/* ================================================================== */
/* 共享组件                                                             */
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

/* ================================================================== */
/* buildRow helper                                                     */
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

const TrendCell = ({ value }) => (
  <TableCell className={value.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
    {value.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
    {value}
  </TableCell>
);

/* ================================================================== */
/* 表头/行组件 (复用 Channel.jsx 的模式)                                */
/* ================================================================== */
const ExpandedTableHeader = ({ showIncentive, showStorePool }) => (
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
      <TableHead className="w-16">操作</TableHead>
    </TableRow>
  </TableHeader>
);

const ExpandedTableRow = ({ row, onClick, showIncentive, showStorePool, nameCellExtra }) => (
  <TableRow className={onClick ? "cursor-pointer hover:bg-blue-50/30" : ""} onClick={onClick}>
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
    <TableCell><ExternalLink className="w-4 h-4 text-[#4080FF]" /></TableCell>
  </TableRow>
);

/* ================================================================== */
/* Mock 数据 - 总商BD原始数据                                           */
/* ================================================================== */
const partnerBdDataRaw = {
  waimai: {
    "上海总商A": [
      { name: "刘洋", mis: "liuyang04", cities: ["上海"], stores: 8, target: "350万", achieved: "320万", rate: 91, yoy: "+12.5%", mom: "+3.1%", profitAmount: "5.8万", totalStores: 480, adStores: 420 },
      { name: "陈静", mis: "chenjing05", cities: ["上海"], stores: 6, target: "300万", achieved: "280万", rate: 93, yoy: "+10.2%", mom: "+2.5%", profitAmount: "5.0万", totalStores: 360, adStores: 310 },
      { name: "赵刚", mis: "zhaogang06", cities: ["上海"], stores: 7, target: "350万", achieved: "310万", rate: 89, yoy: "+8.1%", mom: "+1.8%", profitAmount: "5.6万", totalStores: 420, adStores: 370 },
      { name: "孙丽", mis: "sunli07", cities: ["杭州"], stores: 6, target: "300万", achieved: "290万", rate: 97, yoy: "+15.2%", mom: "+4.2%", profitAmount: "5.2万", totalStores: 380, adStores: 350 },
      { name: "周强", mis: "zhouqiang08", cities: ["杭州"], stores: 5, target: "280万", achieved: "270万", rate: 96, yoy: "+11.8%", mom: "+2.8%", profitAmount: "4.9万", totalStores: 320, adStores: 290 },
    ],
    "杭州总商B": [
      { name: "孙丽", mis: "sunli07", cities: ["杭州"], stores: 6, target: "250万", achieved: "240万", rate: 96, yoy: "+14.5%", mom: "+3.5%", profitAmount: "4.3万", totalStores: 380, adStores: 350 },
      { name: "周强", mis: "zhouqiang08", cities: ["杭州"], stores: 5, target: "250万", achieved: "240万", rate: 96, yoy: "+10.8%", mom: "+2.2%", profitAmount: "4.3万", totalStores: 320, adStores: 290 },
      { name: "冯雷", mis: "fenglei11", cities: ["苏州"], stores: 4, target: "150万", achieved: "120万", rate: 80, yoy: "+5.2%", mom: "-0.5%", profitAmount: "2.2万", totalStores: 260, adStores: 180 },
    ],
    "广州总商E": [
      { name: "卫涛", mis: "weitao13", cities: ["广州"], stores: 6, target: "260万", achieved: "255万", rate: 98, yoy: "+11.5%", mom: "+3.2%", profitAmount: "4.6万", totalStores: 400, adStores: 380 },
      { name: "蒋琳", mis: "jianglin14", cities: ["广州"], stores: 5, target: "240万", achieved: "235万", rate: 98, yoy: "+9.8%", mom: "+2.8%", profitAmount: "4.2万", totalStores: 350, adStores: 320 },
      { name: "沈悦", mis: "shenyue15", cities: ["深圳"], stores: 5, target: "260万", achieved: "235万", rate: 90, yoy: "+7.2%", mom: "+1.5%", profitAmount: "4.2万", totalStores: 360, adStores: 300 },
      { name: "韩冰", mis: "hanbing16", cities: ["深圳"], stores: 5, target: "240万", achieved: "215万", rate: 90, yoy: "+6.5%", mom: "+1.2%", profitAmount: "3.9万", totalStores: 340, adStores: 280 },
    ],
    "深圳总商F": [
      { name: "沈悦", mis: "shenyue15", cities: ["深圳"], stores: 5, target: "260万", achieved: "235万", rate: 90, yoy: "+7.2%", mom: "+1.5%", profitAmount: "4.2万", totalStores: 360, adStores: 300 },
      { name: "韩冰", mis: "hanbing16", cities: ["深圳"], stores: 5, target: "240万", achieved: "215万", rate: 90, yoy: "+6.5%", mom: "+1.2%", profitAmount: "3.9万", totalStores: 340, adStores: 280 },
      { name: "杨旭", mis: "yangxu17", cities: ["厦门"], stores: 4, target: "200万", achieved: "195万", rate: 98, yoy: "+13.5%", mom: "+3.8%", profitAmount: "3.5万", totalStores: 280, adStores: 260 },
    ],
    "北京总商H": [
      { name: "秦宇", mis: "qinyu19", cities: ["北京"], stores: 4, target: "180万", achieved: "135万", rate: 75, yoy: "-2.5%", mom: "-1.8%", profitAmount: "2.4万", totalStores: 320, adStores: 180 },
      { name: "尤鑫", mis: "youxin20", cities: ["北京"], stores: 4, target: "160万", achieved: "120万", rate: 75, yoy: "-3.8%", mom: "-2.1%", profitAmount: "2.2万", totalStores: 280, adStores: 160 },
      { name: "许诺", mis: "xunuo21", cities: ["北京"], stores: 3, target: "160万", achieved: "125万", rate: 78, yoy: "-1.2%", mom: "-0.8%", profitAmount: "2.2万", totalStores: 220, adStores: 170 },
      { name: "何璐", mis: "helu22", cities: ["天津"], stores: 4, target: "200万", achieved: "140万", rate: 70, yoy: "-4.5%", mom: "-2.5%", profitAmount: "2.5万", totalStores: 300, adStores: 150 },
      { name: "吕超", mis: "lvchao23", cities: ["天津"], stores: 3, target: "200万", achieved: "140万", rate: 70, yoy: "-5.2%", mom: "-3.0%", profitAmount: "2.5万", totalStores: 250, adStores: 120 },
    ],
    "成都总商K": [
      { name: "孔明", mis: "kongming26", cities: ["成都"], stores: 5, target: "260万", achieved: "255万", rate: 98, yoy: "+16.5%", mom: "+4.5%", profitAmount: "4.6万", totalStores: 350, adStores: 330 },
      { name: "曹颖", mis: "caoying27", cities: ["成都"], stores: 4, target: "240万", achieved: "235万", rate: 98, yoy: "+14.2%", mom: "+3.8%", profitAmount: "4.2万", totalStores: 300, adStores: 280 },
      { name: "严浩", mis: "yanhao28", cities: ["重庆"], stores: 4, target: "200万", achieved: "192万", rate: 96, yoy: "+10.5%", mom: "+2.8%", profitAmount: "3.5万", totalStores: 320, adStores: 290 },
    ],
    "重庆总商L": [
      { name: "严浩", mis: "yanhao28", cities: ["重庆"], stores: 4, target: "200万", achieved: "192万", rate: 96, yoy: "+10.5%", mom: "+2.8%", profitAmount: "3.5万", totalStores: 320, adStores: 290 },
      { name: "华蓉", mis: "huarong29", cities: ["重庆"], stores: 3, target: "200万", achieved: "192万", rate: 96, yoy: "+9.8%", mom: "+2.5%", profitAmount: "3.5万", totalStores: 260, adStores: 235 },
    ],
    "沈阳总商N": [
      { name: "陶宇", mis: "taoyu32", cities: ["沈阳"], stores: 3, target: "160万", achieved: "95万", rate: 59, yoy: "-8.5%", mom: "-3.2%", profitAmount: "1.7万", totalStores: 200, adStores: 90 },
      { name: "姜伟", mis: "jiangwei33", cities: ["沈阳"], stores: 2, target: "140万", achieved: "85万", rate: 61, yoy: "-7.8%", mom: "-2.8%", profitAmount: "1.5万", totalStores: 160, adStores: 80 },
    ],
    "大连总商O": [
      { name: "戚峰", mis: "qifeng34", cities: ["大连"], stores: 2, target: "150万", achieved: "85万", rate: 57, yoy: "-9.2%", mom: "-3.5%", profitAmount: "1.5万", totalStores: 140, adStores: 70 },
      { name: "谢勇", mis: "xieyong35", cities: ["大连"], stores: 2, target: "130万", achieved: "75万", rate: 58, yoy: "-8.8%", mom: "-3.0%", profitAmount: "1.4万", totalStores: 120, adStores: 65 },
    ],
    "天津总商I": [
      { name: "何璐", mis: "helu22", cities: ["天津"], stores: 4, target: "200万", achieved: "140万", rate: 70, yoy: "-4.5%", mom: "-2.5%", profitAmount: "2.5万", totalStores: 300, adStores: 150 },
      { name: "吕超", mis: "lvchao23", cities: ["天津"], stores: 3, target: "200万", achieved: "140万", rate: 70, yoy: "-5.2%", mom: "-3.0%", profitAmount: "2.5万", totalStores: 250, adStores: 120 },
    ],
  },
  daocan: {
    "上海餐联A": [
      { name: "刘洋", mis: "liuyang04", cities: ["上海"], stores: 5, target: "260万", achieved: "245万", rate: 94, yoy: "+9.6%", mom: "+2.5%", profitAmount: "4.4万", totalStores: 320, adStores: 280 },
      { name: "陈静", mis: "chenjing05", cities: ["上海"], stores: 4, target: "240万", achieved: "225万", rate: 94, yoy: "+8.5%", mom: "+2.0%", profitAmount: "4.1万", totalStores: 280, adStores: 245 },
      { name: "吴敏", mis: "wumin09", cities: ["南京"], stores: 3, target: "210万", achieved: "195万", rate: 93, yoy: "+7.2%", mom: "+1.5%", profitAmount: "3.5万", totalStores: 220, adStores: 190 },
      { name: "郑华", mis: "zhenghua10", cities: ["南京"], stores: 3, target: "190万", achieved: "177万", rate: 93, yoy: "+6.8%", mom: "+1.2%", profitAmount: "3.2万", totalStores: 200, adStores: 170 },
    ],
    "杭州餐联B": [
      { name: "孙丽", mis: "sunli07", cities: ["杭州"], stores: 4, target: "260万", achieved: "234万", rate: 90, yoy: "+6.2%", mom: "+1.5%", profitAmount: "4.2万", totalStores: 300, adStores: 250 },
      { name: "周强", mis: "zhouqiang08", cities: ["杭州"], stores: 4, target: "240万", achieved: "216万", rate: 90, yoy: "+5.8%", mom: "+1.2%", profitAmount: "3.9万", totalStores: 280, adStores: 230 },
      { name: "冯雷", mis: "fenglei11", cities: ["苏州"], stores: 3, target: "120万", achieved: "100万", rate: 83, yoy: "+4.1%", mom: "-0.5%", profitAmount: "1.8万", totalStores: 180, adStores: 120 },
    ],
    "广州餐联D": [
      { name: "卫涛", mis: "weitao13", cities: ["广州"], stores: 4, target: "260万", achieved: "250万", rate: 96, yoy: "+8.5%", mom: "+2.2%", profitAmount: "4.5万", totalStores: 280, adStores: 250 },
      { name: "蒋琳", mis: "jianglin14", cities: ["广州"], stores: 4, target: "240万", achieved: "230万", rate: 96, yoy: "+7.8%", mom: "+1.8%", profitAmount: "4.1万", totalStores: 260, adStores: 230 },
      { name: "杨旭", mis: "yangxu17", cities: ["厦门"], stores: 2, target: "160万", achieved: "148万", rate: 93, yoy: "+5.5%", mom: "+1.0%", profitAmount: "2.7万", totalStores: 160, adStores: 130 },
    ],
    "深圳餐联E": [
      { name: "沈悦", mis: "shenyue15", cities: ["深圳"], stores: 3, target: "210万", achieved: "200万", rate: 95, yoy: "+6.5%", mom: "+1.5%", profitAmount: "3.6万", totalStores: 200, adStores: 180 },
      { name: "韩冰", mis: "hanbing16", cities: ["深圳"], stores: 3, target: "190万", achieved: "180万", rate: 95, yoy: "+5.8%", mom: "+1.2%", profitAmount: "3.2万", totalStores: 180, adStores: 160 },
    ],
    "北京餐联G": [
      { name: "秦宇", mis: "qinyu19", cities: ["北京"], stores: 3, target: "210万", achieved: "152万", rate: 72, yoy: "-5.1%", mom: "-2.0%", profitAmount: "2.7万", totalStores: 260, adStores: 130 },
      { name: "尤鑫", mis: "youxin20", cities: ["北京"], stores: 3, target: "190万", achieved: "138万", rate: 73, yoy: "-4.8%", mom: "-1.8%", profitAmount: "2.5万", totalStores: 240, adStores: 120 },
      { name: "何璐", mis: "helu22", cities: ["天津"], stores: 2, target: "160万", achieved: "112万", rate: 70, yoy: "-6.3%", mom: "-2.5%", profitAmount: "2.0万", totalStores: 180, adStores: 80 },
    ],
    "成都餐联J": [
      { name: "孔明", mis: "kongming26", cities: ["成都"], stores: 3, target: "200万", achieved: "195万", rate: 98, yoy: "+10.8%", mom: "+3.0%", profitAmount: "3.5万", totalStores: 220, adStores: 200 },
      { name: "严浩", mis: "yanhao28", cities: ["重庆"], stores: 2, target: "100万", achieved: "96万", rate: 96, yoy: "+8.2%", mom: "+2.0%", profitAmount: "1.7万", totalStores: 150, adStores: 130 },
    ],
    "沈阳餐联L": [
      { name: "陶宇", mis: "taoyu32", cities: ["沈阳"], stores: 2, target: "100万", achieved: "68万", rate: 68, yoy: "-10.5%", mom: "-4.0%", profitAmount: "1.2万", totalStores: 120, adStores: 50 },
    ],
    "天津餐联H": [
      { name: "何璐", mis: "helu22", cities: ["天津"], stores: 2, target: "160万", achieved: "112万", rate: 70, yoy: "-6.3%", mom: "-2.5%", profitAmount: "2.0万", totalStores: 180, adStores: 80 },
      { name: "吕超", mis: "lvchao23", cities: ["天津"], stores: 2, target: "140万", achieved: "98万", rate: 70, yoy: "-7.2%", mom: "-3.0%", profitAmount: "1.8万", totalStores: 160, adStores: 70 },
    ],
  },
};

/* Build expanded BD data */
const partnerBdData = {};
for (const biz of Object.keys(partnerBdDataRaw)) {
  partnerBdData[biz] = {};
  for (const partner of Object.keys(partnerBdDataRaw[biz])) {
    partnerBdData[biz][partner] = partnerBdDataRaw[biz][partner].map((r) => {
      const built = buildRow(r);
      if (r.totalStores && r.adStores) {
        built.totalStores = r.totalStores;
        built.adStores = r.adStores;
        built.adPenetration = `${(r.adStores / r.totalStores * 100).toFixed(1)}%`;
      }
      return built;
    });
  }
}

/* ================================================================== */
/* 从 BD 数据聚合城市层数据                                             */
/* ================================================================== */
const partnerCityData = {};
for (const biz of Object.keys(partnerBdDataRaw)) {
  partnerCityData[biz] = {};
  for (const partner of Object.keys(partnerBdDataRaw[biz])) {
    const bdList = partnerBdData[biz][partner];
    const cityMap = {};
    bdList.forEach((bd) => {
      const city = bd.cities[0];
      if (!cityMap[city]) {
        cityMap[city] = {
          name: city,
          bdCount: 0,
          stores: 0,
          target: 0,
          achieved: 0,
          profitAmount: 0,
          gtv: 0,
          totalStores: 0,
          adStores: 0,
          bdNames: [],
        };
      }
      const c = cityMap[city];
      c.bdCount += 1;
      c.stores += bd.stores;
      c.target += parseAmount(bd.target);
      c.achieved += parseAmount(bd.achieved);
      c.profitAmount += parseAmount(bd.profitAmount);
      c.gtv += parseAmount(bd.gtv);
      c.totalStores += bd.totalStores || 0;
      c.adStores += bd.adStores || 0;
      c.bdNames.push(bd.name);
    });
    partnerCityData[biz][partner] = Object.values(cityMap).map((c) => {
      const rate = Math.round((c.achieved / c.target) * 100);
      const profitImprovement = c.gtv > 0 ? (c.profitAmount / c.gtv * 100).toFixed(1) + "%" : "—";
      const adPenetration = c.totalStores > 0 ? `${(c.adStores / c.totalStores * 100).toFixed(1)}%` : "—";
      return {
        name: c.name,
        target: `${c.target.toFixed(0)}万`,
        achieved: `${c.achieved.toFixed(0)}万`,
        rate,
        yoy: "+8.5%",
        mom: "+2.0%",
        mr: `${(15 + Math.random() * 10).toFixed(1)}%`,
        mrRate: `${75 + Math.floor(Math.random() * 25)}%`,
        mrYoy: `+${(Math.random() * 3).toFixed(1)}pp`,
        mrMom: `+${(Math.random() * 2).toFixed(1)}pp`,
        penetration: `${60 + Math.floor(Math.random() * 30)}%`,
        arpu: `${(0.5 + Math.random() * 4.5).toFixed(2)}万`,
        profitAmount: `${c.profitAmount.toFixed(1)}万`,
        gtv: `${c.gtv.toFixed(0)}万`,
        profitImprovement,
        totalStores: c.totalStores,
        adStores: c.adStores,
        adPenetration,
        bdCount: c.bdCount,
        stores: c.stores,
        bdNames: c.bdNames.join("、"),
      };
    });
  }
}

/* ================================================================== */
/* Mock 数据 - 总商汇总信息                                              */
/* ================================================================== */
const partnerSummary = {
  waimai: {
    "上海总商A": { region: "华东区", target: "1,100万", achieved: "1,020万", rate: 93, monetization: "3.4%", profitAmount: "18.4万", bdCount: 5, storeCount: 32, mrRate: "88%", gtv: "6,120万", profitImprovement: "0.3%" },
    "杭州总商B": { region: "华东区", target: "500万", achieved: "480万", rate: 96, monetization: "3.2%", profitAmount: "8.6万", bdCount: 3, storeCount: 15, mrRate: "91%", gtv: "2,880万", profitImprovement: "0.3%" },
    "广州总商E": { region: "华南区", target: "500万", achieved: "490万", rate: 98, monetization: "3.8%", profitAmount: "8.8万", bdCount: 4, storeCount: 20, mrRate: "89%", gtv: "2,940万", profitImprovement: "0.3%" },
    "深圳总商F": { region: "华南区", target: "500万", achieved: "450万", rate: 90, monetization: "2.1%", profitAmount: "8.1万", bdCount: 3, storeCount: 14, mrRate: "82%", gtv: "2,700万", profitImprovement: "0.3%" },
    "北京总商H": { region: "华北区", target: "500万", achieved: "380万", rate: 76, monetization: "2.4%", profitAmount: "4.6万", bdCount: 5, storeCount: 18, mrRate: "68%", gtv: "2,280万", profitImprovement: "0.2%" },
    "成都总商K": { region: "西南区", target: "500万", achieved: "490万", rate: 98, monetization: "3.6%", profitAmount: "8.8万", bdCount: 3, storeCount: 13, mrRate: "92%", gtv: "2,940万", profitImprovement: "0.3%" },
    "重庆总商L": { region: "西南区", target: "400万", achieved: "384万", rate: 96, monetization: "3.4%", profitAmount: "6.9万", bdCount: 2, storeCount: 7, mrRate: "90%", gtv: "2,304万", profitImprovement: "0.3%" },
    "沈阳总商N": { region: "东北区", target: "300万", achieved: "180万", rate: 60, monetization: "1.6%", profitAmount: "1.8万", bdCount: 2, storeCount: 5, mrRate: "52%", gtv: "1,080万", profitImprovement: "0.2%" },
    "大连总商O": { region: "东北区", target: "280万", achieved: "160万", rate: 57, monetization: "1.5%", profitAmount: "1.6万", bdCount: 2, storeCount: 4, mrRate: "50%", gtv: "960万", profitImprovement: "0.2%" },
    "天津总商I": { region: "华北区", target: "400万", achieved: "280万", rate: 70, monetization: "2.0%", profitAmount: "3.4万", bdCount: 2, storeCount: 7, mrRate: "60%", gtv: "1,680万", profitImprovement: "0.2%" },
  },
  daocan: {
    "上海餐联A": { region: "华东区", target: "500万", achieved: "470万", rate: 94, monetization: "3.1%", profitAmount: "7.5万", bdCount: 4, storeCount: 15, mrRate: "84%", gtv: "2,820万", profitImprovement: "0.3%" },
    "杭州餐联B": { region: "华东区", target: "500万", achieved: "450万", rate: 90, monetization: "2.8%", profitAmount: "7.2万", bdCount: 3, storeCount: 11, mrRate: "82%", gtv: "2,700万", profitImprovement: "0.3%" },
    "广州餐联D": { region: "华南区", target: "500万", achieved: "480万", rate: 96, monetization: "3.3%", profitAmount: "7.7万", bdCount: 3, storeCount: 10, mrRate: "86%", gtv: "2,880万", profitImprovement: "0.3%" },
    "深圳餐联E": { region: "华南区", target: "400万", achieved: "380万", rate: 95, monetization: "2.6%", profitAmount: "6.1万", bdCount: 2, storeCount: 6, mrRate: "85%", gtv: "2,280万", profitImprovement: "0.3%" },
    "北京餐联G": { region: "华北区", target: "400万", achieved: "290万", rate: 73, monetization: "2.0%", profitAmount: "2.9万", bdCount: 3, storeCount: 8, mrRate: "62%", gtv: "1,740万", profitImprovement: "0.2%" },
    "成都餐联J": { region: "西南区", target: "200万", achieved: "195万", rate: 98, monetization: "3.4%", profitAmount: "3.1万", bdCount: 2, storeCount: 5, mrRate: "90%", gtv: "1,170万", profitImprovement: "0.3%" },
    "沈阳餐联L": { region: "东北区", target: "100万", achieved: "68万", rate: 68, monetization: "1.2%", profitAmount: "0.5万", bdCount: 1, storeCount: 2, mrRate: "55%", gtv: "408万", profitImprovement: "0.1%" },
    "天津餐联H": { region: "华北区", target: "300万", achieved: "210万", rate: 70, monetization: "1.7%", profitAmount: "2.1万", bdCount: 2, storeCount: 4, mrRate: "58%", gtv: "1,260万", profitImprovement: "0.2%" },
  },
};

/* ================================================================== */
/* AI 分析 - 按总商                                                      */
/* ================================================================== */
const aiPartnerData = {
  waimai: {
    "上海总商A": [
      { title: "总商整体表现优秀", text: "上海总商A整体达成率93%，5名BD中4人达成率超89%。覆盖上海+杭州双城，区域间协同效果好。" },
      { title: "城市维度分析", text: "上海3名BD合计贡献900万，杭州2名BD合计560万。上海贡献更高但杭州达成率96%+表现更优。" },
      { title: "盈亏改善分析", text: "总商盈亏改善0.3%，GTV达6,120万。分润18.4万位居华东区第一，经营效率优秀。" },
    ],
    "北京总商H": [
      { title: "达成率偏低需关注", text: "北京总商H整体达成率76%，5名BD达成率均在70-78%区间。京津双城均表现不佳。" },
      { title: "城市维度分析", text: "北京3名BD合计380万（达成率75%），天津2名BD合计280万（达成率70%）。天津为拖累项。" },
      { title: "盈亏改善分析", text: "总商盈亏改善0.2%，MR达成率仅68%远低于全国均值。建议加大广告产品推广力度。" },
    ],
  },
  daocan: {
    "上海餐联A": [
      { title: "总商整体表现优秀", text: "上海餐联A整体达成率94%，4名BD中全部达成率超93%。覆盖上海+南京双城，运营能力突出。" },
      { title: "城市维度分析", text: "上海2名BD合计470万（达成率94%），南京2名BD合计372万（达成率93%）。双城均衡发展。" },
      { title: "盈亏改善分析", text: "总商盈亏改善0.3%，MR达成率84%。GTV达2,820万，分润7.5万经营稳健。" },
    ],
  },
};

/* ================================================================== */
/* 面包屑导航                                                            */
/* ================================================================== */
const PartnerBreadcrumb = ({ partnerName, bizLabel, cityName }) => (
  <div className="flex items-center gap-2 text-sm mb-3">
    <Link to="/channel" className="flex items-center gap-1 text-gray-500 hover:text-[#4080FF] transition-colors">
      <ArrowLeft className="w-4 h-4" />
      渠道
    </Link>
    <ChevronRight className="w-3 h-3 text-gray-300" />
    <span className="text-gray-500">全国总商</span>
    <ChevronRight className="w-3 h-3 text-gray-300" />
    {cityName ? (
      <>
        <Link to={`/channel/partner/${encodeURIComponent(partnerName)}`} className="text-gray-500 hover:text-[#4080FF] transition-colors">
          {partnerName}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-[#4080FF] font-medium">{cityName} · {bizLabel}</span>
      </>
    ) : (
      <span className="text-[#4080FF] font-medium">{partnerName} · {bizLabel}</span>
    )}
  </div>
);

/* ================================================================== */
/* 主组件 - 两层透视：城市 → BD                                         */
/* ================================================================== */
const PartnerDetail = () => {
  const { partnerName, cityName } = useParams();
  const navigate = useNavigate();
  const { bizLine } = useBizLine();
  const [selectedCity, setSelectedCity] = useState(null);
  const bizLabel = bizLine === "waimai" ? "外卖" : "到餐";

  const decodedPartner = decodeURIComponent(partnerName || "");
  const decodedCity = cityName ? decodeURIComponent(cityName) : selectedCity;

  const summaryMap = partnerSummary[bizLine] || partnerSummary.waimai;
  const summary = summaryMap[decodedPartner];

  const cityMap = partnerCityData[bizLine] || partnerCityData.waimai;
  const cityList = cityMap[decodedPartner] || [];

  const bdMap = partnerBdData[bizLine] || partnerBdData.waimai;
  const allBdList = bdMap[decodedPartner] || [];
  const bdList = decodedCity ? allBdList.filter((bd) => bd.cities[0] === decodedCity) : [];

  const aiMap = aiPartnerData[bizLine] || aiPartnerData.waimai;
  const aiItems = aiMap[decodedPartner] || [
    { title: "总商明细", text: `${decodedPartner}共${allBdList.length}名BD，覆盖${cityList.length}个城市，总商整体达成率${summary ? summary.rate : 0}%。` },
  ];

  if (!summary) {
    return (
      <div className="space-y-5">
        <PartnerBreadcrumb partnerName={decodedPartner} bizLabel={bizLabel} />
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">未找到「{decodedPartner}」的数据</p>
            <button onClick={() => navigate("/channel")} className="text-[#4080FF] hover:underline">
              返回渠道页
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* 城市层统计 */
  const cityTotalTarget = cityList.reduce((s, c) => s + parseAmount(c.target), 0);
  const cityTotalAchieved = cityList.reduce((s, c) => s + parseAmount(c.achieved), 0);
  const cityTotalProfit = cityList.reduce((s, c) => s + parseAmount(c.profitAmount), 0);
  const cityAvgRate = cityList.length > 0 ? Math.round(cityList.reduce((s, c) => s + c.rate, 0) / cityList.length) : 0;

  /* BD层统计 */
  const bdTotalTarget = bdList.reduce((s, b) => s + parseAmount(b.target), 0);
  const bdTotalAchieved = bdList.reduce((s, b) => s + parseAmount(b.achieved), 0);
  const bdTotalProfit = bdList.reduce((s, b) => s + parseAmount(b.profitAmount), 0);
  const bdAvgRate = bdList.length > 0 ? Math.round(bdList.reduce((s, b) => s + b.rate, 0) / bdList.length) : 0;
  const bdTotalGtv = bdList.reduce((s, b) => s + parseAmount(b.gtv), 0);
  const bdAvgProfitImprovement = bdTotalGtv > 0 ? (bdTotalProfit / bdTotalGtv * 100).toFixed(1) + "%" : "—";

  return (
    <div className="space-y-5">
      <PartnerBreadcrumb partnerName={decodedPartner} bizLabel={bizLabel} cityName={decodedCity} />
      <PageHeader
        title={decodedCity ? `${decodedPartner} · ${decodedCity} 城市透视` : `${decodedPartner} · 城市透视分析`}
        description={decodedCity ? `${decodedCity}城市BD/运营目标达成明细` : `所属区域：${summary.region} | 总商覆盖城市达成明细，点击城市进入BD/运营明细`}
      />

      {/* 总商KPI概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <SummaryCard label="总商目标值" value={summary.target} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成值" value={summary.achieved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="总商达成率" value={`${summary.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={summary.rate >= 90 ? "正常" : summary.rate >= 80 ? "有风险" : "严重滞后"} />
        <SummaryCard label="MR达成率" value={summary.mrRate} icon={DollarSign} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="覆盖城市" value={`${cityList.length}`} sub={`${summary.bdCount}名BD`} icon={Network} color="text-indigo-600" bg="bg-indigo-50" />
        <SummaryCard label="分润金额" value={summary.profitAmount} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
        <SummaryCard label="GTV" value={summary.gtv} icon={Store} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="盈亏改善" value={summary.profitImprovement} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* 城市层表格（第一层） */}
      {!decodedCity && (
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-900">{decodedPartner} · 城市达成明细</p>
              <span className="text-xs text-gray-400">点击城市行 → 查看 BD/运营明细</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <ExpandedTableHeader showIncentive showStorePool />
                <TableBody>
                  {cityList.map((row) => (
                    <ExpandedTableRow
                      key={row.name}
                      row={row}
                      showIncentive
                      showStorePool
                      nameCellExtra={`${row.bdCount}名BD · ${row.stores}家门店 · ${row.bdNames}`}
                      onClick={() => navigate(`/channel/partner/${encodeURIComponent(decodedPartner)}/city/${encodeURIComponent(row.name)}`)}
                    />
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold text-gray-900">总商合计</TableCell>
                    <TableCell className="font-semibold text-gray-900">{cityTotalTarget.toFixed(0)}万</TableCell>
                    <TableCell className="font-semibold text-gray-900">{cityTotalAchieved.toFixed(0)}万</TableCell>
                    <TableCell className="font-semibold text-[#4080FF]">{cityAvgRate}%</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell className="text-gray-600">{cityList.reduce((s, c) => s + (c.totalStores || 0), 0)}</TableCell>
                    <TableCell className="text-gray-600">{cityList.reduce((s, c) => s + (c.adStores || 0), 0)}</TableCell>
                    <TableCell className="text-gray-600">{(() => { const t = cityList.reduce((s, c) => s + (c.totalStores || 0), 0); const a = cityList.reduce((s, c) => s + (c.adStores || 0), 0); return t > 0 ? `${(a / t * 100).toFixed(1)}%` : "—"; })()}</TableCell>
                    <TableCell className="font-semibold text-[#4080FF]">{cityTotalProfit.toFixed(1)}万</TableCell>
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
      )}

      {/* BD层表格（第二层，选中城市后显示） */}
      {decodedCity && bdList.length > 0 && (
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-900">{decodedCity} · BD/运营达成明细</p>
              <span className="text-xs text-gray-400">共{bdList.length}名BD</span>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <ExpandedTableHeader showIncentive showStorePool />
                <TableBody>
                  {bdList.map((bd) => (
                    <ExpandedTableRow
                      key={bd.mis}
                      row={bd}
                      showIncentive
                      showStorePool
                      nameCellExtra={`${bd.mis} · ${bd.stores}家门店`}
                    />
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold text-gray-900">城市合计</TableCell>
                    <TableCell className="font-semibold text-gray-900">{bdTotalTarget.toFixed(0)}万</TableCell>
                    <TableCell className="font-semibold text-gray-900">{bdTotalAchieved.toFixed(0)}万</TableCell>
                    <TableCell className="font-semibold text-[#4080FF]">{bdAvgRate}%</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell className="text-gray-600">{bdList.reduce((s, b) => s + (b.totalStores || 0), 0)}</TableCell>
                    <TableCell className="text-gray-600">{bdList.reduce((s, b) => s + (b.adStores || 0), 0)}</TableCell>
                    <TableCell className="text-gray-600">{(() => { const t = bdList.reduce((s, b) => s + (b.totalStores || 0), 0); const a = bdList.reduce((s, b) => s + (b.adStores || 0), 0); return t > 0 ? `${(a / t * 100).toFixed(1)}%` : "—"; })()}</TableCell>
                    <TableCell className="font-semibold text-[#4080FF]">{bdTotalProfit.toFixed(1)}万</TableCell>
                    <TableCell className="font-semibold text-gray-900">{bdTotalGtv.toFixed(0)}万</TableCell>
                    <TableCell className="font-semibold text-gray-900">{bdAvgProfitImprovement}</TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AiDiagnosisCard items={aiItems} />
    </div>
  );
};

export default PartnerDetail;
