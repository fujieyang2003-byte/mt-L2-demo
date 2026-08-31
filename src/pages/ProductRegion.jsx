import React, { useState, useMemo } from "react";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Sparkles, Grid3X3, ChevronUp, ChevronDown } from "lucide-react";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 模拟数据                                                            */
/* ================================================================== */
const WAIMAI_REGIONS = ["京津冀", "辽吉", "山东", "晋蒙", "陕宁", "甘青新", "黑龙江", "江苏", "浙江", "安徽", "河南", "湖北", "湖南", "江西", "粤海", "川藏", "黔渝", "福建", "广西", "云南"];
const WAIMAI_PRODUCTS = ["点金推广", "全站推广", "订单通", "超级流量卡", "营销魔方", "津贴联盟", "流量助手"];

const DAOCAN_REGIONS = ["京津冀", "辽吉", "山东", "江苏", "浙江", "粤海", "川藏"];
const DAOCAN_PRODUCTS = ["推广通", "订单通", "置顶卡", "智选展位", "品牌专区", "搜索推广"];

function generateHeatmapData(regions, products) {
  const data = [];
  regions.forEach((region) => {
    products.forEach((product) => {
      const penetration = Math.round((Math.random() * 70 + 10) * 10) / 10;
      const merchants = Math.round(Math.random() * 800 + 50);
      const revenue = Math.round(Math.random() * 500 + 20);
      const revenueMom = Number((Math.random() * 20 - 5).toFixed(1));
      const penetrationMom = Number((Math.random() * 15 - 3).toFixed(1));
      const merchantsMom = Number((Math.random() * 12 - 2).toFixed(1));
      data.push({ region, product, penetration, merchants, revenue, revenueMom, penetrationMom, merchantsMom });
    });
  });
  return data;
}

const AI_ITEMS = [
  "京津冀区域在多数产品上渗透率偏低，存在区域整体问题，建议加强本地BD资源配置。",
  "超级流量卡在所有区域均表现优异，属于产品本身强势，可复制推广策略至其他产品。",
  "四川-订单通组合渗透率仅12.3%，为精准机会点，建议针对该区域进行专项运营活动。",
  "粤海区域高渗透率单元数占比最高，可作为标杆区域进行经验输出。",
];

