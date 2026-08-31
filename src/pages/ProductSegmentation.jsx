import React, { useMemo, useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { useBizLine } from "@/contexts/BizLineContext";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
import { AiResultList } from "@/components/AiPanel";
import AiAnalysisPanel from "@/components/AiAnalysisPanel";

/* ================================================================== */
/* 共享组件                                                            */
/* ================================================================== */
const RateProgress = ({ rate }) => (
  <div className="flex items-center gap-2">
    <Progress value={Math.min(rate, 100)} className="h-2 flex-1" />
    <span className="text-xs text-gray-500 w-10 shrink-0">{rate}%</span>
  </div>
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
  { code: "djtg", name: "点金推广", category: "效果广告" },
  { code: "qztgjj", name: "全站推广（竞价）", category: "效果广告" },
  { code: "cjllk", name: "超级流量卡", category: "效果广告" },
  { code: "ddt", name: "订单通", category: "效果广告" },
  { code: "ddtqz", name: "订单通（全站）", category: "效果广告" },
  { code: "lkb", name: "揽客宝", category: "效果广告" },
  { code: "phf", name: "拼好饭推广", category: "效果广告" },
  { code: "sglljsb", name: "闪购流量加速包", category: "效果广告" },
  { code: "sgyzs", name: "闪购一站式", category: "效果广告" },
  { code: "zxyzs", name: "中小一站式", category: "效果广告" },
  { code: "yxmf", name: "营销魔方", category: "效果广告" },
  { code: "jtlm", name: "津贴联盟", category: "效果广告" },
  { code: "yxhd", name: "营销活动", category: "效果广告" },
  { code: "sjlm", name: "赏金联盟", category: "效果广告" },
  { code: "dsdz", name: "袋鼠店长", category: "增值产品" },
  { code: "jzzp", name: "金字招牌", category: "增值产品" },
  { code: "znhd", name: "流量助手", category: "省钱产品" },
  { code: "bjcpm", name: "铂金展位CPM", category: "品宣产品" },
  { code: "bjcpt", name: "铂金展位CPT", category: "品宣产品" },
  { code: "bjzw", name: "铂金展位", category: "品宣产品" },
  { code: "pzplc", name: "品专品类词", category: "品宣产品" },
  { code: "pzppc", name: "品专品牌词", category: "品宣产品" },
  { code: "ppzx", name: "品牌装修", category: "品宣产品" },
  { code: "sylbkp_wm_cpm", name: "首页列表卡片", category: "品宣产品" },
  { code: "fwsc", name: "服务市场", category: "增值产品" },
  { code: "yysc", name: "应用市场", category: "增值产品" },
  { code: "kdg_wm_cpt", name: "跨店购", category: "增值产品" },
  { code: "yycpt", name: "异业CPT", category: "增值产品" },
];

/* 外卖产品色板（每个产品独立颜色，28色） */
const WAIMAI_PRODUCT_COLORS = [
  "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#1D4ED8", "#1E40AF", "#1E3A8A",
  "#0EA5E9", "#0284C7", "#0369A1", "#075985", "#0C4A6E", "#0891B2", "#155E75",
  "#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5",
  "#F59E0B",
  "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE", "#F472B6", "#FB7185",
];

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
  { name: "点金推广", category: "效果广告", revenue: "1,860万", target: "2,000万", rate: 93, share: 15.2, yoy: "+14.5%", mom: "+3.1%", merchants: 1820, arpu: "141元", coverage: "78%" },
  { name: "全站推广（竞价）", category: "效果广告", revenue: "1,240万", target: "1,400万", rate: 89, share: 10.1, yoy: "+28.3%", mom: "+8.2%", merchants: 960, arpu: "159元", coverage: "41%" },
  { name: "超级流量卡", category: "效果广告", revenue: "780万", target: "900万", rate: 87, share: 6.4, yoy: "+18.7%", mom: "+2.5%", merchants: 1240, arpu: "111元", coverage: "53%" },
  { name: "订单通", category: "效果广告", revenue: "1,520万", target: "1,600万", rate: 95, share: 12.4, yoy: "+22.1%", mom: "+5.3%", merchants: 2100, arpu: "119元", coverage: "89%" },
  { name: "订单通（全站）", category: "效果广告", revenue: "680万", target: "750万", rate: 91, share: 5.6, yoy: "+35.6%", mom: "+9.1%", merchants: 780, arpu: "131元", coverage: "33%" },
  { name: "揽客宝", category: "效果广告", revenue: "320万", target: "400万", rate: 80, share: 2.6, yoy: "+6.2%", mom: "-1.1%", merchants: 890, arpu: "84元", coverage: "38%" },
  { name: "拼好饭推广", category: "效果广告", revenue: "260万", target: "280万", rate: 93, share: 2.1, yoy: "+45.8%", mom: "+12.3%", merchants: 1560, arpu: "58元", coverage: "67%" },
  { name: "闪购流量加速包", category: "效果广告", revenue: "190万", target: "220万", rate: 86, share: 1.6, yoy: "+52.1%", mom: "+15.7%", merchants: 420, arpu: "94元", coverage: "18%" },
  { name: "闪购一站式", category: "效果广告", revenue: "420万", target: "450万", rate: 93, share: 3.4, yoy: "+40.2%", mom: "+10.5%", merchants: 680, arpu: "110元", coverage: "29%" },
  { name: "中小一站式", category: "效果广告", revenue: "680万", target: "800万", rate: 85, share: 5.6, yoy: "+16.8%", mom: "+2.8%", merchants: 2400, arpu: "74元", coverage: "100%" },
  { name: "营销魔方", category: "效果广告", revenue: "280万", target: "320万", rate: 88, share: 2.3, yoy: "+25.4%", mom: "+7.2%", merchants: 450, arpu: "110元", coverage: "19%" },
  { name: "津贴联盟", category: "效果广告", revenue: "350万", target: "380万", rate: 92, share: 2.9, yoy: "+11.5%", mom: "+1.8%", merchants: 1200, arpu: "75元", coverage: "51%" },
  { name: "营销活动", category: "效果广告", revenue: "420万", target: "500万", rate: 84, share: 3.4, yoy: "+9.8%", mom: "+2.6%", merchants: 890, arpu: "96元", coverage: "38%" },
  { name: "赏金联盟", category: "效果广告", revenue: "190万", target: "250万", rate: 76, share: 1.6, yoy: "+8.8%", mom: "+0.9%", merchants: 680, arpu: "74元", coverage: "29%" },
  { name: "袋鼠店长", category: "增值产品", revenue: "520万", target: "550万", rate: 95, share: 4.3, yoy: "+10.2%", mom: "+1.5%", merchants: 3200, arpu: "56元", coverage: "100%" },
  { name: "金字招牌", category: "增值产品", revenue: "310万", target: "360万", rate: 86, share: 2.5, yoy: "+13.4%", mom: "+3.2%", merchants: 560, arpu: "104元", coverage: "24%" },
  { name: "服务市场", category: "增值产品", revenue: "120万", target: "140万", rate: 86, share: 1.0, yoy: "+6.8%", mom: "+1.2%", merchants: 620, arpu: "61元", coverage: "26%" },
  { name: "应用市场", category: "增值产品", revenue: "80万", target: "100万", rate: 80, share: 0.7, yoy: "+12.3%", mom: "+2.5%", merchants: 380, arpu: "64元", coverage: "16%" },
  { name: "跨店购", category: "增值产品", revenue: "60万", target: "80万", rate: 75, share: 0.5, yoy: "+20.1%", mom: "+5.3%", merchants: 240, arpu: "70元", coverage: "10%" },
  { name: "异业CPT", category: "增值产品", revenue: "40万", target: "50万", rate: 80, share: 0.3, yoy: "+8.5%", mom: "+1.8%", merchants: 120, arpu: "80元", coverage: "5%" },
  { name: "流量助手", category: "省钱产品", revenue: "180万", target: "200万", rate: 90, share: 1.5, yoy: "+16.5%", mom: "+3.8%", merchants: 1100, arpu: "56元", coverage: "47%" },
  { name: "铂金展位CPM", category: "品宣产品", revenue: "580万", target: "700万", rate: 83, share: 4.7, yoy: "+8.9%", mom: "+1.2%", merchants: 320, arpu: "188元", coverage: "14%" },
  { name: "铂金展位CPT", category: "品宣产品", revenue: "420万", target: "520万", rate: 81, share: 3.4, yoy: "+5.3%", mom: "-0.8%", merchants: 180, arpu: "214元", coverage: "8%" },
  { name: "铂金展位", category: "品宣产品", revenue: "340万", target: "400万", rate: 85, share: 2.8, yoy: "+11.2%", mom: "+2.1%", merchants: 240, arpu: "167元", coverage: "10%" },
  { name: "品专品类词", category: "品宣产品", revenue: "280万", target: "350万", rate: 80, share: 2.3, yoy: "+7.6%", mom: "+0.5%", merchants: 110, arpu: "224元", coverage: "5%" },
  { name: "品专品牌词", category: "品宣产品", revenue: "220万", target: "300万", rate: 73, share: 1.8, yoy: "-3.2%", mom: "-2.1%", merchants: 80, arpu: "232元", coverage: "3%" },
  { name: "品牌装修", category: "品宣产品", revenue: "180万", target: "240万", rate: 75, share: 1.5, yoy: "+4.1%", mom: "-1.3%", merchants: 420, arpu: "92元", coverage: "18%" },
  { name: "首页列表卡片", category: "品宣产品", revenue: "240万", target: "280万", rate: 86, share: 2.0, yoy: "+19.6%", mom: "+4.8%", merchants: 380, arpu: "111元", coverage: "16%" },
];

