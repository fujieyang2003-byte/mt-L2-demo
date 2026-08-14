import React, { useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { useBizLine } from "@/contexts/BizLineContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import KpiCard from "@/components/dashboard/KpiCard";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  AreaChart,
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
  Sparkles,
  Trophy,
  Target,
  PieChart,
  Layers,
  Users,
  CheckCircle2,
} from "lucide-react";

/* ================================================================== */
/* 总览摘要 KPI（按业务线区分）– platform_admin                          */
/* ================================================================== */
const kpiDataMap = {
  waimai: [
    { label: "广告收入", value: "¥ 12,846万", trend: 8.6, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "目标达成率", value: "92.3%", trend: 3.2, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "活跃商家数", value: "8,562", trend: 5.1, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009" },
    { label: "预警城市", value: "6", trend: -12.5, icon: AlertTriangle, iconBg: "#fdeaea", iconColor: "#f04438", footerLabel: "较上周期" },
    { label: "预警总商", value: "11", trend: -8.2, icon: AlertTriangle, iconBg: "#fff4e6", iconColor: "#f79009", footerLabel: "较上周期" },
  ],
  daocan: [
    { label: "广告收入", value: "¥ 8,420万", trend: 6.2, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "目标达成率", value: "85.4%", trend: 1.8, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "活跃商家数", value: "5,230", trend: 3.5, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009" },
    { label: "预警城市", value: "8", trend: -8.2, icon: AlertTriangle, iconBg: "#fdeaea", iconColor: "#f04438", footerLabel: "较上周期" },
    { label: "预警总商", value: "15", trend: -6.0, icon: AlertTriangle, iconBg: "#fff4e6", iconColor: "#f79009", footerLabel: "较上周期" },
  ],
};

const revenueTrendDataMap = {
  waimai: [
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
  ],
  daocan: [
    { date: "8/1", revenue: 268, yoy: 5.1 },
    { date: "8/2", revenue: 285, yoy: 4.2 },
    { date: "8/3", revenue: 302, yoy: 6.8 },
    { date: "8/4", revenue: 251, yoy: 3.5 },
    { date: "8/5", revenue: 296, yoy: 7.9 },
    { date: "8/6", revenue: 332, yoy: 10.2 },
    { date: "8/7", revenue: 318, yoy: 9.1 },
    { date: "8/8", revenue: 279, yoy: 5.6 },
    { date: "8/9", revenue: 305, yoy: 7.8 },
    { date: "8/10", revenue: 342, yoy: 11.5 },
  ],
};

const regionRevenueDataMap = {
  waimai: [
    { region: "华东区", revenue: 3265, target: 3500, rate: 93 },
    { region: "华南区", revenue: 2890, target: 3000, rate: 96 },
    { region: "华北区", revenue: 2105, target: 2600, rate: 81 },
    { region: "西南区", revenue: 1950, target: 2000, rate: 98 },
    { region: "东北区", revenue: 1020, target: 1500, rate: 68 },
  ],
  daocan: [
    { region: "华东区", revenue: 2150, target: 2400, rate: 90 },
    { region: "华南区", revenue: 1980, target: 2100, rate: 94 },
    { region: "华北区", revenue: 1360, target: 1800, rate: 76 },
    { region: "西南区", revenue: 680, target: 750, rate: 91 },
    { region: "东北区", revenue: 420, target: 650, rate: 65 },
  ],
};

const regionRankingMap = {
  waimai: [
    { rank: 1, name: "华东区", revenue: "3,265万", rate: 93, yoy: "+12.4%", trend: "up" },
    { rank: 2, name: "华南区", revenue: "2,890万", rate: 96, yoy: "+8.1%", trend: "up" },
    { rank: 3, name: "华北区", revenue: "2,105万", rate: 81, yoy: "-3.6%", trend: "down" },
    { rank: 4, name: "西南区", revenue: "1,950万", rate: 98, yoy: "+15.2%", trend: "up" },
    { rank: 5, name: "东北区", revenue: "1,020万", rate: 68, yoy: "-8.3%", trend: "down" },
  ],
  daocan: [
    { rank: 1, name: "华东区", revenue: "2,150万", rate: 90, yoy: "+9.6%", trend: "up" },
    { rank: 2, name: "华南区", revenue: "1,980万", rate: 94, yoy: "+6.2%", trend: "up" },
    { rank: 3, name: "华北区", revenue: "1,360万", rate: 76, yoy: "-5.1%", trend: "down" },
    { rank: 4, name: "西南区", revenue: "680万", rate: 91, yoy: "+10.8%", trend: "up" },
    { rank: 5, name: "东北区", revenue: "420万", rate: 65, yoy: "-10.2%", trend: "down" },
  ],
};

const partnerRankingMap = {
  waimai: [
    { rank: 1, name: "上海总商A", revenue: "540万", rate: 90, city: "上海" },
    { rank: 2, name: "广州总商E", revenue: "490万", rate: 98, city: "广州" },
    { rank: 3, name: "成都总商K", revenue: "490万", rate: 98, city: "成都" },
    { rank: 4, name: "杭州总商B", revenue: "480万", rate: 96, city: "杭州" },
    { rank: 5, name: "深圳总商F", revenue: "450万", rate: 90, city: "深圳" },
  ],
  daocan: [
    { rank: 1, name: "北京餐联盟C", revenue: "360万", rate: 88, city: "北京" },
    { rank: 2, name: "上海餐饮商H", revenue: "320万", rate: 92, city: "上海" },
    { rank: 3, name: "广州到餐商M", revenue: "280万", rate: 85, city: "广州" },
    { rank: 4, name: "成都餐饮商J", revenue: "250万", rate: 90, city: "成都" },
    { rank: 5, name: "深圳到餐商P", revenue: "220万", rate: 83, city: "深圳" },
  ],
};

const anomalyAlertsMap = {
  waimai: [
    { name: "东北区达成率仅68%", detail: "距目标缺口480万，建议紧急调配资源", level: "高" },
    { name: "华北区达成率81%", detail: "距目标缺口495万，需重点关注北京和天津", level: "高" },
    { name: "品牌广告达成率77%", detail: "受大客户预算缩减影响，建议拓展中小品牌", level: "中" },
    { name: "老商0投广渗透率0%", detail: "1200家商户未投广，潜在月收入96万", level: "中" },
  ],
  daocan: [
    { name: "东北区达成率仅65%", detail: "距目标缺口230万，建议重点推动到餐广告覆盖", level: "高" },
    { name: "华北区达成率76%", detail: "距目标缺口440万，需关注北京到餐商户流失", level: "高" },
    { name: "品牌广告达成率70%", detail: "到餐品牌广告投放不足，建议加强餐饮品牌拓展", level: "中" },
    { name: "老商0投广渗透率0%", detail: "800家到餐商户未投广，潜在月收入52万", level: "中" },
  ],
};

const levelColor = {
  高: "bg-red-50 text-red-500",
  中: "bg-orange-50 text-orange-500",
  低: "bg-blue-50 text-[#4080FF]",
};

const productSummaryMap = {
  waimai: [
    { product: "信息流广告", revenue: "5,820万", rate: 94, share: "48%", trend: "+15.3%" },
    { product: "搜索广告", revenue: "3,410万", rate: 90, share: "28%", trend: "+8.7%" },
    { product: "品牌广告", revenue: "1,850万", rate: 77, share: "15%", trend: "-2.1%" },
    { product: "CPS佣金广告", revenue: "1,070万", rate: 109, share: "9%", trend: "+22.4%" },
  ],
  daocan: [
    { product: "信息流广告", revenue: "3,820万", rate: 91, share: "45%", trend: "+12.1%" },
    { product: "搜索广告", revenue: "2,260万", rate: 88, share: "27%", trend: "+6.5%" },
    { product: "品牌广告", revenue: "1,180万", rate: 70, share: "14%", trend: "-3.8%" },
    { product: "CPS佣金广告", revenue: "680万", rate: 102, share: "8%", trend: "+18.2%" },
  ],
};

const merchantSummaryMap = {
  waimai: [
    { tier: "高GTV成熟商", count: 320, adRate: "90.3%", revenue: "45.2万", status: "良好" },
    { tier: "老商低MR", count: 860, adRate: "20.9%", revenue: "12.3万", status: "待提升" },
    { tier: "老商0投广", count: 1200, adRate: "0%", revenue: "0万", status: "需突破" },
    { tier: "新签及流失挽回", count: 280, adRate: "29.2%", revenue: "3.1万", status: "需激活" },
  ],
  daocan: [
    { tier: "高GTV成熟商", count: 180, adRate: "85.1%", revenue: "28.6万", status: "良好" },
    { tier: "老商低MR", count: 520, adRate: "18.5%", revenue: "7.8万", status: "待提升" },
    { tier: "老商0投广", count: 800, adRate: "0%", revenue: "0万", status: "需突破" },
    { tier: "新签及流失挽回", count: 160, adRate: "25.6%", revenue: "1.9万", status: "需激活" },
  ],
};

const channelSummaryMap = {
  waimai: [
    { region: "华东区", partners: 12, revenue: "3,265万", rate: 93, status: "正常" },
    { region: "华南区", partners: 10, revenue: "2,890万", rate: 96, status: "正常" },
    { region: "华北区", partners: 8, revenue: "2,105万", rate: 81, status: "有风险" },
    { region: "西南区", partners: 6, revenue: "1,950万", rate: 98, status: "正常" },
    { region: "东北区", partners: 5, revenue: "1,020万", rate: 68, status: "严重滞后" },
  ],
  daocan: [
    { region: "华东区", partners: 9, revenue: "2,150万", rate: 90, status: "正常" },
    { region: "华南区", partners: 7, revenue: "1,980万", rate: 94, status: "正常" },
    { region: "华北区", partners: 6, revenue: "1,360万", rate: 76, status: "有风险" },
    { region: "西南区", partners: 4, revenue: "680万", rate: 91, status: "正常" },
    { region: "东北区", partners: 3, revenue: "420万", rate: 65, status: "严重滞后" },
  ],
};

const aiAnalysisItemsMap = {
  waimai: [
    "整体广告收入12,846万，达成率92.3%，较上月增长8.6%，经营态势良好",
    "东北区达成率68%为全国最低，建议紧急安排专项会议，重点推动沈阳和长春的尾部城市冲刺",
    "品牌广告达成率77%低于均值，受大客户预算缩减影响，建议拓展中小品牌客户弥补缺口",
    "CPS佣金广告YoY+22.4%增长最快，建议加大推广力度作为增量来源",
    "1200家老商0投广为最大潜在增量，按5%月转化率预计可月增收4.8万",
  ],
  daocan: [
    "整体广告收入8,420万，达成率85.4%，较上月增长6.2%，经营态势平稳",
    "东北区达成率65%为全国最低，到餐广告覆盖不足，建议重点推动沈阳和哈尔滨",
    "品牌广告达成率70%低于均值，到餐品牌投放意愿弱，建议加强餐饮品牌拓展",
    "CPS佣金广告YoY+18.2%增长较快，建议加大到餐场景推广",
    "800家老商0投广为到餐最大潜在增量，按5%月转化率预计可月增收3.2万",
  ],
};

/* ================================================================== */
/* AI 智能分析卡片（共享组件）                                           */
/* ================================================================== */
const AiAnalysisCard = ({ items }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardHeader>
      <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#4080FF]" />
        AI 经营分析
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2.5">
        {items.map((text, index) => (
          <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
            <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
            <p className="leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/* ================================================================== */
/* 区块标题（共享组件）                                                  */
/* ================================================================== */
const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
    {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
    <h2 className="text-sm font-semibold text-gray-700">{children}</h2>
  </div>
);

/* ================================================================== */
/* platform_admin — 全国总览（保持原逻辑不变）                            */
/* ================================================================== */
const PlatformAdminOverview = ({ bizLine }) => {
  const kpiData = kpiDataMap[bizLine] || kpiDataMap.waimai;
  const revenueTrendData = revenueTrendDataMap[bizLine] || revenueTrendDataMap.waimai;
  const regionRevenueData = regionRevenueDataMap[bizLine] || regionRevenueDataMap.waimai;
  const regionRanking = regionRankingMap[bizLine] || regionRankingMap.waimai;
  const partnerRanking = partnerRankingMap[bizLine] || partnerRankingMap.waimai;
  const anomalyAlerts = anomalyAlertsMap[bizLine] || anomalyAlertsMap.waimai;
  const productSummary = productSummaryMap[bizLine] || productSummaryMap.waimai;
  const merchantSummary = merchantSummaryMap[bizLine] || merchantSummaryMap.waimai;
  const channelSummary = channelSummaryMap[bizLine] || channelSummaryMap.waimai;
  const aiAnalysisItems = aiAnalysisItemsMap[bizLine] || aiAnalysisItemsMap.waimai;

  return (
    <div className="space-y-5">
      {/* ====== 总览摘要 ====== */}
      <div>
        <SectionTitle>总览摘要</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiData.map((item) => (
            <KpiCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* ====== 经营变化 ====== */}
      <div>
        <SectionTitle>经营变化</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                月度广告收入趋势
              </CardTitle>
              <Badge variant="outline" className="text-gray-400 font-normal">
                近10天
              </Badge>
            </CardHeader>
            <CardContent>
              <div style={{ height: 280 }}>
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
                    />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "YoY增长率" ? [`${value}%`, name] : [`${value}万元`, name]
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="revenue" name="每日收入" fill="#4080FF" opacity={0.7} radius={[4, 4, 0, 0]} barSize={22} />
                    <Line yAxisId="right" type="monotone" dataKey="yoy" name="YoY增长率" stroke="#f79009" strokeWidth={2} dot={{ r: 3, fill: "#f79009" }} activeDot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                各区域收入对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={regionRevenueData} layout="vertical" margin={{ top: 4, right: 8, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                    <YAxis dataKey="region" type="category" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip formatter={(value, name) => [`${value}万`, name]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="实际收入" fill="#4080FF" opacity={0.7} radius={[0, 4, 4, 0]} barSize={18} />
                    <Bar dataKey="target" name="目标收入" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={18} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ====== 排名 ====== */}
      <div>
        <SectionTitle icon={Trophy}>各节点收入排名</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">大区收入排名</p>
              <div className="space-y-2">
                {regionRanking.map((item) => (
                  <div key={item.rank} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.rank === 1 ? "bg-amber-50 text-amber-600" : item.rank === 2 ? "bg-gray-100 text-gray-500" : item.rank === 3 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                    }`}>
                      {item.rank}
                    </span>
                    <span className="font-medium text-gray-800 text-sm flex-1">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.revenue}</span>
                    <span className={`text-xs ${item.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>{item.yoy}</span>
                    <Badge className={`border-none font-normal text-xs ${item.rate >= 90 ? "bg-emerald-50 text-emerald-600" : item.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                      {item.rate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-4">合作商收入 TOP5</p>
              <div className="space-y-2">
                {partnerRanking.map((item) => (
                  <div key={item.rank} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.rank === 1 ? "bg-amber-50 text-amber-600" : item.rank === 2 ? "bg-gray-100 text-gray-500" : item.rank === 3 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                    }`}>
                      {item.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.city}</p>
                    </div>
                    <span className="text-sm text-gray-600">{item.revenue}</span>
                    <Badge className={`border-none font-normal text-xs ${item.rate >= 90 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#4080FF]"}`}>
                      {item.rate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ====== 经营分析 ====== */}
      <div>
        <SectionTitle>经营分析</SectionTitle>

        <Card className="border-none shadow-sm bg-white mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-gray-900">达成率异常提示</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {anomalyAlerts.map((item) => (
                <div key={item.name} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${levelColor[item.level]}`}>
                    {item.level}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-[#4080FF]" />
                <p className="text-sm font-semibold text-gray-900">产品经营汇总</p>
              </div>
              <div className="space-y-2.5">
                {productSummary.map((item) => (
                  <div key={item.product} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700 flex-1 truncate">{item.product}</span>
                    <span className="text-gray-500 text-xs">{item.revenue}</span>
                    <span className={`text-xs font-medium ${item.trend.startsWith("-") ? "text-red-500" : "text-emerald-600"}`}>{item.trend}</span>
                    <Badge className={`border-none font-normal text-xs shrink-0 ${item.rate >= 90 ? "bg-emerald-50 text-emerald-600" : item.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                      {item.rate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Store className="w-4 h-4 text-[#4080FF]" />
                <p className="text-sm font-semibold text-gray-900">商家经营汇总</p>
              </div>
              <div className="space-y-2.5">
                {merchantSummary.map((item) => (
                  <div key={item.tier} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700 flex-1 truncate">{item.tier}</span>
                    <span className="text-gray-500 text-xs">{item.count}家</span>
                    <span className="text-gray-500 text-xs">{item.adRate}</span>
                    <Badge className={`border-none font-normal text-xs shrink-0 ${
                      item.status === "良好" ? "bg-emerald-50 text-emerald-600" :
                      item.status === "待提升" ? "bg-amber-50 text-amber-600" :
                      item.status === "需突破" ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#4080FF]"
                    }`}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-[#4080FF]" />
                <p className="text-sm font-semibold text-gray-900">渠道经营汇总</p>
              </div>
              <div className="space-y-2.5">
                {channelSummary.map((item) => (
                  <div key={item.region} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700 flex-1 truncate">{item.region}</span>
                    <span className="text-gray-500 text-xs">{item.partners}商</span>
                    <span className="text-gray-500 text-xs">{item.revenue}</span>
                    <Badge className={`border-none font-normal text-xs shrink-0 ${
                      item.status === "正常" ? "bg-emerald-50 text-emerald-600" :
                      item.status === "有风险" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                    }`}>
                      {item.rate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <AiAnalysisCard items={aiAnalysisItems} />
      </div>
    </div>
  );
};

/* ================================================================== */
/* biz_manager mock data — 华东区城市级                                  */
/* ================================================================== */
const bizKpiMap = {
  waimai: [
    { label: "区域广告收入", value: "¥ 3,265万", trend: 12.4, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "区域达成率", value: "93.3%", trend: 4.1, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "活跃商家数", value: "2,180", trend: 6.8, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009" },
    { label: "预警数量", value: "5", trend: -16.7, icon: AlertTriangle, iconBg: "#fdeaea", iconColor: "#f04438", footerLabel: "较上周期（越低越好）" },
  ],
  daocan: [
    { label: "区域广告收入", value: "¥ 2,150万", trend: 9.6, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "区域达成率", value: "89.6%", trend: 2.3, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "活跃商家数", value: "1,420", trend: 4.2, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009" },
    { label: "预警数量", value: "8", trend: -11.2, icon: AlertTriangle, iconBg: "#fdeaea", iconColor: "#f04438", footerLabel: "较上周期（越低越好）" },
  ],
};

const cityTableMap = {
  waimai: [
    { city: "上海", revenue: "1,180万", target: "1,200万", rate: 98, rf: "32%", mr: "4.8%", yoy: "+14.2%", mom: "+3.5%" },
    { city: "杭州", revenue: "860万", target: "900万", rate: 96, rf: "28%", mr: "4.2%", yoy: "+10.8%", mom: "+2.1%" },
    { city: "南京", revenue: "620万", target: "750万", rate: 83, rf: "22%", mr: "3.6%", yoy: "-2.4%", mom: "-1.8%" },
    { city: "苏州", revenue: "605万", target: "650万", rate: 93, rf: "25%", mr: "3.9%", yoy: "+8.6%", mom: "+1.2%" },
  ],
  daocan: [
    { city: "上海", revenue: "780万", target: "850万", rate: 92, rf: "26%", mr: "3.5%", yoy: "+11.2%", mom: "+2.8%" },
    { city: "杭州", revenue: "560万", target: "600万", rate: 93, rf: "24%", mr: "3.2%", yoy: "+8.4%", mom: "+1.6%" },
    { city: "南京", revenue: "420万", target: "550万", rate: 76, rf: "18%", mr: "2.8%", yoy: "-4.1%", mom: "-2.3%" },
    { city: "苏州", revenue: "390万", target: "400万", rate: 98, rf: "21%", mr: "3.1%", yoy: "+6.8%", mom: "+0.9%" },
  ],
};

const cityRankingMap = {
  waimai: [
    { rank: 1, name: "上海", revenue: "1,180万", rate: 98, yoy: "+14.2%", trend: "up" },
    { rank: 2, name: "杭州", revenue: "860万", rate: 96, yoy: "+10.8%", trend: "up" },
    { rank: 3, name: "苏州", revenue: "605万", rate: 93, yoy: "+8.6%", trend: "up" },
    { rank: 4, name: "南京", revenue: "620万", rate: 83, yoy: "-2.4%", trend: "down" },
  ],
  daocan: [
    { rank: 1, name: "上海", revenue: "780万", rate: 92, yoy: "+11.2%", trend: "up" },
    { rank: 2, name: "杭州", revenue: "560万", rate: 93, yoy: "+8.4%", trend: "up" },
    { rank: 3, name: "苏州", revenue: "390万", rate: 98, yoy: "+6.8%", trend: "up" },
    { rank: 4, name: "南京", revenue: "420万", rate: 76, yoy: "-4.1%", trend: "down" },
  ],
};

const bizAiMap = {
  waimai: [
    "华东区广告收入3,265万，达成率93.3%，较上月增长12.4%，增长领跑全国",
    "南京达成率83%为区域内最低，建议重点关注南京尾部商户的投广覆盖",
    "上海贡献区域36%收入，达成率98%表现优异，建议总结上海经验推广至其他城市",
    "苏州RF率25%有提升空间，建议加强苏州信息流广告的投放引导",
  ],
  daocan: [
    "华东区到餐广告收入2,150万，达成率89.6%，较上月增长9.6%，区域表现稳健",
    "南京达成率76%为区域内最低，到餐广告覆盖不足，建议加大南京餐饮商户拓展",
    "上海贡献区域36%收入，CPS佣金广告增长18%，建议推广至杭州和苏州",
    "苏州MR 3.1%略低于区域均值，建议优化到餐广告投放策略",
  ],
};

/* ================================================================== */
/* BizManagerOverview — 大区经理视角（华东区城市级）                      */
/* ================================================================== */
const BizManagerOverview = ({ bizLine, region }) => {
  const kpiData = bizKpiMap[bizLine] || bizKpiMap.waimai;
  const cityRows = cityTableMap[bizLine] || cityTableMap.waimai;
  const cityRanking = cityRankingMap[bizLine] || cityRankingMap.waimai;
  const aiItems = bizAiMap[bizLine] || bizAiMap.waimai;

  return (
    <div className="space-y-5">
      {/* ====== 区域摘要 ====== */}
      <div>
        <SectionTitle>{region} · 区域总览</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((item) => (
            <KpiCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* ====== 城市明细表 ====== */}
      <div>
        <SectionTitle>城市经营明细</SectionTitle>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>城市</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>目标</TableHead>
                  <TableHead className="w-32">达成率</TableHead>
                  <TableHead>RF率</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>YoY</TableHead>
                  <TableHead>MoM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityRows.map((row) => (
                  <TableRow key={row.city}>
                    <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{row.revenue}</TableCell>
                    <TableCell className="text-gray-500">{row.target}</TableCell>
                    <TableCell>
                      <Badge className={`border-none font-normal text-xs ${
                        row.rate >= 95 ? "bg-emerald-50 text-emerald-600" :
                        row.rate >= 85 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"
                      }`}>
                        {row.rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{row.rf}</TableCell>
                    <TableCell className="text-gray-600">{row.mr}</TableCell>
                    <TableCell className={row.yoy.startsWith("-") ? "text-red-500 text-xs" : "text-emerald-600 text-xs"}>{row.yoy}</TableCell>
                    <TableCell className={row.mom.startsWith("-") ? "text-red-500 text-xs" : "text-emerald-600 text-xs"}>{row.mom}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ====== 城市排名 ====== */}
      <div>
        <SectionTitle icon={Trophy}>城市收入排名</SectionTitle>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="space-y-2">
              {cityRanking.map((item) => (
                <div key={item.rank} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    item.rank === 1 ? "bg-amber-50 text-amber-600" : item.rank === 2 ? "bg-gray-100 text-gray-500" : item.rank === 3 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                  }`}>
                    {item.rank}
                  </span>
                  <span className="font-medium text-gray-800 text-sm flex-1">{item.name}</span>
                  <span className="text-sm text-gray-600">{item.revenue}</span>
                  <span className={`text-xs ${item.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>{item.yoy}</span>
                  <Badge className={`border-none font-normal text-xs ${item.rate >= 95 ? "bg-emerald-50 text-emerald-600" : item.rate >= 85 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                    {item.rate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== AI 分析 ====== */}
      <AiAnalysisCard items={aiItems} />
    </div>
  );
};

/* ================================================================== */
/* partner mock data — 上海城市级BD级                                    */
/* ================================================================== */
const partnerKpiMap = {
  waimai: [
    { label: "城市广告收入", value: "¥ 1,180万", trend: 14.2, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "城市达成率", value: "98.3%", trend: 5.6, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "覆盖商家数", value: "680", trend: 7.4, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009" },
    { label: "活跃BD数", value: "3", trend: 0, icon: Users, iconBg: "#f3e8ff", iconColor: "#7c3aed" },
  ],
  daocan: [
    { label: "城市广告收入", value: "¥ 780万", trend: 11.2, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "城市达成率", value: "91.8%", trend: 3.2, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "覆盖商家数", value: "420", trend: 5.1, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009" },
    { label: "活跃BD数", value: "3", trend: 0, icon: Users, iconBg: "#f3e8ff", iconColor: "#7c3aed" },
  ],
};

const bdTableMap = {
  waimai: [
    { bdName: "刘洋", stores: 8, revenue: "420万", target: "400万", rate: 105, achievement: "优秀" },
    { bdName: "陈静", stores: 7, revenue: "380万", target: "380万", rate: 100, achievement: "达标" },
    { bdName: "赵刚", stores: 6, revenue: "380万", target: "420万", rate: 90, achievement: "待提升" },
  ],
  daocan: [
    { bdName: "刘洋", stores: 6, revenue: "280万", target: "260万", rate: 108, achievement: "优秀" },
    { bdName: "陈静", stores: 5, revenue: "260万", target: "270万", rate: 96, achievement: "达标" },
    { bdName: "赵刚", stores: 4, revenue: "240万", target: "320万", rate: 75, achievement: "待提升" },
  ],
};

const bdRankingMap = {
  waimai: [
    { rank: 1, name: "刘洋", revenue: "420万", rate: 105, stores: "8家" },
    { rank: 2, name: "陈静", revenue: "380万", rate: 100, stores: "7家" },
    { rank: 3, name: "赵刚", revenue: "380万", rate: 90, stores: "6家" },
  ],
  daocan: [
    { rank: 1, name: "刘洋", revenue: "280万", rate: 108, stores: "6家" },
    { rank: 2, name: "陈静", revenue: "260万", rate: 96, stores: "5家" },
    { rank: 3, name: "赵刚", revenue: "240万", rate: 75, stores: "4家" },
  ],
};

const partnerAiMap = {
  waimai: [
    "上海广告收入1,180万，达成率98.3%，超额完成目标，城市经营表现优异",
    "刘洋BD达成率105%领跑城市，建议总结其运营经验并分享给团队其他成员",
    "赵刚BD达成率90%低于城市均值，建议重点关注其门店结构和投广策略",
    "城市RF率32%高于区域均值28%，广告渗透率良好，建议维持现有节奏",
  ],
  daocan: [
    "上海到餐广告收入780万，达成率91.8%，较上月增长11.2%，经营稳步提升",
    "刘洋BD达成率108%超额完成，到餐广告覆盖率高，建议总结经验推广",
    "赵刚BD达成率75%为城市最低，建议加强到餐商户的开店和投广引导",
    "城市MR 3.5%高于区域均值3.2%，货币化效率良好",
  ],
};

/* ================================================================== */
/* PartnerOverview — 合作商视角（上海BD级）                               */
/* ================================================================== */
const PartnerOverview = ({ bizLine, city, partnerName }) => {
  const kpiData = partnerKpiMap[bizLine] || partnerKpiMap.waimai;
  const bdRows = bdTableMap[bizLine] || bdTableMap.waimai;
  const bdRanking = bdRankingMap[bizLine] || bdRankingMap.waimai;
  const aiItems = partnerAiMap[bizLine] || partnerAiMap.waimai;

  return (
    <div className="space-y-5">
      {/* ====== 城市摘要 ====== */}
      <div>
        <SectionTitle>{city} · 合作商总览（{partnerName}）</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((item) => (
            <KpiCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* ====== BD明细表 ====== */}
      <div>
        <SectionTitle>BD经营明细</SectionTitle>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BD姓名</TableHead>
                  <TableHead>覆盖门店</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>目标</TableHead>
                  <TableHead className="w-32">达成率</TableHead>
                  <TableHead>达成评价</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bdRows.map((row) => (
                  <TableRow key={row.bdName}>
                    <TableCell className="font-medium text-gray-800">{row.bdName}</TableCell>
                    <TableCell className="text-gray-600">{row.stores}家</TableCell>
                    <TableCell className="font-semibold text-gray-900">{row.revenue}</TableCell>
                    <TableCell className="text-gray-500">{row.target}</TableCell>
                    <TableCell>
                      <Badge className={`border-none font-normal text-xs ${
                        row.rate >= 100 ? "bg-emerald-50 text-emerald-600" :
                        row.rate >= 90 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"
                      }`}>
                        {row.rate}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none font-normal text-xs ${
                        row.achievement === "优秀" ? "bg-emerald-50 text-emerald-600" :
                        row.achievement === "达标" ? "bg-blue-50 text-[#4080FF]" : "bg-amber-50 text-amber-600"
                      }`}>
                        {row.achievement}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ====== BD排名 ====== */}
      <div>
        <SectionTitle icon={Trophy}>城市BD收入排名</SectionTitle>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="space-y-2">
              {bdRanking.map((item) => (
                <div key={item.rank} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    item.rank === 1 ? "bg-amber-50 text-amber-600" : item.rank === 2 ? "bg-gray-100 text-gray-500" : "bg-orange-50 text-orange-600"
                  }`}>
                    {item.rank}
                  </span>
                  <span className="font-medium text-gray-800 text-sm flex-1">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.stores}</span>
                  <span className="text-sm text-gray-600">{item.revenue}</span>
                  <Badge className={`border-none font-normal text-xs ${item.rate >= 100 ? "bg-emerald-50 text-emerald-600" : item.rate >= 90 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                    {item.rate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== AI 分析 ====== */}
      <AiAnalysisCard items={aiItems} />
    </div>
  );
};

/* ================================================================== */
/* bd mock data — 个人门店级                                            */
/* ================================================================== */
const bdKpiMap = {
  waimai: [
    { label: "个人广告收入", value: "¥ 420万", trend: 15.8, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "个人达成率", value: "105.0%", trend: 6.2, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "覆盖门店数", value: "8", trend: 0, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009", footerLabel: "门店数稳定" },
    { label: "投广覆盖率", value: "87.5%", trend: 4.3, icon: CheckCircle2, iconBg: "#f3e8ff", iconColor: "#7c3aed" },
  ],
  daocan: [
    { label: "个人广告收入", value: "¥ 280万", trend: 12.4, icon: DollarSign, iconBg: "#e8f0ff", iconColor: "#4080FF" },
    { label: "个人达成率", value: "107.7%", trend: 5.8, icon: Target, iconBg: "#e6f9f0", iconColor: "#12b76a" },
    { label: "覆盖门店数", value: "6", trend: 0, icon: Store, iconBg: "#fff4e6", iconColor: "#f79009", footerLabel: "门店数稳定" },
    { label: "投广覆盖率", value: "83.3%", trend: 3.6, icon: CheckCircle2, iconBg: "#f3e8ff", iconColor: "#7c3aed" },
  ],
};

const bdStoreTableMap = {
  waimai: [
    { store: "五角场店", revenue: "65万", target: "55万", rate: 118, ads: 7, mr: "5.2%", yoy: "+18.4%" },
    { store: "南京东路店", revenue: "58万", target: "55万", rate: 105, ads: 6, mr: "4.8%", yoy: "+12.1%" },
    { store: "徐家汇店", revenue: "52万", target: "50万", rate: 104, ads: 6, mr: "4.5%", yoy: "+10.6%" },
    { store: "人民广场店", revenue: "48万", target: "50万", rate: 96, ads: 5, mr: "4.2%", yoy: "+6.8%" },
    { store: "中山公园店", revenue: "45万", target: "48万", rate: 94, ads: 5, mr: "4.0%", yoy: "+5.2%" },
    { store: "陆家嘴店", revenue: "42万", target: "45万", rate: 93, ads: 4, mr: "3.8%", yoy: "+4.1%" },
    { store: "莘庄店", revenue: "38万", target: "48万", rate: 79, ads: 3, mr: "3.2%", yoy: "-3.6%" },
    { store: "宝山店", revenue: "35万", target: "49万", rate: 71, ads: 3, mr: "2.9%", yoy: "-6.2%" },
  ],
  daocan: [
    { store: "五角场店", revenue: "52万", target: "45万", rate: 116, ads: 5, mr: "4.0%", yoy: "+15.2%" },
    { store: "南京东路店", revenue: "48万", target: "45万", rate: 107, ads: 5, mr: "3.8%", yoy: "+10.8%" },
    { store: "徐家汇店", revenue: "45万", target: "42万", rate: 107, ads: 4, mr: "3.5%", yoy: "+8.6%" },
    { store: "人民广场店", revenue: "38万", target: "42万", rate: 90, ads: 4, mr: "3.1%", yoy: "+4.2%" },
    { store: "中山公园店", revenue: "35万", target: "40万", rate: 88, ads: 3, mr: "2.9%", yoy: "+2.8%" },
    { store: "陆家嘴店", revenue: "30万", target: "46万", rate: 65, ads: 2, mr: "2.2%", yoy: "-5.4%" },
  ],
};

const bdTrendMap = {
  waimai: [
    { date: "8/1", revenue: 38 },
    { date: "8/2", revenue: 42 },
    { date: "8/3", revenue: 45 },
    { date: "8/4", revenue: 40 },
    { date: "8/5", revenue: 46 },
    { date: "8/6", revenue: 52 },
    { date: "8/7", revenue: 48 },
    { date: "8/8", revenue: 44 },
    { date: "8/9", revenue: 50 },
    { date: "8/10", revenue: 55 },
  ],
  daocan: [
    { date: "8/1", revenue: 24 },
    { date: "8/2", revenue: 26 },
    { date: "8/3", revenue: 28 },
    { date: "8/4", revenue: 25 },
    { date: "8/5", revenue: 30 },
    { date: "8/6", revenue: 33 },
    { date: "8/7", revenue: 31 },
    { date: "8/8", revenue: 28 },
    { date: "8/9", revenue: 32 },
    { date: "8/10", revenue: 35 },
  ],
};

const bdAiMap = {
  waimai: [
    "个人广告收入420万，达成率105%，超额完成目标，本月业绩排名城市第一",
    "五角场店达成率118%表现最优，建议总结投广策略并应用到尾部门店",
    "宝山店达成率71%为最低，建议本周优先拜访并推荐CPC引流产品",
    "8家门店中6家已达标，莘庄店和宝山店需要重点提升投广覆盖率",
    "个人平均MR 4.0%高于团队均值3.8%，货币化效率良好，建议保持",
  ],
  daocan: [
    "个人到餐广告收入280万，达成率107.7%，超额完成目标，到餐业绩城市领先",
    "五角场店达成率116%为最佳，到餐广告渗透率高，建议总结经验",
    "陆家嘴店达成率65%为最低，到餐广告覆盖率不足，建议优先推动投广",
    "6家门店中4家已达标，陆家嘴店需要在下周重点跟进",
    "个人平均MR 3.3%高于团队均值3.1%，到餐货币化效率良好",
  ],
};

/* ================================================================== */
/* BdOverview — BD/运营视角（个人门店级）                                 */
/* ================================================================== */
const BdOverview = ({ bizLine, bdName }) => {
  const kpiData = bdKpiMap[bizLine] || bdKpiMap.waimai;
  const storeRows = bdStoreTableMap[bizLine] || bdStoreTableMap.waimai;
  const trendData = bdTrendMap[bizLine] || bdTrendMap.waimai;
  const aiItems = bdAiMap[bizLine] || bdAiMap.waimai;

  return (
    <div className="space-y-5">
      {/* ====== 个人摘要 ====== */}
      <div>
        <SectionTitle>{bdName} · 个人总览</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((item) => (
            <KpiCard key={item.label} {...item} />
          ))}
        </div>
      </div>

      {/* ====== 个人收入趋势 ====== */}
      <div>
        <SectionTitle>个人广告收入趋势</SectionTitle>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              近10天收入走势
            </CardTitle>
            <Badge variant="outline" className="text-gray-400 font-normal">
              单位：万元
            </Badge>
          </CardHeader>
          <CardContent>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bdRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4080FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4080FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}万元`, "每日收入"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#4080FF" strokeWidth={2} fill="url(#bdRevenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ====== 门店明细表 ====== */}
      <div>
        <SectionTitle>门店经营明细</SectionTitle>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>门店</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>目标</TableHead>
                  <TableHead className="w-32">达成率</TableHead>
                  <TableHead>投广数</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>YoY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeRows.map((row) => (
                  <TableRow key={row.store}>
                    <TableCell className="font-medium text-gray-800">{row.store}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{row.revenue}</TableCell>
                    <TableCell className="text-gray-500">{row.target}</TableCell>
                    <TableCell>
                      <Badge className={`border-none font-normal text-xs ${
                        row.rate >= 100 ? "bg-emerald-50 text-emerald-600" :
                        row.rate >= 85 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"
                      }`}>
                        {row.rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{row.ads}</TableCell>
                    <TableCell className="text-gray-600">{row.mr}</TableCell>
                    <TableCell className={row.yoy.startsWith("-") ? "text-red-500 text-xs" : "text-emerald-600 text-xs"}>{row.yoy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ====== AI 分析 ====== */}
      <AiAnalysisCard items={aiItems} />
    </div>
  );
};

/* ================================================================== */
/* 主组件 — 根据角色路由到不同总览视图                                    */
/* ================================================================== */
const Overview = () => {
  const { bizLine } = useBizLine();
  const { currentUser } = useUser();
  const role = currentUser?.role;

  const viewComponent = useMemo(() => {
    switch (role) {
      case "biz_manager":
        return (
          <BizManagerOverview
            bizLine={bizLine}
            region={currentUser?.region || "华东区"}
          />
        );
      case "partner":
        return (
          <PartnerOverview
            bizLine={bizLine}
            city={currentUser?.city || "上海"}
            partnerName={currentUser?.partnerName || "上海总商A"}
          />
        );
      case "bd":
        return (
          <BdOverview
            bizLine={bizLine}
            bdName={currentUser?.bdName || "刘洋"}
          />
        );
      case "platform_admin":
      default:
        return <PlatformAdminOverview bizLine={bizLine} />;
    }
  }, [role, bizLine, currentUser]);

  const pageDescriptions = {
    platform_admin: "全局经营指标概览，实时掌握广告业务健康度",
    biz_manager: `${currentUser?.region || "华东区"}区域经营指标概览，掌握区域内城市级业务健康度`,
    partner: `${currentUser?.city || "上海"}城市经营指标概览，掌握BD级业务执行情况`,
    bd: `${currentUser?.bdName || "刘洋"}个人经营指标概览，实时跟踪门店级广告投放效果`,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="首页总览"
        description={pageDescriptions[role] || pageDescriptions.platform_admin}
      />
      {viewComponent}
    </div>
  );
};

export default Overview;
