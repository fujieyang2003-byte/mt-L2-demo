import React, { useMemo } from "react";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownRight,
  Store,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* Demo 数据：商家变化                                                 */
/* ================================================================== */
const merchantChangeData = {
  waimai: {
    p0ToP1: {
      count: 1248,
      avgRevenueChange: "+3,200",
      avgGtvChange: "+12,500",
      revenueTrend: "up",
      gtvTrend: "up",
    },
    p0ToP2: {
      count: 892,
      avgRevenueChange: "-1,800",
      avgGtvChange: "-6,200",
      revenueTrend: "down",
      gtvTrend: "down",
    },
    p1ToP0: {
      count: 456,
      avgRevenueChange: "-2,100",
      avgGtvChange: "-8,400",
      revenueTrend: "down",
      gtvTrend: "down",
    },
    p2ToP0: {
      count: 334,
      avgRevenueChange: "+2,800",
      avgGtvChange: "+9,100",
      revenueTrend: "up",
      gtvTrend: "up",
    },
    detailRows: [
      { from: "P0", to: "P1", city: "上海", count: 320, revenueChange: "+3,500", gtvChange: "+13,200" },
      { from: "P0", to: "P1", city: "北京", count: 280, revenueChange: "+3,100", gtvChange: "+11,800" },
      { from: "P0", to: "P1", city: "杭州", count: 210, revenueChange: "+3,400", gtvChange: "+12,600" },
      { from: "P0", to: "P1", city: "深圳", count: 198, revenueChange: "+3,000", gtvChange: "+11,500" },
      { from: "P0", to: "P1", city: "广州", count: 180, revenueChange: "+2,900", gtvChange: "+11,000" },
      { from: "P0", to: "P1", city: "成都", count: 165, revenueChange: "+2,800", gtvChange: "+10,500" },
      { from: "P0", to: "P2", city: "上海", count: 220, revenueChange: "-1,900", gtvChange: "-6,500" },
      { from: "P0", to: "P2", city: "北京", count: 198, revenueChange: "-1,800", gtvChange: "-6,200" },
      { from: "P0", to: "P2", city: "杭州", count: 165, revenueChange: "-1,700", gtvChange: "-5,800" },
      { from: "P0", to: "P2", city: "深圳", count: 150, revenueChange: "-1,600", gtvChange: "-5,500" },
      { from: "P0", to: "P2", city: "广州", count: 98, revenueChange: "-1,500", gtvChange: "-5,200" },
      { from: "P0", to: "P2", city: "成都", count: 61, revenueChange: "-1,400", gtvChange: "-4,800" },
    ],
    aiItems: [
      { title: "P0→P1 升级商家是核心增长引擎", text: "本月共有1,248家商家从P0升级为P1，平均广告收入增长3,200元，GTV增长12,500元。建议对升级商家加大专属运营资源投入，推动其持续投放。" },
      { title: "P0→P2 降级商家需重点关注", text: "本月有892家商家从P0降级为P2，平均广告收入下降1,800元，GTV下降6,200元。建议对这些商家进行流失预警分析，制定挽回策略。" },
      { title: "上海、北京升级商家数量领先", text: "上海320家、北京280家商家完成P0→P1升级，两城合计占比48%。建议在这两个城市试点商家成长加速计划。" },
    ],
  },
  daocan: {
    p0ToP1: {
      count: 420,
      avgRevenueChange: "+2,100",
      avgGtvChange: "+8,400",
      revenueTrend: "up",
      gtvTrend: "up",
    },
    p0ToP2: {
      count: 310,
      avgRevenueChange: "-1,200",
      avgGtvChange: "-4,500",
      revenueTrend: "down",
      gtvTrend: "down",
    },
    p1ToP0: {
      count: 180,
      avgRevenueChange: "-1,500",
      avgGtvChange: "-5,800",
      revenueTrend: "down",
      gtvTrend: "down",
    },
    p2ToP0: {
      count: 120,
      avgRevenueChange: "+1,800",
      avgGtvChange: "+6,200",
      revenueTrend: "up",
      gtvTrend: "up",
    },
    detailRows: [
      { from: "P0", to: "P1", city: "上海", count: 110, revenueChange: "+2,300", gtvChange: "+9,100" },
      { from: "P0", to: "P1", city: "北京", count: 95, revenueChange: "+2,000", gtvChange: "+8,200" },
      { from: "P0", to: "P1", city: "杭州", count: 78, revenueChange: "+2,100", gtvChange: "+8,500" },
      { from: "P0", to: "P1", city: "深圳", count: 65, revenueChange: "+1,900", gtvChange: "+7,800" },
      { from: "P0", to: "P1", city: "广州", count: 72, revenueChange: "+1,800", gtvChange: "+7,200" },
      { from: "P0", to: "P2", city: "上海", count: 85, revenueChange: "-1,300", gtvChange: "-4,800" },
      { from: "P0", to: "P2", city: "北京", count: 72, revenueChange: "-1,200", gtvChange: "-4,500" },
      { from: "P0", to: "P2", city: "杭州", count: 58, revenueChange: "-1,100", gtvChange: "-4,200" },
      { from: "P0", to: "P2", city: "深圳", count: 52, revenueChange: "-1,000", gtvChange: "-3,800" },
      { from: "P0", to: "P2", city: "广州", count: 43, revenueChange: "-900", gtvChange: "-3,500" },
    ],
    aiItems: [
      { title: "到餐P0→P1升级商家潜力释放", text: "本月420家商家从P0升级为P1，平均广告收入增长2,100元，GTV增长8,400元。到餐商家升级后的广告效果提升明显，建议扩大冷启商家覆盖。" },
      { title: "P0→P2降级需建立预警机制", text: "310家商家降级为P2，平均收入下降1,200元。建议建立商家健康度评分模型，对可能降级的商家提前干预。" },
      { title: "上海到餐商家升级数量最多", text: "上海110家商家完成升级，领先其他城市。建议总结上海运营经验，向其他城市复制推广。" },
    ],
  },
};

