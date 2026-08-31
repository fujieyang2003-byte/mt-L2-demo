import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AiPanel from "@/components/AiPanel";

/* ================================================================== */
/* 城市业绩数据                                                          */
/* ================================================================== */
const CITY_CATEGORIES = ["E类城市", "F类城市", "G类城市", "旅游城市", "非旅游城市"];

const CITY_DATA = {
  summary: [
    { category: "E类城市", cities: "北京、上海、广州、深圳", revenue: 12580, target: 13200, rate: 95, waimai: 7580, daocan: 4200, shangou: 580, yiyao: 220 },
    { category: "F类城市", cities: "杭州、南京、成都、武汉、重庆", revenue: 6230, target: 7200, rate: 87, waimai: 3580, daocan: 2150, shangou: 380, yiyao: 120 },
    { category: "G类城市", cities: "苏州、西安、郑州、长沙、天津", revenue: 3120, target: 4000, rate: 78, waimai: 1520, daocan: 1280, shangou: 220, yiyao: 100 },
    { category: "旅游城市", cities: "三亚、丽江、桂林、厦门", revenue: 680, target: 800, rate: 85, waimai: 120, daocan: 480, shangou: 60, yiyao: 20 },
    { category: "非旅游城市", cities: "其他160个城市", revenue: 456, target: 600, rate: 76, waimai: 46, daocan: 310, shangou: 80, yiyao: 20 },
  ],
  waimai: [
    { category: "E类城市", cities: "北京、上海、广州、深圳", revenue: 7580, target: 7800, rate: 97, merchants: 12500, penetration: 72.5 },
    { category: "F类城市", cities: "杭州、南京、成都、武汉、重庆", revenue: 3580, target: 4000, rate: 90, merchants: 8200, penetration: 65.2 },
    { category: "G类城市", cities: "苏州、西安、郑州、长沙、天津", revenue: 1520, target: 1900, rate: 80, merchants: 5600, penetration: 52.8 },
    { category: "旅游城市", cities: "三亚、丽江、桂林、厦门", revenue: 120, target: 150, rate: 80, merchants: 800, penetration: 38.5 },
    { category: "非旅游城市", cities: "其他160个城市", revenue: 46, target: 65, rate: 71, merchants: 420, penetration: 28.2 },
  ],
  daocan: [
    { category: "E类城市", cities: "北京、上海、广州、深圳", revenue: 4200, target: 4500, rate: 93, merchants: 6800, penetration: 48.5 },
    { category: "F类城市", cities: "杭州、南京、成都、武汉、重庆", revenue: 2150, target: 2500, rate: 86, merchants: 4200, penetration: 42.8 },
    { category: "G类城市", cities: "苏州、西安、郑州、长沙、天津", revenue: 1280, target: 1650, rate: 78, merchants: 3100, penetration: 35.5 },
    { category: "旅游城市", cities: "三亚、丽江、桂林、厦门", revenue: 480, target: 550, rate: 87, merchants: 1200, penetration: 55.2 },
    { category: "非旅游城市", cities: "其他160个城市", revenue: 310, target: 400, rate: 78, merchants: 1800, penetration: 22.5 },
  ],
  shangou: [
    { category: "E类城市", cities: "北京、上海、广州、深圳", revenue: 580, target: 650, rate: 89, merchants: 2100, penetration: 32.5 },
    { category: "F类城市", cities: "杭州、南京、成都、武汉、重庆", revenue: 380, target: 450, rate: 84, merchants: 1400, penetration: 28.8 },
    { category: "G类城市", cities: "苏州、西安、郑州、长沙、天津", revenue: 220, target: 300, rate: 73, merchants: 850, penetration: 22.5 },
    { category: "旅游城市", cities: "三亚、丽江、桂林、厦门", revenue: 60, target: 80, rate: 75, merchants: 200, penetration: 18.5 },
    { category: "非旅游城市", cities: "其他160个城市", revenue: 80, target: 120, rate: 67, merchants: 350, penetration: 12.8 },
  ],
  yiyao: [
    { category: "E类城市", cities: "北京、上海、广州、深圳", revenue: 220, target: 250, rate: 88, merchants: 650, penetration: 25.5 },
    { category: "F类城市", cities: "杭州、南京、成都、武汉、重庆", revenue: 120, target: 150, rate: 80, merchants: 380, penetration: 18.2 },
    { category: "G类城市", cities: "苏州、西安、郑州、长沙、天津", revenue: 100, target: 130, rate: 77, merchants: 280, penetration: 15.5 },
    { category: "旅游城市", cities: "三亚、丽江、桂林、厦门", revenue: 20, target: 25, rate: 80, merchants: 60, penetration: 12.5 },
    { category: "非旅游城市", cities: "其他160个城市", revenue: 20, target: 30, rate: 67, merchants: 80, penetration: 8.5 },
  ],
};

