import React, { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import PageHeader from "@/components/dashboard/PageHeader";
import DiagnosisPushDialog from "@/components/dashboard/DiagnosisPushDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sparkles,
  Gauge,
  TrendingUp,
  TrendingDown,
  Send,
} from "lucide-react";
import AiPanel from "@/components/AiPanel";

/** 健康评级配置：红黄绿三档 */
const HEALTH_CONFIG = {
  健康: { className: "bg-emerald-50 text-emerald-600", ring: "#12b76a" },
  一般: { className: "bg-amber-50 text-amber-600", ring: "#f79009" },
  预警: { className: "bg-red-50 text-red-500", ring: "#f04438" },
};

const getHealthLevel = (score) => {
  if (score >= 85) return "健康";
  if (score >= 70) return "一般";
  return "预警";
};

const HealthBadge = ({ level }) => {
  const cfg = HEALTH_CONFIG[level] || HEALTH_CONFIG["一般"];
  return <Badge className={`border-none font-normal ${cfg.className}`}>{level}</Badge>;
};

/** 圆形评分环：用 conic-gradient 模拟进度圆环 */
const ScoreRing = ({ score }) => {
  const level = getHealthLevel(score);
  const color = HEALTH_CONFIG[level].ring;
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: `conic-gradient(${color} ${score * 3.6}deg, #eef0f3 0deg)`,
      }}
    >
      <div className="w-[62px] h-[62px] rounded-full bg-white flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-400">评分</span>
      </div>
    </div>
  );
};

/* 商家分层经营分析已拆分为独立页面 MerchantTierAnalysis.jsx */

