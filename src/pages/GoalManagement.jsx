import React, { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
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
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, CheckCircle2, AlertTriangle, Gauge, Sparkles } from "lucide-react";

/** 根据达成率返回状态文案与徽标样式 */
const getStatus = (rate) => {
  if (rate >= 100) {
    return { label: "已达成", className: "bg-emerald-50 text-emerald-600" };
  }
  if (rate >= 80) {
    return { label: "进行中", className: "bg-blue-50 text-[#4080FF]" };
  }
  return { label: "预警", className: "bg-red-50 text-red-500" };
};

const StatusBadge = ({ rate }) => {
  const status = getStatus(rate);
  return (
    <Badge className={`border-none font-normal ${status.className}`}>
      {status.label}
    </Badge>
  );
};

const RateProgress = ({ rate }) => (
  <div className="flex items-center gap-2">
    <Progress value={Math.min(rate, 100)} className="h-2 flex-1" />
    <span className="text-xs text-gray-500 w-10 shrink-0">{rate}%</span>
  </div>
);

/** AI 智能分析卡片：统一用于各角色视图底部展示编号列表式分析建议 */
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
          <div
            key={index}
            className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700"
          >
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

/* ------------------------------------------------------------------ */
/* platform_admin：总部视角 —— 全国五大区汇总                          */
/* ------------------------------------------------------------------ */
const headquarterRows = [
  { region: "华东区", target: "3,200万", achieved: "2,912万", rate: 91, yoy: "+12.4%" },
  { region: "华南区", target: "2,600万", achieved: "2,470万", rate: 95, yoy: "+8.1%" },
  { region: "华北区", target: "2,100万", achieved: "1,554万", rate: 74, yoy: "-3.6%" },
  { region: "西南区", target: "1,500万", achieved: "1,455万", rate: 97, yoy: "+15.2%" },
  { region: "东北区", target: "980万", achieved: "1,020万", rate: 104, yoy: "+6.7%" },
];

const headquarterDiagnosis = [
  "华北区达成率74%低于预警线，建议本周安排专项会议跟进",
  "东北区已超额达成104%，可适当调高下月目标或将资源倾斜至薄弱区域",
  "整体达成率预计月底可达93%，需重点推动华北和东北的尾部城市冲刺",
];