const AI_ITEMS = [
  "E类城市（北上广深）贡献12,580万收入，达成率95%，是四业务线核心收入来源",
  "旅游城市到餐收入480万，渗透率55.2%为全分类最高，旅游场景广告价值突出",
  "非旅游城市合计456万，达成率76%，是最大增量潜力池，建议批量培育和触达",
  "G类城市整体达成率78%，有提升空间，建议加强中小城市商家教育和激励",
];

/* ================================================================== */
/* 辅助组件                                                             */
/* ================================================================== */

/* ================================================================== */
/* 城市业绩主页面                                                        */
/* ================================================================== */
export default function OverviewCity() {
  return (
    <div className="space-y-5">
      <AiPanel items={AI_ITEMS} />

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900">合作商业绩</p>
            <Badge variant="outline" className="text-gray-400 font-normal text-xs">2025年8月</Badge>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary" className="text-xs">汇总</TabsTrigger>
              <TabsTrigger value="waimai" className="text-xs">外卖</TabsTrigger>
              <TabsTrigger value="daocan" className="text-xs">到餐</TabsTrigger>
              <TabsTrigger value="shangou" className="text-xs">闪购</TabsTrigger>
              <TabsTrigger value="yiyao" className="text-xs">医药</TabsTrigger>
            </TabsList>

            {/* 汇总 Tab */}
            <TabsContent value="summary">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap sticky left-0 bg-gray-50/50 z-10">城市分类</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">代表城市</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">总收入</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">总目标</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">达成率</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">外卖</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">到餐</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">闪购</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">医药</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CITY_DATA.summary.map((row) => (
                      <TableRow key={row.category}>
                        <TableCell className="text-xs font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white z-10">{row.category}</TableCell>
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap max-w-[200px] truncate">{row.cities}</TableCell>
                        <TableCell className="text-xs font-semibold text-gray-900 whitespace-nowrap">{row.revenue}万</TableCell>
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">{row.target}万</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">
                          <Badge className={`border-none text-xs font-normal ${row.rate >= 90 ? "bg-emerald-50 text-emerald-600" : row.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                            {row.rate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">{row.waimai}万</TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">{row.daocan}万</TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">{row.shangou}万</TableCell>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">{row.yiyao}万</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* 各业务线 Tab */}
            {["waimai", "daocan", "shangou", "yiyao"].map((biz) => (
              <TabsContent key={biz} value={biz}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap sticky left-0 bg-gray-50/50 z-10">城市分类</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">代表城市</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">收入</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">目标</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">达成率</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">商家数</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 whitespace-nowrap">渗透率</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CITY_DATA[biz].map((row) => (
                        <TableRow key={row.category}>
                          <TableCell className="text-xs font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white z-10">{row.category}</TableCell>
                          <TableCell className="text-xs text-gray-500 whitespace-nowrap max-w-[200px] truncate">{row.cities}</TableCell>
                          <TableCell className="text-xs font-semibold text-gray-900 whitespace-nowrap">{row.revenue}万</TableCell>
                          <TableCell className="text-xs text-gray-500 whitespace-nowrap">{row.target}万</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            <Badge className={`border-none text-xs font-normal ${row.rate >= 90 ? "bg-emerald-50 text-emerald-600" : row.rate >= 80 ? "bg-blue-50 text-[#4080FF]" : "bg-red-50 text-red-500"}`}>
                              {row.rate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 whitespace-nowrap">{row.merchants}</TableCell>
                          <TableCell className="text-xs text-gray-600 whitespace-nowrap">{row.penetration}%</TableCell>
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