/* ================================================================== */
/* 辅助组件                                                            */
/* ================================================================== */
const TrendCell = ({ value }) => (
  <span className={`text-xs font-medium ${value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
    {value >= 0 ? "+" : ""}{value}%
  </span>
);


const Heatmap = ({ title, regions, products, data, metric, colorFn }) => {
  const getValue = (region, product) => {
    const item = data.find((d) => d.region === region && d.product === product);
    return item ? item[metric] : 0;
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <div className="px-5 py-4 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
      </div>
      <CardContent className="p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="flex">
            <div className="w-16 shrink-0" />
            {products.map((p) => (
              <div key={p} className="flex-1 text-[10px] text-gray-500 text-center px-1 py-2 truncate" title={p}>{p}</div>
            ))}
          </div>
          {/* Data rows */}
          {regions.map((region) => (
            <div key={region} className="flex items-center">
              <div className="w-16 shrink-0 text-[10px] text-gray-500 text-right pr-2 py-1.5 truncate" title={region}>{region}</div>
              {products.map((product) => {
                const val = getValue(region, product);
                return (
                  <div key={product} className="flex-1 px-0.5 py-0.5">
                    <div
                      className="h-8 rounded flex items-center justify-center text-[10px] font-medium cursor-default transition-opacity hover:opacity-80"
                      style={{ backgroundColor: colorFn(val), color: val > 40 ? "#fff" : "#1f2937" }}
                      title={`${region} · ${product}: ${metric === "penetration" ? val + "%" : val + "家"}`}
                    >
                      {metric === "penetration" ? val + "%" : val}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-end gap-3 mt-3 text-[10px] text-gray-400">
          <span>低</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: colorFn(metric === "penetration" ? i * 16 : i * 150) }} />
            ))}
          </div>
          <span>高</span>
        </div>
      </CardContent>
    </Card>
  );
};

/* ================================================================== */
/* 主页面                                                              */
/* ================================================================== */
export default function ProductRegion() {
  const { bizLine } = useBizLine();
  const regions = bizLine === "waimai" ? WAIMAI_REGIONS : DAOCAN_REGIONS;
  const products = bizLine === "waimai" ? WAIMAI_PRODUCTS : DAOCAN_PRODUCTS;
  const data = useMemo(() => generateHeatmapData(regions, products), [regions, products]);
  const label = bizLine === "waimai" ? "外卖" : "到餐";
  const [oppOpen, setOppOpen] = useState(false);

  const totalCells = regions.length * products.length;
  const highCount = data.filter((d) => d.penetration > 60).length;
  const midCount = data.filter((d) => d.penetration >= 30 && d.penetration <= 60).length;
  const lowCount = data.filter((d) => d.penetration < 30).length;

  /* 渗透率颜色：从接近白色 → 深蓝，色差拉大 */
  const penetrationColor = (val) => {
    const ratio = Math.min(val / 80, 1);
    // 低值: 很浅的灰蓝 rgb(235, 242, 255)  高值: 深蓝 rgb(0, 60, 180)
    const r = Math.round(235 + (0 - 235) * ratio);
    const g = Math.round(242 + (60 - 242) * ratio);
    const b = Math.round(255 + (180 - 255) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  /* 商家数颜色：从接近白色 → 深绿，色差拉大 */
  const merchantColor = (val) => {
    const ratio = Math.min(val / 800, 1);
    // 低值: 很浅的灰绿 rgb(232, 245, 233)  高值: 深绿 rgb(0, 100, 60)
    const r = Math.round(232 + (0 - 232) * ratio);
    const g = Math.round(245 + (100 - 245) * ratio);
    const b = Math.round(233 + (60 - 233) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{label}产品分区域</h1>
        <p className="text-sm text-gray-400 mt-1">区域 × 产品渗透机会矩阵</p>
      </div>

      {/* AI 智能分析 */}
      <AiPanel items={AI_ITEMS} />

      {/* 机会识别 */}
      <Card className="border-none shadow-sm bg-white">
        <button
          onClick={() => setOppOpen(!oppOpen)}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-[#4080FF]" />
            <span className="text-sm font-semibold text-gray-900">机会识别</span>
            <span className="text-xs text-gray-400">| 点击{oppOpen ? "收起" : "展开"}</span>
          </div>
          {oppOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalCells}</p>
              <p className="text-xs text-gray-500 mt-1">总矩阵单元数</p>
              <p className="text-[10px] text-gray-400 mt-0.5">(=区域×产品数)</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 text-center">
              <p className="text-2xl font-bold text-emerald-600">{highCount}</p>
              <p className="text-xs text-gray-500 mt-1">高渗透率单元数</p>
              <p className="text-[10px] text-gray-400 mt-0.5">(&gt;60%渗透率)</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 text-center">
              <p className="text-2xl font-bold text-amber-600">{midCount}</p>
              <p className="text-xs text-gray-500 mt-1">中渗透率单元数</p>
              <p className="text-[10px] text-gray-400 mt-0.5">(30%-60%渗透率)</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 text-center">
              <p className="text-2xl font-bold text-red-500">{lowCount}</p>
              <p className="text-xs text-gray-500 mt-1">低渗透率单元数</p>
              <p className="text-[10px] text-gray-400 mt-0.5">(&lt;30%渗透率)</p>
            </div>
          </div>

          {oppOpen && (
            <div className="overflow-x-auto border-t border-gray-100 pt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="text-xs text-gray-500 font-medium">区域</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium">产品</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium text-right">广告收入(万)</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium text-right">收入 MoM</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium text-right">渗透率</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium text-right">渗透率 MoM</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium text-right">广告商家数</TableHead>
                    <TableHead className="text-xs text-gray-500 font-medium text-right">商家数 MoM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 50).map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50/50">
                      <TableCell className="text-xs text-gray-900">{row.region}</TableCell>
                      <TableCell className="text-xs text-gray-900">{row.product}</TableCell>
                      <TableCell className="text-xs text-gray-900 text-right">{row.revenue}</TableCell>
                      <TableCell className="text-right"><TrendCell value={row.revenueMom} /></TableCell>
                      <TableCell className="text-right text-xs text-gray-900">{row.penetration}%</TableCell>
                      <TableCell className="text-right"><TrendCell value={row.penetrationMom} /></TableCell>
                      <TableCell className="text-right text-xs text-gray-900">{row.merchants}</TableCell>
                      <TableCell className="text-right"><TrendCell value={row.merchantsMom} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-gray-400 mt-2 text-center">展示前 50 条，共 {data.length} 条</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 热力图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Heatmap
          title="渗透率热力图"
          regions={regions}
          products={products}
          data={data}
          metric="penetration"
          colorFn={penetrationColor}
        />
        <Heatmap
          title="商家数热力图"
          regions={regions}
          products={products}
          data={data}
          metric="merchants"
          colorFn={merchantColor}
        />
      </div>
    </div>
  );
}