/* 外卖产品颜色映射（必须在 waimaiProductRevenue 之后） */
const waimaiProductColorMap = {};
waimaiProductRevenue.forEach((p, i) => {
  waimaiProductColorMap[p.name] = WAIMAI_PRODUCT_COLORS[i];
});
const waimaiColorFor = (product) => waimaiProductColorMap[product.name] || "#94A3B8";

/* ================================================================== */
/* 到餐产品收入数据（5个消耗类型）                                      */
/* ================================================================== */
const daocanProductRevenue = [
  { name: "推广通 (CPC)", revenue: "3,820万", target: "4,300万", rate: 89, share: 45.2, yoy: "+12.1%", mom: "+2.5%", merchants: 820, arpu: "298元", coverage: "80%" },
  { name: "订单通 (CPS)", revenue: "1,680万", target: "1,500万", rate: 112, share: 19.9, yoy: "+22.4%", mom: "+6.1%", merchants: 990, arpu: "183元", coverage: "88%" },
  { name: "置顶卡等 (CPT)", revenue: "980万", target: "1,200万", rate: 82, share: 11.6, yoy: "+5.8%", mom: "-0.5%", merchants: 340, arpu: "238元", coverage: "30%" },
  { name: "智选展位等 (CPM)", revenue: "1,240万", target: "1,500万", rate: 83, share: 14.7, yoy: "+8.7%", mom: "+1.4%", merchants: 420, arpu: "240元", coverage: "37%" },
  { name: "商户通/智能掌柜 (MEM)", revenue: "720万", target: "800万", rate: 90, share: 8.5, yoy: "+15.3%", mom: "+3.2%", merchants: 560, arpu: "159元", coverage: "50%" },
];