/* ------------------------------------------------------------------ */
/* platform_admin：总部视角 —— 全国经营健康度仪表盘                     */
/* ------------------------------------------------------------------ */
const regionHealthRows = [
  {
    region: "甘青新区域",
    name: "甘青新区域",
    score: 88,
    details: [
      { city: "兰州", revenue: "186万", rfRate: "92%", mr: "142万", mrRate: "88%", yoy: "+9.6%", mom: "+3.2%" },
      { city: "乌鲁木齐", revenue: "124万", rfRate: "85%", mr: "96万", mrRate: "81%", yoy: "+6.1%", mom: "-1.4%" },
      { city: "西宁", revenue: "98万", rfRate: "90%", mr: "78万", mrRate: "90%", yoy: "+11.3%", mom: "+4.8%" },
    ],
  },
  {
    region: "黑龙江区域",
    name: "黑龙江区域",
    score: 72,
    details: [
      { city: "哈尔滨", revenue: "215万", rfRate: "76%", mr: "158万", mrRate: "74%", yoy: "-2.1%", mom: "-5.6%" },
      { city: "齐齐哈尔", revenue: "87万", rfRate: "71%", mr: "62万", mrRate: "69%", yoy: "-4.8%", mom: "-3.2%" },
      { city: "大庆", revenue: "132万", rfRate: "79%", mr: "101万", mrRate: "77%", yoy: "+1.5%", mom: "-2.0%" },
    ],
  },
  {
    region: "晋蒙区域",
    name: "晋蒙区域",
    score: 65,
    details: [
      { city: "太原", revenue: "156万", rfRate: "68%", mr: "110万", mrRate: "65%", yoy: "-6.3%", mom: "-7.8%" },
      { city: "呼和浩特", revenue: "93万", rfRate: "64%", mr: "68万", mrRate: "63%", yoy: "-8.1%", mom: "-5.4%" },
      { city: "包头", revenue: "81万", rfRate: "70%", mr: "59万", mrRate: "67%", yoy: "-3.5%", mom: "-4.1%" },
    ],
  },
  {
    region: "京津冀区域",
    name: "京津冀区域",
    score: 91,
    details: [
      { city: "北京", revenue: "612万", rfRate: "96%", mr: "478万", mrRate: "93%", yoy: "+13.4%", mom: "+5.1%" },
      { city: "天津", revenue: "245万", rfRate: "90%", mr: "189万", mrRate: "88%", yoy: "+9.8%", mom: "+2.6%" },
      { city: "石家庄", revenue: "178万", rfRate: "88%", mr: "136万", mrRate: "86%", yoy: "+7.2%", mom: "+1.9%" },
    ],
  },
  {
    region: "辽吉区域",
    name: "辽吉区域",
    score: 78,
    details: [
      { city: "沈阳", revenue: "203万", rfRate: "82%", mr: "156万", mrRate: "80%", yoy: "+2.3%", mom: "+0.8%" },
      { city: "长春", revenue: "167万", rfRate: "79%", mr: "124万", mrRate: "77%", yoy: "-1.2%", mom: "-1.6%" },
      { city: "大连", revenue: "189万", rfRate: "85%", mr: "143万", mrRate: "83%", yoy: "+4.6%", mom: "+2.1%" },
    ],
  },
  {
    region: "河南区域",
    name: "河南区域",
    score: 82,
    details: [
      { city: "郑州", revenue: "298万", rfRate: "87%", mr: "226万", mrRate: "84%", yoy: "+6.4%", mom: "+2.9%" },
      { city: "洛阳", revenue: "154万", rfRate: "83%", mr: "117万", mrRate: "81%", yoy: "+3.1%", mom: "+1.0%" },
      { city: "南阳", revenue: "102万", rfRate: "80%", mr: "79万", mrRate: "78%", yoy: "+1.8%", mom: "-0.6%" },
    ],
  },
  {
    region: "浙江区域",
    name: "浙江区域",
    score: 93,
    details: [
      { city: "杭州", revenue: "356万", rfRate: "97%", mr: "278万", mrRate: "95%", yoy: "+14.2%", mom: "+4.4%" },
      { city: "宁波", revenue: "241万", rfRate: "94%", mr: "188万", mrRate: "92%", yoy: "+10.6%", mom: "+3.7%" },
      { city: "温州", revenue: "198万", rfRate: "91%", mr: "152万", mrRate: "90%", yoy: "+8.9%", mom: "+2.5%" },
    ],
  },
  {
    region: "福建区域",
    name: "福建区域",
    score: 86,
    details: [
      { city: "福州", revenue: "221万", rfRate: "89%", mr: "171万", mrRate: "87%", yoy: "+7.8%", mom: "+3.0%" },
      { city: "厦门", revenue: "267万", rfRate: "92%", mr: "206万", mrRate: "90%", yoy: "+9.1%", mom: "+3.6%" },
      { city: "泉州", revenue: "143万", rfRate: "84%", mr: "109万", mrRate: "82%", yoy: "+5.3%", mom: "+1.7%" },
    ],
  },
  {
    region: "川渝区域",
    name: "川渝区域",
    score: 79,
    details: [
      { city: "成都", revenue: "312万", rfRate: "84%", mr: "238万", mrRate: "82%", yoy: "+5.6%", mom: "+1.3%" },
      { city: "重庆", revenue: "289万", rfRate: "81%", mr: "219万", mrRate: "79%", yoy: "+3.9%", mom: "-0.4%" },
      { city: "绵阳", revenue: "76万", rfRate: "75%", mr: "56万", mrRate: "73%", yoy: "+1.2%", mom: "-1.1%" },
    ],
  },
  {
    region: "湖北区域",
    name: "湖北区域",
    score: 68,
    details: [
      { city: "武汉", revenue: "267万", rfRate: "72%", mr: "196万", mrRate: "70%", yoy: "-3.4%", mom: "-6.2%" },
      { city: "宜昌", revenue: "98万", rfRate: "66%", mr: "71万", mrRate: "64%", yoy: "-5.9%", mom: "-4.3%" },
      { city: "襄阳", revenue: "87万", rfRate: "69%", mr: "63万", mrRate: "67%", yoy: "-2.7%", mom: "-3.5%" },
    ],
  },
];

