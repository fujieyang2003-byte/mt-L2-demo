import React, { useState } from "react";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 产品总览数据                                                        */
/* ================================================================== */
const WAIMAI_PRODUCT_ROWS = [
  { rank: 1, product: "点金推广", category: "竞价", revenue: 5820, yoy: 15.3, mom: 4.2, target: 6200, rate: 94, penetration: 68.5, pyoy: 5.2, pmom: 1.8, arpu: 142, ayoy: 8.1, amom: 2.3, merchants: 8560, myoy: 6.5, mmom: 1.9 },
  { rank: 2, product: "全站推广（竞价）", category: "竞价", revenue: 3410, yoy: 8.7, mom: 2.1, target: 3800, rate: 90, penetration: 42.3, pyoy: 3.1, pmom: 0.8, arpu: 198, ayoy: 5.4, amom: 1.2, merchants: 4300, myoy: 3.2, mmom: 0.9 },
  { rank: 3, product: "订单通", category: "CPS", revenue: 1850, yoy: -2.1, mom: -0.5, target: 2400, rate: 77, penetration: 35.6, pyoy: -1.2, pmom: -0.3, arpu: 89, ayoy: -0.8, amom: -0.2, merchants: 5200, myoy: -1.3, mmom: -0.3 },
  { rank: 4, product: "超级流量卡", category: "CPT", revenue: 1070, yoy: 22.4, mom: 6.8, target: 980, rate: 109, penetration: 18.2, pyoy: 4.5, pmom: 1.5, arpu: 156, ayoy: 12.1, amom: 3.8, merchants: 1720, myoy: 9.2, mmom: 2.7 },
  { rank: 5, product: "营销魔方", category: "套餐", revenue: 680, yoy: 5.2, mom: 1.4, target: 800, rate: 85, penetration: 12.8, pyoy: 1.5, pmom: 0.4, arpu: 178, ayoy: 3.2, amom: 0.9, merchants: 960, myoy: 1.9, mmom: 0.5 },
  { rank: 6, product: "津贴联盟", category: "联盟", revenue: 420, yoy: -1.8, mom: -0.4, target: 580, rate: 72, penetration: 8.5, pyoy: -0.5, pmom: -0.1, arpu: 75, ayoy: -1.2, amom: -0.3, merchants: 1120, myoy: -0.6, mmom: -0.1 },
  { rank: 7, product: "流量助手", category: "工具", revenue: 310, yoy: 3.1, mom: 0.8, target: 450, rate: 69, penetration: 6.2, pyoy: 0.8, pmom: 0.2, arpu: 95, ayoy: 2.1, amom: 0.6, merchants: 820, myoy: 1.0, mmom: 0.2 },
];

const DAOCAN_PRODUCT_ROWS = [
  { rank: 1, product: "推广通 (CPC)", category: "竞价", revenue: 3820, yoy: 12.1, mom: 3.5, target: 4200, rate: 91, penetration: 55.2, pyoy: 4.2, pmom: 1.2, arpu: 298, ayoy: 7.5, amom: 2.1, merchants: 3250, myoy: 4.5, mmom: 1.3 },
  { rank: 2, product: "订单通 (CPS)", category: "CPS", revenue: 2260, yoy: 6.5, mom: 1.8, target: 2600, rate: 87, penetration: 38.6, pyoy: 2.1, pmom: 0.6, arpu: 242, ayoy: 3.8, amom: 1.0, merchants: 1860, myoy: 2.6, mmom: 0.8 },
  { rank: 3, product: "置顶卡等 (CPT)", category: "CPT", revenue: 1180, yoy: -3.8, mom: -1.0, target: 1680, rate: 70, penetration: 22.1, pyoy: -1.5, pmom: -0.4, arpu: 186, ayoy: -1.2, amom: -0.3, merchants: 1260, myoy: -2.5, mmom: -0.7 },
  { rank: 4, product: "智选展位等 (CPM)", category: "CPM", revenue: 680, yoy: 18.2, mom: 5.2, target: 660, rate: 103, penetration: 14.5, pyoy: 3.8, pmom: 1.1, arpu: 162, ayoy: 10.2, amom: 2.8, merchants: 820, myoy: 7.2, mmom: 2.1 },
  { rank: 5, product: "品牌专区", category: "品牌", revenue: 320, yoy: -5.1, mom: -1.4, target: 490, rate: 65, penetration: 6.8, pyoy: -1.2, pmom: -0.3, arpu: 155, ayoy: -3.5, amom: -0.9, merchants: 410, myoy: -1.6, mmom: -0.5 },
  { rank: 6, product: "搜索推广", category: "搜索", revenue: 210, yoy: 8.9, mom: 2.4, target: 270, rate: 78, penetration: 4.2, pyoy: 1.5, pmom: 0.4, arpu: 89, ayoy: 5.2, amom: 1.4, merchants: 560, myoy: 3.5, mmom: 1.0 },
];