/* ================================================================== */
/* 产品×商家分层 交叉数据（外卖 TOP8 × P0-P3）                          */
/* ================================================================== */
const waimaiProductTierRows = [
  // 点金推广
  { product: "点金推广", tier: "P0", category: "效果广告", revenue: "820万", yoy: "+16.2%", mom: "+4.1%", tierShare: "44.1%", totalShare: "6.7%", gtv: "6,800万", arpu: "190元", penetration: "82%" },
  { product: "点金推广", tier: "P1", category: "效果广告", revenue: "520万", yoy: "+12.8%", mom: "+2.6%", tierShare: "28.0%", totalShare: "4.3%", gtv: "3,900万", arpu: "137元", penetration: "65%" },
  { product: "点金推广", tier: "P2", category: "效果广告", revenue: "340万", yoy: "+10.5%", mom: "+1.8%", tierShare: "18.3%", totalShare: "2.8%", gtv: "2,200万", arpu: "107元", penetration: "42%" },
  { product: "点金推广", tier: "P3", category: "效果广告", revenue: "180万", yoy: "+8.1%", mom: "+0.5%", tierShare: "9.7%", totalShare: "1.5%", gtv: "1,000万", arpu: "79元", penetration: "18%" },
  // 全站推广（竞价）
  { product: "全站推广（竞价）", tier: "P0", category: "效果广告", revenue: "580万", yoy: "+32.1%", mom: "+9.5%", tierShare: "46.8%", totalShare: "4.7%", gtv: "4,200万", arpu: "205元", penetration: "68%" },
  { product: "全站推广（竞价）", tier: "P1", category: "效果广告", revenue: "340万", yoy: "+26.5%", mom: "+7.2%", tierShare: "27.4%", totalShare: "2.8%", gtv: "2,100万", arpu: "158元", penetration: "45%" },
  { product: "全站推广（竞价）", tier: "P2", category: "效果广告", revenue: "220万", yoy: "+22.3%", mom: "+5.8%", tierShare: "17.7%", totalShare: "1.8%", gtv: "1,200万", arpu: "119元", penetration: "28%" },
  { product: "全站推广（竞价）", tier: "P3", category: "效果广告", revenue: "100万", yoy: "+18.6%", mom: "+3.2%", tierShare: "8.1%", totalShare: "0.8%", gtv: "480万", arpu: "86元", penetration: "12%" },
  // 订单通
  { product: "订单通", tier: "P0", category: "效果广告", revenue: "680万", yoy: "+25.4%", mom: "+6.8%", tierShare: "44.7%", totalShare: "5.6%", gtv: "5,600万", arpu: "173元", penetration: "91%" },
  { product: "订单通", tier: "P1", category: "效果广告", revenue: "420万", yoy: "+20.1%", mom: "+4.5%", tierShare: "27.6%", totalShare: "3.4%", gtv: "3,100万", arpu: "127元", penetration: "78%" },
  { product: "订单通", tier: "P2", category: "效果广告", revenue: "280万", yoy: "+18.2%", mom: "+3.6%", tierShare: "18.4%", totalShare: "2.3%", gtv: "1,800万", arpu: "101元", penetration: "56%" },
  { product: "订单通", tier: "P3", category: "效果广告", revenue: "140万", yoy: "+12.5%", mom: "+1.8%", tierShare: "9.2%", totalShare: "1.1%", gtv: "800万", arpu: "74元", penetration: "25%" },
  // 超级流量卡
  { product: "超级流量卡", tier: "P0", category: "效果广告", revenue: "360万", yoy: "+22.1%", mom: "+3.8%", tierShare: "46.2%", totalShare: "2.9%", gtv: "2,800万", arpu: "163元", penetration: "55%" },
  { product: "超级流量卡", tier: "P1", category: "效果广告", revenue: "220万", yoy: "+17.5%", mom: "+2.1%", tierShare: "28.2%", totalShare: "1.8%", gtv: "1,500万", arpu: "124元", penetration: "38%" },
  { product: "超级流量卡", tier: "P2", category: "效果广告", revenue: "140万", yoy: "+14.2%", mom: "+1.5%", tierShare: "17.9%", totalShare: "1.1%", gtv: "850万", arpu: "94元", penetration: "22%" },
  { product: "超级流量卡", tier: "P3", category: "效果广告", revenue: "60万", yoy: "+9.8%", mom: "+0.3%", tierShare: "7.7%", totalShare: "0.5%", gtv: "320万", arpu: "66元", penetration: "8%" },
  // 袋鼠店长
  { product: "袋鼠店长", tier: "P0", category: "增值产品", revenue: "210万", yoy: "+12.5%", mom: "+2.1%", tierShare: "40.4%", totalShare: "1.7%", gtv: "1,800万", arpu: "74元", penetration: "100%" },
  { product: "袋鼠店长", tier: "P1", category: "增值产品", revenue: "150万", yoy: "+10.2%", mom: "+1.5%", tierShare: "28.8%", totalShare: "1.2%", gtv: "1,200万", arpu: "59元", penetration: "100%" },
  { product: "袋鼠店长", tier: "P2", category: "增值产品", revenue: "100万", yoy: "+8.8%", mom: "+0.8%", tierShare: "19.2%", totalShare: "0.8%", gtv: "700万", arpu: "48元", penetration: "100%" },
  { product: "袋鼠店长", tier: "P3", category: "增值产品", revenue: "60万", yoy: "+6.1%", mom: "+0.2%", tierShare: "11.5%", totalShare: "0.5%", gtv: "380万", arpu: "40元", penetration: "100%" },
  // 铂金展位CPM
  { product: "铂金展位CPM", tier: "P0", category: "品宣产品", revenue: "320万", yoy: "+10.5%", mom: "+1.8%", tierShare: "55.2%", totalShare: "2.6%", gtv: "2,200万", arpu: "250元", penetration: "28%" },
  { product: "铂金展位CPM", tier: "P1", category: "品宣产品", revenue: "150万", yoy: "+7.2%", mom: "+0.5%", tierShare: "25.9%", totalShare: "1.2%", gtv: "900万", arpu: "190元", penetration: "12%" },
  { product: "铂金展位CPM", tier: "P2", category: "品宣产品", revenue: "80万", yoy: "+5.1%", mom: "-0.3%", tierShare: "13.8%", totalShare: "0.7%", gtv: "420万", arpu: "143元", penetration: "5%" },
  { product: "铂金展位CPM", tier: "P3", category: "品宣产品", revenue: "30万", yoy: "+2.8%", mom: "-1.2%", tierShare: "5.2%", totalShare: "0.2%", gtv: "130万", arpu: "104元", penetration: "2%" },
  // 订单通（全站）
  { product: "订单通（全站）", tier: "P0", category: "效果广告", revenue: "310万", yoy: "+40.2%", mom: "+10.5%", tierShare: "45.6%", totalShare: "2.5%", gtv: "2,400万", arpu: "181元", penetration: "52%" },
  { product: "订单通（全站）", tier: "P1", category: "效果广告", revenue: "180万", yoy: "+33.5%", mom: "+8.2%", tierShare: "26.5%", totalShare: "1.5%", gtv: "1,200万", arpu: "136元", penetration: "32%" },
  { product: "订单通（全站）", tier: "P2", category: "效果广告", revenue: "120万", yoy: "+28.8%", mom: "+6.1%", tierShare: "17.6%", totalShare: "1.0%", gtv: "680万", arpu: "110元", penetration: "18%" },
  { product: "订单通（全站）", tier: "P3", category: "效果广告", revenue: "70万", yoy: "+22.1%", mom: "+3.5%", tierShare: "10.3%", totalShare: "0.6%", gtv: "350万", arpu: "83元", penetration: "8%" },
  // 中小一站式
  { product: "中小一站式", tier: "P0", category: "效果广告", revenue: "180万", yoy: "+18.5%", mom: "+3.2%", tierShare: "26.5%", totalShare: "1.5%", gtv: "1,500万", arpu: "91元", penetration: "100%" },
  { product: "中小一站式", tier: "P1", category: "效果广告", revenue: "200万", yoy: "+16.2%", mom: "+2.8%", tierShare: "29.4%", totalShare: "1.6%", gtv: "1,600万", arpu: "83元", penetration: "100%" },
  { product: "中小一站式", tier: "P2", category: "效果广告", revenue: "180万", yoy: "+15.8%", mom: "+2.5%", tierShare: "26.5%", totalShare: "1.5%", gtv: "1,400万", arpu: "71元", penetration: "100%" },
  { product: "中小一站式", tier: "P3", category: "效果广告", revenue: "120万", yoy: "+14.1%", mom: "+1.8%", tierShare: "17.6%", totalShare: "1.0%", gtv: "850万", arpu: "54元", penetration: "100%" },
  // 拼好饭推广
  { product: "拼好饭推广", tier: "P0", category: "效果广告", revenue: "80万", yoy: "+52.1%", mom: "+13.5%", tierShare: "30.8%", totalShare: "0.7%", gtv: "600万", arpu: "66元", penetration: "68%" },
  { product: "拼好饭推广", tier: "P1", category: "效果广告", revenue: "70万", yoy: "+48.5%", mom: "+12.1%", tierShare: "26.9%", totalShare: "0.6%", gtv: "480万", arpu: "56元", penetration: "55%" },
  { product: "拼好饭推广", tier: "P2", category: "效果广告", revenue: "60万", yoy: "+42.3%", mom: "+10.8%", tierShare: "23.1%", totalShare: "0.5%", gtv: "360万", arpu: "48元", penetration: "42%" },
  { product: "拼好饭推广", tier: "P3", category: "效果广告", revenue: "50万", yoy: "+38.6%", mom: "+9.5%", tierShare: "19.2%", totalShare: "0.4%", gtv: "280万", arpu: "42元", penetration: "28%" },
];