const merchantHealthRows = [
  {
    region: "武夷山总商",
    name: "武夷山总商",
    score: 87,
    details: [
      { city: "南平", revenue: "142万", rfRate: "88%", mr: "108万", mrRate: "86%", yoy: "+8.4%", mom: "+2.7%" },
      { city: "三明", revenue: "96万", rfRate: "85%", mr: "73万", mrRate: "84%", yoy: "+6.7%", mom: "+1.9%" },
      { city: "龙岩", revenue: "78万", rfRate: "90%", mr: "61万", mrRate: "89%", yoy: "+9.2%", mom: "+3.1%" },
    ],
  },
  {
    region: "浙江某总商",
    name: "浙江某总商",
    score: 91,
    details: [
      { city: "杭州", revenue: "268万", rfRate: "95%", mr: "210万", mrRate: "93%", yoy: "+12.6%", mom: "+4.2%" },
      { city: "绍兴", revenue: "134万", rfRate: "91%", mr: "104万", mrRate: "90%", yoy: "+9.8%", mom: "+2.8%" },
      { city: "嘉兴", revenue: "112万", rfRate: "89%", mr: "87万", mrRate: "88%", yoy: "+7.5%", mom: "+2.1%" },
    ],
  },
  {
    region: "河南某总商",
    name: "河南某总商",
    score: 73,
    details: [
      { city: "郑州", revenue: "165万", rfRate: "75%", mr: "122万", mrRate: "73%", yoy: "-1.8%", mom: "-2.9%" },
      { city: "开封", revenue: "68万", rfRate: "70%", mr: "49万", mrRate: "69%", yoy: "-3.2%", mom: "-3.6%" },
      { city: "新乡", revenue: "71万", rfRate: "72%", mr: "52万", mrRate: "71%", yoy: "-0.9%", mom: "-1.4%" },
    ],
  },
  {
    region: "东北某总商",
    name: "东北某总商",
    score: 66,
    details: [
      { city: "沈阳", revenue: "124万", rfRate: "66%", mr: "89万", mrRate: "64%", yoy: "-6.8%", mom: "-8.1%" },
      { city: "长春", revenue: "96万", rfRate: "63%", mr: "68万", mrRate: "62%", yoy: "-7.4%", mom: "-5.9%" },
      { city: "哈尔滨", revenue: "88万", rfRate: "68%", mr: "63万", mrRate: "66%", yoy: "-4.6%", mom: "-4.2%" },
    ],
  },
  {
    region: "川渝某总商",
    name: "川渝某总商",
    score: 82,
    details: [
      { city: "成都", revenue: "187万", rfRate: "85%", mr: "143万", mrRate: "83%", yoy: "+4.9%", mom: "+1.6%" },
      { city: "重庆", revenue: "156万", rfRate: "81%", mr: "118万", mrRate: "80%", yoy: "+3.2%", mom: "+0.7%" },
      { city: "德阳", revenue: "58万", rfRate: "78%", mr: "43万", mrRate: "76%", yoy: "+2.1%", mom: "-0.3%" },
    ],
  },
];

const headquarterDiagnosis = [
  "华北区综合评分68分处于预警状态，收入达成率仅74%，建议重点关注并增派支援",
  "东北区评分76分处于一般水平，MoM环比下降明显，需排查商户流失原因",
  "华东区和西南区表现优秀，可提炼标杆经验向其他区域推广",
  "整体MR达成率偏低，建议推动CPS类产品渗透提升商户活跃度",
];

