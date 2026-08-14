import React, { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useBizLine } from "@/contexts/BizLineContext";
import PageHeader from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Store,
  CheckCircle2,
  Gauge,
  Sparkles,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  DollarSign,
  Target as TargetIcon,
  Search,
  ChevronLeft,
  ChevronRight,
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
        {items.map((text, index) => (
          <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
            <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
            <p className="leading-relaxed">{typeof text === "string" ? text : text.title ? `${text.title}：${text.text}` : text.text}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

const SummaryCards = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    {items.map((item) => (
      <Card key={item.label} className="border-none shadow-sm bg-white">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f0ff" }}>
            <item.icon className="w-5 h-5" style={{ color: "#4080FF" }} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-semibold text-gray-900 mt-1">{item.value}</p>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

/* ================================================================== */
/* 外卖产品定义（28个产品）                                             */
/* ================================================================== */
const WAIMAI_PRODUCTS = [
  { code: "djtg", name: "点金推广", category: "竞价广告" },
  { code: "qztgjj", name: "全站推广（竞价）", category: "竞价广告" },
  { code: "cjllk", name: "超级流量卡", category: "竞价广告" },
  { code: "ddt", name: "订单通", category: "效果广告" },
  { code: "ddtqz", name: "订单通（全站）", category: "效果广告" },
  { code: "lkb", name: "揽客宝", category: "效果广告" },
  { code: "phf", name: "拼好饭推广", category: "效果广告" },
  { code: "sglljsb", name: "闪购流量加速包", category: "效果广告" },
  { code: "sgyzs", name: "闪购一站式", category: "一站式" },
  { code: "zxyzs", name: "中小一站式", category: "一站式" },
  { code: "sgyzs", name: "闪购一站式", category: "一站式" },
  { code: "bjcpm", name: "铂金展位CPM", category: "品牌广告" },
  { code: "bjcpt", name: "铂金展位CPT", category: "品牌广告" },
  { code: "bjzw", name: "铂金展位", category: "品牌广告" },
  { code: "pzplc", name: "品专品类词", category: "品牌广告" },
  { code: "pzppc", name: "品专品牌词", category: "品牌广告" },
  { code: "jzzp", name: "金字招牌", category: "品牌广告" },
  { code: "ppzx", name: "品牌装修", category: "品牌广告" },
  { code: "sylbkp_wm_cpm", name: "首页列表卡片", category: "品牌广告" },
  { code: "yxhd", name: "营销活动", category: "营销活动" },
  { code: "yxmf", name: "营销魔方", category: "营销活动" },
  { code: "jtlm", name: "津贴联盟", category: "营销活动" },
  { code: "sjlm", name: "赏金联盟", category: "营销活动" },
  { code: "dsdz", name: "袋鼠店长", category: "工具服务" },
  { code: "znhd", name: "流量助手", category: "工具服务" },
  { code: "fwsc", name: "服务市场", category: "工具服务" },
  { code: "yysc", name: "应用市场", category: "工具服务" },
  { code: "kdg_wm_cpt", name: "跨店购", category: "工具服务" },
  { code: "yycpt", name: "异业CPT", category: "工具服务" },
];

/* 外卖产品色板（按品类分色） */
const WAIMAI_CATEGORY_COLORS = {
  "竞价广告": "#4080FF",
  "效果广告": "#00C896",
  "品牌广告": "#FF8C42",
  "一站式": "#A855F7",
  "营销活动": "#EC4899",
  "工具服务": "#6B7280",
};

const waimaiColorFor = (product) => WAIMAI_CATEGORY_COLORS[product.category] || "#94A3B8";

/* ================================================================== */
/* 到餐产品定义（5个消耗类型）                                          */
/* ================================================================== */
const DAOCAN_PRODUCTS = [
  { code: "cpc", name: "推广通", fullName: "推广通 (CPC)", category: "CPC", desc: "按点击付费" },
  { code: "cps", name: "订单通", fullName: "订单通 (CPS)", category: "CPS", desc: "按销售佣金付费" },
  { code: "cpt", name: "置顶卡等", fullName: "置顶卡等 (CPT)", category: "CPT", desc: "按时间付费" },
  { code: "cpm", name: "智选展位等", fullName: "智选展位等 (CPM)", category: "CPM", desc: "按千次展示付费" },
  { code: "mem", name: "商户通", fullName: "商户通/智能掌柜 (MEM)", category: "MEM", desc: "会员服务" },
];

const DAOCAN_COLORS = ["#4080FF", "#00C896", "#FF8C42", "#A855F7", "#EC4899"];

const daocanColorFor = (idx) => DAOCAN_COLORS[idx % DAOCAN_COLORS.length];

/* ================================================================== */
/* 外卖产品收入数据（28个产品）                                         */
/* ================================================================== */
const waimaiProductRevenue = [
  { name: "点金推广", category: "竞价广告", revenue: "1,860万", target: "2,000万", rate: 93, share: 15.2, yoy: "+14.5%", mom: "+3.1%", merchants: 1820, arpu: "1.02万", coverage: "78%" },
  { name: "全站推广（竞价）", category: "竞价广告", revenue: "1,240万", target: "1,400万", rate: 89, share: 10.1, yoy: "+28.3%", mom: "+8.2%", merchants: 960, arpu: "1.29万", coverage: "41%" },
  { name: "超级流量卡", category: "竞价广告", revenue: "780万", target: "900万", rate: 87, share: 6.4, yoy: "+18.7%", mom: "+2.5%", merchants: 1240, arpu: "0.63万", coverage: "53%" },
  { name: "订单通", category: "效果广告", revenue: "1,520万", target: "1,600万", rate: 95, share: 12.4, yoy: "+22.1%", mom: "+5.3%", merchants: 2100, arpu: "0.72万", coverage: "89%" },
  { name: "订单通（全站）", category: "效果广告", revenue: "680万", target: "750万", rate: 91, share: 5.6, yoy: "+35.6%", mom: "+9.1%", merchants: 780, arpu: "0.87万", coverage: "33%" },
  { name: "揽客宝", category: "效果广告", revenue: "320万", target: "400万", rate: 80, share: 2.6, yoy: "+6.2%", mom: "-1.1%", merchants: 890, arpu: "0.36万", coverage: "38%" },
  { name: "拼好饭推广", category: "效果广告", revenue: "260万", target: "280万", rate: 93, share: 2.1, yoy: "+45.8%", mom: "+12.3%", merchants: 1560, arpu: "0.17万", coverage: "67%" },
  { name: "闪购流量加速包", category: "效果广告", revenue: "190万", target: "220万", rate: 86, share: 1.6, yoy: "+52.1%", mom: "+15.7%", merchants: 420, arpu: "0.45万", coverage: "18%" },
  { name: "闪购一站式", category: "一站式", revenue: "420万", target: "450万", rate: 93, share: 3.4, yoy: "+40.2%", mom: "+10.5%", merchants: 680, arpu: "0.62万", coverage: "29%" },
  { name: "中小一站式", category: "一站式", revenue: "680万", target: "800万", rate: 85, share: 5.6, yoy: "+16.8%", mom: "+2.8%", merchants: 2400, arpu: "0.28万", coverage: "100%" },
  { name: "铂金展位CPM", category: "品牌广告", revenue: "580万", target: "700万", rate: 83, share: 4.7, yoy: "+8.9%", mom: "+1.2%", merchants: 320, arpu: "1.81万", coverage: "14%" },
  { name: "铂金展位CPT", category: "品牌广告", revenue: "420万", target: "520万", rate: 81, share: 3.4, yoy: "+5.3%", mom: "-0.8%", merchants: 180, arpu: "2.33万", coverage: "8%" },
  { name: "铂金展位", category: "品牌广告", revenue: "340万", target: "400万", rate: 85, share: 2.8, yoy: "+11.2%", mom: "+2.1%", merchants: 240, arpu: "1.42万", coverage: "10%" },
  { name: "品专品类词", category: "品牌广告", revenue: "280万", target: "350万", rate: 80, share: 2.3, yoy: "+7.6%", mom: "+0.5%", merchants: 110, arpu: "2.55万", coverage: "5%" },
  { name: "品专品牌词", category: "品牌广告", revenue: "220万", target: "300万", rate: 73, share: 1.8, yoy: "-3.2%", mom: "-2.1%", merchants: 80, arpu: "2.75万", coverage: "3%" },
  { name: "金字招牌", category: "品牌广告", revenue: "310万", target: "360万", rate: 86, share: 2.5, yoy: "+13.4%", mom: "+3.2%", merchants: 560, arpu: "0.55万", coverage: "24%" },
  { name: "品牌装修", category: "品牌广告", revenue: "180万", target: "240万", rate: 75, share: 1.5, yoy: "+4.1%", mom: "-1.3%", merchants: 420, arpu: "0.43万", coverage: "18%" },
  { name: "首页列表卡片", category: "品牌广告", revenue: "240万", target: "280万", rate: 86, share: 2.0, yoy: "+19.6%", mom: "+4.8%", merchants: 380, arpu: "0.63万", coverage: "16%" },
  { name: "营销活动", category: "营销活动", revenue: "420万", target: "500万", rate: 84, share: 3.4, yoy: "+9.8%", mom: "+2.6%", merchants: 890, arpu: "0.47万", coverage: "38%" },
  { name: "营销魔方", category: "营销活动", revenue: "280万", target: "320万", rate: 88, share: 2.3, yoy: "+25.4%", mom: "+7.2%", merchants: 450, arpu: "0.62万", coverage: "19%" },
  { name: "津贴联盟", category: "营销活动", revenue: "350万", target: "380万", rate: 92, share: 2.9, yoy: "+11.5%", mom: "+1.8%", merchants: 1200, arpu: "0.29万", coverage: "51%" },
  { name: "赏金联盟", category: "营销活动", revenue: "190万", target: "250万", rate: 76, share: 1.6, yoy: "+8.8%", mom: "+0.9%", merchants: 680, arpu: "0.28万", coverage: "29%" },
  { name: "袋鼠店长", category: "工具服务", revenue: "520万", target: "550万", rate: 95, share: 4.3, yoy: "+10.2%", mom: "+1.5%", merchants: 3200, arpu: "0.16万", coverage: "100%" },
  { name: "流量助手", category: "工具服务", revenue: "180万", target: "200万", rate: 90, share: 1.5, yoy: "+16.5%", mom: "+3.8%", merchants: 1100, arpu: "0.16万", coverage: "47%" },
  { name: "服务市场", category: "工具服务", revenue: "120万", target: "140万", rate: 86, share: 1.0, yoy: "+6.8%", mom: "+1.2%", merchants: 620, arpu: "0.19万", coverage: "26%" },
  { name: "应用市场", category: "工具服务", revenue: "80万", target: "100万", rate: 80, share: 0.7, yoy: "+12.3%", mom: "+2.5%", merchants: 380, arpu: "0.21万", coverage: "16%" },
  { name: "跨店购", category: "工具服务", revenue: "60万", target: "80万", rate: 75, share: 0.5, yoy: "+20.1%", mom: "+5.3%", merchants: 240, arpu: "0.25万", coverage: "10%" },
  { name: "异业CPT", category: "工具服务", revenue: "40万", target: "50万", rate: 80, share: 0.3, yoy: "+8.5%", mom: "+1.8%", merchants: 120, arpu: "0.33万", coverage: "5%" },
];

/* ================================================================== */
/* 到餐产品收入数据（5个消耗类型）                                      */
/* ================================================================== */
const daocanProductRevenue = [
  { name: "推广通 (CPC)", revenue: "3,820万", target: "4,300万", rate: 89, share: 45.2, yoy: "+12.1%", mom: "+2.5%", merchants: 820, arpu: "4.66万", coverage: "80%" },
  { name: "订单通 (CPS)", revenue: "1,680万", target: "1,500万", rate: 112, share: 19.9, yoy: "+22.4%", mom: "+6.1%", merchants: 990, arpu: "1.70万", coverage: "88%" },
  { name: "置顶卡等 (CPT)", revenue: "980万", target: "1,200万", rate: 82, share: 11.6, yoy: "+5.8%", mom: "-0.5%", merchants: 340, arpu: "2.88万", coverage: "30%" },
  { name: "智选展位等 (CPM)", revenue: "1,240万", target: "1,500万", rate: 83, share: 14.7, yoy: "+8.7%", mom: "+1.4%", merchants: 420, arpu: "2.95万", coverage: "37%" },
  { name: "商户通/智能掌柜 (MEM)", revenue: "720万", target: "800万", rate: 90, share: 8.5, yoy: "+15.3%", mom: "+3.2%", merchants: 560, arpu: "1.29万", coverage: "50%" },
];

/* ================================================================== */
/* 外卖分区域数据（按品类聚合）                                         */
/* ================================================================== */
const waimaiRegionRows = [
  { region: "华东区", "竞价广告": "1,820万", "效果广告": "1,240万", "品牌广告": "620万", "一站式": "580万", "营销活动": "420万", "工具服务": "380万", total: "5,060万" },
  { region: "华南区", "竞价广告": "1,380万", "效果广告": "980万", "品牌广告": "480万", "一站式": "420万", "营销活动": "340万", "工具服务": "280万", total: "3,880万" },
  { region: "华北区", "竞价广告": "1,020万", "效果广告": "780万", "品牌广告": "380万", "一站式": "320万", "营销活动": "260万", "工具服务": "220万", total: "2,980万" },
  { region: "西南区", "竞价广告": "780万", "效果广告": "580万", "品牌广告": "280万", "一站式": "240万", "营销活动": "180万", "工具服务": "160万", total: "2,220万" },
  { region: "东北区", "竞价广告": "320万", "效果广告": "240万", "品牌广告": "120万", "一站式": "100万", "营销活动": "80万", "工具服务": "60万", total: "920万" },
];

/* 到餐分区域数据（按消耗类型） */
const daocanRegionRows = [
  { region: "华东区", "推广通 (CPC)": "1,720万", "订单通 (CPS)": "760万", "置顶卡等 (CPT)": "440万", "智选展位等 (CPM)": "560万", "商户通/智能掌柜 (MEM)": "320万", total: "3,800万" },
  { region: "华南区", "推广通 (CPC)": "1,380万", "订单通 (CPS)": "610万", "置顶卡等 (CPT)": "350万", "智选展位等 (CPM)": "450万", "商户通/智能掌柜 (MEM)": "260万", total: "3,050万" },
  { region: "华北区", "推广通 (CPC)": "1,020万", "订单通 (CPS)": "450万", "置顶卡等 (CPT)": "280万", "智选展位等 (CPM)": "370万", "商户通/智能掌柜 (MEM)": "210万", total: "2,330万" },
  { region: "西南区", "推广通 (CPC)": "820万", "订单通 (CPS)": "360万", "置顶卡等 (CPT)": "220万", "智选展位等 (CPM)": "290万", "商户通/智能掌柜 (MEM)": "170万", total: "1,860万" },
  { region: "东北区", "推广通 (CPC)": "380万", "订单通 (CPS)": "170万", "置顶卡等 (CPT)": "100万", "智选展位等 (CPM)": "130万", "商户通/智能掌柜 (MEM)": "80万", total: "860万" },
];

/* ================================================================== */
/* 产品目标数据                                                         */
/* ================================================================== */
const waimaiTargetRows = [
  { product: "点金推广", target: "2,000万", achieved: "1,860万", rate: 93, gap: "140万", dailyNeeded: "7万", yoy: "+14.5%", status: "进行中" },
  { product: "全站推广（竞价）", target: "1,400万", achieved: "1,240万", rate: 89, gap: "160万", dailyNeeded: "8万", yoy: "+28.3%", status: "进行中" },
  { product: "订单通", target: "1,600万", achieved: "1,520万", rate: 95, gap: "80万", dailyNeeded: "4万", yoy: "+22.1%", status: "进行中" },
  { product: "订单通（全站）", target: "750万", achieved: "680万", rate: 91, gap: "70万", dailyNeeded: "4万", yoy: "+35.6%", status: "进行中" },
  { product: "超级流量卡", target: "900万", achieved: "780万", rate: 87, gap: "120万", dailyNeeded: "6万", yoy: "+18.7%", status: "进行中" },
  { product: "闪购一站式", target: "450万", achieved: "420万", rate: 93, gap: "30万", dailyNeeded: "2万", yoy: "+40.2%", status: "进行中" },
  { product: "中小一站式", target: "800万", achieved: "680万", rate: 85, gap: "120万", dailyNeeded: "6万", yoy: "+16.8%", status: "进行中" },
  { product: "袋鼠店长", target: "550万", achieved: "520万", rate: 95, gap: "30万", dailyNeeded: "2万", yoy: "+10.2%", status: "进行中" },
  { product: "拼好饭推广", target: "280万", achieved: "260万", rate: 93, gap: "20万", dailyNeeded: "1万", yoy: "+45.8%", status: "进行中" },
  { product: "揽客宝", target: "400万", achieved: "320万", rate: 80, gap: "80万", dailyNeeded: "4万", yoy: "+6.2%", status: "预警" },
  { product: "铂金展位CPM", target: "700万", achieved: "580万", rate: 83, gap: "120万", dailyNeeded: "6万", yoy: "+8.9%", status: "进行中" },
  { product: "品专品牌词", target: "300万", achieved: "220万", rate: 73, gap: "80万", dailyNeeded: "4万", yoy: "-3.2%", status: "预警" },
  { product: "品牌装修", target: "240万", achieved: "180万", rate: 75, gap: "60万", dailyNeeded: "3万", yoy: "+4.1%", status: "预警" },
  { product: "赏金联盟", target: "250万", achieved: "190万", rate: 76, gap: "60万", dailyNeeded: "3万", yoy: "+8.8%", status: "预警" },
  { product: "首页列表卡片", target: "280万", achieved: "240万", rate: 86, gap: "40万", dailyNeeded: "2万", yoy: "+19.6%", status: "进行中" },
  { product: "营销活动", target: "500万", achieved: "420万", rate: 84, gap: "80万", dailyNeeded: "4万", yoy: "+9.8%", status: "进行中" },
  { product: "营销魔方", target: "320万", achieved: "280万", rate: 88, gap: "40万", dailyNeeded: "2万", yoy: "+25.4%", status: "进行中" },
  { product: "津贴联盟", target: "380万", achieved: "350万", rate: 92, gap: "30万", dailyNeeded: "2万", yoy: "+11.5%", status: "进行中" },
  { product: "金字招牌", target: "360万", achieved: "310万", rate: 86, gap: "50万", dailyNeeded: "3万", yoy: "+13.4%", status: "进行中" },
  { product: "铂金展位", target: "400万", achieved: "340万", rate: 85, gap: "60万", dailyNeeded: "3万", yoy: "+11.2%", status: "进行中" },
  { product: "铂金展位CPT", target: "520万", achieved: "420万", rate: 81, gap: "100万", dailyNeeded: "5万", yoy: "+5.3%", status: "进行中" },
  { product: "闪购流量加速包", target: "220万", achieved: "190万", rate: 86, gap: "30万", dailyNeeded: "2万", yoy: "+52.1%", status: "进行中" },
  { product: "流量助手", target: "200万", achieved: "180万", rate: 90, gap: "20万", dailyNeeded: "1万", yoy: "+16.5%", status: "进行中" },
  { product: "品专品类词", target: "350万", achieved: "280万", rate: 80, gap: "70万", dailyNeeded: "4万", yoy: "+7.6%", status: "进行中" },
  { product: "服务市场", target: "140万", achieved: "120万", rate: 86, gap: "20万", dailyNeeded: "1万", yoy: "+6.8%", status: "进行中" },
  { product: "跨店购", target: "80万", achieved: "60万", rate: 75, gap: "20万", dailyNeeded: "1万", yoy: "+20.1%", status: "预警" },
  { product: "应用市场", target: "100万", achieved: "80万", rate: 80, gap: "20万", dailyNeeded: "1万", yoy: "+12.3%", status: "进行中" },
  { product: "异业CPT", target: "50万", achieved: "40万", rate: 80, gap: "10万", dailyNeeded: "1万", yoy: "+8.5%", status: "进行中" },
];

const daocanTargetRows = [
  { product: "推广通 (CPC)", target: "4,300万", achieved: "3,820万", rate: 89, gap: "480万", dailyNeeded: "24万", yoy: "+12.1%", status: "进行中" },
  { product: "订单通 (CPS)", target: "1,500万", achieved: "1,680万", rate: 112, gap: "0万", dailyNeeded: "0万", yoy: "+22.4%", status: "已达成" },
  { product: "置顶卡等 (CPT)", target: "1,200万", achieved: "980万", rate: 82, gap: "220万", dailyNeeded: "11万", yoy: "+5.8%", status: "进行中" },
  { product: "智选展位等 (CPM)", target: "1,500万", achieved: "1,240万", rate: 83, gap: "260万", dailyNeeded: "13万", yoy: "+8.7%", status: "进行中" },
  { product: "商户通/智能掌柜 (MEM)", target: "800万", achieved: "720万", rate: 90, gap: "80万", dailyNeeded: "4万", yoy: "+15.3%", status: "进行中" },
];

/* ================================================================== */
/* AI智能分析                                                           */
/* ================================================================== */
const aiAnalysisDataMap = {
  waimai: {
    platform_admin: [
      { title: "竞价广告为第一大品类", text: "点金推广+全站推广+超级流量卡合计占比31.7%，达成率89-93%，是外卖广告收入核心支柱" },
      { title: "订单通系列增长强劲", text: "订单通+订单通（全站）合计占比18%，YoY+22-36%，闪购流量加速包YoY+52%为全品类增速最快，建议加大推广" },
      { title: "品牌广告达成率偏低", text: "品专品牌词达成率73%、品牌装修75%，受大客户预算缩减影响，建议拓展中小品牌客户弥补缺口" },
      { title: "工具类产品稳定", text: "袋鼠店长覆盖率100%贡献520万收入，是稳定的工具类收入来源。跨店购和应用市场尚在早期，增长空间大" },
      { title: "营销活动品类机会", text: "营销魔方YoY+25.4%增速亮眼但覆盖商户仅450家，建议从营销活动商户中交叉转化" },
    ],
    biz_manager: [
      { title: "区域产品结构差异", text: "华东区竞价广告收入1,820万领先，东北区仅320万。建议将华东运营经验复制到东北" },
      { title: "闪购产品线机会", text: "闪购一站式YoY+40.2%、闪购流量加速包YoY+52.1%，是重要增量来源，建议重点推进闪购产品开通" },
      { title: "拼好饭推广爆发增长", text: "YoY+45.8%为效果广告增速最快产品，覆盖1,560家商户但ARPU仅0.17万，建议引导商户提升推广预算" },
      { title: "品牌广告需突破", text: "华北区品牌广告达成率最低，建议重点跟进北京的品牌客户预算恢复情况" },
    ],
    partner: [
      { title: "核心产品开通率", text: "点金推广开通率78%，订单通89%，建议优先推动剩余22%商户开通点金推广" },
      { title: "品牌广告开通率低", text: "品牌装修开通率仅18%，建议重点推进品牌类产品开通，预计可增收3-5万/月" },
      { title: "工具类渗透", text: "袋鼠店长覆盖率最高但ARPU低，建议引导商户开通更高阶的流量助手服务" },
      { title: "一站式产品推介", text: "中小一站式覆盖100%但ARPU仅0.28万，建议引导商户升级配置提升产出" },
    ],
    bd: [
      { title: "核心产品表现", text: "你的门店点金推广贡献最高，4家门店平均产出6.6万/店，表现优秀" },
      { title: "品牌广告机会", text: "虽然只有2家门店开通品牌广告但贡献较高，建议多拓展品牌客户" },
      { title: "订单通覆盖", text: "5家门店已开通订单通，建议引导剩余门店开通，预计可月增收1.2万" },
      { title: "营销活动", text: "建议下周推进2家未开通营销活动门店，预计可月增收0.8万" },
    ],
  },
  daocan: {
    platform_admin: [
      { title: "推广通(CPC)为第一大品类", text: "收入占比45.2%，达成率89%，是到餐广告收入核心。建议扩大餐饮商户覆盖" },
      { title: "订单通(CPS)超额完成", text: "达成率112%，YoY+22.4%增长最快，建议加大到餐场景推广力度作为增量来源" },
      { title: "置顶卡(CPT)达成率偏低", text: "达成率82%，受餐饮品牌投放意愿弱影响。建议降低门槛拓展中小餐饮" },
      { title: "商户通(MEM)稳定增长", text: "达成率90%+YoY+15.3%，覆盖率50%有提升空间，建议推动更多餐饮商户开通" },
      { title: "智选展位(CPM)机会", text: "覆盖率仅37%，ARPU 2.95万为各品类最高，建议重点拓展品牌展位资源" },
    ],
    biz_manager: [
      { title: "区域CPC表现", text: "华东区推广通收入1,720万领先，东北区仅380万。建议复制华东经验到东北" },
      { title: "CPS全面超额", text: "所有区域订单通达成率均超100%，是到餐最稳定增量品类" },
      { title: "CPT区域性差异大", text: "华东区CPT达成率88%最高，东北区仅68%，需重点排查合作商执行力" },
      { title: "MEM推广机会", text: "华北区商户通覆盖率最低，建议重点推进华北餐饮商户开通" },
    ],
    partner: [
      { title: "CPC开通率", text: "推广通开通率80%，建议优先推动剩余20%商户开通" },
      { title: "CPS已全覆盖", text: "订单通开通率88%最高且超额完成，是稳定收入来源" },
      { title: "CPT开通率偏低", text: "置顶卡开通率仅30%，建议重点推进品牌类餐饮开通" },
      { title: "MEM升级", text: "商户通开通率50%，建议引导商户升级智能掌柜提升服务价值" },
    ],
    bd: [
      { title: "CPC核心产品", text: "推广通贡献收入45%是你的核心产品，3家门店平均产出5.8万/店" },
      { title: "CPS全覆盖", text: "4家门店已开通订单通且均超额完成，执行节奏良好" },
      { title: "CPT机会", text: "只有1家门店开通置顶卡但ARPU高，建议多拓展到餐品牌客户" },
      { title: "MEM推进", text: "建议下周推进1家未开通商户通的门店，预计可月增收0.5万" },
    ],
  },
};

/* ================================================================== */
/* 图表组件                                                             */
/* ================================================================== */
const ProductShareChart = ({ data }) => (
  <div style={{ height: 220 }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(value) => [`${value}%`, "占比"]} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

const ProductShareBar = ({ data }) => {
  const total = data.reduce((s, r) => s + r.value, 0);
  return (
    <div className="flex h-3 rounded-full overflow-hidden mb-1">
      {data.map((r) => (
        <div key={r.name} style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }} />
      ))}
    </div>
  );
};

/* ================================================================== */
/* 外卖产品视图（平台管理员）                                          */
/* ================================================================== */
const WaimaiProductView = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const categories = useMemo(() => {
    const cats = [...new Set(waimaiProductRevenue.map((r) => r.category))];
    return cats;
  }, []);

  const filtered = useMemo(() => {
    let result = waimaiProductRevenue;
    if (categoryFilter !== "all") {
      result = result.filter((r) => r.category === categoryFilter);
    }
    if (search.trim()) {
      result = result.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // 按品类聚合用于图表
  const categoryAgg = useMemo(() => {
    const map = {};
    waimaiProductRevenue.forEach((r) => {
      if (!map[r.category]) map[r.category] = { name: r.category, value: 0, color: waimaiColorFor({ category: r.category }) };
      map[r.category].value += r.share;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, []);

  const totalRevenue = waimaiProductRevenue.reduce((s, r) => s + parseAmount(r.revenue), 0);
  const totalTarget = waimaiProductRevenue.reduce((s, r) => s + parseAmount(r.target), 0);
  const overallRate = Math.round((totalRevenue / totalTarget) * 100);
  const totalMerchants = waimaiProductRevenue.reduce((s, r) => s + r.merchants, 0);

  // 品类聚合目标
  const categoryTargetAgg = useMemo(() => {
    const map = {};
    waimaiTargetRows.forEach((r) => {
      const cat = WAIMAI_PRODUCTS.find((p) => p.name === r.product)?.category || "其他";
      if (!map[cat]) map[cat] = { product: cat, target: 0, achieved: 0, rate: 0, gap: 0, count: 0 };
      map[cat].target += parseAmount(r.target);
      map[cat].achieved += parseAmount(r.achieved);
      map[cat].gap += parseAmount(r.gap);
      map[cat].count += 1;
    });
    return Object.values(map).map((r) => ({ ...r, rate: Math.round((r.achieved / r.target) * 100), target: `${r.target.toLocaleString()}万`, achieved: `${r.achieved.toLocaleString()}万`, gap: `${r.gap}万`, yoy: "+12.5%", status: r.rate >= 100 ? "已达成" : r.rate >= 85 ? "进行中" : "预警" }));
  }, []);

  return (
    <div>
      {/* 汇总卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "产品总收入", value: `${totalRevenue.toLocaleString()}万`, icon: DollarSign },
          { label: "产品数", value: "28", icon: Layers },
          { label: "活跃商户", value: `${totalMerchants.toLocaleString()}`, icon: Store },
          { label: "综合达成率", value: `${overallRate}%`, icon: Gauge },
        ].map((item) => (
          <Card key={item.label} className="border-none shadow-sm bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f0ff" }}>
                <item.icon className="w-5 h-5" style={{ color: "#4080FF" }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* 品类占比图 */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-2">各品类收入占比</p>
            <ProductShareChart data={categoryAgg} />
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {categoryAgg.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-gray-600">{r.name} {r.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 品类增速 */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">各品类YoY增速</p>
            <div className="space-y-3">
              {categoryAgg.map((r) => {
                const products = waimaiProductRevenue.filter((p) => p.category === r.name);
                const avgYoy = products.reduce((s, p) => s + parseFloat(p.yoy), 0) / products.length;
                const isNeg = avgYoy < 0;
                return (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-xs text-gray-700 w-20 shrink-0 truncate">{r.name}</span>
                    <Badge className={`border-none font-normal text-xs ${isNeg ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                      YoY {isNeg ? "" : "+"}{avgYoy.toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-gray-400">{products.length}个产品</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 品类达成率 */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">各品类达成率</p>
            <div className="space-y-3">
              {categoryTargetAgg.map((r) => (
                <div key={r.product} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: WAIMAI_CATEGORY_COLORS[r.product] }} />
                  <span className="text-xs text-gray-700 w-20 shrink-0 truncate">{r.product}</span>
                  <div className="flex-1"><RateProgress rate={r.rate} /></div>
                  <Badge className={`border-none font-normal text-xs ${r.rate >= 100 ? "bg-emerald-50 text-emerald-600" : r.rate >= 85 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 产品收入详情表 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">产品收入明细（{filtered.length}个产品）</p>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(0); }}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="品类筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部品类</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  placeholder="搜索产品..."
                  className="h-8 w-40 pl-8 text-sm"
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品名称</TableHead>
                <TableHead>品类</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>目标</TableHead>
                <TableHead className="w-40">达成率</TableHead>
                <TableHead>占比</TableHead>
                <TableHead>活跃商户</TableHead>
                <TableHead>ARPU</TableHead>
                <TableHead>覆盖率</TableHead>
                <TableHead>YoY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: waimaiColorFor(row) }} />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell><Badge className="border-none font-normal bg-gray-50 text-gray-600 text-xs">{row.category}</Badge></TableCell>
                  <TableCell className="font-medium">{row.revenue}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                  <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.share}%</Badge></TableCell>
                  <TableCell>{row.merchants.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-600">{row.arpu}</TableCell>
                  <TableCell className="text-gray-600">{row.coverage}</TableCell>
                  <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                    {row.yoy.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                    {row.yoy}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-400">第 {page + 1}/{totalPages} 页，共 {filtered.length} 个产品</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-md border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分区域产品情况（按品类） */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">分区域品类收入情况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>大区</TableHead>
                <TableHead>竞价广告</TableHead>
                <TableHead>效果广告</TableHead>
                <TableHead>品牌广告</TableHead>
                <TableHead>一站式</TableHead>
                <TableHead>营销活动</TableHead>
                <TableHead>工具服务</TableHead>
                <TableHead>合计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waimaiRegionRows.map((row) => (
                <TableRow key={row.region}>
                  <TableCell className="font-medium text-gray-800">{row.region}</TableCell>
                  <TableCell className="text-[#4080FF]">{row["竞价广告"]}</TableCell>
                  <TableCell className="text-[#00C896]">{row["效果广告"]}</TableCell>
                  <TableCell className="text-[#FF8C42]">{row["品牌广告"]}</TableCell>
                  <TableCell className="text-[#A855F7]">{row["一站式"]}</TableCell>
                  <TableCell className="text-[#EC4899]">{row["营销活动"]}</TableCell>
                  <TableCell className="text-[#6B7280]">{row["工具服务"]}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 产品目标 */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <TargetIcon className="w-3.5 h-3.5 text-[#4080FF]" />
            产品目标
          </h2>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">各产品目标达成率（按达成率排序）</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>产品</TableHead>
                  <TableHead>目标收入</TableHead>
                  <TableHead>实际完成</TableHead>
                  <TableHead className="w-40">达成率</TableHead>
                  <TableHead>剩余缺口</TableHead>
                  <TableHead>日均需完成</TableHead>
                  <TableHead>YoY</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...waimaiTargetRows].sort((a, b) => b.rate - a.rate).map((row) => (
                  <TableRow key={row.product}>
                    <TableCell className="font-medium text-gray-800">{row.product}</TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell className="font-medium">{row.achieved}</TableCell>
                    <TableCell><RateProgress rate={row.rate} /></TableCell>
                    <TableCell className="text-red-500">{row.gap}</TableCell>
                    <TableCell>{row.dailyNeeded}</TableCell>
                    <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>{row.yoy}</TableCell>
                    <TableCell>
                      <Badge className={`border-none font-normal ${
                        row.status === "已达成" ? "bg-emerald-50 text-emerald-600" :
                        row.status === "进行中" ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"
                      }`}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ================================================================== */
/* 到餐产品视图（平台管理员）                                          */
/* ================================================================== */
const DaocanProductView = () => {
  const chartData = daocanProductRevenue.map((r, i) => ({ name: r.name, value: r.share, color: daocanColorFor(i) }));
  const colorByProduct = {};
  daocanProductRevenue.forEach((r, i) => { colorByProduct[r.name] = daocanColorFor(i); });

  const totalRevenue = daocanProductRevenue.reduce((s, r) => s + parseAmount(r.revenue), 0);
  const totalTarget = daocanProductRevenue.reduce((s, r) => s + parseAmount(r.target), 0);
  const overallRate = Math.round((totalRevenue / totalTarget) * 100);
  const totalMerchants = daocanProductRevenue.reduce((s, r) => s + r.merchants, 0);

  return (
    <div>
      {/* 汇总卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "产品总收入", value: `${totalRevenue.toLocaleString()}万`, icon: DollarSign },
          { label: "消耗类型数", value: "5", icon: Layers },
          { label: "活跃商户", value: `${totalMerchants.toLocaleString()}`, icon: Store },
          { label: "综合达成率", value: `${overallRate}%`, icon: Gauge },
        ].map((item) => (
          <Card key={item.label} className="border-none shadow-sm bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f0ff" }}>
                <item.icon className="w-5 h-5" style={{ color: "#4080FF" }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-2">各消耗类型收入占比</p>
            <ProductShareChart data={chartData} />
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {daocanProductRevenue.map((r) => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorByProduct[r.name] }} />
                  <span className="text-xs text-gray-600">{r.name} {r.share}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">同比/环比增速</p>
            <div className="space-y-3">
              {daocanProductRevenue.map((r) => {
                const idx = daocanProductRevenue.indexOf(r);
                return (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: daocanColorFor(idx) }} />
                    <span className="text-xs text-gray-700 w-28 shrink-0 truncate">{r.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <Badge className={`border-none font-normal text-xs ${r.yoy.startsWith("-") ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        YoY {r.yoy}
                      </Badge>
                      <Badge className={`border-none font-normal text-xs ${r.mom.startsWith("-") ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                        MoM {r.mom}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">覆盖率 & ARPU值</p>
            <div className="space-y-3">
              {daocanProductRevenue.map((r) => {
                const idx = daocanProductRevenue.indexOf(r);
                return (
                  <div key={r.name} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: daocanColorFor(idx) }} />
                    <span className="text-xs text-gray-700 w-28 shrink-0 truncate">{r.name}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">覆盖</span>
                        <span className="text-xs font-medium text-gray-700">{r.coverage}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">ARPU</span>
                        <span className="text-xs font-medium text-[#4080FF]">{r.arpu}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 产品收入详情表 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">各消耗类型收入明细</p>
          <ProductShareBar data={chartData} />
          <div className="flex flex-wrap gap-4 mt-2 mb-4">
            {daocanProductRevenue.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorByProduct[r.name] }} />
                <span className="text-xs text-gray-600">{r.name} {r.share}%</span>
              </div>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>消耗类型</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>目标</TableHead>
                <TableHead className="w-48">达成率</TableHead>
                <TableHead>收入占比</TableHead>
                <TableHead>活跃商户</TableHead>
                <TableHead>ARPU</TableHead>
                <TableHead>覆盖率</TableHead>
                <TableHead>YoY</TableHead>
                <TableHead>MoM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daocanProductRevenue.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>
                    <span className="font-medium text-gray-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorByProduct[row.name] }} />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{row.revenue}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                  <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.share}%</Badge></TableCell>
                  <TableCell>{row.merchants.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-600">{row.arpu}</TableCell>
                  <TableCell className="text-gray-600">{row.coverage}</TableCell>
                  <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>{row.yoy}</TableCell>
                  <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>{row.mom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分区域产品情况 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">分区域消耗类型收入情况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>大区</TableHead>
                <TableHead>推广通(CPC)</TableHead>
                <TableHead>订单通(CPS)</TableHead>
                <TableHead>置顶卡(CPT)</TableHead>
                <TableHead>智选展位(CPM)</TableHead>
                <TableHead>商户通(MEM)</TableHead>
                <TableHead>合计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daocanRegionRows.map((row) => (
                <TableRow key={row.region}>
                  <TableCell className="font-medium text-gray-800">{row.region}</TableCell>
                  <TableCell className="text-[#4080FF]">{row["推广通 (CPC)"]}</TableCell>
                  <TableCell className="text-[#00C896]">{row["订单通 (CPS)"]}</TableCell>
                  <TableCell className="text-[#FF8C42]">{row["置顶卡等 (CPT)"]}</TableCell>
                  <TableCell className="text-[#A855F7]">{row["智选展位等 (CPM)"]}</TableCell>
                  <TableCell className="text-[#EC4899]">{row["商户通/智能掌柜 (MEM)"]}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 产品目标 */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <TargetIcon className="w-3.5 h-3.5 text-[#4080FF]" />
            产品目标
          </h2>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">各消耗类型目标达成率</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>消耗类型</TableHead>
                  <TableHead>目标收入</TableHead>
                  <TableHead>实际完成</TableHead>
                  <TableHead className="w-48">达成率</TableHead>
                  <TableHead>剩余缺口</TableHead>
                  <TableHead>日均需完成</TableHead>
                  <TableHead>YoY</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daocanTargetRows.map((row) => (
                  <TableRow key={row.product}>
                    <TableCell>
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorByProduct[row.product] }} />
                        {row.product}
                      </span>
                    </TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell className="font-medium">{row.achieved}</TableCell>
                    <TableCell><RateProgress rate={row.rate} /></TableCell>
                    <TableCell className="text-red-500">{row.gap}</TableCell>
                    <TableCell>{row.dailyNeeded}</TableCell>
                    <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>{row.yoy}</TableCell>
                    <TableCell>
                      <Badge className={`border-none font-normal ${
                        row.status === "已达成" ? "bg-emerald-50 text-emerald-600" :
                        row.status === "进行中" ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"
                      }`}>
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{totalTarget.toLocaleString()}万</TableCell>
                  <TableCell className="font-semibold text-gray-900">{totalRevenue.toLocaleString()}万</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{overallRate}%</TableCell>
                  <TableCell className="font-semibold text-red-500">{(totalTarget - totalRevenue).toLocaleString()}万</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ================================================================== */
/* 角色视角数据 - 广告业务经理（华东区城市级）                          */
/* ================================================================== */
const bizManagerData = {
  waimai: {
    cities: [
      { name: "上海", revenue: "1,150万", target: "1,280万", rate: 90, merchants: 420, topProducts: ["点金推广", "订单通", "全站推广（竞价）", "超级流量卡"] },
      { name: "杭州", revenue: "625万", target: "720万", rate: 87, merchants: 280, topProducts: ["点金推广", "订单通", "全站推广（竞价）"] },
      { name: "南京", revenue: "433万", target: "520万", rate: 83, merchants: 190, topProducts: ["点金推广", "订单通", "全站推广（竞价）"] },
      { name: "苏州", revenue: "342万", target: "420万", rate: 81, merchants: 150, topProducts: ["点金推广", "订单通", "超级流量卡"] },
    ],
    products: [
      { name: "点金推广", category: "竞价广告", 上海: "320万", 杭州: "180万", 南京: "120万", 苏州: "95万", total: "715万", rate: 89 },
      { name: "订单通", category: "效果广告", 上海: "280万", 杭州: "160万", 南京: "105万", 苏州: "82万", total: "627万", rate: 93 },
      { name: "全站推广（竞价）", category: "竞价广告", 上海: "210万", 杭州: "120万", 南京: "80万", 苏州: "62万", total: "472万", rate: 86 },
      { name: "超级流量卡", category: "竞价广告", 上海: "150万", 杭州: "85万", 南京: "58万", 苏州: "48万", total: "341万", rate: 85 },
      { name: "袋鼠店长", category: "工具服务", 上海: "95万", 杭州: "55万", 南京: "38万", 苏州: "30万", total: "218万", rate: 93 },
      { name: "闪购一站式", category: "一站式", 上海: "80万", 杭州: "45万", 南京: "30万", 苏州: "25万", total: "180万", rate: 90 },
      { name: "营销活动", category: "营销活动", 上海: "50万", 杭州: "30万", 南京: "20万", 苏州: "15万", total: "115万", rate: 82 },
      { name: "揽客宝", category: "效果广告", 上海: "40万", 杭州: "25万", 南京: "18万", 苏州: "12万", total: "95万", rate: 79 },
    ],
  },
  daocan: {
    cities: [
      { name: "上海", revenue: "1,290万", target: "1,400万", rate: 92, merchants: 280, topProducts: ["推广通 (CPC)", "订单通 (CPS)", "智选展位等 (CPM)"] },
      { name: "杭州", revenue: "835万", target: "950万", rate: 88, merchants: 190, topProducts: ["推广通 (CPC)", "订单通 (CPS)", "智选展位等 (CPM)"] },
      { name: "南京", revenue: "546万", target: "650万", rate: 84, merchants: 130, topProducts: ["推广通 (CPC)", "订单通 (CPS)"] },
      { name: "苏州", revenue: "427万", target: "520万", rate: 82, merchants: 100, topProducts: ["推广通 (CPC)", "订单通 (CPS)"] },
    ],
    products: [
      { name: "推广通 (CPC)", 上海: "580万", 杭州: "380万", 南京: "250万", 苏州: "195万", total: "1,405万", rate: 88 },
      { name: "订单通 (CPS)", 上海: "260万", 杭州: "170万", 南京: "112万", 苏州: "88万", total: "630万", rate: 108 },
      { name: "置顶卡等 (CPT)", 上海: "150万", 杭州: "95万", 南京: "62万", 苏州: "48万", total: "355万", rate: 81 },
      { name: "智选展位等 (CPM)", 上海: "190万", 杭州: "120万", 南京: "78万", 苏州: "60万", total: "448万", rate: 83 },
      { name: "商户通/智能掌柜 (MEM)", 上海: "110万", 杭州: "70万", 南京: "46万", 苏州: "36万", total: "262万", rate: 88 },
    ],
  },
};

/* ================================================================== */
/* 角色视角数据 - 合作商（上海BD级）                                    */
/* ================================================================== */
const partnerData = {
  waimai: {
    bds: [
      { name: "刘洋", mis: "liuyang04", revenue: "138万", target: "150万", rate: 92, stores: 28, topProducts: ["点金推广", "订单通", "全站推广（竞价）"] },
      { name: "陈思远", mis: "chensy02", revenue: "125万", target: "140万", rate: 89, stores: 25, topProducts: ["点金推广", "订单通", "超级流量卡"] },
      { name: "王芳", mis: "wangf01", revenue: "110万", target: "130万", rate: 85, stores: 22, topProducts: ["点金推广", "订单通", "袋鼠店长"] },
      { name: "张磊", mis: "zhangl03", revenue: "95万", target: "120万", rate: 79, stores: 20, topProducts: ["点金推广", "揽客宝", "袋鼠店长"] },
      { name: "李婷", mis: "lit02", revenue: "82万", target: "100万", rate: 82, stores: 18, topProducts: ["订单通", "中小一站式", "袋鼠店长"] },
    ],
    products: [
      { name: "点金推广", category: "竞价广告", revenue: "190万", rate: 88, bdCount: 5, share: 34.5 },
      { name: "订单通", category: "效果广告", revenue: "150万", rate: 92, bdCount: 5, share: 27.3 },
      { name: "全站推广（竞价）", category: "竞价广告", revenue: "62万", rate: 85, bdCount: 2, share: 11.3 },
      { name: "超级流量卡", category: "竞价广告", revenue: "48万", rate: 83, bdCount: 2, share: 8.7 },
      { name: "袋鼠店长", category: "工具服务", revenue: "44万", rate: 90, bdCount: 3, share: 8.0 },
      { name: "揽客宝", category: "效果广告", revenue: "32万", rate: 76, bdCount: 2, share: 5.8 },
      { name: "中小一站式", category: "一站式", revenue: "24万", rate: 82, bdCount: 1, share: 4.4 },
    ],
  },
  daocan: {
    bds: [
      { name: "刘洋", mis: "liuyang04", revenue: "168万", target: "180万", rate: 93, stores: 22, topProducts: ["推广通 (CPC)", "订单通 (CPS)", "智选展位等 (CPM)"] },
      { name: "陈思远", mis: "chensy02", revenue: "152万", target: "170万", rate: 89, stores: 20, topProducts: ["推广通 (CPC)", "订单通 (CPS)"] },
      { name: "王芳", mis: "wangf01", revenue: "130万", target: "155万", rate: 84, stores: 18, topProducts: ["推广通 (CPC)", "商户通/智能掌柜 (MEM)"] },
      { name: "张磊", mis: "zhangl03", revenue: "115万", target: "140万", rate: 82, stores: 16, topProducts: ["推广通 (CPC)", "订单通 (CPS)"] },
      { name: "李婷", mis: "lit02", revenue: "98万", target: "120万", rate: 82, stores: 14, topProducts: ["推广通 (CPC)", "置顶卡等 (CPT)"] },
    ],
    products: [
      { name: "推广通 (CPC)", revenue: "305万", rate: 88, bdCount: 5, share: 46.0 },
      { name: "订单通 (CPS)", revenue: "138万", rate: 108, bdCount: 4, share: 20.8 },
      { name: "置顶卡等 (CPT)", revenue: "68万", rate: 81, bdCount: 2, share: 10.3 },
      { name: "智选展位等 (CPM)", revenue: "82万", rate: 83, bdCount: 2, share: 12.4 },
      { name: "商户通/智能掌柜 (MEM)", revenue: "70万", rate: 88, bdCount: 2, share: 10.6 },
    ],
  },
};

/* ================================================================== */
/* 角色视角数据 - BD（上海门店级）                                      */
/* ================================================================== */
const bdData = {
  waimai: {
    stores: [
      { name: "老山东饺子馆", id: "WM-SH-001", revenue: "8.5万", target: "9万", rate: 94, products: ["点金推广", "订单通", "袋鼠店长"] },
      { name: "川香源麻辣烫", id: "WM-SH-002", revenue: "7.2万", target: "8万", rate: 90, products: ["点金推广", "订单通", "超级流量卡"] },
      { name: "黄焖鸡米饭(中山公园店)", id: "WM-SH-003", revenue: "6.8万", target: "8万", rate: 85, products: ["点金推广", "订单通"] },
      { name: "沙县小吃(静安店)", id: "WM-SH-004", revenue: "5.5万", target: "7万", rate: 79, products: ["点金推广", "揽客宝"] },
      { name: "兰州拉面馆(徐汇店)", id: "WM-SH-005", revenue: "5.0万", target: "6万", rate: 83, products: ["订单通", "中小一站式"] },
      { name: "重庆小面(长宁店)", id: "WM-SH-006", revenue: "4.8万", target: "6万", rate: 80, products: ["点金推广", "袋鼠店长"] },
      { name: "真功夫(人民广场店)", id: "WM-SH-007", revenue: "4.2万", target: "5万", rate: 84, products: ["订单通", "全站推广（竞价）"] },
      { name: "永和大王(南京东路店)", id: "WM-SH-008", revenue: "3.8万", target: "5万", rate: 76, products: ["点金推广", "袋鼠店长"] },
    ],
    products: [
      { name: "点金推广", category: "竞价广告", stores: 6, revenue: "15.5万", rate: 88 },
      { name: "订单通", category: "效果广告", stores: 5, revenue: "12.0万", rate: 92 },
      { name: "袋鼠店长", category: "工具服务", stores: 3, revenue: "5.8万", rate: 90 },
      { name: "超级流量卡", category: "竞价广告", stores: 1, revenue: "3.5万", rate: 85 },
      { name: "全站推广（竞价）", category: "竞价广告", stores: 1, revenue: "2.8万", rate: 82 },
      { name: "揽客宝", category: "效果广告", stores: 1, revenue: "3.2万", rate: 76 },
      { name: "中小一站式", category: "一站式", stores: 1, revenue: "3.0万", rate: 80 },
    ],
  },
  daocan: {
    stores: [
      { name: "老山东饺子馆", id: "DC-SH-001", revenue: "9.8万", target: "10万", rate: 98, products: ["推广通 (CPC)", "订单通 (CPS)", "商户通/智能掌柜 (MEM)"] },
      { name: "川香源麻辣烫", id: "DC-SH-002", revenue: "8.2万", target: "9万", rate: 91, products: ["推广通 (CPC)", "订单通 (CPS)"] },
      { name: "黄焖鸡米饭(中山公园店)", id: "DC-SH-003", revenue: "7.5万", target: "9万", rate: 83, products: ["推广通 (CPC)", "智选展位等 (CPM)"] },
      { name: "沙县小吃(静安店)", id: "DC-SH-004", revenue: "6.2万", target: "8万", rate: 78, products: ["推广通 (CPC)"] },
      { name: "兰州拉面馆(徐汇店)", id: "DC-SH-005", revenue: "5.8万", target: "7万", rate: 83, products: ["推广通 (CPC)", "订单通 (CPS)"] },
      { name: "重庆小面(长宁店)", id: "DC-SH-006", revenue: "5.2万", target: "6万", rate: 87, products: ["推广通 (CPC)", "商户通/智能掌柜 (MEM)"] },
      { name: "真功夫(人民广场店)", id: "DC-SH-007", revenue: "4.5万", target: "6万", rate: 75, products: ["推广通 (CPC)", "置顶卡等 (CPT)"] },
      { name: "永和大王(南京东路店)", id: "DC-SH-008", revenue: "4.0万", target: "5万", rate: 80, products: ["推广通 (CPC)"] },
    ],
    products: [
      { name: "推广通 (CPC)", stores: 8, revenue: "30.5万", rate: 85 },
      { name: "订单通 (CPS)", stores: 3, revenue: "11.8万", rate: 105 },
      { name: "置顶卡等 (CPT)", stores: 1, revenue: "2.5万", rate: 75 },
      { name: "智选展位等 (CPM)", stores: 1, revenue: "3.8万", rate: 82 },
      { name: "商户通/智能掌柜 (MEM)", stores: 2, revenue: "2.6万", rate: 88 },
    ],
  },
};

/* 角色视图产品颜色辅助 */
const roleColorFor = (product, bizLine, index) => {
  if (bizLine === "waimai") return waimaiColorFor(product);
  return daocanColorFor(index);
};

/* ================================================================== */
/* 广告业务经理产品视图（城市级）                                       */
/* ================================================================== */
const BizManagerProductView = ({ currentUser, bizLine }) => {
  const data = bizManagerData[bizLine] || bizManagerData.waimai;
  const region = currentUser?.region || "华东区";

  const totalRevenue = data.cities.reduce((s, c) => s + parseAmount(c.revenue), 0);
  const totalTarget = data.cities.reduce((s, c) => s + parseAmount(c.target), 0);
  const overallRate = Math.round((totalRevenue / totalTarget) * 100);
  const totalMerchants = data.cities.reduce((s, c) => s + c.merchants, 0);

  return (
    <div>
      <SummaryCards items={[
        { label: "区域总收入", value: `${totalRevenue.toLocaleString()}万`, icon: DollarSign },
        { label: "管辖城市", value: `${data.cities.length}个`, icon: Layers },
        { label: "活跃商户", value: `${totalMerchants.toLocaleString()}`, icon: Store },
        { label: "综合达成率", value: `${overallRate}%`, icon: Gauge },
      ]} />

      {/* 城市收入概况 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">{region}各城市产品收入概况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>城市</TableHead>
                <TableHead>总收入</TableHead>
                <TableHead>目标</TableHead>
                <TableHead className="w-40">达成率</TableHead>
                <TableHead>活跃商户</TableHead>
                <TableHead>Top产品</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.cities.map((city) => (
                <TableRow key={city.name}>
                  <TableCell className="font-medium text-gray-800">{city.name}</TableCell>
                  <TableCell className="font-medium">{city.revenue}</TableCell>
                  <TableCell>{city.target}</TableCell>
                  <TableCell><RateProgress rate={city.rate} /></TableCell>
                  <TableCell>{city.merchants.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {city.topProducts.map((p) => (
                        <Badge key={p} className="border-none font-normal bg-blue-50 text-[#4080FF] text-xs">{p}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 各城市产品收入明细 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">各城市产品收入明细</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>上海</TableHead>
                <TableHead>杭州</TableHead>
                <TableHead>南京</TableHead>
                <TableHead>苏州</TableHead>
                <TableHead>合计</TableHead>
                <TableHead className="w-32">达成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((row, index) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: roleColorFor(row, bizLine, index) }} />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#4080FF]">{row["上海"]}</TableCell>
                  <TableCell>{row["杭州"]}</TableCell>
                  <TableCell>{row["南京"]}</TableCell>
                  <TableCell>{row["苏州"]}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{row.total}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* 合作商产品视图（BD级）                                              */
/* ================================================================== */
const PartnerProductView = ({ currentUser, bizLine }) => {
  const data = partnerData[bizLine] || partnerData.waimai;
  const city = currentUser?.city || "上海";
  const partnerName = currentUser?.partnerName || "上海总商A";

  const totalRevenue = data.bds.reduce((s, b) => s + parseAmount(b.revenue), 0);
  const totalTarget = data.bds.reduce((s, b) => s + parseAmount(b.target), 0);
  const overallRate = Math.round((totalRevenue / totalTarget) * 100);
  const totalStores = data.bds.reduce((s, b) => s + b.stores, 0);

  return (
    <div>
      <SummaryCards items={[
        { label: "城市总收入", value: `${totalRevenue.toLocaleString()}万`, icon: DollarSign },
        { label: "管理BD", value: `${data.bds.length}人`, icon: Layers },
        { label: "活跃商户", value: `${totalStores.toLocaleString()}`, icon: Store },
        { label: "综合达成率", value: `${overallRate}%`, icon: Gauge },
      ]} />

      {/* BD收入概况 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">{city}各BD产品收入概况（{partnerName}）</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BD姓名</TableHead>
                <TableHead>MIS</TableHead>
                <TableHead>总收入</TableHead>
                <TableHead>目标</TableHead>
                <TableHead className="w-40">达成率</TableHead>
                <TableHead>门店数</TableHead>
                <TableHead>管理产品</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bds.map((bd) => (
                <TableRow key={bd.mis}>
                  <TableCell className="font-medium text-gray-800">{bd.name}</TableCell>
                  <TableCell className="text-gray-500">{bd.mis}</TableCell>
                  <TableCell className="font-medium">{bd.revenue}</TableCell>
                  <TableCell>{bd.target}</TableCell>
                  <TableCell><RateProgress rate={bd.rate} /></TableCell>
                  <TableCell>{bd.stores}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {bd.topProducts.map((p) => (
                        <Badge key={p} className="border-none font-normal bg-blue-50 text-[#4080FF] text-xs">{p}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 产品收入汇总 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">产品收入汇总</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>总收入</TableHead>
                <TableHead className="w-32">达成率</TableHead>
                <TableHead>覆盖BD数</TableHead>
                <TableHead>占比</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((row, index) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: roleColorFor(row, bizLine, index) }} />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{row.revenue}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                  <TableCell>{row.bdCount}</TableCell>
                  <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.share}%</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* BD产品视图（门店级）                                                */
/* ================================================================== */
const BdProductView = ({ currentUser, bizLine }) => {
  const data = bdData[bizLine] || bdData.waimai;
  const bdName = currentUser?.bdName || "刘洋";

  const totalRevenue = data.stores.reduce((s, st) => s + parseAmount(st.revenue), 0);
  const totalTarget = data.stores.reduce((s, st) => s + parseAmount(st.target), 0);
  const overallRate = Math.round((totalRevenue / totalTarget) * 100);

  return (
    <div>
      <SummaryCards items={[
        { label: "总收入", value: `${Math.round(totalRevenue * 10) / 10}万`, icon: DollarSign },
        { label: "管理门店", value: `${data.stores.length}家`, icon: Store },
        { label: "投放产品", value: `${data.products.length}种`, icon: Layers },
        { label: "综合达成率", value: `${overallRate}%`, icon: Gauge },
      ]} />

      {/* 门店产品投放情况 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">{bdName}管理门店产品投放情况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>门店名称</TableHead>
                <TableHead>门店ID</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>目标</TableHead>
                <TableHead className="w-40">达成率</TableHead>
                <TableHead>投放产品</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium text-gray-800">{store.name}</TableCell>
                  <TableCell className="text-gray-500">{store.id}</TableCell>
                  <TableCell className="font-medium">{store.revenue}</TableCell>
                  <TableCell>{store.target}</TableCell>
                  <TableCell><RateProgress rate={store.rate} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {store.products.map((p) => (
                        <Badge key={p} className="border-none font-normal bg-blue-50 text-[#4080FF] text-xs">{p}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 产品投放汇总 */}
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">产品投放汇总</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>投放门店数</TableHead>
                <TableHead>收入</TableHead>
                <TableHead className="w-32">达成率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((row, index) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: roleColorFor(row, bizLine, index) }} />
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell>{row.stores}</TableCell>
                  <TableCell className="font-medium">{row.revenue}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* 主组件                                                              */
/* ================================================================== */
const ProductSegmentation = () => {
  const { currentUser } = useUser();
  const { bizLine } = useBizLine();
  const role = currentUser?.role;

  const aiAnalysisData = aiAnalysisDataMap[bizLine] || aiAnalysisDataMap.waimai;
  const aiItems = aiAnalysisData[role] || aiAnalysisData.platform_admin;

  const bizLabel = bizLine === "waimai" ? "外卖" : "到餐";
  const descMap = {
    platform_admin: bizLine === "waimai"
      ? "按28个广告产品维度分析收入结构、目标达成与增长机会"
      : "按5个消耗类型（CPC/CPS/CPT/CPM/MEM）维度分析收入结构、目标达成与增长机会",
    biz_manager: `${currentUser?.region || "华东区"}各城市${bizLabel}产品收入结构、目标达成与增长机会`,
    partner: `${currentUser?.city || "上海"}各BD${bizLabel}产品收入结构、目标达成与增长机会`,
    bd: `管辖门店${bizLabel}产品投放情况与目标达成`,
  };
  const desc = descMap[role] || descMap.platform_admin;

  const renderView = () => {
    switch (role) {
      case "biz_manager":
        return <BizManagerProductView currentUser={currentUser} bizLine={bizLine} />;
      case "partner":
        return <PartnerProductView currentUser={currentUser} bizLine={bizLine} />;
      case "bd":
        return <BdProductView currentUser={currentUser} bizLine={bizLine} />;
      default:
        return bizLine === "waimai" ? <WaimaiProductView /> : <DaocanProductView />;
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="产品" description={desc} />

      {renderView()}

      {/* AI 智能分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4080FF]" />
            AI 智能分析 · {bizLabel}
          </h2>
        </div>
        <AiDiagnosisCard items={aiItems} />
      </div>
    </div>
  );
};

export default ProductSegmentation;
