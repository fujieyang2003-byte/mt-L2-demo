import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KpiCard from "@/components/dashboard/KpiCard";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Store,
  AlertTriangle,
} from "lucide-react";

const kpiData = [
  {
    label: "广告收入",
    value: "¥ 12,846万",
    trend: 8.6,
    icon: DollarSign,
    iconBg: "#e8f0ff",
    iconColor: "#4080FF",
  },
  {
    label: "MR 完成率",
    value: "92.3%",
    trend: 3.2,
    icon: TrendingUp,
    iconBg: "#e6f9f0",
    iconColor: "#12b76a",
  },
  {
    label: "活跃商户数",
    value: "8,562",
    trend: 5.1,
    icon: Store,
    iconBg: "#fff4e6",
    iconColor: "#f79009",
  },
  {
    label: "预警数量",
    value: "17",
    trend: -12.5,
    icon: AlertTriangle,
    iconBg: "#fdeaea",
    iconColor: "#f04438",
    footerLabel: "较上周期（越低越好）",
  },
];

const alertList = [
  { name: "华东区域-3月MR完成率预警", level: "高", time: "10 分钟前" },
  { name: "华南KA客户流失风险预警", level: "中", time: "1 小时前" },
  { name: "西南区域激励超支预警", level: "中", time: "3 小时前" },
  { name: "华北新客转化率下降预警", level: "低", time: "昨天" },
];

const levelColor = {
  高: "bg-red-50 text-red-500",
  中: "bg-orange-50 text-orange-500",
  低: "bg-blue-50 text-[#4080FF]",
};

/** 近30天广告收入趋势 Demo 数据：8/1 - 8/10，收入(万元) 380-520 波动，YoY(%) 5-15 波动 */
const revenueTrendData = [
  { date: "8/1", revenue: 412, yoy: 8.2 },
  { date: "8/2", revenue: 438, yoy: 6.5 },
  { date: "8/3", revenue: 465, yoy: 9.1 },
  { date: "8/4", revenue: 397, yoy: 5.8 },
  { date: "8/5", revenue: 452, yoy: 11.3 },
  { date: "8/6", revenue: 508, yoy: 13.6 },
  { date: "8/7", revenue: 486, yoy: 12.1 },
  { date: "8/8", revenue: 431, yoy: 7.4 },
  { date: "8/9", revenue: 473, yoy: 10.2 },
  { date: "8/10", revenue: 519, yoy: 14.8 },
];

const Overview = () => {
  return (
    <div>
      <PageHeader
        title="首页总览"
        description="全局经营指标概览，实时掌握广告业务健康度"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiData.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              广告收入趋势
            </CardTitle>
            <Badge variant="outline" className="text-gray-400 font-normal">
              近30天
            </Badge>
          </CardHeader>
          <CardContent>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "收入(万元)", angle: -90, position: "insideLeft", fontSize: 12, fill: "#9ca3af" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: "YoY(%)", angle: 90, position: "insideRight", fontSize: 12, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "YoY增长率" ? [`${value}%`, name] : [`${value}万元`, name]
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="每日收入"
                    fill="#4080FF"
                    opacity={0.7}
                    radius={[4, 4, 0, 0]}
                    barSize={22}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="yoy"
                    name="YoY增长率"
                    stroke="#4080FF"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#4080FF" }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              最新预警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertList.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-none last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${levelColor[item.level]}`}
                  >
                    {item.level}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