const HeadquarterView = () => {
  const [dimTab, setDimTab] = useState("region");
  const [selectedItem, setSelectedItem] = useState(null);
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushTarget, setPushTarget] = useState(null);
  const dashboardRows = dimTab === "region" ? regionHealthRows : merchantHealthRows;

  const handleSwitchDim = (nextDim) => {
    setDimTab(nextDim);
    setSelectedItem(null);
  };

  const handleSelectItem = (row) => {
    setSelectedItem((prev) => (prev?.name === row.name ? null : row));
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-gray-50/70">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-medium text-gray-700">评分细则：</span>
            综合评分 = 收入达成率×40% + MR达成率×40% + 消耗环比(MoM)×20%。
            评级标准：≥85分 <span className="text-emerald-600 font-medium">健康（绿色）</span> /
            70-84分 <span className="text-amber-600 font-medium">一般（黄色）</span> /
            &lt;70分 <span className="text-red-500 font-medium">预警（红色）</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">全国经营健康度仪表盘</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={dimTab === "region" ? "default" : "outline"}
                onClick={() => handleSwitchDim("region")}
              >
                按区域
              </Button>
              <Button
                size="sm"
                variant={dimTab === "merchant" ? "default" : "outline"}
                onClick={() => handleSwitchDim("merchant")}
              >
                按总商
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {dashboardRows.map((row) => {
              const level = getHealthLevel(row.score);
              const isActive = selectedItem?.name === row.name;
              return (
                <div
                  key={row.region}
                  onClick={() => handleSelectItem(row)}
                  className={`rounded-lg border p-4 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? "border-[#4080FF] bg-blue-50/40"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <ScoreRing score={row.score} />
                  <p className="text-sm font-medium text-gray-800">{row.region}</p>
                  <HealthBadge level={level} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedItem && (
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-base font-semibold text-gray-900 mb-4">
              {selectedItem.name} 经营明细
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>城市</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>收入完成率(RF)</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>MR完成率</TableHead>
                  <TableHead>YoY</TableHead>
                  <TableHead>MoM</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedItem.details || []).map((detail) => (
                  <TableRow key={detail.city}>
                    <TableCell className="font-medium text-gray-800">{detail.city}</TableCell>
                    <TableCell>{detail.revenue}</TableCell>
                    <TableCell>{detail.rfRate}</TableCell>
                    <TableCell>{detail.mr}</TableCell>
                    <TableCell>{detail.mrRate}</TableCell>
                    <TableCell>
                      <MomText value={detail.yoy} />
                    </TableCell>
                    <TableCell>
                      <MomText value={detail.mom} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#4080FF]"
                        onClick={() => {
                          setPushTarget({ name: detail.city, mis: "demo_user", data: detail });
                          setPushDialogOpen(true);
                        }}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        下发诊断
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
)}

<AiPanel items={headquarterDiagnosis} />

<DiagnosisPushDialog
  open={pushDialogOpen}
  onOpenChange={setPushDialogOpen}
  targetName={pushTarget?.name}
  targetMis={pushTarget?.mis}
  rowData={pushTarget?.data}
/>
</div>
);
};

/* ------------------------------------------------------------------ */
/* biz_manager：业务经理视角 —— 各城市经营健康度                        */
/* ------------------------------------------------------------------ */
const bizManagerRegionKpi = [
  { label: "区域广告收入", value: "¥326万", yoy: "+12.3%", mom: "-2.1%" },
  { label: "区域MR", value: "3.2%", yoy: "+0.4%", mom: "-0.2%" },
  { label: "区域收入完成率(RF)", value: "87.3%", yoy: "+5.6%", mom: "+1.8%" },
];

const bizManagerRows = [
  { city: "金华市", revenue: "58万", rfRate: "92%", mr: "3.5%", mrRate: "96%", yoy: "+15%", mom: "+3%", level: "健康" },
  { city: "杭州市", revenue: "76万", rfRate: "90%", mr: "3.3%", mrRate: "93%", yoy: "+11%", mom: "+2%", level: "健康" },
  { city: "宁波市", revenue: "49万", rfRate: "84%", mr: "3.0%", mrRate: "88%", yoy: "+6%", mom: "+1%", level: "健康" },
  { city: "温州市", revenue: "37万", rfRate: "78%", mr: "2.6%", mrRate: "80%", yoy: "+2%", mom: "-1%", level: "一般" },
  { city: "衢州市", revenue: "29万", rfRate: "73%", mr: "2.3%", mrRate: "75%", yoy: "-3%", mom: "-3%", level: "一般" },
  { city: "丽水市", revenue: "23万", rfRate: "68%", mr: "2.1%", mrRate: "72%", yoy: "-8%", mom: "-5%", level: "预警" },
];

const bizManagerDiagnosis = [
  "丽水市收入完成率仅68%，MoM下滑5%，建议优先介入追收，排查大盘商户欠费及流失原因",
  "衢州市YoY、MoM双降，MR完成率75%处于临界水平，建议加强催收频次并跟进商户续费意愿",
  "金华市、杭州市追收效果显著，RF均超90%，可将其账期管理与催收话术复制至薄弱城市",
  "区域整体RF完成率87.3%，建议月底前重点攻坚丽水、衢州两地缺口，确保区域目标达成",
];

const MomText = ({ value }) => {
  const isDown = value.startsWith("-");
  const Icon = isDown ? TrendingDown : TrendingUp;
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${
        isDown ? "text-red-500" : "text-emerald-600"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {value}
    </span>
  );
};

const BizManagerView = () => {
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushTarget, setPushTarget] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bizManagerRegionKpi.map((item) => (
          <Card key={item.label} className="border-none shadow-sm bg-white">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1.5">{item.value}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-gray-400">
                  YoY <MomText value={item.yoy} />
                </span>
                <span className="text-gray-400">
                  MoM <MomText value={item.mom} />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">各城市追收经营情况</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>城市</TableHead>
                <TableHead>广告收入(万)</TableHead>
                <TableHead>收入完成率(RF)</TableHead>
                <TableHead>MR</TableHead>
                <TableHead>MR完成率</TableHead>
                <TableHead>YoY</TableHead>
                <TableHead>MoM</TableHead>
                <TableHead>健康评级</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bizManagerRows.map((row) => (
                <TableRow key={row.city}>
                  <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                  <TableCell>{row.revenue}</TableCell>
                  <TableCell>{row.rfRate}</TableCell>
                  <TableCell>{row.mr}</TableCell>
                  <TableCell>{row.mrRate}</TableCell>
                  <TableCell>
                    <MomText value={row.yoy} />
                  </TableCell>
                  <TableCell>
                    <MomText value={row.mom} />
                  </TableCell>
                  <TableCell>
                    <HealthBadge level={row.level} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4080FF]"
                      onClick={() => {
                        setPushTarget({ name: row.city, mis: "demo_user", data: row });
                        setPushDialogOpen(true);
                      }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      下发诊断
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AiPanel items={bizManagerDiagnosis} />

      <DiagnosisPushDialog
        open={pushDialogOpen}
        onOpenChange={setPushDialogOpen}
        targetName={pushTarget?.name}
        targetMis={pushTarget?.mis}
        rowData={pushTarget?.data}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* partner：合作商视角 —— 负责城市经营数据 + 团队各 BD 的经营数据          */
/* ------------------------------------------------------------------ */
const partnerCityRows = [
  { city: "建宁县", revenue: "15万", rfRate: "88%", mr: "2.8%", yoy: "+10%", mom: "+2%", level: "健康" },
  { city: "邵武市", revenue: "22万", rfRate: "76%", mr: "2.3%", yoy: "-3%", mom: "-4%", level: "一般" },
  { city: "光泽县", revenue: "8万", rfRate: "62%", mr: "1.5%", yoy: "-12%", mom: "-8%", level: "预警" },
  { city: "武夷山市", revenue: "31万", rfRate: "91%", mr: "3.1%", yoy: "+8%", mom: "+1%", level: "健康" },
];

const partnerBdRows = [
  { name: "王磊", city: "建宁县", stores: 42, activeStores: 39, consumption: "165万", perCapita: "3.93万", mom: "+7.4%" },
  { name: "李娜", city: "邵武市", stores: 35, activeStores: 26, consumption: "108万", perCapita: "3.09万", mom: "-9.1%" },
  { name: "张伟", city: "武夷山市", stores: 38, activeStores: 34, consumption: "128万", perCapita: "3.37万", mom: "+2.8%" },
  { name: "刘洋", city: "建宁县", stores: 40, activeStores: 37, consumption: "142万", perCapita: "3.55万", mom: "+5.6%" },
  { name: "陈静", city: "光泽县", stores: 30, activeStores: 21, consumption: "96万", perCapita: "3.20万", mom: "-13.5%" },
];

const partnerDiagnosis = [
  "光泽县收入完成率(RF)仅 62%，YoY -12%，陈静负责该城市消耗同步下滑 13.5%，建议合作商优先介入排查门店流失及催收问题",
  "邵武市健康评级为「一般」，MoM 连续下滑，建议加强对李娜团队的门店拜访与政策宣导支持",
  "建宁县、武夷山市经营健康，王磊、张伟、刘洋团队人均消耗领先，可将其管理经验在合作商内部推广",
  "建议合作商按城市健康评级分级管理，对预警城市加大巡检频次，对健康城市保持资源倾斜以巩固增长",
];

const PartnerView = () => {
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushTarget, setPushTarget] = useState(null);

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">合作商负责城市经营数据</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>城市</TableHead>
                <TableHead>广告收入(万)</TableHead>
                <TableHead>收入完成率(RF)</TableHead>
                <TableHead>MR</TableHead>
                <TableHead>YoY</TableHead>
                <TableHead>MoM</TableHead>
                <TableHead>健康评级</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerCityRows.map((row) => (
                <TableRow key={row.city}>
                  <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                  <TableCell>{row.revenue}</TableCell>
                  <TableCell>{row.rfRate}</TableCell>
                  <TableCell>{row.mr}</TableCell>
                  <TableCell>
                    <MomText value={row.yoy} />
                  </TableCell>
                  <TableCell>
                    <MomText value={row.mom} />
                  </TableCell>
                  <TableCell>
                    <HealthBadge level={row.level} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4080FF]"
                      onClick={() => {
                        setPushTarget({ name: row.city, mis: "demo_user", data: row });
                        setPushDialogOpen(true);
                      }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      下发诊断
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <p className="text-base font-semibold text-gray-900 mb-4">下属 BD/运营 经营表现</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BD 姓名</TableHead>
                <TableHead>负责城市</TableHead>
                <TableHead>负责门店数</TableHead>
                <TableHead>活跃门店</TableHead>
                <TableHead>总消耗</TableHead>
                <TableHead>人均消耗</TableHead>
                <TableHead>环比</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerBdRows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium text-gray-800">{row.name}</TableCell>
                  <TableCell>{row.city}</TableCell>
                  <TableCell>{row.stores}</TableCell>
                  <TableCell>{row.activeStores}</TableCell>
                  <TableCell>{row.consumption}</TableCell>
                  <TableCell>{row.perCapita}</TableCell>
                  <TableCell>
                    <MomText value={row.mom} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4080FF]"
                      onClick={() => {
                        setPushTarget({ name: row.name, mis: "demo_user", data: row });
                        setPushDialogOpen(true);
                      }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      下发诊断
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AiPanel items={partnerDiagnosis} />

      <DiagnosisPushDialog
        open={pushDialogOpen}
        onOpenChange={setPushDialogOpen}
        targetName={pushTarget?.name}
        targetMis={pushTarget?.mis}
        rowData={pushTarget?.data}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* bd：BD/运营视角 —— 门店级诊断                                        */
/* ------------------------------------------------------------------ */
const bdStoreRows = [
  {
    store: "望京旗舰店",
    level: "健康",
    thisMonth: "12.6万",
    lastMonth: "11.4万",
    mrRate: "96%",
    suggestion: "消耗稳步提升，建议维持当前投放策略并适度加大预算",
  },
  {
    store: "国贸店",
    level: "一般",
    thisMonth: "8.1万",
    lastMonth: "8.6万",
    mrRate: "84%",
    suggestion: "消耗小幅下滑，建议关注核心商户续费情况，提前预警流失风险",
  },
  {
    store: "三里屯店",
    level: "预警",
    thisMonth: "10.4万",
    lastMonth: "14.2万",
    mrRate: "63%",
    suggestion: "消耗下滑明显，建议推 CPS 产品拉动新客户消耗，尽快介入拜访",
  },
  {
    store: "西单店",
    level: "健康",
    thisMonth: "7.9万",
    lastMonth: "7.5万",
    mrRate: "99%",
    suggestion: "MR 率接近满分，建议保持当前节奏，适当挖掘增量商户",
  },
  {
    store: "中关村店",
    level: "健康",
    thisMonth: "10.5万",
    lastMonth: "9.8万",
    mrRate: "97%",
    suggestion: "消耗环比增长良好，建议尝试拓展品牌广告等高价值产品",
  },
  {
    store: "亦庄店",
    level: "预警",
    thisMonth: "4.2万",
    lastMonth: "6.5万",
    mrRate: "58%",
    suggestion: "消耗下滑建议推 CPS 产品，同时排查商户经营状态是否异常",
  },
];

const parseAmount = (value) => parseFloat(value.replace(/[^\d.]/g, "")) || 0;

const StoreCard = ({ item }) => {
  const cfg = HEALTH_CONFIG[item.level] || HEALTH_CONFIG["一般"];
  const thisVal = parseAmount(item.thisMonth);
  const lastVal = parseAmount(item.lastMonth);
  const momPct = lastVal ? (((thisVal - lastVal) / lastVal) * 100).toFixed(1) : "0.0";
  const isDown = thisVal < lastVal;

  return (
    <Card
      className={`border-none shadow-sm bg-white ${
        item.level === "预警" ? "ring-1 ring-red-200" : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-900">{item.store}</p>
          <HealthBadge level={item.level} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">本月消耗 vs 上月</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">
              {item.thisMonth}
              <span className="text-xs text-gray-400 font-normal ml-1">
                / {item.lastMonth}
              </span>
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-sm font-medium ${
              isDown ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {isDown ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            {isDown ? "" : "+"}
            {momPct}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
          <span>MR 率</span>
          <span className="font-medium" style={{ color: cfg.ring }}>
            {item.mrRate}
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50/50 p-3">
          <Sparkles className="w-3.5 h-3.5 text-[#4080FF] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-relaxed">{item.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const BdView = () => {
  const total = bdStoreRows.length;
  const healthyCount = bdStoreRows.filter((row) => row.level === "健康").length;
  const healthyRate = ((healthyCount / total) * 100).toFixed(0);

  const avgMomPct = useMemo(() => {
    const values = bdStoreRows.map((row) => {
      const thisVal = parseAmount(row.thisMonth);
      const lastVal = parseAmount(row.lastMonth);
      return lastVal ? ((thisVal - lastVal) / lastVal) * 100 : 0;
    });
    return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1);
  }, []);

  const summaryCards = [
    { label: "门店健康率", value: `${healthyRate}%`, icon: Gauge },
    {
      label: "平均消耗环比",
      value: `${avgMomPct >= 0 ? "+" : ""}${avgMomPct}%`,
      icon: avgMomPct >= 0 ? TrendingUp : TrendingDown,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bdStoreRows.map((item) => (
          <StoreCard key={item.store} item={item} />
        ))}
      </div>
    </>
  );
};

const VIEW_COMPONENTS = {
  platform_admin: HeadquarterView,
  biz_manager: BizManagerView,
  partner: PartnerView,
  bd: BdView,
};

const BusinessDiagnosis = () => {
  const { currentUser } = useUser();
  const role = currentUser?.role;

  const ViewComponent = useMemo(() => {
    return VIEW_COMPONENTS[role] || HeadquarterView;
  }, [role]);

  return (
    <div>
      <PageHeader
        title="经营诊断"
        description="多维度分析广告业务经营状况，及时发现潜在风险"
      />

      <ViewComponent />
    </div>
  );
};

export default BusinessDiagnosis;
