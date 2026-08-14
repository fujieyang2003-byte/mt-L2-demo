import React, { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import PageHeader from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Sparkles,
  Wallet,
  Clock3,
  Target,
  Calculator,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  Edit3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
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

const getStatus = (rate) => {
  if (rate >= 100) return { label: "已达成", className: "bg-emerald-50 text-emerald-600" };
  if (rate >= 80) return { label: "进行中", className: "bg-blue-50 text-[#4080FF]" };
  return { label: "预警", className: "bg-red-50 text-red-500" };
};

const StatusBadge = ({ rate }) => {
  const status = getStatus(rate);
  return <Badge className={`border-none font-normal ${status.className}`}>{status.label}</Badge>;
};

const STATUS_CONFIG = {
  已发放: { className: "bg-emerald-50 text-emerald-600" },
  待发放: { className: "bg-blue-50 text-[#4080FF]" },
  计算中: { className: "bg-amber-50 text-amber-600" },
};

const PayStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { className: "bg-gray-100 text-gray-500" };
  return <Badge className={`border-none font-normal ${cfg.className}`}>{status}</Badge>;
};

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
            <p className="leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

const TABS = [
  { value: "goal", label: "目标管理", icon: Target },
  { value: "incentive", label: "激励测算", icon: Calculator },
];

const VIEW_OPTIONS = [
  { value: "platform_admin", label: "平台管理员视角" },
  { value: "biz_manager", label: "广告业务经理视角" },
  { value: "partner", label: "合作商视角" },
  { value: "bd", label: "BD/运营视角" },
];

const BIZ_LINE_TABS = [
  { value: "waimai", label: "外卖" },
  { value: "daocan", label: "到餐" },
];

/* ================================================================== */
/* 目标管理 - 平台管理员数据（含分润、下钻）                            */
/* ================================================================== */

const goalAdminSummary = {
  waimai: { totalTarget: "6,380万", totalAchieved: "5,441万", rate: 85, gap: "939万", dailyNeeded: "47万" },
  daocan: { totalTarget: "4,000万", totalAchieved: "3,020万", rate: 76, gap: "980万", dailyNeeded: "49万" },
};

const goalAdminRegionRows = {
  waimai: [
    { region: "华东区", target: "1,800万", achieved: "1,620万", rate: 90, gap: "180万", dailyNeeded: "9万", profitBase: "1,620万", profitRate: "1.8%", profitAmount: "29.2万", yoy: "+12.4%" },
    { region: "华南区", target: "1,400万", achieved: "1,330万", rate: 95, gap: "70万", dailyNeeded: "3.5万", profitBase: "1,330万", profitRate: "1.8%", profitAmount: "23.9万", yoy: "+8.1%" },
    { region: "华北区", target: "1,200万", achieved: "888万", rate: 74, gap: "312万", dailyNeeded: "15.6万", profitBase: "888万", profitRate: "1.2%", profitAmount: "10.7万", yoy: "-3.6%" },
    { region: "西南区", target: "1,200万", achieved: "1,164万", rate: 97, gap: "36万", dailyNeeded: "1.8万", profitBase: "1,164万", profitRate: "1.8%", profitAmount: "21.0万", yoy: "+15.2%" },
    { region: "东北区", target: "780万", achieved: "439万", rate: 56, gap: "341万", dailyNeeded: "17.1万", profitBase: "439万", profitRate: "1.0%", profitAmount: "4.4万", yoy: "-8.3%" },
  ],
  daocan: [
    { region: "华东区", target: "1,400万", achieved: "1,292万", rate: 92, gap: "108万", dailyNeeded: "5.4万", profitBase: "1,292万", profitRate: "1.6%", profitAmount: "20.7万", yoy: "+10.1%" },
    { region: "华南区", target: "1,200万", achieved: "1,140万", rate: 95, gap: "60万", dailyNeeded: "3万", profitBase: "1,140万", profitRate: "1.6%", profitAmount: "18.2万", yoy: "+6.5%" },
    { region: "华北区", target: "900万", achieved: "666万", rate: 74, gap: "234万", dailyNeeded: "11.7万", profitBase: "666万", profitRate: "1.0%", profitAmount: "6.7万", yoy: "-5.2%" },
    { region: "西南区", target: "300万", achieved: "291万", rate: 97, gap: "9万", dailyNeeded: "0.5万", profitBase: "291万", profitRate: "1.6%", profitAmount: "4.7万", yoy: "+9.8%" },
    { region: "东北区", target: "200万", achievable: "—", achieved: "131万", rate: 66, gap: "69万", dailyNeeded: "3.5万", profitBase: "131万", profitRate: "0.8%", profitAmount: "1.0万", yoy: "-12.1%" },
  ],
};