const AI_ITEMS = [
  "点金推广收入占比48%，同比增长15.3%，是外卖广告收入的核心引擎，建议持续优化竞价策略以提升ARPU值。",
  "超级流量卡达成率109%，同比增长22.4%，表现最为亮眼，可考虑扩大覆盖城市范围。",
  "订单通达成率仅77%，同比下降2.1%，需重点关注产品竞争力及商户续约情况。",
  "整体渗透率仍有提升空间，尾部产品（流量助手、津贴联盟）渗透率不足10%，存在增量机会。",
];

/* ================================================================== */
/* 辅助组件                                                            */
/* ================================================================== */
const TrendCell = ({ value }) => (
  <span className={`text-xs font-medium ${value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
    {value >= 0 ? "+" : ""}{value}%
  </span>
);


/* ================================================================== */
/* 主页面                                                              */
/* ================================================================== */
export default function ProductOverview() {
  const { bizLine } = useBizLine();
  const rows = bizLine === "waimai" ? WAIMAI_PRODUCT_ROWS : DAOCAN_PRODUCT_ROWS;
  const label = bizLine === "waimai" ? "外卖" : "到餐";

  return (
    <div className="space-y-5">
      {/* 页面标题 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{label}经营走势</h1>
        <p className="text-sm text-gray-400 mt-1">产品维度 · 收入 / 渗透率 / ARPU / 商家数</p>
      </div>

      {/* AI 智能分析 */}
      <AiPanel items={AI_ITEMS} />

      {/* 数据表格 */}
      <Card className="border-none shadow-sm bg-white">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">产品经营数据</span>
            <Badge className="bg-blue-50 text-[#4080FF] border-none text-xs font-normal">{rows.length}个产品</Badge>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-xs text-gray-500 font-medium text-center w-10">排名</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium">产品</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium">品类</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">收入(万)</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">收入YoY</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">收入MoM</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">目标</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">达成率</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">渗透率</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">渗透率YoY</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">渗透率MoM</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">ARPU</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">ARPU YoY</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">ARPU MoM</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">商家数</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">商家数YoY</TableHead>
                <TableHead className="text-xs text-gray-500 font-medium text-right">商家数MoM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.rank} className="hover:bg-gray-50/50">
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                      row.rank === 1 ? "bg-amber-100 text-amber-600" :
                      row.rank === 2 ? "bg-gray-200 text-gray-600" :
                      row.rank === 3 ? "bg-orange-100 text-orange-600" :
                      "bg-gray-100 text-gray-400"
                    }`}>{row.rank}</span>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">{row.product}</TableCell>
                  <TableCell className="text-xs text-gray-500">{row.category}</TableCell>
                  <TableCell className="text-sm text-gray-900 text-right font-medium">{row.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right"><TrendCell value={row.yoy} /></TableCell>
                  <TableCell className="text-right"><TrendCell value={row.mom} /></TableCell>
                  <TableCell className="text-sm text-gray-900 text-right">{row.target.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={`text-xs font-semibold ${row.rate >= 90 ? "text-emerald-600" : row.rate >= 70 ? "text-orange-500" : "text-red-500"}`}>{row.rate}%</span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-gray-900">{row.penetration}%</TableCell>
                  <TableCell className="text-right"><TrendCell value={row.pyoy} /></TableCell>
                  <TableCell className="text-right"><TrendCell value={row.pmom} /></TableCell>
                  <TableCell className="text-right text-sm text-gray-900">{row.arpu}</TableCell>
                  <TableCell className="text-right"><TrendCell value={row.ayoy} /></TableCell>
                  <TableCell className="text-right"><TrendCell value={row.amom} /></TableCell>
                  <TableCell className="text-right text-sm text-gray-900">{row.merchants.toLocaleString()}</TableCell>
                  <TableCell className="text-right"><TrendCell value={row.myoy} /></TableCell>
                  <TableCell className="text-right"><TrendCell value={row.mmom} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
