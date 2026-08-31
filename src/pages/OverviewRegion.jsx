import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 区域业绩数据                                                          */
/* ================================================================== */
const REGION_DATA = [
  { region: "粤海区域", summary: { revenue: 4770, target: 5100, rate: 94 }, waimai: { revenue: 2890, target: 3000, rate: 96 }, daocan: { revenue: 1980, target: 2100, rate: 94 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "江苏区域", summary: { revenue: 5415, target: 5900, rate: 92 }, waimai: { revenue: 3265, target: 3500, rate: 93 }, daocan: { revenue: 2150, target: 2400, rate: 90 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "京津冀区域", summary: { revenue: 3465, target: 4400, rate: 79 }, waimai: { revenue: 2105, target: 2600, rate: 81 }, daocan: { revenue: 1360, target: 1800, rate: 76 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "沪杭区域", summary: { revenue: 4730, target: 5200, rate: 91 }, waimai: { revenue: 2850, target: 3100, rate: 92 }, daocan: { revenue: 1880, target: 2100, rate: 90 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "鲁冀区域", summary: { revenue: 2870, target: 3700, rate: 78 }, waimai: { revenue: 1750, target: 2200, rate: 80 }, daocan: { revenue: 1120, target: 1500, rate: 75 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "川藏区域", summary: { revenue: 2630, target: 2750, rate: 96 }, waimai: { revenue: 1950, target: 2000, rate: 98 }, daocan: { revenue: 680, target: 750, rate: 91 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "湘鄂赣区域", summary: { revenue: 2530, target: 3200, rate: 79 }, waimai: { revenue: 1550, target: 1900, rate: 82 }, daocan: { revenue: 980, target: 1300, rate: 75 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "闽台区域", summary: { revenue: 2200, target: 2700, rate: 81 }, waimai: { revenue: 1350, target: 1650, rate: 82 }, daocan: { revenue: 850, target: 1050, rate: 81 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "辽吉区域", summary: { revenue: 1440, target: 2150, rate: 67 }, waimai: { revenue: 1020, target: 1500, rate: 68 }, daocan: { revenue: 420, target: 650, rate: 65 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
  { region: "陕甘青宁区域", summary: { revenue: 1370, target: 1950, rate: 70 }, waimai: { revenue: 850, target: 1200, rate: 71 }, daocan: { revenue: 520, target: 750, rate: 69 }, shangou: { revenue: 0, target: 0, rate: 0 }, yiyao: { revenue: 0, target: 0, rate: 0 } },
];

const AI_ITEMS = [
  "全国10个区域中，粤海区域达成率94%领跑，收入4,770万表现优异",
  "辽吉区域达成率67%为全国最低，缺口710万，建议紧急调配资源",
  "京津冀区域达成率79%，存在较大提升空间，需重点关注北京和天津",
  "川藏区域达成率96%表现亮眼，建议总结其运营经验向其他区域推广",
];

/* ================================================================== */
/* 辅助组件                                                             */
/* ================================================================== */

/* ================================================================== */
/* 区域业绩主页面                                                        */
/* ================================================================== */
export default function OverviewRegion() {
  const [revenueOnly, setRevenueOnly] = useState(false);

  const BizColumns = ({ biz }) => (
    <>
      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">{biz}收入</TableHead>
      {!revenueOnly && <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">{biz}目标</TableHead>}
      {!revenueOnly && <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">{biz}达成率</TableHead>}
    </>
  );

  const BizCells = ({ data }) => (
    <>
      <TableCell className="text-sm whitespace-nowrap text-gray-700">{data.revenue > 0 ? `${data.revenue}万` : "—"}</TableCell>
      {!revenueOnly && <TableCell className="text-sm whitespace-nowrap text-gray-500">{data.target > 0 ? `${data.target}万` : "—"}</TableCell>}
      {!revenueOnly && (
        <TableCell className="text-sm whitespace-nowrap">
          {data.rate > 0 ? (
            <Badge className={`border-none text-xs font-normal ${data.rate >= 90 ? "bg-emerald-50 text-emerald-600" : data.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
              {data.rate}%
            </Badge>
          ) : "—"}
        </TableCell>
      )}
    </>
  );

  return (
<div className="space-y-5">
<AiPanel items={AI_ITEMS} />

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-semibold text-gray-900">区域业绩</p>
              <p className="text-xs text-gray-400 mt-0.5">可用范围：广告业务经理</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">只看收入</span>
                <Switch checked={revenueOnly} onCheckedChange={setRevenueOnly} />
              </div>
              <Badge variant="outline" className="text-gray-400 font-normal text-xs">2025年8月</Badge>
            </div>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary" className="text-xs">汇总</TabsTrigger>
              <TabsTrigger value="waimai" className="text-xs">外卖</TabsTrigger>
              <TabsTrigger value="daocan" className="text-xs">到餐</TabsTrigger>
              <TabsTrigger value="shangou" className="text-xs">闪购</TabsTrigger>
              <TabsTrigger value="yiyao" className="text-xs">医药</TabsTrigger>
            </TabsList>

            {["summary", "waimai", "daocan", "shangou", "yiyao"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap sticky left-0 bg-gray-50/50 z-10">区域</TableHead>
                        {tab === "summary" && (
                          <>
                            <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">总收入</TableHead>
                            {!revenueOnly && <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">总目标</TableHead>}
                            {!revenueOnly && <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">总达成率</TableHead>}
                          </>
                        )}
                        {tab === "summary" && <BizColumns biz="外卖" />}
                        {tab === "summary" && <BizColumns biz="到餐" />}
                        {tab === "summary" && <BizColumns biz="闪购" />}
                        {tab === "summary" && <BizColumns biz="医药" />}
                        {tab !== "summary" && <BizColumns biz={tab === "waimai" ? "外卖" : tab === "daocan" ? "到餐" : tab === "shangou" ? "闪购" : "医药"} />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {REGION_DATA.map((row) => (
                        <TableRow key={row.region}>
                          <TableCell className="text-sm font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white z-10">{row.region}</TableCell>
                          {tab === "summary" && (
                            <>
                              <TableCell className="text-sm font-semibold text-gray-900 whitespace-nowrap">{row.summary.revenue}万</TableCell>
                              {!revenueOnly && <TableCell className="text-sm text-gray-500 whitespace-nowrap">{row.summary.target}万</TableCell>}
                              {!revenueOnly && (
                                <TableCell className="text-sm whitespace-nowrap">
                                  <Badge className={`border-none text-xs font-normal ${row.summary.rate >= 90 ? "bg-emerald-50 text-emerald-600" : row.summary.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                                    {row.summary.rate}%
                                  </Badge>
                                </TableCell>
                              )}
                            </>
                          )}
                          {tab === "summary" && <BizCells data={row.waimai} />}
                          {tab === "summary" && <BizCells data={row.daocan} />}
                          {tab === "summary" && <BizCells data={row.shangou} />}
                          {tab === "summary" && <BizCells data={row.yiyao} />}
                          {tab !== "summary" && <BizCells data={row[tab]} />}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