// 下钻：区域 → 城市 → 合作商
const drillDownData = {
  waimai: {
    "华东区": [
      { city: "上海", partner: "上海总商A", target: "600万", achieved: "540万", rate: 90, profitAmount: "9.7万" },
      { city: "杭州", partner: "杭州总商B", target: "500万", achieved: "480万", rate: 96, profitAmount: "8.6万" },
      { city: "南京", partner: "南京总商C", target: "400万", achieved: "360万", rate: 90, profitAmount: "6.5万" },
      { city: "苏州", partner: "苏州总商D", target: "300万", achieved: "240万", rate: 80, profitAmount: "4.3万" },
    ],
    "华南区": [
      { city: "广州", partner: "广州总商E", target: "500万", achieved: "490万", rate: 98, profitAmount: "8.8万" },
      { city: "深圳", partner: "深圳总商F", target: "500万", achieved: "450万", rate: 90, profitAmount: "8.1万" },
      { city: "厦门", partner: "厦门总商G", target: "400万", achieved: "390万", rate: 98, profitAmount: "7.0万" },
    ],
    "华北区": [
      { city: "北京", partner: "北京总商H", target: "500万", achieved: "380万", rate: 76, profitAmount: "4.6万" },
      { city: "天津", partner: "天津总商I", target: "400万", achieved: "280万", rate: 70, profitAmount: "3.4万" },
      { city: "石家庄", partner: "石家庄总商J", target: "300万", achieved: "228万", rate: 76, profitAmount: "2.7万" },
    ],
    "西南区": [
      { city: "成都", partner: "成都总商K", target: "500万", achieved: "490万", rate: 98, profitAmount: "8.8万" },
      { city: "重庆", partner: "重庆总商L", target: "400万", achieved: "384万", rate: 96, profitAmount: "6.9万" },
      { city: "昆明", partner: "昆明总商M", target: "300万", achieved: "290万", rate: 97, profitAmount: "5.2万" },
    ],
    "东北区": [
      { city: "沈阳", partner: "沈阳总商N", target: "300万", achieved: "180万", rate: 60, profitAmount: "1.8万" },
      { city: "大连", partner: "大连总商O", target: "280万", achievable: "—", achieved: "160万", rate: 57, profitAmount: "1.6万" },
      { city: "长春", partner: "长春总商P", target: "200万", achieved: "99万", rate: 50, profitAmount: "1.0万" },
    ],
  },
  daocan: {
    "华东区": [
      { city: "上海", partner: "上海餐联A", target: "500万", achieved: "470万", rate: 94, profitAmount: "7.5万" },
      { city: "杭州", partner: "杭州餐联B", target: "500万", achieved: "450万", rate: 90, profitAmount: "7.2万" },
      { city: "南京", partner: "南京餐联C", target: "400万", achieved: "372万", rate: 93, profitAmount: "6.0万" },
    ],
    "华南区": [
      { city: "广州", partner: "广州餐联D", target: "500万", achieved: "480万", rate: 96, profitAmount: "7.7万" },
      { city: "深圳", partner: "深圳餐联E", target: "400万", achieved: "380万", rate: 95, profitAmount: "6.1万" },
      { city: "厦门", partner: "厦门餐联F", target: "300万", achieved: "280万", rate: 93, profitAmount: "4.4万" },
    ],
    "华北区": [
      { city: "北京", partner: "北京餐联G", target: "400万", achieved: "290万", rate: 73, profitAmount: "2.9万" },
      { city: "天津", partner: "天津餐联H", target: "300万", achieved: "210万", rate: 70, profitAmount: "2.1万" },
      { city: "石家庄", partner: "石家庄餐联I", target: "200万", achieved: "166万", rate: 83, profitAmount: "1.7万" },
    ],
    "西南区": [
      { city: "成都", partner: "成都餐联J", target: "200万", achieved: "195万", rate: 98, profitAmount: "3.1万" },
      { city: "重庆", partner: "重庆餐联K", target: "100万", achieved: "96万", rate: 96, profitAmount: "1.6万" },
    ],
    "东北区": [
      { city: "沈阳", partner: "沈阳餐联L", target: "100万", achieved: "68万", rate: 68, profitAmount: "0.5万" },
      { city: "大连", partner: "大连餐联M", target: "60万", achieved: "38万", rate: 63, profitAmount: "0.3万" },
      { city: "长春", partner: "长春餐联N", target: "40万", achieved: "25万", rate: 63, profitAmount: "0.2万" },
    ],
  },
};

const goalAdminDiagnosis = {
  waimai: [
    "华北区达成率74%低于预警线，剩余缺口312万，建议本周安排专项会议跟进，重点推动北京和天津的尾部城市冲刺",
    "东北区达成率仅56%，远低于全国均值，预计月底达成率约65%，存在严重风险，建议紧急调配资源支持",
    "整体达成率预计月底可达85%，需集中力量攻坚华北和东北两个薄弱区域，预计还需日均47万才能完成目标",
    "西南区达成率97%表现优异，可将其成功经验（商户拜访SOP+CPS推广活动）复制到华北区",
  ],
  daocan: [
    "到餐业务整体达成率76%，低于外卖线，主要拖累来自华北区（74%）和东北区（66%）",
    "华东区和华南区达成率超90%，是到餐收入的主要贡献区域，建议保持当前策略",
    "东北区到餐业务达成率66%为全国最低，建议排查合作商执行力和商户覆盖情况",
    "按当前进度，到餐线月底预计达成率约80%，缺口约980万，建议加大腰部城市的新签商户拓展力度",
  ],
};