/* ================================================================== */
/* 变化卡片组件                                                        */
/* ================================================================== */
const ChangeCard = ({ label, value, sub, trend, icon: Icon, color, bg }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="pt-5 pb-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {trend === "up" && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
            {trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500" />}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrendValue = ({ value }) => {
  const isUp = !value.startsWith("-");
  return (
    <span className={`flex items-center gap-0.5 text-sm ${isUp ? "text-emerald-600" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value}
    </span>
  );
};

/* ================================================================== */
/* 主组件                                                              */
/* ================================================================== */
const MerchantChange = () => {
  const { bizLine } = useBizLine();
  const data = useMemo(() => merchantChangeData[bizLine] || merchantChangeData.waimai, [bizLine]);

  const p0ToP1Rows = data.detailRows.filter((r) => r.from === "P0" && r.to === "P1");
  const p0ToP2Rows = data.detailRows.filter((r) => r.from === "P0" && r.to === "P2");

  return (
    <div className="space-y-5">
      {/* AI 智能分析 */}
      <AiPanel items={data.aiItems} />

      {/* P0 → P1 升级 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">P0 → P1 升级商家</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ChangeCard
            label="转移商家数量"
            value={data.p0ToP1.count.toLocaleString()}
            sub="较上月 +12%"
            trend="up"
            icon={Store}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <ChangeCard
            label="平均广告收入变化"
            value={data.p0ToP1.avgRevenueChange}
            sub="元/家"
            trend={data.p0ToP1.revenueTrend}
            icon={DollarSign}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <ChangeCard
            label="平均GTV变化"
            value={data.p0ToP1.avgGtvChange}
            sub="元/家"
            trend={data.p0ToP1.gtvTrend}
            icon={BarChart3}
            color="text-violet-600"
            bg="bg-violet-50"
          />
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>来源等级</TableHead>
                    <TableHead>目标等级</TableHead>
                    <TableHead>城市</TableHead>
                    <TableHead>转移商家数</TableHead>
                    <TableHead>广告收入变化</TableHead>
                    <TableHead>GTV变化</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p0ToP1Rows.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-blue-50/30">
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600">{row.from}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-600">{row.to}</span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                      <TableCell>{row.count}</TableCell>
                      <TableCell><TrendValue value={row.revenueChange} /></TableCell>
                      <TableCell><TrendValue value={row.gtvChange} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P0 → P2 降级 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-red-500 rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">P0 → P2 降级商家</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ChangeCard
            label="转移商家数量"
            value={data.p0ToP2.count.toLocaleString()}
            sub="较上月 -8%"
            trend="down"
            icon={Store}
            color="text-red-600"
            bg="bg-red-50"
          />
          <ChangeCard
            label="平均广告收入变化"
            value={data.p0ToP2.avgRevenueChange}
            sub="元/家"
            trend={data.p0ToP2.revenueTrend}
            icon={DollarSign}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <ChangeCard
            label="平均GTV变化"
            value={data.p0ToP2.avgGtvChange}
            sub="元/家"
            trend={data.p0ToP2.gtvTrend}
            icon={BarChart3}
            color="text-violet-600"
            bg="bg-violet-50"
          />
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>来源等级</TableHead>
                    <TableHead>目标等级</TableHead>
                    <TableHead>城市</TableHead>
                    <TableHead>转移商家数</TableHead>
                    <TableHead>广告收入变化</TableHead>
                    <TableHead>GTV变化</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p0ToP2Rows.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-blue-50/30">
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600">{row.from}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-600">{row.to}</span>
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                      <TableCell>{row.count}</TableCell>
                      <TableCell><TrendValue value={row.revenueChange} /></TableCell>
                      <TableCell><TrendValue value={row.gtvChange} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantChange;