const HeadquarterView = () => (
  <div className="space-y-4">
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <p className="text-base font-semibold text-gray-900 mb-4">全国五大区目标汇总</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>大区</TableHead>
              <TableHead>目标收入</TableHead>
              <TableHead>达成收入</TableHead>
              <TableHead className="w-56">达成率</TableHead>
              <TableHead>YoY</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headquarterRows.map((row) => (
              <TableRow key={row.region}>
                <TableCell className="font-medium text-gray-800">{row.region}</TableCell>
                <TableCell>{row.target}</TableCell>
                <TableCell>{row.achieved}</TableCell>
                <TableCell>
                  <RateProgress rate={row.rate} />
                </TableCell>
                <TableCell className={row.yoy.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                  {row.yoy}
                </TableCell>
                <TableCell>
                  <StatusBadge rate={row.rate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AiDiagnosisCard items={headquarterDiagnosis} />
  </div>
);

/* ------------------------------------------------------------------ */
/* biz_manager：业务经理视角 —— 各城市目标达成                         */
/* ------------------------------------------------------------------ */
const bizManagerRows = [
  { city: "上海", line: "信息流广告", target: "580万", achieved: "552万", rate: 95 },
  { city: "北京", line: "搜索广告", target: "620万", achieved: "497万", rate: 80 },
  { city: "广州", line: "信息流广告", target: "420万", achieved: "441万", rate: 105 },
  { city: "深圳", line: "品牌广告", target: "460万", achieved: "331万", rate: 72 },
  { city: "杭州", line: "搜索广告", target: "350万", achieved: "329万", rate: 94 },
  { city: "成都", line: "信息流广告", target: "280万", achieved: "291万", rate: 104 },
];

const bizManagerDiagnosis = [
  "上海外卖广告达成率103%表现突出，可复制经验到其他城市",
  "武汉达成率72%偏低，建议增加商户拜访频次并配合CPS推广活动",
  "整体6个城市中4个达成率超80%，需集中资源攻坚剩余2个城市",
];

const BizManagerView = () => (
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
            {bizManagerRows.map((row) => (
              <TableRow key={row.city}>
                <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                <TableCell>{row.line}</TableCell>
                <TableCell>{row.target}</TableCell>
                <TableCell>{row.achieved}</TableCell>
                <TableCell>
                  <RateProgress rate={row.rate} />
                </TableCell>
                <TableCell>
                  <StatusBadge rate={row.rate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AiDiagnosisCard items={bizManagerDiagnosis} />
  </div>
);

/* ------------------------------------------------------------------ */
/* partner：合作商视角 —— 各城市目标情况                                */
/* ------------------------------------------------------------------ */
const partnerRows = [
  { city: "武汉", targetMerchant: 320, opened: 296, target: "180万", achieved: "165万", rate: 92 },
  { city: "南京", targetMerchant: 260, opened: 198, target: "150万", achieved: "108万", rate: 72 },
  { city: "西安", targetMerchant: 210, opened: 215, target: "120万", achieved: "128万", rate: 107 },
  { city: "重庆", targetMerchant: 280, opened: 231, target: "160万", achieved: "142万", rate: 89 },
];

const partnerDiagnosis = [
  "成都目标商户开通率较低（58/80），建议加大地推力度",
  "北京和上海达成率均超90%，执行节奏良好，保持当前策略即可",
];

const PartnerView = () => (
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
            {partnerRows.map((row) => (
              <TableRow key={row.city}>
                <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                <TableCell>{row.targetMerchant}</TableCell>
                <TableCell>{row.opened}</TableCell>
                <TableCell>{row.target}</TableCell>
                <TableCell>{row.achieved}</TableCell>
                <TableCell>
                  <RateProgress rate={row.rate} />
                </TableCell>
                <TableCell>
                  <StatusBadge rate={row.rate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AiDiagnosisCard items={partnerDiagnosis} />
  </div>
);

/* ------------------------------------------------------------------ */
/* bd：BD/运营视角 —— KPI 卡片 + 门店达成表                             */
/* ------------------------------------------------------------------ */
const bdStoreRows = [
  { store: "望京旗舰店", type: "信息流广告", target: "12万", achieved: "12.6万", rate: 105 },
  { store: "国贸店", type: "搜索广告", target: "9万", achieved: "8.1万", rate: 90 },
  { store: "三里屯店", type: "品牌广告", target: "15万", achieved: "10.4万", rate: 69 },
  { store: "西单店", type: "信息流广告", target: "8万", achieved: "7.9万", rate: 99 },
  { store: "中关村店", type: "搜索广告", target: "10万", achieved: "10.5万", rate: 105 },
  { store: "亦庄店", type: "信息流广告", target: "6万", achieved: "4.2万", rate: 70 },
  { store: "回龙观店", type: "品牌广告", target: "7万", achieved: "6.3万", rate: 90 },
  { store: "通州店", type: "搜索广告", target: "5万", achieved: "5.4万", rate: 108 },
];

const BdView = () => {
  const total = bdStoreRows.length;
  const achievedCount = bdStoreRows.filter((row) => row.rate >= 100).length;
  const notAchievedCount = total - achievedCount;
  const overallRate = (
    bdStoreRows.reduce((sum, row) => sum + row.rate, 0) / total
  ).toFixed(1);

  const summaryCards = [
    { label: "总门店", value: `${total}`, icon: Store },
    { label: "已达标", value: `${achievedCount}`, icon: CheckCircle2 },
    { label: "未达标", value: `${notAchievedCount}`, icon: AlertTriangle },
    { label: "个人达成率", value: `${overallRate}%`, icon: Gauge },
  ];

  const bdDiagnosis = [
    "你负责的8家门店中6家已达标，个人达成率89%处于团队前列",
    "望京店和回龙观店达成率低于80%，建议本周优先拜访并推荐CPC引流产品",
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((item) => (
          <Card key={item.label} className="border-none shadow-sm bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#e8f0ff" }}
              >
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
              {bdStoreRows.map((row) => (
                <TableRow key={row.store}>
                  <TableCell className="font-medium text-gray-800">{row.store}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell>{row.achieved}</TableCell>
                  <TableCell>
                    <RateProgress rate={row.rate} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge rate={row.rate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AiDiagnosisCard items={bdDiagnosis} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 视角切换配置（仅 platform_admin 可用）                               */
/* ------------------------------------------------------------------ */
const VIEW_OPTIONS = [
  { value: "platform_admin", label: "平台管理员视角" },
  { value: "biz_manager", label: "广告业务经理视角" },
  { value: "partner", label: "合作商视角" },
  { value: "bd", label: "BD/运营视角" },
];

const VIEW_COMPONENTS = {
  platform_admin: HeadquarterView,
  biz_manager: BizManagerView,
  partner: PartnerView,
  bd: BdView,
};

const GoalManagement = () => {
  const { currentUser } = useUser();
  const role = currentUser?.role;
  const [adminView, setAdminView] = useState("platform_admin");

  const ViewComponent = useMemo(() => {
    if (role === "platform_admin") {
      return VIEW_COMPONENTS[adminView] || HeadquarterView;
    }
    return VIEW_COMPONENTS[role] || BdView;
  }, [role, adminView]);

  return (
    <div>
      <PageHeader
        title="目标管理"
        description="制定与跟踪各区域广告业务经营目标"
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

      <ViewComponent />
    </div>
  );
};

export default GoalManagement;