/* ================================================================== */
/* 激励测算 - 平台管理员数据（含分润计算结果）                          */
/* ================================================================== */

const incAdminSummary = {
  waimai: { totalBudget: "1,100万", totalPaid: "890万", totalRemaining: "210万", rate: 81 },
  daocan: { totalBudget: "600万", totalPaid: "450万", totalRemaining: "150万", rate: 75 },
};

const incAdminRegionRows = {
  waimai: [
    { region: "华东区", budget: "300万", paid: "280万", remaining: "20万", rate: 93, profitBase: "1,620万", achRate: "90%", profitRatio: "1.8%", profitAmount: "29.2万", status: "已发放" },
    { region: "华南区", budget: "240万", paid: "220万", remaining: "20万", rate: 92, profitBase: "1,330万", achRate: "95%", profitRatio: "1.8%", profitAmount: "23.9万", status: "已发放" },
    { region: "华北区", budget: "200万", paid: "130万", remaining: "70万", rate: 65, profitBase: "888万", achRate: "74%", profitRatio: "1.2%", profitAmount: "10.7万", status: "待发放" },
    { region: "西南区", budget: "200万", paid: "180万", remaining: "20万", rate: 90, profitBase: "1,164万", achRate: "97%", profitRatio: "1.8%", profitAmount: "21.0万", status: "已发放" },
    { region: "东北区", budget: "160万", paid: "80万", remaining: "80万", rate: 50, profitBase: "439万", achRate: "56%", profitRatio: "1.0%", profitAmount: "4.4万", status: "计算中" },
  ],
  daocan: [
    { region: "华东区", budget: "200万", paid: "170万", remaining: "30万", rate: 85, profitBase: "1,292万", achRate: "92%", profitRatio: "1.6%", profitAmount: "20.7万", status: "已发放" },
    { region: "华南区", budget: "160万", paid: "140万", remaining: "20万", rate: 88, profitBase: "1,140万", achRate: "95%", profitRatio: "1.6%", profitAmount: "18.2万", status: "已发放" },
    { region: "华北区", budget: "120万", paid: "70万", remaining: "50万", rate: 58, profitBase: "666万", achRate: "74%", profitRatio: "1.0%", profitAmount: "6.7万", status: "待发放" },
    { region: "西南区", budget: "60万", paid: "45万", remaining: "15万", rate: 75, profitBase: "291万", achRate: "97%", profitRatio: "1.6%", profitAmount: "4.7万", status: "计算中" },
    { region: "东北区", budget: "60万", paid: "25万", remaining: "35万", rate: 42, profitBase: "131万", achRate: "66%", profitRatio: "0.8%", profitAmount: "1.0万", status: "计算中" },
  ],
};

const incAdminDiagnosis = {
  waimai: [
    "华南区激励发放率92%为全国最高，激励驱动效果显著，建议将其激励方案作为标杆推广",
    "华北区剩余激励预算较多（70万），建议加大激励发放节奏推动月底冲刺，优先向达成率74%的合作商倾斜",
    "东北区激励发放率仅50%，配合其达成率56%的情况，建议核查激励方案是否合理，必要时调整激励系数",
    "整体激励发放率81%，预计月底可达90%以上，外卖线分润总额预计89.2万",
  ],
  daocan: [
    "到餐线激励发放率75%，低于外卖线，主要拖累来自华北区（58%）和东北区（42%）",
    "华东区和华南区发放率超85%，激励使用效率较高，分润已全额发放",
    "到餐线分润总额预计51.3万，其中华东区占比40%贡献最大",
    "建议对到餐线达成率低于70%的区域暂缓发放激励，待业绩改善后补发",
  ],
};

/* ================================================================== */
/* 目标管理 - 其他角色数据（保持不变）                                   */
/* ================================================================== */

const goalBizManagerRows = [
  { city: "上海", line: "信息流广告", target: "580万", achieved: "552万", rate: 95 },
  { city: "北京", line: "搜索广告", target: "620万", achieved: "497万", rate: 80 },
  { city: "广州", line: "信息流广告", target: "420万", achieved: "441万", rate: 105 },
  { city: "深圳", line: "品牌广告", target: "460万", achieved: "331万", rate: 72 },
  { city: "杭州", line: "搜索广告", target: "350万", achieved: "329万", rate: 94 },
  { city: "成都", line: "信息流广告", target: "280万", achieved: "291万", rate: 104 },
];

