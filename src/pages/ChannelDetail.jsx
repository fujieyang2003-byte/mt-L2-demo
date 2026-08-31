import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBizLine } from "@/contexts/BizLineContext";
import PageHeader from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Store,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Target,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Network,
  ExternalLink,
} from "lucide-react";
import AiAnalysisPanel from "@/components/AiAnalysisPanel";

/* ================================================================== */
/* 共享组件 & 工具                                                       */
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

const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

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
/* buildRow helper - auto-generates expanded fields                     */
/* mr ~ 15-25% of achieved, gtv ~ 5-8x of achieved.                     */
/* profitImprovement = (profitAmount / gtv * 100).toFixed(1) + "%"      */
/* ================================================================== */
const buildRow = (r) => {
  const achievedNum = parseAmount(r.achieved);
  const gtvNum = r.gtv ? parseAmount(r.gtv) : Math.round(achievedNum * (5 + Math.random() * 3));
  const profitNum = r.profitAmount ? parseAmount(r.profitAmount) : 0;
  const profitImprovement = profitNum > 0 ? (profitNum / gtvNum * 100).toFixed(1) + "%" : "—";
  const yoyVal = r.yoy || "+0.0%";
  const momVal = r.mom || (r.yoy ? `${yoyVal.startsWith("-") ? "-" : "+"}${(Math.abs(parseFloat(yoyVal)) * 0.3).toFixed(1)}%` : "+0.0%");
  const mrVal = r.mr || `${(15 + Math.random() * 10).toFixed(1)}%`;
  return {
    ...r,
    yoy: yoyVal,
    mom: momVal,
    mr: mrVal,
    mrRate: r.mrRate || `${75 + Math.floor(Math.random() * 25)}%`,
    mrYoy: r.mrYoy || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 3).toFixed(1)}pp`,
    mrMom: r.mrMom || `${Math.random() > 0.3 ? "+" : "-"}${(Math.random() * 2).toFixed(1)}pp`,
    penetration: r.penetration || `${60 + Math.floor(Math.random() * 30)}%`,
    arpu: r.arpu || `${(0.5 + Math.random() * 4.5).toFixed(2)}万`,
    gtv: `${gtvNum}万`,
    profitAmount: r.profitAmount || `${profitNum}万`,
    profitImprovement,
  };
};

/* ================================================================== */
/* Mock 数据 - 区域汇总                                                 */
/* ================================================================== */
const channelRegionRows = {
  waimai: [
    { region: "京津冀区域", partners: 12, cities: 4, target: "1,800万", achieved: "1,620万", rate: 90, gap: "180万", profitBase: "1,620万", profitRate: "1.8%", profitAmount: "29.2万", yoy: "+12.4%", monetization: "3.2%" },
    { region: "辽吉区域", partners: 6, cities: 3, target: "780万", achieved: "439万", rate: 56, gap: "341万", profitBase: "439万", profitRate: "1.0%", profitAmount: "4.4万", yoy: "-8.3%", monetization: "1.6%" },
    { region: "山东区域", partners: 8, cities: 3, target: "1,200万", achieved: "1,056万", rate: 88, gap: "144万", profitBase: "1,056万", profitRate: "1.5%", profitAmount: "15.8万", yoy: "+6.7%", monetization: "2.8%" },
    { region: "晋蒙区域", partners: 5, cities: 2, target: "500万", achieved: "445万", rate: 89, gap: "55万", profitBase: "445万", profitRate: "1.4%", profitAmount: "6.2万", yoy: "+4.2%", monetization: "2.5%" },
    { region: "陕宁区域", partners: 5, cities: 2, target: "480万", achieved: "408万", rate: 85, gap: "72万", profitBase: "408万", profitRate: "1.3%", profitAmount: "5.3万", yoy: "+2.1%", monetization: "2.3%" },
    { region: "甘青新区域", partners: 4, cities: 2, target: "360万", achieved: "281万", rate: 78, gap: "79万", profitBase: "281万", profitRate: "1.1%", profitAmount: "3.1万", yoy: "-1.5%", monetization: "1.9%" },
    { region: "黑龙江区域", partners: 4, cities: 2, target: "320万", achieved: "218万", rate: 68, gap: "102万", profitBase: "218万", profitRate: "1.0%", profitAmount: "2.2万", yoy: "-4.8%", monetization: "1.7%" },
    { region: "江苏区域", partners: 10, cities: 3, target: "1,400万", achieved: "1,330万", rate: 95, gap: "70万", profitBase: "1,330万", profitRate: "1.8%", profitAmount: "23.9万", yoy: "+8.1%", monetization: "3.5%" },
    { region: "浙江区域", partners: 9, cities: 3, target: "1,100万", achieved: "1,012万", rate: 92, gap: "88万", profitBase: "1,012万", profitRate: "1.7%", profitAmount: "17.2万", yoy: "+7.5%", monetization: "3.3%" },
    { region: "安徽区域", partners: 6, cities: 2, target: "600万", achieved: "552万", rate: 92, gap: "48万", profitBase: "552万", profitRate: "1.6%", profitAmount: "8.8万", yoy: "+5.8%", monetization: "3.0%" },
    { region: "河南区域", partners: 7, cities: 3, target: "800万", achieved: "712万", rate: 89, gap: "88万", profitBase: "712万", profitRate: "1.5%", profitAmount: "10.7万", yoy: "+4.1%", monetization: "2.7%" },
    { region: "湖北区域", partners: 6, cities: 2, target: "560万", achieved: "493万", rate: 88, gap: "67万", profitBase: "493万", profitRate: "1.4%", profitAmount: "6.9万", yoy: "+3.2%", monetization: "2.6%" },
    { region: "湖南区域", partners: 5, cities: 2, target: "480万", achieved: "408万", rate: 85, gap: "72万", profitBase: "408万", profitRate: "1.3%", profitAmount: "5.3万", yoy: "+1.8%", monetization: "2.4%" },
    { region: "江西区域", partners: 4, cities: 2, target: "360万", achieved: "302万", rate: 84, gap: "58万", profitBase: "302万", profitRate: "1.3%", profitAmount: "3.9万", yoy: "+0.5%", monetization: "2.2%" },
    { region: "粤海区域", partners: 10, cities: 3, target: "1,200万", achieved: "1,164万", rate: 97, gap: "36万", profitBase: "1,164万", profitRate: "1.8%", profitAmount: "21.0万", yoy: "+15.2%", monetization: "3.8%" },
    { region: "川藏区域", partners: 6, cities: 3, target: "1,200万", achieved: "1,092万", rate: 91, gap: "108万", profitBase: "1,092万", profitRate: "1.7%", profitAmount: "18.6万", yoy: "+9.6%", monetization: "3.4%" },
    { region: "黔渝区域", partners: 5, cities: 2, target: "500万", achieved: "460万", rate: 92, gap: "40万", profitBase: "460万", profitRate: "1.6%", profitAmount: "7.4万", yoy: "+7.2%", monetization: "3.1%" },
    { region: "福建区域", partners: 5, cities: 2, target: "480万", achieved: "437万", rate: 91, gap: "43万", profitBase: "437万", profitRate: "1.6%", profitAmount: "7.0万", yoy: "+6.0%", monetization: "3.0%" },
    { region: "广西区域", partners: 4, cities: 2, target: "360万", achieved: "317万", rate: 88, gap: "43万", profitBase: "317万", profitRate: "1.4%", profitAmount: "4.4万", yoy: "+3.5%", monetization: "2.5%" },
    { region: "云南区域", partners: 4, cities: 2, target: "320万", achieved: "256万", rate: 80, gap: "64万", profitBase: "256万", profitRate: "1.2%", profitAmount: "3.1万", yoy: "+1.2%", monetization: "2.0%" },
  ],
  daocan: [
    { region: "京津冀区域", partners: 10, cities: 3, target: "1,400万", achieved: "1,292万", rate: 92, gap: "108万", profitBase: "1,292万", profitRate: "1.6%", profitAmount: "20.7万", yoy: "+10.1%", monetization: "2.9%" },
    { region: "辽吉区域", partners: 5, cities: 3, target: "200万", achieved: "131万", rate: 66, gap: "69万", profitBase: "131万", profitRate: "0.8%", profitAmount: "1.0万", yoy: "-12.1%", monetization: "1.2%" },
    { region: "山东区域", partners: 7, cities: 2, target: "700万", achieved: "623万", rate: 89, gap: "77万", profitBase: "623万", profitRate: "1.4%", profitAmount: "8.7万", yoy: "+5.2%", monetization: "2.6%" },
    { region: "晋蒙区域", partners: 4, cities: 2, target: "360万", achieved: "313万", rate: 87, gap: "47万", profitBase: "313万", profitRate: "1.2%", profitAmount: "3.8万", yoy: "+2.8%", monetization: "2.2%" },
    { region: "陕宁区域", partners: 4, cities: 2, target: "320万", achieved: "270万", rate: 84, gap: "50万", profitBase: "270万", profitRate: "1.1%", profitAmount: "3.0万", yoy: "+0.8%", monetization: "2.0%" },
    { region: "甘青新区域", partners: 3, cities: 2, target: "240万", achieved: "184万", rate: 77, gap: "56万", profitBase: "184万", profitRate: "0.9%", profitAmount: "1.7万", yoy: "-2.5%", monetization: "1.5%" },
    { region: "黑龙江区域", partners: 3, cities: 2, target: "200万", achieved: "132万", rate: 66, gap: "68万", profitBase: "132万", profitRate: "0.8%", profitAmount: "1.1万", yoy: "-6.0%", monetization: "1.3%" },
    { region: "江苏区域", partners: 8, cities: 3, target: "1,200万", achieved: "1,140万", rate: 95, gap: "60万", profitBase: "1,140万", profitRate: "1.6%", profitAmount: "18.2万", yoy: "+6.5%", monetization: "3.1%" },
    { region: "浙江区域", partners: 7, cities: 2, target: "900万", achieved: "828万", rate: 92, gap: "72万", profitBase: "828万", profitRate: "1.5%", profitAmount: "12.4万", yoy: "+5.8%", monetization: "2.8%" },
    { region: "安徽区域", partners: 5, cities: 2, target: "480万", achieved: "437万", rate: 91, gap: "43万", profitBase: "437万", profitRate: "1.4%", profitAmount: "6.1万", yoy: "+4.2%", monetization: "2.6%" },
    { region: "河南区域", partners: 5, cities: 2, target: "560万", achieved: "493万", rate: 88, gap: "67万", profitBase: "493万", profitRate: "1.3%", profitAmount: "6.4万", yoy: "+3.0%", monetization: "2.4%" },
    { region: "湖北区域", partners: 4, cities: 2, target: "400万", achieved: "348万", rate: 87, gap: "52万", profitBase: "348万", profitRate: "1.2%", profitAmount: "4.2万", yoy: "+2.0%", monetization: "2.2%" },
    { region: "湖南区域", partners: 4, cities: 2, target: "320万", achieved: "270万", rate: 84, gap: "50万", profitBase: "270万", profitRate: "1.1%", profitAmount: "3.0万", yoy: "+0.5%", monetization: "2.0%" },
    { region: "江西区域", partners: 3, cities: 2, target: "240万", achieved: "198万", rate: 83, gap: "42万", profitBase: "198万", profitRate: "1.0%", profitAmount: "2.0万", yoy: "-0.5%", monetization: "1.8%" },
    { region: "粤海区域", partners: 8, cities: 3, target: "1,200万", achieved: "732万", rate: 61, gap: "468万", profitBase: "732万", profitRate: "1.2%", profitAmount: "8.8万", yoy: "+2.5%", monetization: "2.0%" },
    { region: "川藏区域", partners: 5, cities: 2, target: "300万", achieved: "291万", rate: 97, gap: "9万", profitBase: "291万", profitRate: "1.6%", profitAmount: "4.7万", yoy: "+9.8%", monetization: "3.4%" },
    { region: "黔渝区域", partners: 4, cities: 2, target: "320万", achieved: "288万", rate: 90, gap: "32万", profitBase: "288万", profitRate: "1.4%", profitAmount: "4.0万", yoy: "+5.5%", monetization: "2.7%" },
    { region: "福建区域", partners: 4, cities: 2, target: "300万", achieved: "270万", rate: 90, gap: "30万", profitBase: "270万", profitRate: "1.4%", profitAmount: "3.8万", yoy: "+4.2%", monetization: "2.6%" },
    { region: "广西区域", partners: 3, cities: 2, target: "240万", achieved: "206万", rate: 86, gap: "34万", profitBase: "206万", profitRate: "1.2%", profitAmount: "2.5万", yoy: "+2.0%", monetization: "2.2%" },
    { region: "云南区域", partners: 3, cities: 2, target: "200万", achieved: "150万", rate: 75, gap: "50万", profitBase: "150万", profitRate: "1.0%", profitAmount: "1.5万", yoy: "-1.0%", monetization: "1.6%" },
  ],
};

/* ================================================================== */
/* Mock 数据 - 城市级（区域→城市下钻）                                    */
/* ================================================================== */
const cityDataRaw = {
  waimai: {
    "京津冀区域": [
      { city: "北京", target: "500万", achieved: "380万", rate: 76, bdCount: 3, merchantCount: 1020, monetization: "2.4%", yoy: "-3.6%", profitAmount: "4.6万" },
      { city: "天津", target: "400万", achieved: "280万", rate: 70, bdCount: 2, merchantCount: 560, monetization: "2.0%", yoy: "-5.2%", profitAmount: "3.4万" },
      { city: "石家庄", target: "300万", achieved: "228万", rate: 76, bdCount: 2, merchantCount: 420, monetization: "2.2%", yoy: "-2.1%", profitAmount: "2.7万" },
      { city: "保定", target: "200万", achieved: "172万", rate: 86, bdCount: 1, merchantCount: 280, monetization: "2.6%", yoy: "+3.5%", profitAmount: "2.2万" },
    ],
    "辽吉区域": [
      { city: "沈阳", target: "300万", achieved: "180万", rate: 60, bdCount: 2, merchantCount: 380, monetization: "1.6%", yoy: "-8.3%", profitAmount: "1.8万" },
      { city: "大连", target: "280万", achieved: "160万", rate: 57, bdCount: 2, merchantCount: 340, monetization: "1.5%", yoy: "-9.1%", profitAmount: "1.6万" },
      { city: "长春", target: "200万", achieved: "99万", rate: 50, bdCount: 1, merchantCount: 260, monetization: "1.3%", yoy: "-12.0%", profitAmount: "1.0万" },
    ],
    "山东区域": [
      { city: "济南", target: "500万", achieved: "460万", rate: 92, bdCount: 2, merchantCount: 680, monetization: "3.0%", yoy: "+5.8%", profitAmount: "6.9万" },
      { city: "青岛", target: "400万", achieved: "350万", rate: 88, bdCount: 2, merchantCount: 520, monetization: "2.7%", yoy: "+4.2%", profitAmount: "5.3万" },
      { city: "烟台", target: "300万", achieved: "246万", rate: 82, bdCount: 1, merchantCount: 380, monetization: "2.3%", yoy: "+1.5%", profitAmount: "3.6万" },
    ],
    "晋蒙区域": [
      { city: "太原", target: "300万", achieved: "270万", rate: 90, bdCount: 2, merchantCount: 420, monetization: "2.6%", yoy: "+3.8%", profitAmount: "3.8万" },
      { city: "呼和浩特", target: "200万", achieved: "175万", rate: 88, bdCount: 1, merchantCount: 280, monetization: "2.3%", yoy: "+2.0%", profitAmount: "2.4万" },
    ],
    "陕宁区域": [
      { city: "西安", target: "300万", achieved: "258万", rate: 86, bdCount: 2, merchantCount: 400, monetization: "2.5%", yoy: "+1.8%", profitAmount: "3.2万" },
      { city: "银川", target: "180万", achieved: "150万", rate: 83, bdCount: 1, merchantCount: 220, monetization: "2.0%", yoy: "-0.5%", profitAmount: "2.1万" },
    ],
    "甘青新区域": [
      { city: "兰州", target: "200万", achieved: "158万", rate: 79, bdCount: 1, merchantCount: 280, monetization: "2.0%", yoy: "-1.2%", profitAmount: "1.9万" },
      { city: "乌鲁木齐", target: "160万", achieved: "123万", rate: 77, bdCount: 1, merchantCount: 200, monetization: "1.8%", yoy: "-2.8%", profitAmount: "1.2万" },
    ],
    "黑龙江区域": [
      { city: "哈尔滨", target: "180万", achieved: "125万", rate: 69, bdCount: 1, merchantCount: 240, monetization: "1.8%", yoy: "-4.5%", profitAmount: "1.3万" },
      { city: "齐齐哈尔", target: "140万", achieved: "93万", rate: 66, bdCount: 1, merchantCount: 180, monetization: "1.5%", yoy: "-6.2%", profitAmount: "0.9万" },
    ],
    "江苏区域": [
      { city: "上海", target: "600万", achieved: "540万", rate: 90, bdCount: 3, merchantCount: 1280, monetization: "3.5%", yoy: "+12.4%", profitAmount: "9.7万" },
      { city: "南京", target: "400万", achieved: "360万", rate: 90, bdCount: 2, merchantCount: 620, monetization: "2.8%", yoy: "+6.5%", profitAmount: "6.5万" },
      { city: "苏州", target: "300万", achieved: "240万", rate: 80, bdCount: 1, merchantCount: 480, monetization: "2.5%", yoy: "+4.2%", profitAmount: "4.3万" },
    ],
    "浙江区域": [
      { city: "杭州", target: "500万", achieved: "480万", rate: 96, bdCount: 2, merchantCount: 860, monetization: "3.2%", yoy: "+8.1%", profitAmount: "8.6万" },
      { city: "宁波", target: "350万", achieved: "308万", rate: 88, bdCount: 1, merchantCount: 480, monetization: "2.7%", yoy: "+5.2%", profitAmount: "5.2万" },
      { city: "温州", target: "250万", achieved: "224万", rate: 90, bdCount: 1, merchantCount: 380, monetization: "2.6%", yoy: "+4.0%", profitAmount: "3.4万" },
    ],
    "安徽区域": [
      { city: "合肥", target: "350万", achieved: "322万", rate: 92, bdCount: 2, merchantCount: 520, monetization: "2.8%", yoy: "+5.2%", profitAmount: "5.0万" },
      { city: "芜湖", target: "250万", achieved: "230万", rate: 92, bdCount: 1, merchantCount: 340, monetization: "2.5%", yoy: "+3.8%", profitAmount: "3.8万" },
    ],
    "河南区域": [
      { city: "郑州", target: "350万", achieved: "312万", rate: 89, bdCount: 2, merchantCount: 580, monetization: "2.7%", yoy: "+4.5%", profitAmount: "4.8万" },
      { city: "洛阳", target: "250万", achieved: "218万", rate: 87, bdCount: 1, merchantCount: 360, monetization: "2.4%", yoy: "+2.8%", profitAmount: "3.3万" },
      { city: "开封", target: "200万", achieved: "182万", rate: 91, bdCount: 1, merchantCount: 280, monetization: "2.5%", yoy: "+3.2%", profitAmount: "2.6万" },
    ],
    "湖北区域": [
      { city: "武汉", target: "350万", achieved: "305万", rate: 87, bdCount: 2, merchantCount: 560, monetization: "2.6%", yoy: "+3.5%", profitAmount: "4.5万" },
      { city: "宜昌", target: "210万", achieved: "188万", rate: 90, bdCount: 1, merchantCount: 320, monetization: "2.4%", yoy: "+2.0%", profitAmount: "2.4万" },
    ],
    "湖南区域": [
      { city: "长沙", target: "300万", achieved: "255万", rate: 85, bdCount: 2, merchantCount: 480, monetization: "2.5%", yoy: "+2.2%", profitAmount: "3.5万" },
      { city: "株洲", target: "180万", achieved: "153万", rate: 85, bdCount: 1, merchantCount: 280, monetization: "2.2%", yoy: "+0.8%", profitAmount: "1.8万" },
    ],
    "江西区域": [
      { city: "南昌", target: "220万", achieved: "185万", rate: 84, bdCount: 1, merchantCount: 340, monetization: "2.2%", yoy: "+0.5%", profitAmount: "2.4万" },
      { city: "赣州", target: "140万", achieved: "117万", rate: 84, bdCount: 1, merchantCount: 220, monetization: "2.0%", yoy: "-0.8%", profitAmount: "1.5万" },
    ],
    "粤海区域": [
      { city: "广州", target: "500万", achieved: "490万", rate: 98, bdCount: 2, merchantCount: 920, monetization: "3.8%", yoy: "+10.5%", profitAmount: "8.8万" },
      { city: "深圳", target: "500万", achieved: "450万", rate: 90, bdCount: 2, merchantCount: 880, monetization: "2.1%", yoy: "+3.2%", profitAmount: "8.1万" },
      { city: "佛山", target: "200万", achieved: "224万", rate: 112, bdCount: 1, merchantCount: 360, monetization: "3.0%", yoy: "+8.5%", profitAmount: "4.1万" },
    ],
    "川藏区域": [
      { city: "成都", target: "500万", achieved: "490万", rate: 98, bdCount: 2, merchantCount: 780, monetization: "3.6%", yoy: "+15.2%", profitAmount: "8.8万" },
      { city: "拉萨", target: "200万", achieved: "182万", rate: 91, bdCount: 1, merchantCount: 220, monetization: "2.6%", yoy: "+5.0%", profitAmount: "2.6万" },
      { city: "绵阳", target: "200万", achieved: "180万", rate: 90, bdCount: 1, merchantCount: 280, monetization: "2.5%", yoy: "+3.8%", profitAmount: "2.5万" },
    ],
    "黔渝区域": [
      { city: "重庆", target: "300万", achieved: "288万", rate: 96, bdCount: 2, merchantCount: 520, monetization: "3.2%", yoy: "+8.0%", profitAmount: "5.2万" },
      { city: "贵阳", target: "200万", achieved: "172万", rate: 86, bdCount: 1, merchantCount: 340, monetization: "2.5%", yoy: "+3.2%", profitAmount: "2.2万" },
    ],
    "福建区域": [
      { city: "福州", target: "260万", achieved: "240万", rate: 92, bdCount: 1, merchantCount: 420, monetization: "2.8%", yoy: "+5.5%", profitAmount: "3.8万" },
      { city: "厦门", target: "220万", achieved: "197万", rate: 90, bdCount: 1, merchantCount: 340, monetization: "2.6%", yoy: "+4.2%", profitAmount: "3.2万" },
    ],
    "广西区域": [
      { city: "南宁", target: "200万", achieved: "178万", rate: 89, bdCount: 1, merchantCount: 320, monetization: "2.4%", yoy: "+3.0%", profitAmount: "2.5万" },
      { city: "柳州", target: "160万", achieved: "139万", rate: 87, bdCount: 1, merchantCount: 240, monetization: "2.1%", yoy: "+1.5%", profitAmount: "1.9万" },
    ],
    "云南区域": [
      { city: "昆明", target: "180万", achieved: "146万", rate: 81, bdCount: 1, merchantCount: 300, monetization: "2.1%", yoy: "+1.2%", profitAmount: "1.9万" },
      { city: "大理", target: "140万", achieved: "110万", rate: 79, bdCount: 1, merchantCount: 200, monetization: "1.9%", yoy: "-0.5%", profitAmount: "1.2万" },
    ],
  },
  daocan: {
    "京津冀区域": [
      { city: "北京", target: "400万", achieved: "290万", rate: 73, bdCount: 2, merchantCount: 480, monetization: "2.0%", yoy: "-5.1%", profitAmount: "2.9万" },
      { city: "天津", target: "300万", achieved: "210万", rate: 70, bdCount: 2, merchantCount: 320, monetization: "1.7%", yoy: "-6.3%", profitAmount: "2.1万" },
      { city: "石家庄", target: "200万", achieved: "166万", rate: 83, bdCount: 1, merchantCount: 240, monetization: "1.9%", yoy: "-1.8%", profitAmount: "1.7万" },
    ],
    "辽吉区域": [
      { city: "沈阳", target: "100万", achieved: "68万", rate: 68, bdCount: 1, merchantCount: 120, monetization: "1.2%", yoy: "-10.5%", profitAmount: "0.5万" },
      { city: "大连", target: "60万", achieved: "38万", rate: 63, bdCount: 1, merchantCount: 80, monetization: "1.0%", yoy: "-12.8%", profitAmount: "0.3万" },
      { city: "长春", target: "40万", achieved: "25万", rate: 63, bdCount: 1, merchantCount: 60, monetization: "0.9%", yoy: "-14.2%", profitAmount: "0.2万" },
    ],
    "山东区域": [
      { city: "济南", target: "400万", achieved: "360万", rate: 90, bdCount: 2, merchantCount: 380, monetization: "2.6%", yoy: "+4.8%", profitAmount: "4.6万" },
      { city: "青岛", target: "300万", achieved: "263万", rate: 88, bdCount: 1, merchantCount: 280, monetization: "2.4%", yoy: "+3.2%", profitAmount: "3.5万" },
    ],
    "晋蒙区域": [
      { city: "太原", target: "200万", achieved: "175万", rate: 88, bdCount: 1, merchantCount: 240, monetization: "2.1%", yoy: "+2.5%", profitAmount: "2.2万" },
      { city: "呼和浩特", target: "160万", achieved: "138万", rate: 86, bdCount: 1, merchantCount: 180, monetization: "1.9%", yoy: "+1.0%", profitAmount: "1.6万" },
    ],
    "陕宁区域": [
      { city: "西安", target: "200万", achieved: "168万", rate: 84, bdCount: 1, merchantCount: 260, monetization: "2.0%", yoy: "+0.5%", profitAmount: "2.0万" },
      { city: "银川", target: "120万", achieved: "102万", rate: 85, bdCount: 1, merchantCount: 140, monetization: "1.8%", yoy: "-0.8%", profitAmount: "1.0万" },
    ],
    "甘青新区域": [
      { city: "兰州", target: "140万", achieved: "108万", rate: 77, bdCount: 1, merchantCount: 160, monetization: "1.6%", yoy: "-2.2%", profitAmount: "1.0万" },
      { city: "乌鲁木齐", target: "100万", achieved: "76万", rate: 76, bdCount: 1, merchantCount: 120, monetization: "1.4%", yoy: "-3.5%", profitAmount: "0.7万" },
    ],
    "黑龙江区域": [
      { city: "哈尔滨", target: "120万", achieved: "80万", rate: 67, bdCount: 1, merchantCount: 140, monetization: "1.4%", yoy: "-5.5%", profitAmount: "0.7万" },
      { city: "齐齐哈尔", target: "80万", achieved: "52万", rate: 65, bdCount: 1, merchantCount: 100, monetization: "1.2%", yoy: "-7.0%", profitAmount: "0.4万" },
    ],
    "江苏区域": [
      { city: "上海", target: "500万", achieved: "470万", rate: 94, bdCount: 2, merchantCount: 620, monetization: "3.1%", yoy: "+9.6%", profitAmount: "7.5万" },
      { city: "南京", target: "400万", achieved: "372万", rate: 93, bdCount: 2, merchantCount: 440, monetization: "2.5%", yoy: "+4.8%", profitAmount: "6.0万" },
      { city: "苏州", target: "300万", achieved: "298万", rate: 99, bdCount: 1, merchantCount: 380, monetization: "2.8%", yoy: "+6.0%", profitAmount: "4.7万" },
    ],
    "浙江区域": [
      { city: "杭州", target: "500万", achieved: "450万", rate: 90, bdCount: 2, merchantCount: 580, monetization: "2.8%", yoy: "+6.2%", profitAmount: "7.2万" },
      { city: "宁波", target: "250万", achieved: "230万", rate: 92, bdCount: 1, merchantCount: 320, monetization: "2.5%", yoy: "+4.0%", profitAmount: "3.4万" },
    ],
    "安徽区域": [
      { city: "合肥", target: "260万", achieved: "238万", rate: 92, bdCount: 1, merchantCount: 340, monetization: "2.5%", yoy: "+3.8%", profitAmount: "3.5万" },
      { city: "芜湖", target: "220万", achieved: "199万", rate: 91, bdCount: 1, merchantCount: 260, monetization: "2.3%", yoy: "+2.8%", profitAmount: "2.6万" },
    ],
    "河南区域": [
      { city: "郑州", target: "260万", achieved: "230万", rate: 88, bdCount: 1, merchantCount: 380, monetization: "2.3%", yoy: "+2.8%", profitAmount: "3.0万" },
      { city: "洛阳", target: "180万", achieved: "158万", rate: 88, bdCount: 1, merchantCount: 240, monetization: "2.1%", yoy: "+1.5%", profitAmount: "2.0万" },
    ],
    "湖北区域": [
      { city: "武汉", target: "240万", achieved: "210万", rate: 88, bdCount: 1, merchantCount: 340, monetization: "2.2%", yoy: "+2.0%", profitAmount: "2.6万" },
      { city: "宜昌", target: "160万", achieved: "138万", rate: 86, bdCount: 1, merchantCount: 200, monetization: "2.0%", yoy: "+0.8%", profitAmount: "1.6万" },
    ],
    "湖南区域": [
      { city: "长沙", target: "180万", achieved: "150万", rate: 83, bdCount: 1, merchantCount: 300, monetization: "2.0%", yoy: "+0.2%", profitAmount: "2.0万" },
      { city: "株洲", target: "140万", achieved: "120万", rate: 86, bdCount: 1, merchantCount: 180, monetization: "1.9%", yoy: "+1.0%", profitAmount: "1.4万" },
    ],
    "江西区域": [
      { city: "南昌", target: "140万", achieved: "116万", rate: 83, bdCount: 1, merchantCount: 200, monetization: "1.8%", yoy: "-0.5%", profitAmount: "1.3万" },
      { city: "赣州", target: "100万", achieved: "82万", rate: 82, bdCount: 1, merchantCount: 140, monetization: "1.6%", yoy: "-1.2%", profitAmount: "0.8万" },
    ],
    "粤海区域": [
      { city: "广州", target: "500万", achieved: "480万", rate: 96, bdCount: 2, merchantCount: 560, monetization: "3.3%", yoy: "+8.5%", profitAmount: "7.7万" },
      { city: "深圳", target: "400万", achieved: "380万", rate: 95, bdCount: 2, merchantCount: 440, monetization: "2.6%", yoy: "+5.1%", profitAmount: "6.1万" },
      { city: "佛山", target: "300万", achieved: "252万", rate: 84, bdCount: 1, merchantCount: 280, monetization: "2.2%", yoy: "+1.0%", profitAmount: "3.0万" },
    ],
    "川藏区域": [
      { city: "成都", target: "200万", achieved: "195万", rate: 98, bdCount: 1, merchantCount: 280, monetization: "3.4%", yoy: "+10.8%", profitAmount: "3.1万" },
      { city: "拉萨", target: "100万", achieved: "96万", rate: 96, bdCount: 1, merchantCount: 100, monetization: "2.8%", yoy: "+6.0%", profitAmount: "1.4万" },
    ],
    "黔渝区域": [
      { city: "重庆", target: "200万", achieved: "180万", rate: 90, bdCount: 1, merchantCount: 280, monetization: "2.6%", yoy: "+4.5%", profitAmount: "2.6万" },
      { city: "贵阳", target: "120万", achieved: "108万", rate: 90, bdCount: 1, merchantCount: 160, monetization: "2.2%", yoy: "+2.5%", profitAmount: "1.4万" },
    ],
    "福建区域": [
      { city: "福州", target: "160万", achieved: "144万", rate: 90, bdCount: 1, merchantCount: 240, monetization: "2.4%", yoy: "+3.5%", profitAmount: "2.0万" },
      { city: "厦门", target: "140万", achieved: "126万", rate: 90, bdCount: 1, merchantCount: 200, monetization: "2.2%", yoy: "+2.8%", profitAmount: "1.8万" },
    ],
    "广西区域": [
      { city: "南宁", target: "140万", achieved: "120万", rate: 86, bdCount: 1, merchantCount: 180, monetization: "2.0%", yoy: "+1.8%", profitAmount: "1.5万" },
      { city: "柳州", target: "100万", achieved: "86万", rate: 86, bdCount: 1, merchantCount: 140, monetization: "1.8%", yoy: "+0.5%", profitAmount: "1.0万" },
    ],
    "云南区域": [
      { city: "昆明", target: "120万", achieved: "90万", rate: 75, bdCount: 1, merchantCount: 180, monetization: "1.7%", yoy: "-1.0%", profitAmount: "1.0万" },
      { city: "大理", target: "80万", achieved: "60万", rate: 75, bdCount: 1, merchantCount: 100, monetization: "1.5%", yoy: "-2.5%", profitAmount: "0.5万" },
    ],
  },
};

/* Build expanded city data */
const cityData = {};
for (const biz of Object.keys(cityDataRaw)) {
  cityData[biz] = {};
  for (const region of Object.keys(cityDataRaw[biz])) {
    cityData[biz][region] = cityDataRaw[biz][region].map(buildRow);
  }
}

/* ================================================================== */
/* Mock 数据 - BD级（城市→BD下钻）                                       */
/* ================================================================== */
const bdDataRaw = {
  waimai: {
    "上海": [
      { name: "刘洋", mis: "liuyang04", stores: 8, target: "200万", achieved: "185万", rate: 93, merchantCount: 420 },
      { name: "陈静", mis: "chenjing05", stores: 6, target: "180万", achieved: "160万", rate: 89, merchantCount: 380 },
      { name: "赵刚", mis: "zhaogang06", stores: 7, target: "220万", achieved: "195万", rate: 89, merchantCount: 480 },
    ],
    "杭州": [
      { name: "孙丽", mis: "sunli07", stores: 6, target: "250万", achieved: "240万", rate: 96, merchantCount: 440 },
      { name: "周强", mis: "zhouqiang08", stores: 5, target: "250万", achieved: "240万", rate: 96, merchantCount: 420 },
    ],
    "南京": [
      { name: "吴敏", mis: "wumin09", stores: 5, target: "200万", achieved: "180万", rate: 90, merchantCount: 320 },
      { name: "郑华", mis: "zhenghua10", stores: 4, target: "200万", achieved: "180万", rate: 90, merchantCount: 300 },
    ],
    "苏州": [
      { name: "冯雷", mis: "fenglei11", stores: 4, target: "150万", achieved: "120万", rate: 80, merchantCount: 250 },
      { name: "褚亮", mis: "chuliang12", stores: 3, target: "150万", achieved: "120万", rate: 80, merchantCount: 230 },
    ],
    "广州": [
      { name: "卫涛", mis: "weitao13", stores: 6, target: "260万", achieved: "255万", rate: 98, merchantCount: 480 },
      { name: "蒋琳", mis: "jianglin14", stores: 5, target: "240万", achieved: "235万", rate: 98, merchantCount: 440 },
    ],
    "深圳": [
      { name: "沈悦", mis: "shenyue15", stores: 5, target: "260万", achieved: "235万", rate: 90, merchantCount: 460 },
      { name: "韩冰", mis: "hanbing16", stores: 5, target: "240万", achieved: "215万", rate: 90, merchantCount: 420 },
    ],
    "厦门": [
      { name: "杨旭", mis: "yangxu17", stores: 4, target: "200万", achieved: "195万", rate: 98, merchantCount: 340 },
      { name: "朱茜", mis: "zhuqian18", stores: 3, target: "200万", achieved: "195万", rate: 98, merchantCount: 300 },
    ],
    "北京": [
      { name: "秦宇", mis: "qinyu19", stores: 4, target: "180万", achieved: "135万", rate: 75, merchantCount: 380 },
      { name: "尤鑫", mis: "youxin20", stores: 4, target: "160万", achieved: "120万", rate: 75, merchantCount: 340 },
      { name: "许诺", mis: "xunuo21", stores: 3, target: "160万", achieved: "125万", rate: 78, merchantCount: 300 },
    ],
    "天津": [
      { name: "何璐", mis: "helu22", stores: 4, target: "200万", achieved: "140万", rate: 70, merchantCount: 300 },
      { name: "吕超", mis: "lvchao23", stores: 3, target: "200万", achieved: "140万", rate: 70, merchantCount: 260 },
    ],
    "石家庄": [
      { name: "施莹", mis: "shiying24", stores: 3, target: "160万", achieved: "120万", rate: 75, merchantCount: 220 },
      { name: "张鹏", mis: "zhangpeng25", stores: 3, target: "140万", achieved: "108万", rate: 77, merchantCount: 200 },
    ],
    "保定": [
      { name: "方圆", mis: "fangyuan40", stores: 3, target: "100万", achieved: "86万", rate: 86, merchantCount: 160 },
      { name: "毛明", mis: "maoming41", stores: 2, target: "100万", achieved: "86万", rate: 86, merchantCount: 140 },
    ],
    "济南": [
      { name: "梁伟", mis: "liangwei42", stores: 5, target: "260万", achieved: "240万", rate: 92, merchantCount: 380 },
      { name: "卢月", mis: "luyue43", stores: 4, target: "240万", achieved: "220万", rate: 92, merchantCount: 340 },
    ],
    "青岛": [
      { name: "尹杰", mis: "yinjie44", stores: 4, target: "220万", achieved: "195万", rate: 89, merchantCount: 300 },
      { name: "覃亮", mis: "qinliang45", stores: 3, target: "180万", achieved: "155万", rate: 86, merchantCount: 260 },
    ],
    "郑州": [
      { name: "洪亮", mis: "hongliang46", stores: 4, target: "200万", achieved: "178万", rate: 89, merchantCount: 320 },
      { name: "石辉", mis: "shihui47", stores: 3, target: "150万", achieved: "134万", rate: 89, merchantCount: 280 },
    ],
    "武汉": [
      { name: "夏雪", mis: "xiaxue48", stores: 4, target: "200万", achieved: "175万", rate: 88, merchantCount: 310 },
      { name: "裴勇", mis: "peiyong49", stores: 3, target: "150万", achieved: "130万", rate: 87, merchantCount: 250 },
    ],
    "长沙": [
      { name: "关宇", mis: "guanyu50", stores: 3, target: "180万", achieved: "153万", rate: 85, merchantCount: 270 },
      { name: "柯达", mis: "keda51", stores: 2, target: "120万", achieved: "102万", rate: 85, merchantCount: 210 },
    ],
    "合肥": [
      { name: "涂明", mis: "tuming52", stores: 3, target: "200万", achieved: "184万", rate: 92, merchantCount: 290 },
      { name: "余静", mis: "yujing53", stores: 2, target: "150万", achieved: "138万", rate: 92, merchantCount: 230 },
    ],
    "太原": [
      { name: "昌林", mis: "changlin54", stores: 3, target: "180万", achieved: "162万", rate: 90, merchantCount: 240 },
      { name: "姚笑", mis: "yaoxiao55", stores: 2, target: "120万", achieved: "108万", rate: 90, merchantCount: 180 },
    ],
    "西安": [
      { name: "湛清", mis: "zhanqing56", stores: 3, target: "180万", achieved: "155万", rate: 86, merchantCount: 230 },
      { name: "项飞", mis: "xiangfei57", stores: 2, target: "120万", achieved: "103万", rate: 86, merchantCount: 170 },
    ],
    "福州": [
      { name: "傅博", mis: "fubo58", stores: 3, target: "150万", achieved: "138万", rate: 92, merchantCount: 240 },
      { name: "庄雅", mis: "zhuangya59", stores: 2, target: "110万", achieved: "102万", rate: 93, merchantCount: 180 },
    ],
    "南宁": [
      { name: "聂雷", mis: "nielei60", stores: 3, target: "120万", achieved: "107万", rate: 89, merchantCount: 180 },
      { name: "司瀚", mis: "sihan61", stores: 2, target: "80万", achieved: "71万", rate: 89, merchantCount: 140 },
    ],
    "昆明": [
      { name: "金鑫", mis: "jinxin30", stores: 3, target: "160万", achieved: "155万", rate: 97, merchantCount: 260 },
      { name: "魏涛", mis: "weitao31", stores: 3, target: "140万", achieved: "135万", rate: 96, merchantCount: 220 },
    ],
    "哈尔滨": [
      { name: "费霞", mis: "feixia62", stores: 2, target: "100万", achieved: "70万", rate: 70, merchantCount: 150 },
      { name: "凌峰", mis: "lingfeng63", stores: 2, target: "80万", achieved: "55万", rate: 69, merchantCount: 120 },
    ],
    "成都": [
      { name: "孔明", mis: "kongming26", stores: 5, target: "260万", achieved: "255万", rate: 98, merchantCount: 420 },
      { name: "曹颖", mis: "caoying27", stores: 4, target: "240万", achieved: "235万", rate: 98, merchantCount: 360 },
    ],
    "重庆": [
      { name: "严浩", mis: "yanhao28", stores: 4, target: "200万", achieved: "192万", rate: 96, merchantCount: 340 },
      { name: "华蓉", mis: "huarong29", stores: 3, target: "200万", achieved: "192万", rate: 96, merchantCount: 280 },
    ],
    "沈阳": [
      { name: "陶宇", mis: "taoyu32", stores: 3, target: "160万", achieved: "95万", rate: 59, merchantCount: 200 },
      { name: "姜伟", mis: "jiangwei33", stores: 2, target: "140万", achieved: "85万", rate: 61, merchantCount: 180 },
    ],
    "大连": [
      { name: "戚峰", mis: "qifeng34", stores: 2, target: "150万", achieved: "85万", rate: 57, merchantCount: 180 },
      { name: "谢勇", mis: "xieyong35", stores: 2, target: "130万", achieved: "75万", rate: 58, merchantCount: 160 },
    ],
    "长春": [
      { name: "邹磊", mis: "zoulei36", stores: 2, target: "110万", achieved: "54万", rate: 49, merchantCount: 140 },
      { name: "喻恬", mis: "yutian37", stores: 2, target: "90万", achieved: "45万", rate: 50, merchantCount: 120 },
    ],
  },
  daocan: {
    "上海": [
      { name: "刘洋", mis: "liuyang04", stores: 5, target: "260万", achieved: "245万", rate: 94, merchantCount: 320 },
      { name: "陈静", mis: "chenjing05", stores: 4, target: "240万", achieved: "225万", rate: 94, merchantCount: 300 },
    ],
    "杭州": [
      { name: "孙丽", mis: "sunli07", stores: 4, target: "260万", achieved: "234万", rate: 90, merchantCount: 300 },
      { name: "周强", mis: "zhouqiang08", stores: 4, target: "240万", achieved: "216万", rate: 90, merchantCount: 280 },
    ],
    "南京": [
      { name: "吴敏", mis: "wumin09", stores: 3, target: "210万", achieved: "195万", rate: 93, merchantCount: 240 },
      { name: "郑华", mis: "zhenghua10", stores: 3, target: "190万", achieved: "177万", rate: 93, merchantCount: 200 },
    ],
    "广州": [
      { name: "卫涛", mis: "weitao13", stores: 4, target: "260万", achieved: "250万", rate: 96, merchantCount: 300 },
      { name: "蒋琳", mis: "jianglin14", stores: 4, target: "240万", achieved: "230万", rate: 96, merchantCount: 260 },
    ],
    "深圳": [
      { name: "沈悦", mis: "shenyue15", stores: 3, target: "210万", achieved: "200万", rate: 95, merchantCount: 240 },
      { name: "韩冰", mis: "hanbing16", stores: 3, target: "190万", achieved: "180万", rate: 95, merchantCount: 200 },
    ],
    "厦门": [
      { name: "杨旭", mis: "yangxu17", stores: 2, target: "160万", achieved: "148万", rate: 93, merchantCount: 180 },
      { name: "朱茜", mis: "zhuqian18", stores: 2, target: "140万", achieved: "132万", rate: 94, merchantCount: 140 },
    ],
    "北京": [
      { name: "秦宇", mis: "qinyu19", stores: 3, target: "210万", achieved: "152万", rate: 72, merchantCount: 260 },
      { name: "尤鑫", mis: "youxin20", stores: 3, target: "190万", achieved: "138万", rate: 73, merchantCount: 220 },
    ],
    "天津": [
      { name: "何璐", mis: "helu22", stores: 2, target: "160万", achieved: "112万", rate: 70, merchantCount: 180 },
      { name: "吕超", mis: "lvchao23", stores: 2, target: "140万", achieved: "98万", rate: 70, merchantCount: 140 },
    ],
    "石家庄": [
      { name: "施莹", mis: "shiying24", stores: 3, target: "200万", achieved: "166万", rate: 83, merchantCount: 240 },
    ],
    "成都": [
      { name: "孔明", mis: "kongming26", stores: 3, target: "200万", achieved: "195万", rate: 98, merchantCount: 280 },
    ],
    "重庆": [
      { name: "严浩", mis: "yanhao28", stores: 2, target: "100万", achieved: "96万", rate: 96, merchantCount: 180 },
    ],
    "沈阳": [
      { name: "陶宇", mis: "taoyu32", stores: 2, target: "100万", achieved: "68万", rate: 68, merchantCount: 120 },
    ],
    "大连": [
      { name: "戚峰", mis: "qifeng34", stores: 1, target: "60万", achieved: "38万", rate: 63, merchantCount: 80 },
    ],
    "长春": [
      { name: "邹磊", mis: "zoulei36", stores: 1, target: "40万", achieved: "25万", rate: 63, merchantCount: 60 },
    ],
    "济南": [
      { name: "梁伟", mis: "liangwei42", stores: 3, target: "200万", achieved: "180万", rate: 90, merchantCount: 220 },
      { name: "卢月", mis: "luyue43", stores: 2, target: "200万", achieved: "180万", rate: 90, merchantCount: 200 },
    ],
    "青岛": [
      { name: "尹杰", mis: "yinjie44", stores: 2, target: "180万", achieved: "158万", rate: 88, merchantCount: 180 },
      { name: "覃亮", mis: "qinliang45", stores: 2, target: "120万", achieved: "105万", rate: 88, merchantCount: 140 },
    ],
    "郑州": [
      { name: "洪亮", mis: "hongliang46", stores: 2, target: "150万", achieved: "132万", rate: 88, merchantCount: 200 },
      { name: "石辉", mis: "shihui47", stores: 2, target: "110万", achieved: "98万", rate: 89, merchantCount: 160 },
    ],
    "武汉": [
      { name: "夏雪", mis: "xiaxue48", stores: 2, target: "140万", achieved: "123万", rate: 88, merchantCount: 190 },
      { name: "裴勇", mis: "peiyong49", stores: 2, target: "100万", achieved: "87万", rate: 87, merchantCount: 150 },
    ],
    "长沙": [
      { name: "关宇", mis: "guanyu50", stores: 2, target: "100万", achieved: "83万", rate: 83, merchantCount: 170 },
      { name: "柯达", mis: "keda51", stores: 1, target: "80万", achieved: "67万", rate: 84, merchantCount: 120 },
    ],
    "合肥": [
      { name: "涂明", mis: "tuming52", stores: 2, target: "150万", achieved: "138万", rate: 92, merchantCount: 200 },
      { name: "余静", mis: "yujing53", stores: 1, target: "110万", achieved: "100万", rate: 91, merchantCount: 140 },
    ],
    "苏州": [
      { name: "冯蕾", mis: "fenglei64", stores: 2, target: "160万", achieved: "158万", rate: 99, merchantCount: 220 },
      { name: "褚洋", mis: "chuyang65", stores: 1, target: "140万", achieved: "140万", rate: 100, merchantCount: 180 },
    ],
    "佛山": [
      { name: "卫涛", mis: "weitao13", stores: 2, target: "160万", achieved: "135万", rate: 84, merchantCount: 160 },
    ],
    "拉萨": [
      { name: "旦增", mis: "danzeng66", stores: 1, target: "60万", achieved: "58万", rate: 97, merchantCount: 60 },
    ],
    "贵阳": [
      { name: "黔明", mis: "qianming67", stores: 1, target: "80万", achieved: "72万", rate: 90, merchantCount: 100 },
    ],
    "福州": [
      { name: "傅博", mis: "fubo58", stores: 1, target: "90万", achieved: "81万", rate: 90, merchantCount: 140 },
    ],
    "南昌": [
      { name: "赣生", mis: "gansheng68", stores: 1, target: "80万", achieved: "66万", rate: 83, merchantCount: 120 },
    ],
  },
};

/* Build expanded BD data */
const bdData = {};
for (const biz of Object.keys(bdDataRaw)) {
  bdData[biz] = {};
  for (const city of Object.keys(bdDataRaw[biz])) {
    bdData[biz][city] = bdDataRaw[biz][city].map(buildRow);
  }
}

/* ================================================================== */
/* AI 分析 - 按区域                                                      */
/* ================================================================== */
const aiRegionData = {
  waimai: {
    "京津冀区域": [
      { title: "区域整体表现", text: "京津冀区域整体达成率90%，北京达成率76%为区域内最低，建议配置专项资源提升北京合作商执行力。" },
      { title: "同比环比下滑", text: "北京YoY-3.6%、天津YoY-5.2%，同比为负增长。建议重点排查合作商执行力和商户覆盖情况。" },
      { title: "保定表现亮眼", text: "保定达成率86%+YoY+3.5%为区域内唯一正增长城市，建议提炼经验。" },
    ],
    "辽吉区域": [
      { title: "区域整体达成率偏低", text: "辽吉区域整体达成率56%为全国最低，3个城市全部达成率低于65%，长春仅50%。" },
      { title: "同比环比持续下滑", text: "沈阳YoY-8.3%、大连YoY-9.1%、长春YoY-12.0%，整体同比为负增长。" },
      { title: "建议紧急调配资源", text: "辽吉区域需紧急调配资源支持，重点排查合作商执行力和商户覆盖情况。" },
    ],
    "江苏区域": [
      { title: "区域整体表现优秀", text: "江苏区域整体达成率95%，上海90%和苏州80%表现稳健。建议提炼上海经验复制到苏州。" },
      { title: "同比增长亮点", text: "上海YoY+12.4%增速领先，江苏区域整体YoY+8.1%远超全国均值。" },
    ],
    "粤海区域": [
      { title: "区域整体表现优秀", text: "粤海区域整体达成率97%，广州98%和佛山112%表现突出。" },
      { title: "深圳货币化率偏低", text: "深圳达成率90%但货币化率仅2.1%，建议重点排查深圳合作商的广告投放结构。" },
    ],
    "川藏区域": [
      { title: "区域表现优异", text: "川藏区域整体达成率91%，成都98%持续高增长。" },
      { title: "同比增长强劲", text: "成都YoY+15.2%为全国增速最快城市，建议增加BD编制扩大覆盖。" },
    ],
  },
  daocan: {
    "京津冀区域": [
      { title: "区域整体达成率偏低", text: "京津冀区域整体达成率73%，主要拖累来自天津（70%）。" },
      { title: "同比环比下滑", text: "北京YoY-5.1%、天津YoY-6.3%，整体同比为负增长。" },
      { title: "北京需重点突破", text: "北京达成率73%，建议配置专项资源推动到餐品牌广告覆盖。" },
    ],
    "辽吉区域": [
      { title: "区域整体达成率最低", text: "辽吉区域整体达成率63%为全国最低，3个城市全部达成率低于70%。" },
      { title: "同比环比严重下滑", text: "沈阳YoY-10.5%、大连YoY-12.8%、长春YoY-14.2%。" },
      { title: "需紧急关注", text: "辽吉区域到餐业务需紧急调配资源，建议排查合作商执行力。" },
    ],
    "江苏区域": [
      { title: "区域整体表现良好", text: "江苏区域整体达成率95%，3个城市全部达成率超90%。上海94%和苏州99%表现稳健。" },
      { title: "同比增长稳定", text: "上海YoY+9.6%，江苏区域整体同比正增长。" },
    ],
    "粤海区域": [
      { title: "区域整体表现优秀", text: "粤海区域整体达成率95%，广州96%为区域内最优。" },
      { title: "同比增长稳定", text: "广州YoY+8.5%，粤海区域整体同比正增长。" },
    ],
    "川藏区域": [
      { title: "区域表现优异", text: "川藏区域整体达成率97%，成都98%持续高增长。" },
      { title: "同比增长强劲", text: "成都YoY+10.8%增速领先全国到餐。" },
    ],
  },
};

/* AI 分析 - 按城市 */
const aiCityData = {
  waimai: {
    "上海": [
      { title: "城市表现稳健", text: "上海达成率90%，3名BD平均达成率90.3%。刘洋93%表现最好，BD整体执行力均衡。" },
      { title: "货币化率领先", text: "上海货币化率3.5%，高于全国均值2.8%。广告覆盖和投放深度较好。" },
    ],
    "北京": [
      { title: "达成率偏低需关注", text: "北京达成率76%，3名BD达成率均在75%左右。建议排查头部商户投放情况。" },
      { title: "头部BD表现", text: "许诺达成率78%略高于团队均值，建议总结其拜访策略向其他BD推广。" },
    ],
    "成都": [
      { title: "城市表现优异", text: "成都达成率98%，2名BD均超95%。是西南区标杆城市。" },
      { title: "增长强劲", text: "成都YoY+15.2%为全国增速最快城市，建议增加BD编制扩大覆盖。" },
    ],
  },
  daocan: {
    "上海": [
      { title: "城市表现稳健", text: "上海到餐达成率94%，2名BD均达94%。到餐广告覆盖结构健康。" },
      { title: "货币化率领先", text: "上海到餐货币化率3.1%，高于到餐全国均值2.5%。" },
    ],
    "北京": [
      { title: "达成率偏低需关注", text: "北京到餐达成率73%，2名BD达成率在72-73%。建议排查合作商执行力。" },
      { title: "重点突破方向", text: "建议推动到餐品牌广告覆盖，提升货币化率。" },
    ],
  },
};

/* ================================================================== */
/* 面包屑导航                                                            */
/* ================================================================== */
const RegionBreadcrumb = ({ regionName, bizLabel }) => (
  <div className="flex items-center gap-2 text-sm mb-3">
    <Link to="/channel" className="flex items-center gap-1 text-gray-500 hover:text-[#4080FF] transition-colors">
      <ArrowLeft className="w-4 h-4" />
      渠道
    </Link>
    <ChevronRight className="w-3 h-3 text-gray-300" />
    <span className="text-gray-500">全国</span>
    <ChevronRight className="w-3 h-3 text-gray-300" />
    <span className="text-[#4080FF] font-medium">{regionName} · {bizLabel}</span>
  </div>
);

const CityBreadcrumb = ({ regionName, cityName, bizLabel }) => (
  <div className="flex items-center gap-2 text-sm mb-3">
    <Link to="/channel" className="flex items-center gap-1 text-gray-500 hover:text-[#4080FF] transition-colors">
      <ArrowLeft className="w-4 h-4" />
      渠道
    </Link>
    <ChevronRight className="w-3 h-3 text-gray-300" />
    <Link to={`/channel/region/${encodeURIComponent(regionName)}`} className="text-gray-500 hover:text-[#4080FF] transition-colors">
      {regionName}
    </Link>
    <ChevronRight className="w-3 h-3 text-gray-300" />
    <span className="text-[#4080FF] font-medium">{cityName} · {bizLabel}</span>
  </div>
);

/* ================================================================== */
/* Trend cell helper - renders yoy/mom style values                     */
/* ================================================================== */
const TrendCell = ({ value }) => (
  <TableCell className={value.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
    {value.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
    {value}
  </TableCell>
);

/* ================================================================== */
/* 区域透视 - 目标达成视图（显示城市列表，点击进入城市详情）                */
/* ================================================================== */
const RegionTrackingDetail = ({ regionRow, cityList, aiItems, regionName }) => {
  const navigate = useNavigate();

  const totalTarget = cityList.reduce((s, c) => s + parseAmount(c.target), 0);
  const totalAchieved = cityList.reduce((s, c) => s + parseAmount(c.achieved), 0);
  const totalBdCount = cityList.reduce((s, c) => s + c.bdCount, 0);
  const totalMerchant = cityList.reduce((s, c) => s + c.merchantCount, 0);
  const totalProfit = cityList.reduce((s, c) => s + parseAmount(c.profitAmount), 0);
  const avgMrRate = cityList.length > 0
    ? Math.round(cityList.reduce((s, c) => s + parseInt(c.mrRate), 0) / cityList.length)
    : 0;

  const handleCityClick = (cityName) => {
    navigate(`/channel/region/${encodeURIComponent(regionName)}/city/${encodeURIComponent(cityName)}`);
  };

  const aiModules = [
    { key: "city", label: "城市达成", items: aiItems },
    { key: "bd", label: "BD下钻", items: aiItems },
  ];

  return (
    <div className="space-y-4">
      <AiAnalysisPanel modules={aiModules} subtitle={`选择板块，让 AI 帮你解读${regionName}数据`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="区域目标值" value={regionRow.target} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成值" value={regionRow.achieved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="区域达成率" value={`${regionRow.rate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" sub={regionRow.rate >= 90 ? "正常" : regionRow.rate >= 80 ? "有风险" : "严重滞后"} />
        <SummaryCard label="剩余缺口" value={regionRow.gap} icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="覆盖城市" value={`${cityList.length}`} sub={`BD ${totalBdCount}人`} icon={Network} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="平均MR达成率" value={`${avgMrRate}%`} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">{regionRow.region} · 城市达成明细</p>
            <span className="text-xs text-gray-400">点击城市行 → 查看BD/运营明细</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">城市</TableHead>
                  <TableHead>目标收入</TableHead>
                  <TableHead>收入</TableHead>
                  <TableHead className="w-32">达成率</TableHead>
                  <TableHead>收入YoY</TableHead>
                  <TableHead>收入MoM</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>MR达成率</TableHead>
                  <TableHead>MR YoY</TableHead>
                  <TableHead>MR MoM</TableHead>
                  <TableHead>渗透率</TableHead>
                  <TableHead>ARPU值</TableHead>
                  <TableHead>分润金额</TableHead>
                  <TableHead>GTV</TableHead>
                  <TableHead>盈亏改善</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-16">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityList.map((city) => (
                  <TableRow
                    key={city.city}
                    className="cursor-pointer hover:bg-blue-50/30"
                    onClick={() => handleCityClick(city.city)}
                  >
                    <TableCell className="font-semibold text-gray-900">
                      {city.city}
                      <span className="block text-xs font-normal text-gray-400 mt-0.5">{city.bdCount}BD · {city.merchantCount}商户</span>
                    </TableCell>
                    <TableCell>{city.target}</TableCell>
                    <TableCell className="font-medium text-gray-700">{city.achieved}</TableCell>
                    <TableCell><RateProgress rate={city.rate} /></TableCell>
                    <TrendCell value={city.yoy} />
                    <TrendCell value={city.mom} />
                    <TableCell className="text-gray-600">{city.mr}</TableCell>
                    <TableCell className="text-gray-600">{city.mrRate}</TableCell>
                    <TrendCell value={city.mrYoy} />
                    <TrendCell value={city.mrMom} />
                    <TableCell className="text-gray-600">{city.penetration}</TableCell>
                    <TableCell className="text-gray-600">{city.arpu}</TableCell>
                    <TableCell className="text-[#4080FF] font-medium">{city.profitAmount}</TableCell>
                    <TableCell className="text-gray-600">{city.gtv}</TableCell>
                    <TableCell className="text-gray-600">{city.profitImprovement}</TableCell>
                    <TableCell><StatusBadge rate={city.rate} /></TableCell>
                    <TableCell>
                      <ExternalLink className="w-4 h-4 text-[#4080FF]" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">区域合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{totalTarget.toFixed(0)}万</TableCell>
                  <TableCell className="font-semibold text-gray-900">{totalAchieved.toFixed(0)}万</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{regionRow.rate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-gray-900">{avgMrRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(1)}万</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* 城市透视 - 目标达成视图（显示BD列表）                                   */
/* ================================================================== */
const CityTrackingDetail = ({ cityName, bdList, aiItems }) => {
  const totalTarget = bdList.reduce((s, b) => s + parseAmount(b.target), 0);
  const totalAchieved = bdList.reduce((s, b) => s + parseAmount(b.achieved), 0);
  const totalStores = bdList.reduce((s, b) => s + b.stores, 0);
  const totalMerchant = bdList.reduce((s, b) => s + b.merchantCount, 0);
  const totalProfit = bdList.reduce((s, b) => s + parseAmount(b.profitAmount), 0);
  const avgRate = bdList.length > 0 ? Math.round(bdList.reduce((s, b) => s + b.rate, 0) / bdList.length) : 0;
  const avgMrRate = bdList.length > 0
    ? Math.round(bdList.reduce((s, b) => s + parseInt(b.mrRate), 0) / bdList.length)
    : 0;

  const aiModules = [
    { key: "bd", label: "BD达成", items: aiItems },
    { key: "store", label: "门店下钻", items: aiItems },
  ];

  return (
    <div className="space-y-4">
      <AiAnalysisPanel modules={aiModules} subtitle={`选择板块，让 AI 帮你解读${cityName}数据`} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard label="城市目标值" value={`${totalTarget.toFixed(0)}万`} icon={Target} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="实际完成值" value={`${totalAchieved.toFixed(0)}万`} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="平均达成率" value={`${avgRate}%`} icon={Gauge} color="text-violet-600" bg="bg-violet-50" />
        <SummaryCard label="BD人数" value={`${bdList.length}`} sub={`${totalStores}家门店`} icon={Network} color="text-cyan-600" bg="bg-cyan-50" />
        <SummaryCard label="分润金额" value={`${totalProfit.toFixed(1)}万`} icon={DollarSign} color="text-rose-600" bg="bg-rose-50" />
        <SummaryCard label="平均MR达成率" value={`${avgMrRate}%`} icon={Store} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">{cityName} · BD/运营达成明细</p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">BD姓名</TableHead>
                  <TableHead>目标收入</TableHead>
                  <TableHead>收入</TableHead>
                  <TableHead className="w-32">达成率</TableHead>
                  <TableHead>收入YoY</TableHead>
                  <TableHead>收入MoM</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>MR达成率</TableHead>
                  <TableHead>MR YoY</TableHead>
                  <TableHead>MR MoM</TableHead>
                  <TableHead>渗透率</TableHead>
                  <TableHead>ARPU值</TableHead>
                  <TableHead>分润金额</TableHead>
                  <TableHead>GTV</TableHead>
                  <TableHead>盈亏改善</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bdList.map((bd) => (
                  <TableRow key={bd.mis}>
                    <TableCell className="font-semibold text-gray-900">
                      {bd.name}
                      <span className="block text-xs font-normal text-gray-400 mt-0.5">{bd.mis} · {bd.stores}家门店</span>
                    </TableCell>
                    <TableCell>{bd.target}</TableCell>
                    <TableCell className="font-medium text-gray-700">{bd.achieved}</TableCell>
                    <TableCell><RateProgress rate={bd.rate} /></TableCell>
                    <TrendCell value={bd.yoy} />
                    <TrendCell value={bd.mom} />
                    <TableCell className="text-gray-600">{bd.mr}</TableCell>
                    <TableCell className="text-gray-600">{bd.mrRate}</TableCell>
                    <TrendCell value={bd.mrYoy} />
                    <TrendCell value={bd.mrMom} />
                    <TableCell className="text-gray-600">{bd.penetration}</TableCell>
                    <TableCell className="text-gray-600">{bd.arpu}</TableCell>
                    <TableCell className="text-[#4080FF] font-medium">{bd.profitAmount}</TableCell>
                    <TableCell className="text-gray-600">{bd.gtv}</TableCell>
                    <TableCell className="text-gray-600">{bd.profitImprovement}</TableCell>
                    <TableCell><StatusBadge rate={bd.rate} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold text-gray-900">城市合计</TableCell>
                  <TableCell className="font-semibold text-gray-900">{totalTarget.toFixed(0)}万</TableCell>
                  <TableCell className="font-semibold text-gray-900">{totalAchieved.toFixed(0)}万</TableCell>
                  <TableCell className="font-semibold text-[#4080FF]">{avgRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-gray-900">{avgMrRate}%</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-semibold text-[#4080FF]">{totalProfit.toFixed(1)}万</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ================================================================== */
/* 主组件 - 根据路由参数判断是区域透视还是城市透视                          */
/* ================================================================== */
const ChannelDetail = () => {
  const { regionName, cityName } = useParams();
  const navigate = useNavigate();
  const { bizLine } = useBizLine();

  const decodedRegion = decodeURIComponent(regionName || "");
  const decodedCity = cityName ? decodeURIComponent(cityName) : null;
  const bizLabel = bizLine === "waimai" ? "外卖" : "到餐";

  // 城市透视模式
  if (decodedCity) {
    const bdList = (bdData[bizLine] || bdData.waimai)[decodedCity] || [];
    const aiDataMap = aiCityData[bizLine] || aiCityData.waimai;
    const aiItems = aiDataMap[decodedCity] || [
      { title: "城市BD明细", text: `${decodedCity}共${bdList.length}名BD，点击BD行查看门店级别详情。` },
    ];

    return (
      <div className="space-y-5">
        <CityBreadcrumb regionName={decodedRegion} cityName={decodedCity} bizLabel={bizLabel} />
        <PageHeader
          title={`${decodedCity} · BD透视分析`}
          description={`${decodedRegion} · ${decodedCity} 城市BD/运营目标达成明细`}
        />
        <CityTrackingDetail cityName={decodedCity} bdList={bdList} aiItems={aiItems} />
      </div>
    );
  }

  // 区域透视模式
  const rows = channelRegionRows[bizLine] || channelRegionRows.waimai;
  const regionRow = rows.find((r) => r.region === decodedRegion);

  const cityMap = cityData[bizLine] || cityData.waimai;
  const cityList = cityMap[decodedRegion] || [];

  const aiDataMap = aiRegionData[bizLine] || aiRegionData.waimai;
  const aiItems = aiDataMap[decodedRegion] || [];

  if (!regionRow) {
    return (
      <div className="space-y-5">
        <RegionBreadcrumb regionName={decodedRegion} bizLabel={bizLabel} />
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">未找到「{decodedRegion}」的数据</p>
            <button
              onClick={() => navigate("/channel")}
              className="text-[#4080FF] hover:underline"
            >
              返回渠道页
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <RegionBreadcrumb regionName={decodedRegion} bizLabel={bizLabel} />
      <PageHeader
        title={`${decodedRegion} · 城市透视分析`}
        description={`${decodedRegion}区域目标达成与追踪，点击城市进入BD/运营明细`}
      />
      <RegionTrackingDetail regionRow={regionRow} cityList={cityList} aiItems={aiItems} regionName={decodedRegion} />
    </div>
  );
};

export default ChannelDetail;
