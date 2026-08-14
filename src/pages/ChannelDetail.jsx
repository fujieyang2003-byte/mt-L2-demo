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
  Sparkles,
  Target,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Network,
  ExternalLink,
} from "lucide-react";

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
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
            <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {index + 1}
            </span>
            <div className="min-w-0">
              {item.title && <p className="font-semibold text-gray-800 mb-0.5">{item.title}</p>}
              <p className="leading-relaxed">{item.text || item}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

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
    { region: "华东区", partners: 12, cities: 4, target: "1,800万", achieved: "1,620万", rate: 90, gap: "180万", profitBase: "1,620万", profitRate: "1.8%", profitAmount: "29.2万", yoy: "+12.4%", monetization: "3.2%" },
    { region: "华南区", partners: 10, cities: 3, target: "1,400万", achieved: "1,330万", rate: 95, gap: "70万", profitBase: "1,330万", profitRate: "1.8%", profitAmount: "23.9万", yoy: "+8.1%", monetization: "3.5%" },
    { region: "华北区", partners: 8, cities: 3, target: "1,200万", achieved: "888万", rate: 74, gap: "312万", profitBase: "888万", profitRate: "1.2%", profitAmount: "10.7万", yoy: "-3.6%", monetization: "2.1%" },
    { region: "西南区", partners: 6, cities: 3, target: "1,200万", achieved: "1,164万", rate: 97, gap: "36万", profitBase: "1,164万", profitRate: "1.8%", profitAmount: "21.0万", yoy: "+15.2%", monetization: "3.8%" },
    { region: "东北区", partners: 6, cities: 3, target: "780万", achieved: "439万", rate: 56, gap: "341万", profitBase: "439万", profitRate: "1.0%", profitAmount: "4.4万", yoy: "-8.3%", monetization: "1.6%" },
  ],
  daocan: [
    { region: "华东区", partners: 10, cities: 3, target: "1,400万", achieved: "1,292万", rate: 92, gap: "108万", profitBase: "1,292万", profitRate: "1.6%", profitAmount: "20.7万", yoy: "+10.1%", monetization: "2.9%" },
    { region: "华南区", partners: 8, cities: 3, target: "1,200万", achieved: "1,140万", rate: 95, gap: "60万", profitBase: "1,140万", profitRate: "1.6%", profitAmount: "18.2万", yoy: "+6.5%", monetization: "3.1%" },
    { region: "华北区", partners: 7, cities: 3, target: "900万", achieved: "666万", rate: 74, gap: "234万", profitBase: "666万", profitRate: "1.0%", profitAmount: "6.7万", yoy: "-5.2%", monetization: "1.8%" },
    { region: "西南区", partners: 5, cities: 2, target: "300万", achieved: "291万", rate: 97, gap: "9万", profitBase: "291万", profitRate: "1.6%", profitAmount: "4.7万", yoy: "+9.8%", monetization: "3.4%" },
    { region: "东北区", partners: 5, cities: 3, target: "200万", achieved: "131万", rate: 66, gap: "69万", profitBase: "131万", profitRate: "0.8%", profitAmount: "1.0万", yoy: "-12.1%", monetization: "1.2%" },
  ],
};