const goalBizManagerDiagnosis = [
  "上海外卖广告达成率103%表现突出，可复制经验到其他城市",
  "武汉达成率72%偏低，建议增加商户拜访频次并配合CPS推广活动",
  "整体6个城市中4个达成率超80%，需集中资源攻坚剩余2个城市",
];

const goalPartnerRows = [
  { city: "武汉", targetMerchant: 320, opened: 296, target: "180万", achieved: "165万", rate: 92 },
  { city: "南京", targetMerchant: 260, opened: 198, target: "150万", achieved: "108万", rate: 72 },
  { city: "西安", targetMerchant: 210, opened: 215, target: "120万", achieved: "128万", rate: 107 },
  { city: "重庆", targetMerchant: 280, opened: 231, target: "160万", achieved: "142万", rate: 89 },
];

const goalPartnerDiagnosis = [
  "成都目标商户开通率较低（58/80），建议加大地推力度",
  "北京和上海达成率均超90%，执行节奏良好，保持当前策略即可",
];

const goalBdStoreRows = [
  { store: "望京旗舰店", type: "信息流广告", target: "12万", achieved: "12.6万", rate: 105 },
  { store: "国贸店", type: "搜索广告", target: "9万", achieved: "8.1万", rate: 90 },
  { store: "三里屯店", type: "品牌广告", target: "15万", achieved: "10.4万", rate: 69 },
  { store: "西单店", type: "信息流广告", target: "8万", achieved: "7.9万", rate: 99 },
  { store: "中关村店", type: "搜索广告", target: "10万", achieved: "10.5万", rate: 105 },
  { store: "亦庄店", type: "信息流广告", target: "6万", achieved: "4.2万", rate: 70 },
  { store: "回龙观店", type: "品牌广告", target: "7万", achieved: "6.3万", rate: 90 },
  { store: "通州店", type: "搜索广告", target: "5万", achieved: "5.4万", rate: 108 },
];

const goalBdDiagnosis = [
  "你负责的8家门店中6家已达标，个人达成率89%处于团队前列",
  "望京店和回龙观店达成率低于80%，建议本周优先拜访并推荐CPC引流产品",
];

/* ================================================================== */
/* 激励测算 - 其他角色数据（保持不变）                                   */
/* ================================================================== */

const incBizManagerRows = [
  { city: "上海", budget: "58万", paid: "52.4万", pending: "5.6万", rate: 90 },
  { city: "北京", budget: "62万", paid: "49.7万", pending: "12.3万", rate: 80 },
  { city: "广州", budget: "42万", paid: "44.1万", pending: "0万", rate: 105 },
  { city: "深圳", budget: "46万", paid: "33.1万", pending: "12.9万", rate: 72 },
  { city: "杭州", budget: "35万", paid: "32.9万", pending: "2.1万", rate: 94 },
  { city: "成都", budget: "28万", paid: "29.1万", pending: "0万", rate: 104 },
];

const incBizManagerDiagnosis = [
  "广州和杭州发放率超90%，激励使用效率较高",
  "武汉发放率偏低（68%），建议核查是否存在激励审批卡点",
  "建议将剩余激励预算优先分配给达成率较低但潜力大的城市",
];

const incPartnerRows = [
  { name: "王磊", mis: "wanglei01", achieved: "165万", rate: "1.8%", incentive: "2.97万", paid: "2.97万", status: "已发放" },
  { name: "李娜", mis: "lina02", achieved: "108万", rate: "1.6%", incentive: "1.73万", paid: "0万", status: "待发放" },
  { name: "张伟", mis: "zhangwei03", achieved: "128万", rate: "1.9%", incentive: "2.43万", paid: "0万", status: "计算中" },
  { name: "刘洋", mis: "liuyang04", achieved: "142万", rate: "1.7%", incentive: "2.41万", paid: "2.41万", status: "已发放" },
  { name: "陈静", mis: "chenjing05", achieved: "96万", rate: "1.5%", incentive: "1.44万", paid: "0万", status: "待发放" },
];

const incPartnerDiagnosis = [
  "张三和李四激励已全额发放，团队执行力强",
  "王五激励系数较低（0.8），建议关注其门店达成情况，协助提升业绩",
];

const incBdStoreRows = [
  { store: "望京旗舰店", achieved: "12.6万", contribution: 22, incentive: "0.63万" },
  { store: "国贸店", achieved: "8.1万", contribution: 14, incentive: "0.41万" },
  { store: "三里屯店", achieved: "10.4万", contribution: 18, incentive: "0.52万" },
  { store: "西单店", achieved: "7.9万", contribution: 14, incentive: "0.40万" },
  { store: "中关村店", achieved: "10.5万", contribution: 18, incentive: "0.53万" },
  { store: "亦庄店", achieved: "8.2万", contribution: 14, incentive: "0.41万" },
];

