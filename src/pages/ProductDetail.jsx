import React, { useState } from "react";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { Eye, MousePointer, ArrowRightLeft, Layers } from "lucide-react";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 产品数据                                                            */
/* ================================================================== */
const WAIMAI_PRODUCTS = [
  { name: "点金推广", exposure: 1250, ctr: 3.2, cvr: 8.5, fillRate: 92 },
  { name: "全站推广（竞价）", exposure: 980, ctr: 2.8, cvr: 7.2, fillRate: 88 },
  { name: "订单通", exposure: 720, ctr: 2.1, cvr: 12.5, fillRate: 85 },
  { name: "超级流量卡", exposure: 450, ctr: 4.5, cvr: 6.8, fillRate: 95 },
  { name: "营销魔方", exposure: 320, ctr: 2.5, cvr: 9.1, fillRate: 78 },
  { name: "津贴联盟", exposure: 280, ctr: 1.8, cvr: 5.2, fillRate: 72 },
  { name: "流量助手", exposure: 180, ctr: 2.2, cvr: 4.5, fillRate: 68 },
];

const DAOCAN_PRODUCTS = [
  { name: "推广通 (CPC)", exposure: 850, ctr: 3.5, cvr: 9.2, fillRate: 90 },
  { name: "订单通 (CPS)", exposure: 620, ctr: 2.6, cvr: 11.5, fillRate: 86 },
  { name: "置顶卡等 (CPT)", exposure: 380, ctr: 4.2, cvr: 5.8, fillRate: 82 },
  { name: "智选展位等 (CPM)", exposure: 520, ctr: 3.8, cvr: 4.2, fillRate: 88 },
  { name: "品牌专区", exposure: 180, ctr: 5.5, cvr: 3.5, fillRate: 75 },
  { name: "搜索推广", exposure: 290, ctr: 4.8, cvr: 6.2, fillRate: 80 },
];

/* 日度流量数据 */
const generateDailyData = () => {
  const data = [];
  for (let i = 1; i <= 14; i++) {
    data.push({
      day: `8/${i}`,
      自然流量: Math.round(800 + Math.random() * 400),
      商业化流量: Math.round(300 + Math.random() * 300),
      端内流量: Math.round(600 + Math.random() * 300),
      外部流量: Math.round(100 + Math.random() * 200),
    });
  }
  return data;
};

const AI_ITEMS = [
  "该产品曝光量近两周呈上升趋势，主要得益于端内自然流量的增长，建议维持当前投放策略。",
  "点击率处于行业中上水平，但填充率仍有8%的提升空间，可优化库存分配逻辑。",
  "转化率在周末时段明显提升，建议在周五-周日加大预算投放以获取更高ROI。",
  "外部流量（联盟）占比偏低，可考虑拓展更多流量合作渠道。",
];

/* ================================================================== */
/* 辅助组件                                                            */
/* ================================================================== */

const MetricCard = ({ icon: Icon, label, value, unit, color, subtext }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}<span className="text-sm font-normal text-gray-400 ml-1">{unit}</span></p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </CardContent>
  </Card>
);

/* ================================================================== */
/* 主页面                                                              */
/* ================================================================== */
export default function ProductDetail() {
  const { bizLine } = useBizLine();
  const products = bizLine === "waimai" ? WAIMAI_PRODUCTS : DAOCAN_PRODUCTS;
  const [selected, setSelected] = useState(products[0].name);
  const product = products.find((p) => p.name === selected) || products[0];
  const dailyData = generateDailyData();
  const label = bizLine === "waimai" ? "外卖" : "到餐";

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{label}单产品明细</h1>
          <p className="text-sm text-gray-400 mt-1">效果维度拆解 · 流量结构分析</p>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-56 text-sm bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* AI 智能分析 */}
      <AiPanel items={AI_ITEMS} />

      {/* 效果指标 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">效果：先看数据量级</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={Eye} label="曝光量" value={product.exposure} unit="万" color="#4080FF" subtext="近14天累计" />
          <MetricCard icon={MousePointer} label="点击率" value={product.ctr} unit="%" color="#00C896" subtext="行业均值 2.8%" />
          <MetricCard icon={ArrowRightLeft} label="转化率" value={product.cvr} unit="%" color="#FF8C42" subtext="点击→成交转化" />
          <MetricCard icon={Layers} label="填充率" value={product.fillRate} unit="%" color="#A855F7" subtext="库存消耗比例" />
        </div>
      </div>

      {/* 流量结构 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-none shadow-sm bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">日度流量趋势</span>
            <Badge className="bg-blue-50 text-[#4080FF] border-none text-xs font-normal ml-2">近14天</Badge>
          </div>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorNatural" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4080FF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4080FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCommercial" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C896" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="自然流量" stroke="#4080FF" fill="url(#colorNatural)" strokeWidth={2} />
                  <Area type="monotone" dataKey="商业化流量" stroke="#00C896" fill="url(#colorCommercial)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">端内 / 外部流量</span>
            <Badge className="bg-amber-50 text-amber-600 border-none text-xs font-normal ml-2">联盟流量</Badge>
          </div>
          <CardContent className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="端内流量" fill="#4080FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="外部流量" fill="#FF8C42" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 大盘流量偏低情况 & 节假日分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-none shadow-sm bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">自然流量 vs 商业化流量</span>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">自然流量</p>
                  <p className="text-xs text-gray-400">C端打开美团的次数</p>
                </div>
                <p className="text-lg font-bold text-[#4080FF]">{Math.round(dailyData.reduce((s, d) => s + d.自然流量, 0) / 14).toLocaleString()}万/天</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">商业化流量</p>
                  <p className="text-xs text-gray-400">广告曝光占总流量比例</p>
                </div>
                <p className="text-lg font-bold text-emerald-600">{Math.round(dailyData.reduce((s, d) => s + d.商业化流量, 0) / dailyData.reduce((s, d) => s + d.自然流量 + d.商业化流量, 0) * 100)}%</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-900">大盘流量偏低预警</p>
                  <p className="text-xs text-gray-400">近3天日均流量环比</p>
                </div>
                <p className="text-lg font-bold text-amber-600">-5.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">节假日单独分析</span>
            <Badge className="bg-red-50 text-red-500 border-none text-xs font-normal ml-2">近期节日</Badge>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 text-sm font-bold text-red-500">节</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">七夕节（8/10）</p>
                  <p className="text-xs text-gray-500 mt-0.5">曝光量 +35% · 转化率 +12% · 建议加大鲜花/礼品类投放</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-sm font-bold text-blue-500">末</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">周末效应</p>
                  <p className="text-xs text-gray-500 mt-0.5">周六日 CTR 比工作日高 18%，建议周末预算上调 20%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-sm font-bold text-amber-500">预</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">中秋预热（9月中旬）</p>
                  <p className="text-xs text-gray-500 mt-0.5">预计礼盒类产品搜索量将上升，建议提前备货广告库存</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