/* ================================================================== */
/* 产品×商家分层 交叉数据（到餐 5类 × P0-P3）                            */
/* ================================================================== */
const daocanProductTierRows = [
  // 推广通 (CPC)
  { product: "推广通 (CPC)", tier: "P0", category: "推广通", revenue: "1,820万", yoy: "+14.5%", mom: "+3.2%", tierShare: "47.6%", totalShare: "21.5%", gtv: "12,000万", arpu: "298元", penetration: "85%" },
  { product: "推广通 (CPC)", tier: "P1", category: "推广通", revenue: "980万", yoy: "+11.2%", mom: "+2.1%", tierShare: "25.7%", totalShare: "11.6%", gtv: "5,800万", arpu: "285元", penetration: "62%" },
  { product: "推广通 (CPC)", tier: "P2", category: "推广通", revenue: "620万", yoy: "+8.5%", mom: "+1.2%", tierShare: "16.2%", totalShare: "7.3%", gtv: "3,200万", arpu: "238元", penetration: "38%" },
  { product: "推广通 (CPC)", tier: "P3", category: "推广通", revenue: "400万", yoy: "+5.8%", mom: "-0.3%", tierShare: "10.5%", totalShare: "4.7%", gtv: "1,800万", arpu: "189元", penetration: "15%" },
  // 订单通 (CPS)
  { product: "订单通 (CPS)", tier: "P0", category: "订单通", revenue: "780万", yoy: "+25.4%", mom: "+7.5%", tierShare: "46.4%", totalShare: "9.2%", gtv: "6,500万", arpu: "236元", penetration: "92%" },
  { product: "订单通 (CPS)", tier: "P1", category: "订单通", revenue: "420万", yoy: "+20.8%", mom: "+5.2%", tierShare: "25.0%", totalShare: "5.0%", gtv: "3,200万", arpu: "173元", penetration: "78%" },
  { product: "订单通 (CPS)", tier: "P2", category: "订单通", revenue: "280万", yoy: "+18.2%", mom: "+4.1%", tierShare: "16.7%", totalShare: "3.3%", gtv: "1,900万", arpu: "134元", penetration: "55%" },
  { product: "订单通 (CPS)", tier: "P3", category: "订单通", revenue: "200万", yoy: "+15.1%", mom: "+2.8%", tierShare: "11.9%", totalShare: "2.4%", gtv: "1,100万", arpu: "97元", penetration: "25%" },
  // 置顶卡等 (CPT)
  { product: "置顶卡等 (CPT)", tier: "P0", category: "置顶卡", revenue: "520万", yoy: "+8.2%", mom: "+0.5%", tierShare: "53.1%", totalShare: "6.2%", gtv: "3,200万", arpu: "285元", penetration: "35%" },
  { product: "置顶卡等 (CPT)", tier: "P1", category: "置顶卡", revenue: "240万", yoy: "+5.5%", mom: "-0.8%", tierShare: "24.5%", totalShare: "2.8%", gtv: "1,300万", arpu: "236元", penetration: "15%" },
  { product: "置顶卡等 (CPT)", tier: "P2", category: "置顶卡", revenue: "140万", yoy: "+3.2%", mom: "-1.5%", tierShare: "14.3%", totalShare: "1.7%", gtv: "650万", arpu: "180元", penetration: "6%" },
  { product: "置顶卡等 (CPT)", tier: "P3", category: "置顶卡", revenue: "80万", yoy: "+1.8%", mom: "-2.2%", tierShare: "8.2%", totalShare: "0.9%", gtv: "320万", arpu: "129元", penetration: "2%" },
  // 智选展位等 (CPM)
  { product: "智选展位等 (CPM)", tier: "P0", category: "智选展位", revenue: "620万", yoy: "+10.5%", mom: "+2.1%", tierShare: "50.0%", totalShare: "7.3%", gtv: "4,000万", arpu: "289元", penetration: "42%" },
  { product: "智选展位等 (CPM)", tier: "P1", category: "智选展位", revenue: "310万", yoy: "+7.8%", mom: "+1.2%", tierShare: "25.0%", totalShare: "3.7%", gtv: "1,800万", arpu: "240元", penetration: "20%" },
  { product: "智选展位等 (CPM)", tier: "P2", category: "智选展位", revenue: "190万", yoy: "+5.5%", mom: "+0.3%", tierShare: "15.3%", totalShare: "2.2%", gtv: "950万", arpu: "187元", penetration: "8%" },
  { product: "智选展位等 (CPM)", tier: "P3", category: "智选展位", revenue: "120万", yoy: "+3.2%", mom: "-0.8%", tierShare: "9.7%", totalShare: "1.4%", gtv: "520万", arpu: "136元", penetration: "3%" },
  // 商户通/智能掌柜 (MEM)
  { product: "商户通/智能掌柜 (MEM)", tier: "P0", category: "商户通", revenue: "320万", yoy: "+18.5%", mom: "+4.2%", tierShare: "44.4%", totalShare: "3.8%", gtv: "2,200万", arpu: "205元", penetration: "58%" },
  { product: "商户通/智能掌柜 (MEM)", tier: "P1", category: "商户通", revenue: "180万", yoy: "+14.2%", mom: "+2.8%", tierShare: "25.0%", totalShare: "2.1%", gtv: "1,100万", arpu: "163元", penetration: "35%" },
  { product: "商户通/智能掌柜 (MEM)", tier: "P2", category: "商户通", revenue: "130万", yoy: "+11.5%", mom: "+1.8%", tierShare: "18.1%", totalShare: "1.5%", gtv: "720万", arpu: "129元", penetration: "18%" },
  { product: "商户通/智能掌柜 (MEM)", tier: "P3", category: "商户通", revenue: "90万", yoy: "+8.8%", mom: "+0.5%", tierShare: "12.5%", totalShare: "1.1%", gtv: "420万", arpu: "97元", penetration: "8%" },
];

/* ================================================================== */
/* 外卖分区域数据（按品类聚合）                                         */
/* ================================================================== */
const waimaiRegionRows = [
  { region: "京津冀区域", "效果广告": "3,660万", "增值产品": "800万", "省钱产品": "280万", "品宣产品": "1,320万", total: "6,060万" },
  { region: "江苏区域", "效果广告": "2,800万", "增值产品": "620万", "省钱产品": "220万", "品宣产品": "1,000万", total: "4,640万" },
  { region: "粤海区域", "效果广告": "2,180万", "增值产品": "480万", "省钱产品": "180万", "品宣产品": "780万", total: "3,620万" },
  { region: "川藏区域", "效果广告": "1,660万", "增值产品": "360万", "省钱产品": "140万", "品宣产品": "580万", total: "2,740万" },
  { region: "山东区域", "效果广告": "1,100万", "增值产品": "240万", "省钱产品": "90万", "品宣产品": "380万", total: "1,810万" },
  { region: "辽吉区域", "效果广告": "680万", "增值产品": "150万", "省钱产品": "60万", "品宣产品": "230万", total: "1,120万" },
];