const incBdDiagnosis = [
  "本月应得激励¥8,650，已到账¥6,200（72%），剩余¥2,450预计月底发放",
  "朝阳区烤鱼店贡献最高（占比22%），是你的核心门店，建议重点维护续约",
];

/* ================================================================== */
/* 汇总卡片组件                                                        */
/* ================================================================== */

const SummaryCard = ({ label, value, sub, icon: Icon, color, bg }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="pt-5 pb-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        </div>
      </div>
    </CardContent>
  </Card>
);

/* ================================================================== */
/* 目标管理 - 平台管理员视图（完整版）                                   */
/* ================================================================== */

const GoalHeadquarterView = () => {
  const [bizLine, setBizLine] = useState("waimai");
  const [month, setMonth] = useState("2025-08");
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [showMaintain, setShowMaintain] = useState(false);

  const summary = goalAdminSummary[bizLine];
  const rows = goalAdminRegionRows[bizLine];
  const drillData = drillDownData[bizLine] || {};
  const aiItems = goalAdminDiagnosis[bizLine];

  const totalProfit = rows.reduce((s, r) => s + parseAmount(r.profitAmount), 0);

  return (
    <div className="space-y-4">
      {/* 顶部：汇总目标卡片 + 业务线切换 + 月份选择器 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {BIZ_LINE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setBizLine(tab.value); setExpandedRegion(null); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                bizLine === tab.value ? "bg-white text-[#4080FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-40 h-9">
            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-08">2025年8月</SelectItem>
            <SelectItem value="2025-07">2025年7月</SelectItem>
            <SelectItem value="2025-06">2025年6月</SelectItem>
            <SelectItem value="2025-05">2025年5月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard label="总目标值" value={summary.totalTarget} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成值" value={summary.totalAchieved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="整体达成率" value={`${summary.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={summary.rate >= 90 ? "正常" : summary.rate >= 80 ? "有风险" : "严重滞后"} />
        <SummaryCard label="剩余缺口" value={summary.gap} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="日均需完成" value={summary.dailyNeeded} icon={TrendingUp} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* 中部：区域目标达成表格（带分润列 + 下钻） */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">全国各区域目标达成明细</p>
            <span className="text-xs text-gray-400">点击区域行可下钻至城市/合作商</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>大区</TableHead>
                <TableHead>目标收入</TableHead>
                <TableHead>实际完成</TableHead>
                <TableHead className="w-40">达成率</TableHead>
                <TableHead>剩余缺口</TableHead>
                <TableHead>日均需完成</TableHead>
                <TableHead>YoY</TableHead>
                <TableHead>分润基数</TableHead>
                <TableHead>分润比例</TableHead>
                <TableHead>分润金额</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isExpanded = expandedRegion === row.region;
                const hasDrill = drillData[row.region];
                return (
                  <React.Fragment key={row.region}>
                    <TableRow
                      className={hasDrill ? "cursor-pointer hover:bg-blue-50/30" : ""}
                      onClick={() => hasDrill && setExpandedRegion(isExpanded ? null : row.region)}
                    >
                      <TableCell className="w-8">
                        {hasDrill && (
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">{row.region}</TableCell>
                      <TableCell>{row.target}</TableCell>
                      <TableCell>{row.achieved}</TableCell>
                      <TableCell><RateProgress rate={row.rate} /></TableCell>
                      <TableCell className="text-red-500">{row.gap}</TableCell>
                      <TableCell>{row.dailyNeeded}</TableCell>
                      <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                        {row.yoy.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                        {row.yoy}
                      </TableCell>
                      <TableCell className="text-gray-600">{row.profitBase}</TableCell>
                      <TableCell className="text-gray-600">{row.profitRate}</TableCell>
                      <TableCell className="text-[#4080FF] font-medium">{row.profitAmount}</TableCell>
                      <TableCell><StatusBadge rate={row.rate} /></TableCell>
                    </TableRow>
                    {isExpanded && hasDrill && (
                      <TableRow className="bg-gray-50/50">
                        <TableCell colSpan={12} className="py-3 px-8">
                          <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 border-b border-gray-100">
                              {row.region} → 城市明细（下钻至合作商）
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>城市</TableHead>
                                  <TableHead>合作商</TableHead>
                                  <TableHead>目标收入</TableHead>
                                  <TableHead>实际完成</TableHead>
                                  <TableHead className="w-40">达成率</TableHead>
                                  <TableHead>分润金额</TableHead>
                                  <TableHead>状态</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {drillData[row.region].map((item) => (
                                  <TableRow key={item.city}>
                                    <TableCell className="font-medium text-gray-800">{item.city}</TableCell>
                                    <TableCell className="text-gray-600">{item.partner}</TableCell>
                                    <TableCell>{item.target}</TableCell>
                                    <TableCell>{item.achieved}</TableCell>
                                    <TableCell><RateProgress rate={item.rate} /></TableCell>
                                    <TableCell className="text-[#4080FF] font-medium">{item.profitAmount}</TableCell>
                                    <TableCell><StatusBadge rate={item.rate} /></TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell />
                <TableCell className="font-semibold text-gray-900">全国合计</TableCell>
                <TableCell className="font-semibold text-gray-900">{summary.totalTarget}</TableCell>
                <TableCell className="font-semibold text-gray-900">{summary.totalAchieved}</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{summary.rate}%</TableCell>
                <TableCell className="font-semibold text-red-500">{summary.gap}</TableCell>
                <TableCell className="font-semibold text-gray-900">{summary.dailyNeeded}</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="font-semibold text-gray-900">合计</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(1)}万</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* 底部：目标维护操作区 */}
      <Collapsible open={showMaintain} onOpenChange={setShowMaintain}>
        <Card className="border-none shadow-sm bg-white">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-5 cursor-pointer">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#4080FF]" />
                <span className="text-base font-semibold text-gray-900">目标维护操作区</span>
                <span className="text-xs text-gray-400">编辑目标值、调整分润配置、批量导入/导出</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMaintain ? "rotate-180" : ""}`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* 编辑目标值 */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">编辑各区域月度目标值</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {rows.map((row) => (
                      <div key={row.region} className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">{row.region}</label>
                        <div className="flex items-center gap-1">
                          <Input defaultValue={row.target.replace("万", "")} className="h-8 text-sm" />
                          <span className="text-xs text-gray-400 shrink-0">万</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 分润配置 */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">分润配置参数</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">基准达成率</label>
                      <div className="flex items-center gap-1">
                        <Input defaultValue="80" className="h-8 text-sm" />
                        <span className="text-xs text-gray-400 shrink-0">%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">基准分润比例</label>
                      <div className="flex items-center gap-1">
                        <Input defaultValue="1.0" className="h-8 text-sm" />
                        <span className="text-xs text-gray-400 shrink-0">%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">超额加成系数</label>
                      <div className="flex items-center gap-1">
                        <Input defaultValue="0.2" className="h-8 text-sm" />
                        <span className="text-xs text-gray-400 shrink-0">%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500">未达成扣减系数</label>
                      <div className="flex items-center gap-1">
                        <Input defaultValue="0.1" className="h-8 text-sm" />
                        <span className="text-xs text-gray-400 shrink-0">%</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 操作按钮 */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button className="bg-[#4080FF] hover:bg-[#3070EE] text-white">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> 保存目标配置
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-1" /> 批量导入目标
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-1" /> 导出分润明细
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* AI 智能分析 */}
      <AiDiagnosisCard items={aiItems} />
    </div>
  );
};

/* ================================================================== */
/* 目标管理 - 其他角色视图（保持不变）                                   */
/* ================================================================== */

const GoalBizManagerView = () => (
  <div className="space-y-4">
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <p className="text-base font-semibold text-gray-900 mb-4">各城市目标达成情况</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>城市</TableHead>
              <TableHead>业务线</TableHead>
              <TableHead>月度目标</TableHead>
              <TableHead>当前达成</TableHead>
              <TableHead className="w-52">达成率</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalBizManagerRows.map((row) => (
              <TableRow key={row.city}>
                <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                <TableCell>{row.line}</TableCell>
                <TableCell>{row.target}</TableCell>
                <TableCell>{row.achieved}</TableCell>
                <TableCell><RateProgress rate={row.rate} /></TableCell>
                <TableCell><StatusBadge rate={row.rate} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <AiDiagnosisCard items={goalBizManagerDiagnosis} />
  </div>
);

const GoalPartnerView = () => (
  <div className="space-y-4">
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <p className="text-base font-semibold text-gray-900 mb-4">各城市目标情况</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>城市</TableHead>
              <TableHead>目标商户数</TableHead>
              <TableHead>已开通</TableHead>
              <TableHead>目标收入</TableHead>
              <TableHead>达成收入</TableHead>
              <TableHead className="w-52">达成率</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goalPartnerRows.map((row) => (
              <TableRow key={row.city}>
                <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                <TableCell>{row.targetMerchant}</TableCell>
                <TableCell>{row.opened}</TableCell>
                <TableCell>{row.target}</TableCell>
                <TableCell>{row.achieved}</TableCell>
                <TableCell><RateProgress rate={row.rate} /></TableCell>
                <TableCell><StatusBadge rate={row.rate} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <AiDiagnosisCard items={goalPartnerDiagnosis} />
  </div>
);

const GoalBdView = () => {
  const total = goalBdStoreRows.length;
  const achievedCount = goalBdStoreRows.filter((row) => row.rate >= 100).length;
  const notAchievedCount = total - achievedCount;
  const overallRate = (goalBdStoreRows.reduce((sum, row) => sum + row.rate, 0) / total).toFixed(1);
  const summaryCards = [
    { label: "总门店", value: `${total}`, icon: Store },
    { label: "已达标", value: `${achievedCount}`, icon: CheckCircle2 },
    { label: "未达标", value: `${notAchievedCount}`, icon: AlertTriangle },
    { label: "个人达成率", value: `${overallRate}%`, icon: Gauge },
  ];
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((item) => (
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
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">门店目标达成情况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>门店名</TableHead>
                <TableHead>产品类型</TableHead>
                <TableHead>月度目标</TableHead>
                <TableHead>当前达成</TableHead>
                <TableHead className="w-52">达成率</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goalBdStoreRows.map((row) => (
                <TableRow key={row.store}>
                  <TableCell className="font-medium text-gray-800">{row.store}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell>{row.achieved}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                  <TableCell><StatusBadge rate={row.rate} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AiDiagnosisCard items={goalBdDiagnosis} />
    </>
  );
};

/* ================================================================== */
/* 激励测算 - 平台管理员视图（完整版）                                   */
/* ================================================================== */

const IncHeadquarterView = () => {
  const [bizLine, setBizLine] = useState("waimai");
  const summary = incAdminSummary[bizLine];
  const rows = incAdminRegionRows[bizLine];
  const aiItems = incAdminDiagnosis[bizLine];

  const totalBudget = rows.reduce((s, r) => s + parseAmount(r.budget), 0);
  const totalPaid = rows.reduce((s, r) => s + parseAmount(r.paid), 0);
  const totalProfit = rows.reduce((s, r) => s + parseAmount(r.profitAmount), 0);

  return (
    <div className="space-y-4">
      {/* 业务线切换 */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {BIZ_LINE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setBizLine(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              bizLine === tab.value ? "bg-white text-[#4080FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="激励预算总额" value={summary.totalBudget} icon={Wallet} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="已发放" value={summary.totalPaid} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="剩余预算" value={summary.totalRemaining} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="整体发放率" value={`${summary.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" />
      </div>

      {/* 各区域激励发放 + 分润计算结果 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">全国各区域激励发放及分润计算</p>
            <Button variant="outline" className="h-8 text-sm">
              <Download className="w-3.5 h-3.5 mr-1" /> 导出分润明细
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>大区</TableHead>
                <TableHead>激励预算</TableHead>
                <TableHead>已发放</TableHead>
                <TableHead>剩余</TableHead>
                <TableHead className="w-40">发放率</TableHead>
                <TableHead>分润基数</TableHead>
                <TableHead>达成率</TableHead>
                <TableHead>分润比例</TableHead>
                <TableHead>分润金额</TableHead>
                <TableHead>发放状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.region}>
                  <TableCell className="font-medium text-gray-800">{row.region}</TableCell>
                  <TableCell>{row.budget}</TableCell>
                  <TableCell>{row.paid}</TableCell>
                  <TableCell className="text-amber-600">{row.remaining}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                  <TableCell className="text-gray-600">{row.profitBase}</TableCell>
                  <TableCell className="text-gray-600">{row.achRate}</TableCell>
                  <TableCell className="text-gray-600">{row.profitRatio}</TableCell>
                  <TableCell className="text-[#4080FF] font-medium">{row.profitAmount}</TableCell>
                  <TableCell><PayStatusBadge status={row.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold text-gray-900">全国合计</TableCell>
                <TableCell className="font-semibold text-gray-900">{totalBudget.toFixed(0)}万</TableCell>
                <TableCell className="font-semibold text-gray-900">{totalPaid.toFixed(0)}万</TableCell>
                <TableCell className="font-semibold text-gray-900">{(totalBudget - totalPaid).toFixed(0)}万</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{summary.rate}%</TableCell>
                <TableCell />
                <TableCell />
                <TableCell className="font-semibold text-gray-900">合计</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(1)}万</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <AiDiagnosisCard items={aiItems} />
    </div>
  );
};

/* ================================================================== */
/* 激励测算 - 其他角色视图（保持不变）                                   */
/* ================================================================== */

const IncBizManagerView = () => {
  const totals = useMemo(() => {
    const budget = incBizManagerRows.reduce((s, r) => s + parseAmount(r.budget), 0);
    const paid = incBizManagerRows.reduce((s, r) => s + parseAmount(r.paid), 0);
    const pending = incBizManagerRows.reduce((s, r) => s + parseAmount(r.pending), 0);
    return { budget, paid, pending, rate: budget ? Math.round((paid / budget) * 100) : 0 };
  }, []);
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">各城市激励发放情况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>城市</TableHead>
                <TableHead>激励预算</TableHead>
                <TableHead>已发放</TableHead>
                <TableHead>待发放</TableHead>
                <TableHead className="w-52">发放率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incBizManagerRows.map((row) => (
                <TableRow key={row.city}>
                  <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                  <TableCell>{row.budget}</TableCell>
                  <TableCell>{row.paid}</TableCell>
                  <TableCell>{row.pending}</TableCell>
                  <TableCell><RateProgress rate={row.rate} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold text-gray-900">合计</TableCell>
                <TableCell className="font-semibold text-gray-900">{totals.budget.toFixed(1)}万</TableCell>
                <TableCell className="font-semibold text-gray-900">{totals.paid.toFixed(1)}万</TableCell>
                <TableCell className="font-semibold text-gray-900">{totals.pending.toFixed(1)}万</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{totals.rate}%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      <AiDiagnosisCard items={incBizManagerDiagnosis} />
    </div>
  );
};

const IncPartnerView = () => {
  const totalIncentive = useMemo(() => incPartnerRows.reduce((s, r) => s + parseAmount(r.incentive), 0), []);
  const totalPaid = useMemo(() => incPartnerRows.reduce((s, r) => s + parseAmount(r.paid), 0), []);
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">团队激励明细</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>MIS</TableHead>
                <TableHead>达成收入</TableHead>
                <TableHead>激励系数</TableHead>
                <TableHead>应发激励</TableHead>
                <TableHead>已发放</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incPartnerRows.map((row) => (
                <TableRow key={row.mis}>
                  <TableCell className="font-medium text-gray-800">{row.name}</TableCell>
                  <TableCell className="text-gray-500">{row.mis}</TableCell>
                  <TableCell>{row.achieved}</TableCell>
                  <TableCell>{row.rate}</TableCell>
                  <TableCell className="text-[#4080FF] font-medium">{row.incentive}</TableCell>
                  <TableCell>{row.paid}</TableCell>
                  <TableCell><PayStatusBadge status={row.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold text-gray-900">合计</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{totalIncentive.toFixed(2)}万</TableCell>
                <TableCell className="font-semibold text-gray-900">{totalPaid.toFixed(2)}万</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      <AiDiagnosisCard items={incPartnerDiagnosis} />
    </div>
  );
};

const IncBdView = () => {
  const totalIncentive = useMemo(() => incBdStoreRows.reduce((s, r) => s + parseAmount(r.incentive), 0), []);
  const summaryCards = [
    { label: "本月应得激励", value: `¥${totalIncentive.toFixed(2)}万`, icon: Wallet },
    { label: "已到账", value: "¥1.85万", icon: CheckCircle2 },
    { label: "待发放", value: `¥${(totalIncentive - 1.85).toFixed(2)}万`, icon: Clock3 },
  ];
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((item) => (
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
      <Card className="border-none shadow-sm bg-white mb-4">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">门店激励贡献明细</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>门店名</TableHead>
                <TableHead>达成收入</TableHead>
                <TableHead>贡献占比</TableHead>
                <TableHead>对应激励</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incBdStoreRows.map((row) => (
                <TableRow key={row.store}>
                  <TableCell className="font-medium text-gray-800">{row.store}</TableCell>
                  <TableCell>{row.achieved}</TableCell>
                  <TableCell>{row.contribution}%</TableCell>
                  <TableCell className="text-[#4080FF] font-medium">{row.incentive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold text-gray-900">个人激励汇总</TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{totalIncentive.toFixed(2)}万</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      <AiDiagnosisCard items={incBdDiagnosis} />
    </>
  );
};

/* ================================================================== */
/* 视图映射                                                            */
/* ================================================================== */

const GOAL_VIEWS = {
  platform_admin: GoalHeadquarterView,
  biz_manager: GoalBizManagerView,
  partner: GoalPartnerView,
  bd: GoalBdView,
};

const INC_VIEWS = {
  platform_admin: IncHeadquarterView,
  biz_manager: IncBizManagerView,
  partner: IncPartnerView,
  bd: IncBdView,
};

const TAB_VIEWS = {
  goal: GOAL_VIEWS,
  incentive: INC_VIEWS,
};

/* ================================================================== */
/* 主组件                                                              */
/* ================================================================== */

const GoalIncentive = () => {
  const { currentUser } = useUser();
  const role = currentUser?.role;
  const [activeTab, setActiveTab] = useState("goal");
  const [adminView, setAdminView] = useState("platform_admin");

  const ViewComponent = useMemo(() => {
    const viewMap = TAB_VIEWS[activeTab];
    if (role === "platform_admin") {
      return viewMap[adminView] || viewMap.platform_admin;
    }
    return viewMap[role] || viewMap.bd;
  }, [role, adminView, activeTab]);

  const tabDescriptions = {
    goal: "制定与跟踪各区域广告业务经营目标",
    incentive: "根据业绩完成情况测算团队/区域激励金额",
  };

  return (
    <div>
      <PageHeader
        title="目标激励"
        description={tabDescriptions[activeTab]}
        extra={
          role === "platform_admin" ? (
            <Select value={adminView} onValueChange={setAdminView}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue placeholder="选择视角" />
              </SelectTrigger>
              <SelectContent>
                {VIEW_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
      />

      <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-white text-[#4080FF] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <ViewComponent />
    </div>
  );
};

export default GoalIncentive;
