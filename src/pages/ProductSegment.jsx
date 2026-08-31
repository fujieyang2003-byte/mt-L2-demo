import React, { useState } from "react";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sparkles } from "lucide-react";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 模拟数据：每个客群下，每产品一行（聚合数据）                         */
/* ================================================================== */
function generateSegmentRows(products, categories) {
  return products.map((product, i) => ({
    product,
    category: categories[i],
    revenue: Math.round(Math.random() * 800 + 50),
    yoy: Number((Math.random() * 30 - 5).toFixed(1)),
    mom: Number((Math.random() * 15 - 2).toFixed(1)),
    tierRatio: Number((Math.random() * 40 + 10).toFixed(1)),
    totalRatio: Number((Math.random() * 25 + 3).toFixed(1)),
    penetration: Number((Math.random() * 60 + 15).toFixed(1)),
    pyoy: Number((Math.random() * 20 - 3).toFixed(1)),
    pmom: Number((Math.random() * 10 - 1).toFixed(1)),
    arpu: Math.round(Math.random() * 250 + 60),
    ayoy: Number((Math.random() * 15 - 2).toFixed(1)),
    amom: Number((Math.random() * 8 - 1).toFixed(1)),
    merchants: Math.round(Math.random() * 3000 + 200),
    myoy: Number((Math.random() * 12 - 1).toFixed(1)),
    mmom: Number((Math.random() * 6 - 0.5).toFixed(1)),
  }));
}

const WAIMAI_PRODUCTS = ["点金推广", "全站推广", "订单通", "超级流量卡", "营销魔方", "津贴联盟", "流量助手"];
const WAIMAI_CATEGORIES = ["竞价", "竞价", "CPS", "CPT", "套餐", "联盟", "工具"];

const DAOCAN_PRODUCTS = ["推广通", "订单通", "置顶卡", "智选展位", "品牌专区", "搜索推广"];
const DAOCAN_CATEGORIES = ["CPC", "CPS", "CPT", "CPM", "品牌", "搜索"];

const WAIMAI_KA = generateSegmentRows(WAIMAI_PRODUCTS, WAIMAI_CATEGORIES);
const WAIMAI_CKA = generateSegmentRows(WAIMAI_PRODUCTS, WAIMAI_CATEGORIES);
const WAIMAI_CHENG = generateSegmentRows(WAIMAI_PRODUCTS, WAIMAI_CATEGORIES);

const DAOCAN_KA = generateSegmentRows(DAOCAN_PRODUCTS, DAOCAN_CATEGORIES);
const DAOCAN_CKA = generateSegmentRows(DAOCAN_PRODUCTS, DAOCAN_CATEGORIES);
const DAOCAN_CHENG = generateSegmentRows(DAOCAN_PRODUCTS, DAOCAN_CATEGORIES);

const AI_ITEMS = [
  "KA商户中点金推广渗透率最高，建议将KA的成功经验复制到CKA和城商层级。",
  "P4尾部商户在各产品上渗透率均不足15%，是最大增量机会，需设计低门槛引流产品。",
  "订单通在城商层级收入占比偏低，可考虑推出城商专属价格方案。",
];

/* ================================================================== */
/* 辅助组件                                                            */
/* ================================================================== */
const TrendCell = ({ value }) => (
  <span className={`text-xs font-medium ${value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
    {value >= 0 ? "+" : ""}{value}%
  </span>
);


const SegmentTable = ({ title, badgeColor, rows }) => (
  <Card className="border-none shadow-sm bg-white">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <Badge className={`${badgeColor} border-none text-xs font-normal`}>{rows.length}条</Badge>
    </div>
    <CardContent className="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="text-xs text-gray-500 font-medium">产品</TableHead>
            <TableHead className="text-xs text-gray-500 font-medium">品类</TableHead>
            <TableHead className="text-xs text-gray-500 font-medium text-right">收入(万)</TableHead>
            <TableHead className="text-xs text-gray-500 font-medium text-right">收入YoY</TableHead>
            <TableHead className="text-xs text-gray-500 font-medium text-right">收入MoM</TableHead>
            <TableHead className="text-xs text-gray-500 font-medium text-right">占商家分层比例</TableHead>
            <TableHead className="text-xs text-gray-500 font-medium text-right">占总收入比例</TableHead>
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
          {rows.map((row, idx) => (
            <TableRow key={idx} className="hover:bg-gray-50/50">
              <TableCell className="text-sm font-medium text-gray-900">{row.product}</TableCell>
              <TableCell className="text-xs text-gray-500">{row.category}</TableCell>
              <TableCell className="text-sm text-gray-900 text-right">{row.revenue.toLocaleString()}</TableCell>
              <TableCell className="text-right"><TrendCell value={row.yoy} /></TableCell>
              <TableCell className="text-right"><TrendCell value={row.mom} /></TableCell>
              <TableCell className="text-right text-xs text-gray-900">{row.tierRatio}%</TableCell>
              <TableCell className="text-right text-xs text-gray-900">{row.totalRatio}%</TableCell>
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
);

/* ================================================================== */
/* 主页面                                                              */
/* ================================================================== */
export default function ProductSegment() {
  const { bizLine } = useBizLine();
  const label = bizLine === "waimai" ? "外卖" : "到餐";
  const kaRows = bizLine === "waimai" ? WAIMAI_KA : DAOCAN_KA;
  const ckaRows = bizLine === "waimai" ? WAIMAI_CKA : DAOCAN_CKA;
  const chengRows = bizLine === "waimai" ? WAIMAI_CHENG : DAOCAN_CHENG;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{label}产品分客群</h1>
        <p className="text-sm text-gray-400 mt-1">KA / CKA / 城商 · 产品聚合数据</p>
      </div>

      {/* AI 智能分析 */}
      <AiPanel items={AI_ITEMS} />

      {/* KA */}
      <SegmentTable title="KA" badgeColor="bg-purple-50 text-purple-600" rows={kaRows} />

      {/* CKA */}
      <SegmentTable title="CKA" badgeColor="bg-blue-50 text-[#4080FF]" rows={ckaRows} />

      {/* 城商 */}
      <SegmentTable title="城商" badgeColor="bg-emerald-50 text-emerald-600" rows={chengRows} />
    </div>
  );
}