/* 外卖分城市数据（按品类聚合，抽样城市） */
const waimaiCityRows = [
  { city: "北京", "效果广告": "1,860万", "增值产品": "420万", "省钱产品": "150万", "品宣产品": "680万", total: "3,110万" },
  { city: "天津", "效果广告": "980万", "增值产品": "220万", "省钱产品": "70万", "品宣产品": "320万", total: "1,590万" },
  { city: "南京", "效果广告": "1,120万", "增值产品": "250万", "省钱产品": "90万", "品宣产品": "420万", total: "1,880万" },
  { city: "苏州", "效果广告": "820万", "增值产品": "180万", "省钱产品": "60万", "品宣产品": "280万", total: "1,340万" },
  { city: "无锡", "效果广告": "480万", "增值产品": "110万", "省钱产品": "40万", "品宣产品": "180万", total: "810万" },
  { city: "广州", "效果广告": "980万", "增值产品": "220万", "省钱产品": "80万", "品宣产品": "360万", total: "1,640万" },
  { city: "深圳", "效果广告": "720万", "增值产品": "160万", "省钱产品": "60万", "品宣产品": "260万", total: "1,200万" },
  { city: "佛山", "效果广告": "280万", "增值产品": "60万", "省钱产品": "20万", "品宣产品": "100万", total: "460万" },
  { city: "成都", "效果广告": "820万", "增值产品": "180万", "省钱产品": "70万", "品宣产品": "300万", total: "1,370万" },
  { city: "重庆", "效果广告": "560万", "增值产品": "120万", "省钱产品": "50万", "品宣产品": "200万", total: "930万" },
  { city: "济南", "效果广告": "420万", "增值产品": "90万", "省钱产品": "30万", "品宣产品": "160万", total: "700万" },
  { city: "青岛", "效果广告": "380万", "增值产品": "80万", "省钱产品": "30万", "品宣产品": "140万", total: "630万" },
  { city: "沈阳", "效果广告": "280万", "增值产品": "60万", "省钱产品": "20万", "品宣产品": "100万", total: "460万" },
  { city: "大连", "效果广告": "220万", "增值产品": "50万", "省钱产品": "20万", "品宣产品": "80万", total: "370万" },
];

/* 到餐分城市数据（按消耗类型，抽样城市） */
const daocanCityRows = [
  { city: "北京", "推广通 (CPC)": "880万", "订单通 (CPS)": "380万", "置顶卡等 (CPT)": "220万", "智选展位等 (CPM)": "280万", "商户通/智能掌柜 (MEM)": "160万", total: "1,920万" },
  { city: "天津", "推广通 (CPC)": "480万", "订单通 (CPS)": "210万", "置顶卡等 (CPT)": "120万", "智选展位等 (CPM)": "160万", "商户通/智能掌柜 (MEM)": "90万", total: "1,060万" },
  { city: "南京", "推广通 (CPC)": "520万", "订单通 (CPS)": "230万", "置顶卡等 (CPT)": "130万", "智选展位等 (CPM)": "170万", "商户通/智能掌柜 (MEM)": "100万", total: "1,150万" },
  { city: "苏州", "推广通 (CPC)": "380万", "订单通 (CPS)": "170万", "置顶卡等 (CPT)": "100万", "智选展位等 (CPM)": "130万", "商户通/智能掌柜 (MEM)": "70万", total: "850万" },
  { city: "无锡", "推广通 (CPC)": "220万", "订单通 (CPS)": "100万", "置顶卡等 (CPT)": "60万", "智选展位等 (CPM)": "70万", "商户通/智能掌柜 (MEM)": "40万", total: "490万" },
  { city: "广州", "推广通 (CPC)": "460万", "订单通 (CPS)": "200万", "置顶卡等 (CPT)": "120万", "智选展位等 (CPM)": "160万", "商户通/智能掌柜 (MEM)": "90万", total: "1,030万" },
  { city: "深圳", "推广通 (CPC)": "340万", "订单通 (CPS)": "150万", "置顶卡等 (CPT)": "90万", "智选展位等 (CPM)": "120万", "商户通/智能掌柜 (MEM)": "70万", total: "770万" },
  { city: "佛山", "推广通 (CPC)": "140万", "订单通 (CPS)": "60万", "置顶卡等 (CPT)": "40万", "智选展位等 (CPM)": "50万", "商户通/智能掌柜 (MEM)": "30万", total: "320万" },
  { city: "成都", "推广通 (CPC)": "380万", "订单通 (CPS)": "170万", "置顶卡等 (CPT)": "100万", "智选展位等 (CPM)": "130万", "商户通/智能掌柜 (MEM)": "80万", total: "860万" },
  { city: "重庆", "推广通 (CPC)": "260万", "订单通 (CPS)": "110万", "置顶卡等 (CPT)": "70万", "智选展位等 (CPM)": "90万", "商户通/智能掌柜 (MEM)": "50万", total: "580万" },
  { city: "济南", "推广通 (CPC)": "200万", "订单通 (CPS)": "90万", "置顶卡等 (CPT)": "50万", "智选展位等 (CPM)": "70万", "商户通/智能掌柜 (MEM)": "40万", total: "450万" },
  { city: "青岛", "推广通 (CPC)": "180万", "订单通 (CPS)": "80万", "置顶卡等 (CPT)": "50万", "智选展位等 (CPM)": "60万", "商户通/智能掌柜 (MEM)": "30万", total: "400万" },
  { city: "沈阳", "推广通 (CPC)": "140万", "订单通 (CPS)": "60万", "置顶卡等 (CPT)": "40万", "智选展位等 (CPM)": "50万", "商户通/智能掌柜 (MEM)": "30万", total: "320万" },
  { city: "大连", "推广通 (CPC)": "110万", "订单通 (CPS)": "50万", "置顶卡等 (CPT)": "30万", "智选展位等 (CPM)": "40万", "商户通/智能掌柜 (MEM)": "20万", total: "250万" },
];

