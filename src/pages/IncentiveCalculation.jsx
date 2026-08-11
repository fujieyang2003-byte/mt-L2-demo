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
import { Wallet, CheckCircle2, Clock3, Sparkles } from "lucide-react";

/** 发放状态徽标：已发放绿色 / 待发放蓝色 / 计算中黄色 */
const STATUS_CONFIG = {
  已发放: { className: "bg-emerald-50 text-emerald-600" },
  待发放: { className: "bg-blue-50 text-[#4080FF]" },
  计算中: { className: "bg-amber-50 text-amber-600" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { className: "bg-gray-100 text-gray-500" };
  return <Badge className={`border-none font-normal ${cfg.className}`}>{status}</Badge>;
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
/* platform_admin：总部视角 —— 全国激励汇总                            */
/* ------------------------------------------------------------------ */
const headquarterRows = [
  { region: "华东区", budget: "620万", paid: "564万", remaining: "56万", rate: 91 },
  { region: "华南区", budget: "480万", paid: "456万", remaining: "24万", rate: 95 },
  { region: "华北区", budget: "410万", paid: "303万", remaining: "107万", rate: 74 },
  { region: "西南区", budget: "290万", paid: "281万", remaining: "9万", rate: 97 },
  { region: "东北区", budget: "180万", paid: "172万", remaining: "8万", rate: 96 },
];

const headquarterDiagnosis = [
  "华南区激励发放率91%为全国最高，激励驱动效果显著",
  "华北区剩余激励预算较多（130万），建议加大激励发放节奏推动月底冲刺",
  "整体激励发放率82%，预计月底可达90%以上，建议关注西南和东北的发放进度",
];

const HeadquarterView = () => (
  <div className="space-y-4">
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <p className="text-base font-semibold text-gray-900 mb-4">全国激励发放汇总</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>大区</TableHead>
              <TableHead>激励预算</TableHead>
              <TableHead>已发放</TableHead>
              <TableHead>剩余</TableHead>
              <TableHead className="w-56">发放率</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headquarterRows.map((row) => (
              <TableRow key={row.region}>
                <TableCell className="font-medium text-gray-800">{row.region}</TableCell>
                <TableCell>{row.budget}</TableCell>
                <TableCell>{row.paid}</TableCell>
                <TableCell>{row.remaining}</TableCell>
                <TableCell>
                  <RateProgress rate={row.rate} />
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
/* biz_manager：业务经理视角 —— 各城市激励发放表                        */
/* ------------------------------------------------------------------ */
const bizManagerRows = [
  { city: "上海", budget: "58万", paid: "52.4万", pending: "5.6万", rate: 90 },
  { city: "北京", budget: "62万", paid: "49.7万", pending: "12.3万", rate: 80 },
  { city: "广州", budget: "42万", paid: "44.1万", pending: "0万", rate: 105 },
  { city: "深圳", budget: "46万", paid: "33.1万", pending: "12.9万", rate: 72 },
  { city: "杭州", budget: "35万", paid: "32.9万", pending: "2.1万", rate: 94 },
  { city: "成都", budget: "28万", paid: "29.1万", pending: "0万", rate: 104 },
];

const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

const bizManagerDiagnosis = [
  "广州和杭州发放率超90%，激励使用效率较高",
  "武汉发放率偏低（68%），建议核查是否存在激励审批卡点",
  "建议将剩余激励预算优先分配给达成率较低但潜力大的城市",
];

const BizManagerView = () => {
  const totals = useMemo(() => {
    const budget = bizManagerRows.reduce((sum, row) => sum + parseAmount(row.budget), 0);
    const paid = bizManagerRows.reduce((sum, row) => sum + parseAmount(row.paid), 0);
    const pending = bizManagerRows.reduce((sum, row) => sum + parseAmount(row.pending), 0);
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
              {bizManagerRows.map((row) => (
                <TableRow key={row.city}>
                  <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                  <TableCell>{row.budget}</TableCell>
                  <TableCell>{row.paid}</TableCell>
                  <TableCell>{row.pending}</TableCell>
                  <TableCell>
                    <RateProgress rate={row.rate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold text-gray-900">合计</TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {totals.budget.toFixed(1)}万
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {totals.paid.toFixed(1)}万
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {totals.pending.toFixed(1)}万
                </TableCell>
                <TableCell className="font-semibold text-[#4080FF]">{totals.rate}%</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <AiDiagnosisCard items={bizManagerDiagnosis} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* partner：合作商视角 —— 团队每人的激励明细                            */
/* ------------------------------------------------------------------ */
const partnerRows = [
  { name: "王磊", mis: "wanglei01", achieved: "165万", rate: "1.8%", incentive: "2.97万", paid: "2.97万", status: "已发放" },
  { name: "李娜", mis: "lina02", achieved: "108万", rate: "1.6%", incentive: "1.73万", paid: "0万", status: "待发放" },
  { name: "张伟", mis: "zhangwei03", achieved: "128万", rate: "1.9%", incentive: "2.43万", paid: "0万", status: "计算中" },
  { name: "刘洋", mis: "liuyang04", achieved: "142万", rate: "1.7%", incentive: "2.41万", paid: "2.41万", status: "已发放" },
  { name: "陈静", mis: "chenjing05", achieved: "96万", rate: "1.5%", incentive: "1.44万", paid: "0万", status: "待发放" },
];

const partnerDiagnosis = [
  "张三和李四激励已全额发放，团队执行力强",
  "王五激励系数较低（0.8），建议关注其门店达成情况，协助提升业绩",
];

const PartnerView = () => {
  const totalIncentive = useMemo(
    () => partnerRows.reduce((sum, row) => sum + parseAmount(row.incentive), 0),
    []
  );
  const totalPaid = useMemo(
    () => partnerRows.reduce((sum, row) => sum + parseAmount(row.paid), 0),
    []
  );

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
              {partnerRows.map((row) => (
                <TableRow key={row.mis}>
                  <TableCell className="font-medium text-gray-800">{row.name}</TableCell>
                  <TableCell className="text-gray-500">{row.mis}</TableCell>
                  <TableCell>{row.achieved}</TableCell>
                  <TableCell>{row.rate}</TableCell>
                  <TableCell className="text-[#4080FF] font-medium">{row.incentive}</TableCell>
                  <TableCell>{row.paid}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-semibold text-gray-900">
                  合计
                </TableCell>
                <TableCell className="font-semibold text-[#4080FF]">
                  {totalIncentive.toFixed(2)}万
                </TableCell>
                <TableCell className="font-semibold text-gray-900">
                  {totalPaid.toFixed(2)}万
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <AiDiagnosisCard items={partnerDiagnosis} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* bd：BD/运营视角 —— KPI 卡片 + 门店激励贡献明细                       */
/* ------------------------------------------------------------------ */
const bdStoreRows = [
  { store: "望京旗舰店", achieved: "12.6万", contribution: 22, incentive: "0.63万" },
  { store: "国贸店", achieved: "8.1万", contribution: 14, incentive: "0.41万" },
  { store: "三里屯店", achieved: "10.4万", contribution: 18, incentive: "0.52万" },
  { store: "西单店", achieved: "7.9万", contribution: 14, incentive: "0.40万" },
  { store: "中关村店", achieved: "10.5万", contribution: 18, incentive: "0.53万" },
  { store: "亦庄店", achieved: "8.2万", contribution: 14, incentive: "0.41万" },
];

const BdView = () => {
  const totalIncentive = useMemo(
    () => bdStoreRows.reduce((sum, row) => sum + parseAmount(row.incentive), 0),
    []
  );

  const summaryCards = [
    { label: "本月应得激励", value: `¥${totalIncentive.toFixed(2)}万`, icon: Wallet },
    { label: "已到账", value: "¥1.85万", icon: CheckCircle2 },
    { label: "待发放", value: `¥${(totalIncentive - 1.85).toFixed(2)}万`, icon: Clock3 },
  ];

  const bdDiagnosis = [
    "本月应得激励¥8,650，已到账¥6,200（72%），剩余¥2,450预计月底发放",
    "朝阳区烤鱼店贡献最高（占比22%），是你的核心门店，建议重点维护续约",
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              {bdStoreRows.map((row) => (
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
                <TableCell colSpan={3} className="font-semibold text-gray-900">
                  个人激励汇总
                </TableCell>
                <TableCell className="font-semibold text-[#4080FF]">
                  {totalIncentive.toFixed(2)}万
                </TableCell>
              </TableRow>
            </TableFooter>
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

const IncentiveCalculation = () => {
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
        title="激励测算"
        description="根据业绩完成情况测算团队/区域激励金额"
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

export default IncentiveCalculation;
