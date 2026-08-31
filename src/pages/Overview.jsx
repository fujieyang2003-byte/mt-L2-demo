import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 核心业绩数据                                                          */
/* ================================================================== */
const CORE_DATA = {
  summary: {
    name: "汇总",
    revenue: 23066, target: 25800, rate: 89,
    revenueYoy: 8.2, revenueYoyAbs: 1746,
    revenueMom: 3.5, revenueMomAbs: 780,
    revenueWow: 1.2, revenueWowAbs: 274,
    mr: 2.85, mrRate: 92,
    mrYoy: 0.3, mrMom: 0.1, mrWow: 0.05,
    penetration: 62.5, arpu: 128,
  },
  lines: [
    {
      name: "外卖", revenue: 12846, target: 14000, rate: 92,
      revenueYoy: 8.6, revenueYoyAbs: 1018,
      revenueMom: 4.2, revenueMomAbs: 518,
      revenueWow: 1.5, revenueWowAbs: 190,
      mr: 3.12, mrRate: 94,
      mrYoy: 0.35, mrMom: 0.15, mrWow: 0.06,
      penetration: 67.2, arpu: 142,
    },
    {
      name: "到餐", revenue: 8420, target: 9800, rate: 86,
      revenueYoy: 6.2, revenueYoyAbs: 492,
      revenueMom: 2.8, revenueMomAbs: 229,
      revenueWow: 0.8, revenueWowAbs: 67,
      mr: 2.45, mrRate: 88,
      mrYoy: 0.18, mrMom: 0.08, mrWow: 0.03,
      penetration: 48.5, arpu: 168,
    },
    {
      name: "闪购", revenue: 1420, target: 1600, rate: 89,
      revenueYoy: 15.5, revenueYoyAbs: 190,
      revenueMom: 5.2, revenueMomAbs: 70,
      revenueWow: 2.1, revenueWowAbs: 29,
      mr: 1.85, mrRate: 85,
      mrYoy: 0.42, mrMom: 0.18, mrWow: 0.08,
      penetration: 35.2, arpu: 95,
    },
    {
      name: "医药", revenue: 380, target: 400, rate: 95,
      revenueYoy: 22.1, revenueYoyAbs: 69,
      revenueMom: 8.5, revenueMomAbs: 30,
      revenueWow: 3.2, revenueWowAbs: 12,
      mr: 1.25, mrRate: 96,
      mrYoy: 0.55, mrMom: 0.22, mrWow: 0.10,
      penetration: 28.8, arpu: 210,
    },
  ],
};

/* ================================================================== */
/* AI 分析                                                              */
/* ================================================================== */
const AI_ITEMS = [
  "四个业务线合计广告收入23,066万，整体达成率89%，较上月增长3.5%，经营态势平稳",
  "外卖收入12,846万占比55.7%，仍是核心收入来源，达成率92%表现良好",
  "医药业务YoY+22.1%增长最快，但绝对体量仅380万，建议加大培育力度",
  "到餐达成率86%为四业务线最低，缺口1,380万，需重点关注",
  "闪购渗透率35.2%有显著提升空间，建议加大商家教育和激励",
];

/* ================================================================== */
/* 辅助组件                                                             */
/* ================================================================== */
const TrendValue = ({ value }) => (
  <span className={`text-xs font-medium ${value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
    {value >= 0 ? "+" : ""}{value}%
  </span>
);

/* ================================================================== */
/* 主页面 — 核心业绩                                                      */
/* ================================================================== */
export default function Overview() {
  const rows = useMemo(() => [CORE_DATA.summary, ...CORE_DATA.lines], []);

  const formatWan = (v) => `${v.toLocaleString()}万`;

  const cellClass = (isSummary) =>
    isSummary ? "font-bold text-gray-900 bg-gray-50/50" : "text-gray-700";

  return (
    <div className="space-y-5">
      {/* AI 智能分析 */}
      <AiPanel items={AI_ITEMS} />

      {/* 大宽表 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-900">核心业绩</p>
              <p className="text-xs text-gray-400 mt-0.5">可用范围：平台管理员</p>
            </div>
            <Badge variant="outline" className="text-gray-400 font-normal text-xs">2025年8月</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap sticky left-0 bg-gray-50/50 z-10">业务线</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">目标</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">达成率</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入YoY</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入YoY绝对值</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入MoM</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入MoM绝对值</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入WoW</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入WoW绝对值</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">MR</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">MR达成率</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">MR YoY</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">MR MoM</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">MR WoW</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">渗透率</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">ARPU值</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isSummary = row.name === "汇总";
                  return (
                    <TableRow key={row.name} className={isSummary ? "bg-blue-50/30" : ""}>
                      <TableCell className={`text-xs whitespace-nowrap sticky left-0 z-10 ${isSummary ? "font-bold text-gray-900 bg-blue-50/30" : "font-medium text-gray-800 bg-white"}`}>
                        {row.name}
                      </TableCell>
                      <TableCell className={`text-xs whitespace-nowrap ${cellClass(isSummary)}`}>{formatWan(row.revenue)}</TableCell>
                      <TableCell className={`text-xs whitespace-nowrap ${cellClass(isSummary)}`}>{formatWan(row.target)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge className={`border-none text-xs font-normal ${row.rate >= 90 ? "bg-emerald-50 text-emerald-600" : row.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                          {row.rate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap"><TrendValue value={row.revenueYoy} /></TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-emerald-600">+{formatWan(row.revenueYoyAbs)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap"><TrendValue value={row.revenueMom} /></TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-emerald-600">+{formatWan(row.revenueMomAbs)}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap"><TrendValue value={row.revenueWow} /></TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-emerald-600">+{formatWan(row.revenueWowAbs)}</TableCell>
                      <TableCell className={`text-xs whitespace-nowrap ${cellClass(isSummary)}`}>{row.mr}%</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <Badge className={`border-none text-xs font-normal ${row.mrRate >= 90 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#4080FF]"}`}>
                          {row.mrRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap"><TrendValue value={row.mrYoy} /></TableCell>
                      <TableCell className="text-xs whitespace-nowrap"><TrendValue value={row.mrMom} /></TableCell>
                      <TableCell className="text-xs whitespace-nowrap"><TrendValue value={row.mrWow} /></TableCell>
                      <TableCell className={`text-xs whitespace-nowrap ${cellClass(isSummary)}`}>{row.penetration}%</TableCell>
                      <TableCell className={`text-xs whitespace-nowrap ${cellClass(isSummary)}`}>{row.arpu}元</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