/* 到餐分区域数据（按消耗类型） */
const daocanRegionRows = [
  { region: "京津冀区域", "推广通 (CPC)": "1,720万", "订单通 (CPS)": "760万", "置顶卡等 (CPT)": "440万", "智选展位等 (CPM)": "560万", "商户通/智能掌柜 (MEM)": "320万", total: "3,800万" },
  { region: "江苏区域", "推广通 (CPC)": "1,380万", "订单通 (CPS)": "610万", "置顶卡等 (CPT)": "350万", "智选展位等 (CPM)": "450万", "商户通/智能掌柜 (MEM)": "260万", total: "3,050万" },
  { region: "粤海区域", "推广通 (CPC)": "1,020万", "订单通 (CPS)": "450万", "置顶卡等 (CPT)": "280万", "智选展位等 (CPM)": "370万", "商户通/智能掌柜 (MEM)": "210万", total: "2,330万" },
  { region: "川藏区域", "推广通 (CPC)": "820万", "订单通 (CPS)": "360万", "置顶卡等 (CPT)": "220万", "智选展位等 (CPM)": "290万", "商户通/智能掌柜 (MEM)": "170万", total: "1,860万" },
  { region: "山东区域", "推广通 (CPC)": "520万", "订单通 (CPS)": "240万", "置顶卡等 (CPT)": "130万", "智选展位等 (CPM)": "170万", "商户通/智能掌柜 (MEM)": "100万", total: "1,160万" },
  { region: "辽吉区域", "推广通 (CPC)": "380万", "订单通 (CPS)": "170万", "置顶卡等 (CPT)": "100万", "智选展位等 (CPM)": "130万", "商户通/智能掌柜 (MEM)": "80万", total: "860万" },
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
      { title: "效果广告为第一大品类", text: "效果广告收入合计占比述70%+，是外卖广告收入核心支柱。点金推广+订单通两大头部产品达成率均起90%" },
      { title: "订单通系列增长强劲", text: "订单通+订单通（全站）合计占比18%，YoY+22-36%，闪购流量加速包YoY+52%为效果广告增速最快，建议加大推广" },
      { title: "品宣产品达成率偏低", text: "品宣产品整体达成率较高，但品专品牌词仅73%、品牌装修75%，受大客户预算缩减影响，建议拓展中小品牌客户弥补缺口" },
      { title: "增值产品稳定", text: "袋鼠店长覆盖率100%贡献520万收入，是稳定的增值类收入来源。跨店购和应用市场尚在早期，增长空间大" },
      { title: "省钱产品机会", text: "流量助手YoY+16.5%增长稳健但ARPU仅0.16万，建议引导商户升级更高阶的流量服务包" },
    ],
    biz_manager: [
      { title: "区域产品结构差异", text: "京津冀区域效果广告收入3,660万领先，辽吉区域仅680万。建议将京津冀运营经验复制到辽吉" },
      { title: "闪购产品线机会", text: "闪购一站式YoY+40.2%、闪购流量加速包YoY+52.1%，是重要增量来源，建议重点推进闪购产品开通" },
      { title: "拼好饭推广爆发增长", text: "YoY+45.8%为效果广告增速最快产品，覆盖1,560家商户但ARPU仅0.17万，建议引导商户提升推广预算" },
      { title: "品宣产品需突破", text: "川藏区域品宣产品达成率最低，建议重点跟进成都的品牌客户预算恢复情况" },
    ],
    partner: [
      { title: "核心产品开通率", text: "点金推广开通率78%，订单通89%，建议优先推动剩余22%商户开通点金推广" },
      { title: "品宣产品开通率低", text: "品牌装修开通率仅18%，建议重点推进品宣类产品开通，预计可增收3-5万/月" },
      { title: "增值产品渗透", text: "袋鼠店长覆盖率最高但ARPU低，建议引导商户开通更高阶的流量助手服务" },
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
      { title: "区域CPC表现", text: "京津冀区域推广通收入1,720万领先，辽吉区域仅380万。建议复制京津冀经验到辽吉" },
      { title: "CPS全面超额", text: "所有区域订单通达成率均超100%，是到餐最稳定增量品类" },
      { title: "CPT区域性差异大", text: "京津冀区域CPT达成率88%最高，辽吉区域仅68%，需重点排查合作商执行力" },
      { title: "MEM推广机会", text: "川藏区域商户通覆盖率最低，建议重点推进川藏餐饮商户开通" },
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
  const [regionViewMode, setRegionViewMode] = useState("region");
  const PAGE_SIZE = 10;

  const categories = useMemo(() => {
    return [...new Set(waimaiProductRevenue.map((r) => r.category))];
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

  // 产品收入占比（全部28个产品，每个独立颜色——表格行用）
  const productShareAgg = useMemo(() => {
    return waimaiProductRevenue.map((r) => ({ name: r.name, value: r.share, color: waimaiColorFor(r) }));
  }, []);

  // 产品收入占比（分组：7个重点产品 + 其他——图表用）
  const productShareGrouped = useMemo(() => {
    const highlight = ["点金推广", "营销魔方", "订单通（全站）", "津贴联盟", "流量助手", "全站推广（竞价）", "拼好饭推广"];
    const colors = ["#2563EB", "#059669", "#0EA5E9", "#8B5CF6", "#F59E0B", "#EC4899", "#10B981", "#9CA3AF"];
    let otherShare = 0;
    const groups = [];
    highlight.forEach((name, i) => {
      const p = waimaiProductRevenue.find((r) => r.name === name);
      if (p) groups.push({ name, value: p.share, color: colors[i] });
    });
    waimaiProductRevenue.forEach((r) => {
      if (!highlight.includes(r.name)) otherShare += r.share;
    });
    groups.push({ name: "其他", value: parseFloat(otherShare.toFixed(1)), color: colors[7] });
    return groups;
  }, []);

  const totalRevenue = waimaiProductRevenue.reduce((s, r) => s + parseAmount(r.revenue), 0);
  const totalTarget = waimaiProductRevenue.reduce((s, r) => s + parseAmount(r.target), 0);
  const overallRate = Math.round((totalRevenue / totalTarget) * 100);
  const totalMerchants = waimaiProductRevenue.reduce((s, r) => s + r.merchants, 0);

  // 收入排名 Top 5
  const revenueTop5 = useMemo(() => {
    return [...waimaiProductRevenue].sort((a, b) => parseAmount(b.revenue) - parseAmount(a.revenue)).slice(0, 5);
  }, []);

  // 产品 ARPU 排名
  const productArpuList = useMemo(() => {
    return [...waimaiProductRevenue].sort((a, b) => parseAmount(b.arpu) - parseAmount(a.arpu)).slice(0, 8);
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

      {/* 产品收入明细 + 分区域产品 — 双 Tab */}
      <Tabs defaultValue="detail" className="mb-4">
        <TabsList className="mb-2">
          <TabsTrigger value="detail">产品收入明细</TabsTrigger>
          <TabsTrigger value="region">产品分区域</TabsTrigger>
          <TabsTrigger value="product-merchant">产品分商家</TabsTrigger>
        </TabsList>

        <TabsContent value="detail">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 左侧2/3：产品收入明细表格 */}
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm bg-white">
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
                  <ProductShareBar data={productShareGrouped} />
                  <div className="flex flex-wrap gap-4 mt-2 mb-4">
                    {productShareGrouped.map((r) => (
                      <div key={r.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-xs text-gray-600">{r.name} {r.value}%</span>
                      </div>
                    ))}
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品名称</TableHead>
                        <TableHead>品类</TableHead>
                        <TableHead>收入</TableHead>
                        <TableHead>收入YoY</TableHead>
                        <TableHead>收入MoM</TableHead>
                        <TableHead>目标</TableHead>
                        <TableHead className="w-40">达成率</TableHead>
                        <TableHead>占比</TableHead>
                        <TableHead>广告商家数</TableHead>
                        <TableHead>ARPU</TableHead>
                        <TableHead>渗透率</TableHead>
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
                          <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                            {row.yoy.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                            {row.yoy}
                          </TableCell>
                          <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                            {row.mom.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                            {row.mom}
                          </TableCell>
                          <TableCell>{row.target}</TableCell>
                          <TableCell><RateProgress rate={row.rate} /></TableCell>
                          <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.share}%</Badge></TableCell>
                          <TableCell>{row.merchants.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-600">{row.arpu}</TableCell>
                          <TableCell className="text-gray-600">{row.coverage}</TableCell>
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
            </div>

            {/* 右侧1/3：图表卡片 */}
            <div className="space-y-4">
              {/* 产品收入占比图 */}
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-2">各产品收入占比</p>
                  <ProductShareChart data={productShareGrouped} />
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {productShareGrouped.map((r) => (
                      <div key={r.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-[11px] text-gray-600">{r.name} {r.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 产品收入排名 Top 5 */}
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-4">各产品收入排名Top5</p>
                  <div className="space-y-3">
                    {revenueTop5.map((r, i) => (
                      <div key={r.name} className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>{i + 1}</span>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: waimaiColorFor(r) }} />
                        <span className="text-xs text-gray-700 flex-1 truncate">{r.name}</span>
                        <span className="text-sm font-semibold" style={{ color: waimaiColorFor(r) }}>{r.revenue}</span>
                        <Badge className="border-none font-normal text-xs" style={{ backgroundColor: waimaiColorFor(r) + "20", color: waimaiColorFor(r) }}>{r.share}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 产品 ARPU 值 */}
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-4">各产品ARPU值</p>
                  <div className="space-y-3">
                    {productArpuList.map((r, i) => (
                      <div key={r.name} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: waimaiColorFor(r) }}>{i + 1}</span>
                        <span className="text-xs text-gray-700 flex-1 truncate">{r.name}</span>
                        <span className="text-sm font-semibold" style={{ color: waimaiColorFor(r) }}>{r.arpu}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 关键指标速览 */}
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">关键指标</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">达标产品</span>
                      <span className="text-sm font-semibold text-gray-900">{waimaiProductRevenue.filter((r) => parseFloat(r.rate) >= 90).length}/{waimaiProductRevenue.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">平均达成率</span>
                      <span className="text-sm font-semibold text-emerald-600">
                        {Math.round(waimaiProductRevenue.reduce((s, r) => s + parseFloat(r.rate), 0) / waimaiProductRevenue.length)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">最高ARPU</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {Math.max(...waimaiProductRevenue.map((r) => parseInt(r.arpu)))}元
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">总商户覆盖</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {waimaiProductRevenue.reduce((s, r) => s + r.merchants, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="region">
      {/* 分区域/城市产品情况（按品类） */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">产品分{regionViewMode === "region" ? "区域" : "城市"}</p>
            <Select value={regionViewMode} onValueChange={(v) => setRegionViewMode(v)}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region">分区域</SelectItem>
                <SelectItem value="city">分城市</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{regionViewMode === "region" ? "区域" : "城市"}</TableHead>
                <TableHead>效果广告</TableHead>
                <TableHead>增值产品</TableHead>
                <TableHead>省钱产品</TableHead>
                <TableHead>品宣产品</TableHead>
                <TableHead>合计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(regionViewMode === "region" ? waimaiRegionRows : waimaiCityRows).map((row) => (
                <TableRow key={row.region || row.city}>
                  <TableCell className="font-medium text-gray-800">{row.region || row.city}</TableCell>
                  <TableCell className="text-[#4080FF]">{row["效果广告"]}</TableCell>
                  <TableCell className="text-[#00C896]">{row["增值产品"]}</TableCell>
                  <TableCell className="text-[#FF8C42]">{row["省钱产品"]}</TableCell>
                  <TableCell className="text-[#A855F7]">{row["品宣产品"]}</TableCell>
                  <TableCell className="font-semibold text-gray-900">{row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="product-merchant">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">产品分商家（{waimaiProductTierRows.length}条 · 产品×商家分层）</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>商家分层</TableHead>
                <TableHead>品类</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>收入YoY</TableHead>
                <TableHead>收入MoM</TableHead>
                <TableHead>占商家分层</TableHead>
                <TableHead>占总收入</TableHead>
                <TableHead>广告实付GTV</TableHead>
                <TableHead>ARPU</TableHead>
                <TableHead>渗透率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waimaiProductTierRows.map((row, idx) => {
                const pStyles = {
                  P0: "bg-red-50 text-red-600",
                  P1: "bg-orange-50 text-orange-600",
                  P2: "bg-amber-50 text-amber-600",
                  P3: "bg-blue-50 text-blue-600",
                };
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-gray-800">{row.product}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${pStyles[row.tier] || pStyles.P3}`}>{row.tier}</span>
                    </TableCell>
                    <TableCell><Badge className="border-none font-normal bg-gray-50 text-gray-600 text-xs">{row.category}</Badge></TableCell>
                    <TableCell className="font-medium">{row.revenue}</TableCell>
                    <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                      {row.yoy.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                      {row.yoy}
                    </TableCell>
                    <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>{row.mom}</TableCell>
                    <TableCell><Badge className="border-none font-normal bg-purple-50 text-purple-600">{row.tierShare}</Badge></TableCell>
                    <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.totalShare}</Badge></TableCell>
                    <TableCell className="text-gray-600">{row.gtv}</TableCell>
                    <TableCell className="text-gray-600">{row.arpu}</TableCell>
                    <TableCell className="text-gray-600">{row.penetration}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

/* ================================================================== */
/* 到餐产品视图（平台管理员）                                          */
/* ================================================================== */
const DaocanProductView = () => {
  const [regionViewMode, setRegionViewMode] = useState("region");
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

      {/* 产品收入明细 + 分区域产品 — 双 Tab */}
      <Tabs defaultValue="detail" className="mb-4">
        <TabsList className="mb-2">
          <TabsTrigger value="detail">产品收入明细</TabsTrigger>
          <TabsTrigger value="region">产品分区域</TabsTrigger>
          <TabsTrigger value="product-merchant">产品分商家</TabsTrigger>
        </TabsList>

        <TabsContent value="detail">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">产品收入明细</p>
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
                <TableHead>产品名称</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>收入YoY</TableHead>
                <TableHead>收入MoM</TableHead>
                <TableHead>目标</TableHead>
                <TableHead className="w-48">达成率</TableHead>
                <TableHead>占比</TableHead>
                <TableHead>广告商家数</TableHead>
                <TableHead>ARPU</TableHead>
                <TableHead>渗透率</TableHead>
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
                  <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                    {row.yoy.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                    {row.yoy}
                  </TableCell>
                  <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                    {row.mom.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                    {row.mom}
                  </TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                  <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.share}%</Badge></TableCell>
                  <TableCell>{row.merchants.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-600">{row.arpu}</TableCell>
                  <TableCell className="text-gray-600">{row.coverage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="region">
      {/* 分区域/城市产品情况 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">产品分{regionViewMode === "region" ? "区域" : "城市"}</p>
            <Select value={regionViewMode} onValueChange={(v) => setRegionViewMode(v)}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region">分区域</SelectItem>
                <SelectItem value="city">分城市</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{regionViewMode === "region" ? "区域" : "城市"}</TableHead>
                <TableHead>推广通(CPC)</TableHead>
                <TableHead>订单通(CPS)</TableHead>
                <TableHead>置顶卡(CPT)</TableHead>
                <TableHead>智选展位(CPM)</TableHead>
                <TableHead>商户通(MEM)</TableHead>
                <TableHead>合计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(regionViewMode === "region" ? daocanRegionRows : daocanCityRows).map((row) => (
                <TableRow key={row.region || row.city}>
                  <TableCell className="font-medium text-gray-800">{row.region || row.city}</TableCell>
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
        </TabsContent>

        <TabsContent value="product-merchant">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">产品分商家（{daocanProductTierRows.length}条 · 消耗类型×商家分层）</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品</TableHead>
                <TableHead>商家分层</TableHead>
                <TableHead>品类</TableHead>
                <TableHead>收入</TableHead>
                <TableHead>收入YoY</TableHead>
                <TableHead>收入MoM</TableHead>
                <TableHead>占商家分层</TableHead>
                <TableHead>占总收入</TableHead>
                <TableHead>广告实付GTV</TableHead>
                <TableHead>ARPU</TableHead>
                <TableHead>渗透率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daocanProductTierRows.map((row, idx) => {
                const pStyles = {
                  P0: "bg-red-50 text-red-600",
                  P1: "bg-orange-50 text-orange-600",
                  P2: "bg-amber-50 text-amber-600",
                  P3: "bg-blue-50 text-blue-600",
                };
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-gray-800">{row.product}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${pStyles[row.tier] || pStyles.P3}`}>{row.tier}</span>
                    </TableCell>
                    <TableCell><Badge className="border-none font-normal bg-gray-50 text-gray-600 text-xs">{row.category}</Badge></TableCell>
                    <TableCell className="font-medium">{row.revenue}</TableCell>
                    <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                      {row.yoy.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                      {row.yoy}
                    </TableCell>
                    <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>{row.mom}</TableCell>
                    <TableCell><Badge className="border-none font-normal bg-purple-50 text-purple-600">{row.tierShare}</Badge></TableCell>
                    <TableCell><Badge className="border-none font-normal bg-blue-50 text-[#4080FF]">{row.totalShare}</Badge></TableCell>
                    <TableCell className="text-gray-600">{row.gtv}</TableCell>
                    <TableCell className="text-gray-600">{row.arpu}</TableCell>
                    <TableCell className="text-gray-600">{row.penetration}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
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
  const region = currentUser?.region || "江苏区域";

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

  /* AI 智能分析：两个下拉 + 触发按钮 */
  const [aiProduct, setAiProduct] = useState("all");
  const [aiRegion, setAiRegion] = useState("全国");
  const [aiTriggered, setAiTriggered] = useState(true);

  /* 产品列表 */
  const productList = bizLine === "waimai" ? waimaiProductRevenue : daocanProductRevenue;
  const aiProductOptions = [
    { value: "all", label: "全产品" },
    ...productList.map((p) => ({ value: p.name, label: p.name })),
  ];

  /* 区域列表 */
  const regionList = bizLine === "waimai" ? waimaiRegionRows : daocanRegionRows;
  const aiRegionOptions = ["全国", ...regionList.map((r) => r.region)];

  /* 根据选择生成分析内容 */
  const aiAnalysisItems = (() => {
    const items = [];
    const productLabel = aiProductOptions.find((o) => o.value === aiProduct)?.label || "全产品";
    const regionLabel = aiRegion;

    /* 筛选产品 */
    const matchedProducts = aiProduct === "all" ? productList : productList.filter((p) => p.name === aiProduct);

    /* 筛选区域数据 */
    const matchedRegions = aiRegion === "全国" ? regionList : regionList.filter((r) => r.region === aiRegion);

    if (aiProduct === "all") {
      /* 全产品分析 */
      const totalRevenue = productList.reduce((s, p) => s + parseFloat(p.revenue.replace(/[,万]/g, "")), 0);
      const totalTarget = productList.reduce((s, p) => s + parseFloat(p.target.replace(/[,万]/g, "")), 0);
      const avgRate = Math.round((totalRevenue / totalTarget) * 100);

      items.push({
        title: `${regionLabel}全产品收入概览`,
        text: `${regionLabel === "全国" ? "全国" : regionLabel}共${productList.length}个产品，合计收入约${totalRevenue.toFixed(0)}万，目标${totalTarget.toFixed(0)}万，整体达成率${avgRate}%。${avgRate >= 90 ? "整体达成良好。" : avgRate >= 80 ? "达成存在一定风险。" : "达成严重滞后，需紧急关注。"}`,
      });

      /* TOP 和 BOTTOM 产品 */
      const sorted = [...productList].sort((a, b) => b.rate - a.rate);
      const top = sorted[0];
      const bottom = sorted[sorted.length - 1];
      if (top) {
        items.push({
          title: `达成最优产品：${top.name}`,
          text: `${top.name}达成率${top.rate}%，收入${top.revenue}，YoY ${top.yoy}。建议总结其运营经验并向其他产品线推广。`,
        });
      }
      if (bottom && bottom !== top) {
        items.push({
          title: `达成待提升产品：${bottom.name}`,
          text: `${bottom.name}达成率仅${bottom.rate}%，收入${bottom.revenue}（目标${bottom.target}），缺口较大。建议重点关注并制定提升方案。`,
        });
      }
    } else {
      /* 单产品分析 */
      const product = matchedProducts[0];
      if (product) {
        items.push({
          title: `${product.name}（${regionLabel}）产品分析`,
          text: `${product.name}收入${product.revenue}（目标${product.target}），达成率${product.rate}%，YoY ${product.yoy}，MoM ${product.mom}，覆盖商户${product.merchants}家，ARPU ${product.arpu}，覆盖率${product.coverage}。${product.rate >= 90 ? "达成情况良好。" : product.rate >= 80 ? "达成有一定风险，需持续跟进。" : "达成严重滞后，建议紧急干预。"}`,
        });

        /* 区域分布分析 */
        if (aiRegion === "全国") {
          const regionData = regionList.map((r) => {
            const val = r[product.name] || r[product.category] || "0万";
            return { region: r.region, value: val };
          });
          const topRegion = regionData[0];
          if (topRegion) {
            items.push({
              title: `${product.name}区域分布`,
              text: `${product.name}在各区域中，${topRegion.region}收入最高（${topRegion.value}），${regionData[regionData.length - 1].region}最低（${regionData[regionData.length - 1].value}）。建议在低收入区域加大推广力度。`,
            });
          }
        }
      }
    }

    /* 区域维度分析 */
    if (aiRegion !== "全国" && matchedRegions.length > 0) {
      const regionRow = matchedRegions[0];
      const regionTotal = regionRow.total;
      if (aiProduct === "all") {
        items.push({
          title: `${aiRegion}区域产品结构`,
          text: `${aiRegion}合计收入${regionTotal}。各品类收入分布：${Object.entries(regionRow).filter(([k]) => k !== "region" && k !== "total").map(([k, v]) => `${k} ${v}`).join("，")}。建议关注占比偏低的品类，挖掘增长空间。`,
        });
      }
    }

    return items.length > 0 ? items : aiItems;
  })();

  return (
    <div className="space-y-5">
      {/* AI 智能分析 — 两个下拉 + 按钮 */}
      <div className="mb-1">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #faf5ff 0%, #f0e7ff 40%, #e8f0ff 100%)",
            border: "1px solid #e9d5ff",
          }}
        >
          {/* 标题行 */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">AI 智能分析</h2>
            <span className="text-xs text-gray-400 font-normal ml-1">| 选择产品与区域，让 AI 解读产品数据</span>
          </div>

          {/* 两个下拉选择器 + 分析按钮 */}
          <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium shrink-0">产品</span>
              <Select value={aiProduct} onValueChange={(v) => { setAiProduct(v); setAiTriggered(false); }}>
                <SelectTrigger className="w-[160px] h-8 text-xs bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiProductOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium shrink-0">区域</span>
              <Select value={aiRegion} onValueChange={(v) => { setAiRegion(v); setAiTriggered(false); }}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiRegionOptions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => setAiTriggered(true)}
              className="flex items-center gap-1 h-8 px-4 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              开始分析
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 分割线 */}
          <div className="mx-5 border-t border-purple-100/60" />

          {/* 分析结果：统一默认第一条 + 苹果式展开 */}
          {!aiTriggered ? (
            <div className="flex items-center justify-center py-6 text-sm text-gray-400 nk-stagger">
              请选择维度后点击「开始分析」
            </div>
          ) : (
            <AiResultList items={aiAnalysisItems} />
          )}
        </div>
      </div>

      {renderView()}
    </div>
  );
};

export default ProductSegmentation;