/* ================================================================== */
/* Mock 数据 - 城市级（区域→城市下钻）                                    */
/* ================================================================== */
const cityDataRaw = {
  waimai: {
    "华东区": [
      { city: "上海", target: "600万", achieved: "540万", rate: 90, bdCount: 3, merchantCount: 1280, monetization: "3.5%", yoy: "+12.4%", profitAmount: "9.7万" },
      { city: "杭州", target: "500万", achieved: "480万", rate: 96, bdCount: 2, merchantCount: 860, monetization: "3.2%", yoy: "+8.1%", profitAmount: "8.6万" },
      { city: "南京", target: "400万", achieved: "360万", rate: 90, bdCount: 2, merchantCount: 620, monetization: "2.8%", yoy: "+6.5%", profitAmount: "6.5万" },
      { city: "苏州", target: "300万", achieved: "240万", rate: 80, bdCount: 2, merchantCount: 480, monetization: "2.5%", yoy: "+4.2%", profitAmount: "4.3万" },
    ],
    "华南区": [
      { city: "广州", target: "500万", achieved: "490万", rate: 98, bdCount: 2, merchantCount: 920, monetization: "3.8%", yoy: "+10.5%", profitAmount: "8.8万" },
      { city: "深圳", target: "500万", achieved: "450万", rate: 90, bdCount: 2, merchantCount: 880, monetization: "2.1%", yoy: "+3.2%", profitAmount: "8.1万" },
      { city: "厦门", target: "400万", achieved: "390万", rate: 98, bdCount: 2, merchantCount: 640, monetization: "3.0%", yoy: "+7.8%", profitAmount: "7.0万" },
    ],
    "华北区": [
      { city: "北京", target: "500万", achieved: "380万", rate: 76, bdCount: 3, merchantCount: 1020, monetization: "2.4%", yoy: "-3.6%", profitAmount: "4.6万" },
      { city: "天津", target: "400万", achieved: "280万", rate: 70, bdCount: 2, merchantCount: 560, monetization: "2.0%", yoy: "-5.2%", profitAmount: "3.4万" },
      { city: "石家庄", target: "300万", achieved: "228万", rate: 76, bdCount: 2, merchantCount: 420, monetization: "2.2%", yoy: "-2.1%", profitAmount: "2.7万" },
    ],
    "西南区": [
      { city: "成都", target: "500万", achieved: "490万", rate: 98, bdCount: 2, merchantCount: 780, monetization: "3.6%", yoy: "+15.2%", profitAmount: "8.8万" },
      { city: "重庆", target: "400万", achieved: "384万", rate: 96, bdCount: 2, merchantCount: 620, monetization: "3.4%", yoy: "+10.5%", profitAmount: "6.9万" },
      { city: "昆明", target: "300万", achieved: "290万", rate: 97, bdCount: 2, merchantCount: 480, monetization: "3.2%", yoy: "+8.8%", profitAmount: "5.2万" },
    ],
    "东北区": [
      { city: "沈阳", target: "300万", achieved: "180万", rate: 60, bdCount: 2, merchantCount: 380, monetization: "1.6%", yoy: "-8.3%", profitAmount: "1.8万" },
      { city: "大连", target: "280万", achieved: "160万", rate: 57, bdCount: 2, merchantCount: 340, monetization: "1.5%", yoy: "-9.1%", profitAmount: "1.6万" },
      { city: "长春", target: "200万", achieved: "99万", rate: 50, bdCount: 2, merchantCount: 260, monetization: "1.3%", yoy: "-12.0%", profitAmount: "1.0万" },
    ],
  },
  daocan: {
    "华东区": [
      { city: "上海", target: "500万", achieved: "470万", rate: 94, bdCount: 2, merchantCount: 620, monetization: "3.1%", yoy: "+9.6%", profitAmount: "7.5万" },
      { city: "杭州", target: "500万", achieved: "450万", rate: 90, bdCount: 2, merchantCount: 580, monetization: "2.8%", yoy: "+6.2%", profitAmount: "7.2万" },
      { city: "南京", target: "400万", achieved: "372万", rate: 93, bdCount: 2, merchantCount: 440, monetization: "2.5%", yoy: "+4.8%", profitAmount: "6.0万" },
    ],
    "华南区": [
      { city: "广州", target: "500万", achieved: "480万", rate: 96, bdCount: 2, merchantCount: 560, monetization: "3.3%", yoy: "+8.5%", profitAmount: "7.7万" },
      { city: "深圳", target: "400万", achieved: "380万", rate: 95, bdCount: 2, merchantCount: 440, monetization: "2.6%", yoy: "+5.1%", profitAmount: "6.1万" },
      { city: "厦门", target: "300万", achieved: "280万", rate: 93, bdCount: 2, merchantCount: 320, monetization: "2.2%", yoy: "+3.8%", profitAmount: "4.4万" },
    ],
    "华北区": [
      { city: "北京", target: "400万", achieved: "290万", rate: 73, bdCount: 2, merchantCount: 480, monetization: "2.0%", yoy: "-5.1%", profitAmount: "2.9万" },
      { city: "天津", target: "300万", achieved: "210万", rate: 70, bdCount: 2, merchantCount: 320, monetization: "1.7%", yoy: "-6.3%", profitAmount: "2.1万" },
      { city: "石家庄", target: "200万", achieved: "166万", rate: 83, bdCount: 1, merchantCount: 240, monetization: "1.9%", yoy: "-1.8%", profitAmount: "1.7万" },
    ],
    "西南区": [
      { city: "成都", target: "200万", achieved: "195万", rate: 98, bdCount: 1, merchantCount: 280, monetization: "3.4%", yoy: "+10.8%", profitAmount: "3.1万" },
      { city: "重庆", target: "100万", achieved: "96万", rate: 96, bdCount: 1, merchantCount: 180, monetization: "3.1%", yoy: "+7.5%", profitAmount: "1.6万" },
    ],
    "东北区": [
      { city: "沈阳", target: "100万", achieved: "68万", rate: 68, bdCount: 1, merchantCount: 120, monetization: "1.2%", yoy: "-10.5%", profitAmount: "0.5万" },
      { city: "大连", target: "60万", achieved: "38万", rate: 63, bdCount: 1, merchantCount: 80, monetization: "1.0%", yoy: "-12.8%", profitAmount: "0.3万" },
      { city: "长春", target: "40万", achieved: "25万", rate: 63, bdCount: 1, merchantCount: 60, monetization: "0.9%", yoy: "-14.2%", profitAmount: "0.2万" },
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
    "成都": [
      { name: "孔明", mis: "kongming26", stores: 5, target: "260万", achieved: "255万", rate: 98, merchantCount: 420 },
      { name: "曹颖", mis: "caoying27", stores: 4, target: "240万", achieved: "235万", rate: 98, merchantCount: 360 },
    ],
    "重庆": [
      { name: "严浩", mis: "yanhao28", stores: 4, target: "200万", achieved: "192万", rate: 96, merchantCount: 340 },
      { name: "华蓉", mis: "huarong29", stores: 3, target: "200万", achieved: "192万", rate: 96, merchantCount: 280 },
    ],
    "昆明": [
      { name: "金鑫", mis: "jinxin30", stores: 3, target: "160万", achieved: "155万", rate: 97, merchantCount: 260 },
      { name: "魏涛", mis: "weitao31", stores: 3, target: "140万", achieved: "135万", rate: 96, merchantCount: 220 },
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
    "华东区": [
      { title: "区域整体表现优秀", text: "华东区整体达成率90%，4个城市中3个达成率超90%。上海90%和杭州96%表现突出，建议提炼杭州经验复制到苏州（达成率80%为区域内最低）。" },
      { title: "苏州货币化率偏低", text: "苏州达成率80%但货币化率2.5%，低于区域内均值3.2%。建议重点排查苏州合作商的广告投放结构，引导尾部商家开通信息流广告。" },
      { title: "同比增长亮点", text: "上海YoY+12.4%增速领先，华东区域整体YoY+8.1%远超全国均值，经营态势良好。" },
    ],
    "华南区": [
      { title: "区域整体表现优秀", text: "华南区整体达成率95%，3个城市中2个达成率超95%。广州98%和厦门98%表现突出。" },
      { title: "深圳货币化率偏低", text: "深圳达成率90%但货币化率仅2.1%，低于区域内均值3.0%。建议重点排查深圳合作商的广告投放结构。" },
      { title: "厦门经验值得推广", text: "厦门达成率98%+货币化率3.0%，是华南区的标杆城市。" },
    ],
    "华北区": [
      { title: "区域整体达成率偏低", text: "华北区整体达成率74%远低于全国均值85%。3个城市中全部达成率低于80%，天津仅70%为区域内最差。" },
      { title: "同比环比持续下滑", text: "北京YoY-3.6%、天津YoY-5.2%，华北区域整体同比为负增长。建议重点排查合作商执行力和商户覆盖情况。" },
      { title: "北京需重点突破", text: "北京作为核心城市达成率仅76%，货币化率2.4%。建议配置专项资源。" },
    ],
    "西南区": [
      { title: "区域表现优异", text: "西南区整体达成率97%为全国最高，3个城市全部达成率超96%。成都98%和昆明97%持续高增长。" },
      { title: "同比增长强劲", text: "成都YoY+15.2%为全国增速最快城市，西南区是标杆区域。" },
      { title: "货币化率领先", text: "区域内平均货币化率3.4%，远高于全国均值2.8%。建议提炼经验向其他区域推广。" },
    ],
    "东北区": [
      { title: "区域整体达成率偏低", text: "东北区整体达成率56%为全国最低，3个城市中全部达成率低于65%，长春仅50%为全国最差。" },
      { title: "同比环比持续下滑", text: "沈阳YoY-8.3%、大连YoY-9.1%、长春YoY-12.0%，东北区域整体同比为负增长。" },
      { title: "建议紧急调配资源", text: "东北区需紧急调配资源支持，重点排查合作商执行力和商户覆盖情况。" },
    ],
  },
  daocan: {
    "华东区": [
      { title: "区域整体表现良好", text: "华东区整体达成率93%，3个城市全部达成率超90%。上海94%和南京93%表现稳健。" },
      { title: "同比增长稳定", text: "上海YoY+9.6%、杭州YoY+6.2%，华东区域整体同比正增长。" },
      { title: "杭州经验推广", text: "杭州达成率90%且货币化率稳定，建议提炼到餐运营经验向华北推广。" },
    ],
    "华南区": [
      { title: "区域整体表现优秀", text: "华南区整体达成率95%，3个城市全部达成率超93%。广州96%为区域内最优。" },
      { title: "同比增长稳定", text: "广州YoY+8.5%和厦门YoY+3.8%，华南区域整体同比正增长。" },
      { title: "深圳经验推广", text: "深圳货币化率2.6%在到餐中表现良好，建议向华北区域推广。" },
    ],
    "华北区": [
      { title: "区域整体达成率偏低", text: "华北区整体达成率74%远低于全国均值76%。主要拖累来自天津（70%）。" },
      { title: "同比环比下滑", text: "北京YoY-5.1%、天津YoY-6.3%，华北区域整体同比为负增长。" },
      { title: "北京需重点突破", text: "北京达成率73%，建议配置专项资源推动到餐品牌广告覆盖。" },
    ],
    "西南区": [
      { title: "区域表现优异", text: "西南区整体达成率97%，2个城市全部达成率超96%。成都98%持续高增长。" },
      { title: "同比增长强劲", text: "成都YoY+10.8%增速领先全国到餐，西南区是标杆区域。" },
      { title: "货币化率领先", text: "区域内平均货币化率3.3%，远高于到餐全国均值2.5%。" },
    ],
    "东北区": [
      { title: "区域整体达成率最低", text: "东北区整体达成率63%为全国最低，3个城市全部达成率低于70%。" },
      { title: "同比环比严重下滑", text: "沈阳YoY-10.5%、大连YoY-12.8%、长春YoY-14.2%。" },
      { title: "需紧急关注", text: "东北区到餐业务需紧急调配资源，建议排查合作商执行力。" },
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

  return (
    <div className="space-y-4">
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

      <AiDiagnosisCard items={aiItems} />
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

  return (
    <div className="space-y-4">
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

      <AiDiagnosisCard items={aiItems} />
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
