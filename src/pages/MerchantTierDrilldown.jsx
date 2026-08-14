import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBizLine } from "@/contexts/BizLineContext";
import PageHeader from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Grid3x3,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";

/* ================================================================== */
/* 共享组件 & 工具                                                       */
/* ================================================================== */
const TrendCell = ({ value }) => {
  if (!value) return <TableCell className="text-gray-300">—</TableCell>;
  const isDown = value.startsWith("-") || value.startsWith("−");
  return (
    <TableCell className={isDown ? "text-red-500" : "text-emerald-600"}>
      {isDown ? (
        <TrendingDown className="w-3 h-3 inline mr-0.5" />
      ) : (
        <TrendingUp className="w-3 h-3 inline mr-0.5" />
      )}
      {value}
    </TableCell>
  );
};

const PBadge = ({ level }) => {
  const styles = {
    P0: "bg-red-50 text-red-600",
    P1: "bg-orange-50 text-orange-600",
    P2: "bg-amber-50 text-amber-600",
    P3: "bg-blue-50 text-blue-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
        styles[level] || styles.P3
      }`}
    >
      {level}
    </span>
  );
};

const parseAmount = (value) =>
  parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;

/* ================================================================== */
/* 基础城市池 — 每个城市的基准数据（全量）                                 */
/* ================================================================== */
const baseCities = {
  waimai: [
    { region: "华东区", city: "上海",   gtvBase: 42000, merchantsBase: 5800, adRate: 0.534 },
    { region: "华东区", city: "杭州",   gtvBase: 23000, merchantsBase: 3200, adRate: 0.531 },
    { region: "华东区", city: "南京",   gtvBase: 20000, merchantsBase: 2800, adRate: 0.536 },
    { region: "华东区", city: "苏州",   gtvBase: 18000, merchantsBase: 2500, adRate: 0.520 },
    { region: "华东区", city: "宁波",   gtvBase: 14000, merchantsBase: 1900, adRate: 0.526 },
    { region: "华东区", city: "无锡",   gtvBase:  9000, merchantsBase: 1200, adRate: 0.533 },
    { region: "华东区", city: "合肥",   gtvBase:  8000, merchantsBase: 1100, adRate: 0.527 },
    { region: "华东区", city: "常州",   gtvBase:  6000, merchantsBase:  800, adRate: 0.525 },
    { region: "华南区", city: "广州",   gtvBase: 35000, merchantsBase: 4200, adRate: 0.528 },
    { region: "华南区", city: "深圳",   gtvBase: 32000, merchantsBase: 3800, adRate: 0.515 },
    { region: "华南区", city: "佛山",   gtvBase: 11000, merchantsBase: 1500, adRate: 0.485 },
    { region: "华南区", city: "东莞",   gtvBase: 10000, merchantsBase: 1300, adRate: 0.490 },
    { region: "华北区", city: "北京",   gtvBase: 38000, merchantsBase: 4500, adRate: 0.492 },
    { region: "华北区", city: "天津",   gtvBase: 15000, merchantsBase: 1800, adRate: 0.473 },
    { region: "华北区", city: "济南",   gtvBase: 12000, merchantsBase: 1400, adRate: 0.501 },
    { region: "华北区", city: "青岛",   gtvBase: 13000, merchantsBase: 1600, adRate: 0.498 },
    { region: "西南区", city: "成都",   gtvBase: 28000, merchantsBase: 3400, adRate: 0.518 },
    { region: "西南区", city: "重庆",   gtvBase: 22000, merchantsBase: 2800, adRate: 0.505 },
    { region: "东北区", city: "沈阳",   gtvBase:  8000, merchantsBase: 1000, adRate: 0.442 },
    { region: "东北区", city: "大连",   gtvBase:  7000, merchantsBase:  900, adRate: 0.435 },
    { region: "东北区", city: "哈尔滨", gtvBase:  6000, merchantsBase:  800, adRate: 0.450 },
  ],
  daocan: [
    { region: "华东区", city: "上海",   gtvBase: 3200, merchantsBase: 800, adRate: 0.085 },
    { region: "华东区", city: "杭州",   gtvBase: 2400, merchantsBase: 600, adRate: 0.083 },
    { region: "华东区", city: "南京",   gtvBase: 2000, merchantsBase: 500, adRate: 0.080 },
    { region: "华东区", city: "黄山",   gtvBase: 1200, merchantsBase: 300, adRate: 0.200 },
    { region: "华东区", city: "苏州",   gtvBase: 1600, merchantsBase: 400, adRate: 0.075 },
    { region: "华东区", city: "宁波",   gtvBase: 1400, merchantsBase: 350, adRate: 0.086 },
    { region: "华东区", city: "无锡",   gtvBase: 1000, merchantsBase: 250, adRate: 0.080 },
    { region: "华东区", city: "合肥",   gtvBase:  880, merchantsBase: 220, adRate: 0.091 },
    { region: "华南区", city: "广州",   gtvBase: 2800, merchantsBase: 700, adRate: 0.082 },
    { region: "华南区", city: "深圳",   gtvBase: 2200, merchantsBase: 550, adRate: 0.078 },
    { region: "华南区", city: "厦门",   gtvBase: 1100, merchantsBase: 280, adRate: 0.155 },
    { region: "华南区", city: "佛山",   gtvBase: 1000, merchantsBase: 250, adRate: 0.070 },
    { region: "华北区", city: "北京",   gtvBase: 2500, merchantsBase: 620, adRate: 0.068 },
    { region: "华北区", city: "天津",   gtvBase: 1200, merchantsBase: 300, adRate: 0.062 },
    { region: "华北区", city: "青岛",   gtvBase: 1300, merchantsBase: 320, adRate: 0.075 },
    { region: "华北区", city: "济南",   gtvBase: 1100, merchantsBase: 280, adRate: 0.072 },
    { region: "西南区", city: "成都",   gtvBase: 1800, merchantsBase: 450, adRate: 0.090 },
    { region: "西南区", city: "重庆",   gtvBase: 1400, merchantsBase: 350, adRate: 0.082 },
    { region: "东北区", city: "沈阳",   gtvBase:  600, merchantsBase: 150, adRate: 0.045 },
    { region: "东北区", city: "大连",   gtvBase:  500, merchantsBase: 130, adRate: 0.040 },
  ],
};

/* ================================================================== */
/* P级 + 行标签 + 列标签 → 差异化参数                                     */
/*                                                                    */
/* 逻辑：                                                              */
/*  - P0: 高MR高ARPU，少商家（头部精华）                                 */
/*  - P1: 中高MR，中等商家                                              */
/*  - P2: 中低MR，多商家                                                */
/*  - P3: 低MR低ARPU，最多商家（长尾）                                   */
/*  - 行标签（新店/头部/腰部/尾部）进一步调节商户比例和MR                  */
/*  - 列标签（大体量/中小体量/旅游/常规/核心/普通）调节城市子集             */
/* ================================================================== */
const pLevelProfile = {
  P0: { mrMul: 1.45, merchantMul: 0.04, arpuMul: 3.0,  yoyAdj: 3.0,  momAdj: 1.5 },
  P1: { mrMul: 1.15, merchantMul: 0.12, arpuMul: 1.6,  yoyAdj: 1.5,  momAdj: 0.8 },
  P2: { mrMul: 0.85, merchantMul: 0.35, arpuMul: 0.8,  yoyAdj: 0.2,  momAdj: -0.2 },
  P3: { mrMul: 0.60, merchantMul: 0.49, arpuMul: 0.35, yoyAdj: -2.0, momAdj: -1.5 },
};

const rowLabelAdj = {
  "新店":     { mrMul: 1.35, merchantMul: 0.08, arpuMul: 0.3,  yoyExtra: 15,  momExtra: 5 },
  "头部老店": { mrMul: 1.10, merchantMul: 0.06, arpuMul: 2.0,  yoyExtra: 2,   momExtra: 1 },
  "头部":     { mrMul: 1.10, merchantMul: 0.06, arpuMul: 2.0,  yoyExtra: 2,   momExtra: 1 },
  "腰部老店": { mrMul: 1.00, merchantMul: 0.15, arpuMul: 1.2,  yoyExtra: 0,   momExtra: 0 },
  "腰部":     { mrMul: 1.00, merchantMul: 0.15, arpuMul: 1.2,  yoyExtra: 0,   momExtra: 0 },
  "尾部老店": { mrMul: 0.90, merchantMul: 0.55, arpuMul: 0.5,  yoyExtra: -3,  momExtra: -2 },
  "尾部":     { mrMul: 0.90, merchantMul: 0.55, arpuMul: 0.5,  yoyExtra: -3,  momExtra: -2 },
  "腰尾部老店":{mrMul: 0.95, merchantMul: 0.40, arpuMul: 0.7,  yoyExtra: -1,  momExtra: -1 },
  "腰尾部":   { mrMul: 0.95, merchantMul: 0.40, arpuMul: 0.7,  yoyExtra: -1,  momExtra: -1 },
};

const largeCities = ["上海", "广州", "北京", "成都", "杭州", "深圳", "南京", "苏州", "重庆", "天津"];
const tourCities = ["黄山", "厦门", "杭州", "成都", "南京", "重庆"];

const filterByColumn = (allCities, colLabel) => {
  if (!colLabel || colLabel === "全部") return allCities;

  const isLarge = colLabel.includes("大体量") || colLabel.includes("核心");
  const isSmall = colLabel.includes("中小") || colLabel.includes("普通");
  const isTour = colLabel.includes("旅游");
  const isNorm = colLabel.includes("常规");

  if (isTour && isLarge) return allCities.filter((c) => tourCities.includes(c.city) && largeCities.includes(c.city));
  if (isTour && isSmall) return allCities.filter((c) => tourCities.includes(c.city) && !largeCities.includes(c.city));
  if (isNorm && isLarge) return allCities.filter((c) => !tourCities.includes(c.city) && largeCities.includes(c.city));
  if (isNorm && isSmall) return allCities.filter((c) => !tourCities.includes(c.city) && !largeCities.includes(c.city));
  if (isLarge) return allCities.filter((c) => largeCities.includes(c.city));
  if (isSmall) return allCities.filter((c) => !largeCities.includes(c.city));
  if (isTour) return allCities.filter((c) => tourCities.includes(c.city));
  if (isNorm) return allCities.filter((c) => !tourCities.includes(c.city));

  return allCities;
};

/* 伪随机但确定性（基于城市名+P级 hash） */
const seedRand = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return ((h % 1000) + 1000) % 1000 / 1000;
};

const generateCityRow = (base, pLevel, rowLabel, bizLine) => {
  const pp = pLevelProfile[pLevel] || pLevelProfile.P3;
  const rp = rowLabelAdj[rowLabel] || rowLabelAdj["尾部老店"];
  const seed = seedRand(base.city + pLevel + rowLabel);
  const rand2 = seedRand(base.city + pLevel + "v2");

  const isWaimai = bizLine === "waimai";
  const baseMr = isWaimai ? 3.0 : 0.8;

  // MR
  const mrVal = baseMr * pp.mrMul * rp.mrMul * (0.85 + seed * 0.3);
  const mrYoyVal = (pp.yoyAdj + rp.yoyExtra) * (0.5 + rand2 * 0.8);
  const mrMomVal = (pp.momAdj + rp.momExtra) * (0.4 + seed * 0.7);

  // 商家数（该P级行的商家数 = 总商家 * 比例）
  const merchantCount = Math.round(base.merchantsBase * pp.merchantMul * rp.merchantMul);
  const adMerchantCount = Math.round(merchantCount * base.adRate * (0.6 + rand2 * 0.5));

  // 收入 = GTV * MR
  const gtvNum = Math.round(base.gtvBase * pp.merchantMul * rp.merchantMul * (0.8 + seed * 0.4));
  const revenueNum = Math.round(gtvNum * mrVal / 100);

  // ARPU
  const arpuVal = adMerchantCount > 0 ? revenueNum / adMerchantCount : 0;

  // YoY / MoM for revenue
  const revYoy = pp.yoyAdj + rp.yoyExtra + (seed - 0.5) * 6;
  const revMom = pp.momAdj + rp.momExtra + (rand2 - 0.5) * 4;

  // 渗透率
  const penVal = base.adRate * 100 * (0.7 + rand2 * 0.6) * (pp.merchantMul > 0.3 ? 0.9 : 1.1);

  const fmt = (v, suffix = "") => `${v >= 0 ? "+" : ""}${v.toFixed(1)}${suffix}`;

  if (isWaimai) {
    const gtvWan = gtvNum / 100; // 转成万
    return {
      region: base.region,
      city: base.city,
      revenue: `${revenueNum}万`,
      gtv: gtvWan >= 10000 ? `${(gtvWan / 10000).toFixed(1)}亿` : `${gtvWan.toFixed(0)}万`,
      mr: `${mrVal.toFixed(2)}%`,
      mrYoy: fmt(mrYoyVal, "pp"),
      mrMom: fmt(mrMomVal, "pp"),
      penetration: `${penVal.toFixed(1)}%`,
      adMerchants: adMerchantCount >= 10000 ? `${(adMerchantCount / 10000).toFixed(1)}万` : `${adMerchantCount}`,
      arpu: `${arpuVal.toFixed(2)}万`,
      yoy: fmt(revYoy, "%"),
      mom: fmt(revMom, "%"),
    };
  } else {
    return {
      region: base.region,
      city: base.city,
      revenue: `${revenueNum}万`,
      gtv: `${gtvNum}万`,
      mr: `${mrVal.toFixed(2)}%`,
      mrYoy: fmt(mrYoyVal, "pp"),
      mrMom: fmt(mrMomVal, "pp"),
      penetration: `${penVal.toFixed(1)}%`,
      adMerchants: adMerchantCount >= 10000 ? `${(adMerchantCount / 10000).toFixed(1)}万` : `${adMerchantCount}`,
      arpu: `${arpuVal.toFixed(2)}万`,
      yoy: fmt(revYoy, "%"),
      mom: fmt(revMom, "%"),
    };
  }
};

/* ================================================================== */
/* 主组件                                                               */
/* ================================================================== */
const MerchantTierDrilldown = () => {
  const [searchParams] = useSearchParams();
  const { bizLine } = useBizLine();
  const navigate = useNavigate();

  const pLevel = searchParams.get("pLevel") || "P0";
  const rowLabel = searchParams.get("rowLabel") || "";
  const colLabel = searchParams.get("colLabel") || "";
  const filter = searchParams.get("filter") || "";

  const allBase = baseCities[bizLine] || baseCities.waimai;
  const filteredBase = filterByColumn(allBase, colLabel);
  const cities = filteredBase.map((b) => generateCityRow(b, pLevel, rowLabel, bizLine));

  // 汇总
  const totalRevenue = cities.reduce((sum, c) => sum + parseAmount(c.revenue), 0);
  const totalGtv = cities.reduce((sum, c) => {
    const v = parseAmount(c.gtv);
    return sum + (c.gtv.includes("亿") ? v * 10000 : v);
  }, 0);
  const totalAdMerchants = cities.reduce((sum, c) => sum + parseAmount(c.adMerchants), 0);
  const avgMr = cities.length > 0 ? cities.reduce((s, c) => s + parseAmount(c.mr), 0) / cities.length : 0;

  return (
    <div className="space-y-5">
      {/* 返回 + 标题 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#4080FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <PageHeader
          title="商家分层透视"
          description={`${rowLabel} × ${colLabel} — 城市级明细数据`}
        />
      </div>

      {/* 筛选条件信息条 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <PBadge level={pLevel} />
            <div className="flex items-center gap-2 text-sm">
              <Grid3x3 className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500">行：</span>
              <span className="font-medium text-gray-800">{rowLabel}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">列：</span>
              <span className="font-medium text-gray-800">{colLabel}</span>
            </div>
            {filter && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400">
                  筛选条件：{filter}
                </span>
              </>
            )}
            <Badge className="bg-blue-50 text-[#4080FF] border-none font-normal ml-auto">
              共 {cities.length} 个城市
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 汇总指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="text-xs text-gray-500 mb-1">总收入</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalRevenue.toFixed(0)}万
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="text-xs text-gray-500 mb-1">总GTV</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalGtv >= 10000 ? `${(totalGtv / 10000).toFixed(1)}亿` : `${totalGtv.toFixed(0)}万`}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="text-xs text-gray-500 mb-1">平均MR</div>
            <div className="text-2xl font-bold text-gray-900">
              {avgMr.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5 pb-5">
            <div className="text-xs text-gray-500 mb-1">广告商家数</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalAdMerchants >= 10000 ? `${(totalAdMerchants / 10000).toFixed(1)}万` : `${totalAdMerchants}`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 城市明细表 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">城市级明细</h2>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">区域</TableHead>
                  <TableHead className="min-w-[80px]">城市</TableHead>
                  <TableHead>收入</TableHead>
                  <TableHead>收入YoY</TableHead>
                  <TableHead>收入MoM</TableHead>
                  <TableHead>GTV</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>MR YoY</TableHead>
                  <TableHead>MR MoM</TableHead>
                  <TableHead>渗透率</TableHead>
                  <TableHead>广告商家数</TableHead>
                  <TableHead>ARPU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((row, i) => (
                  <TableRow key={`${row.city}-${i}`}>
                    <TableCell className="text-gray-500">{row.region}</TableCell>
                    <TableCell className="font-semibold text-gray-900">
                      {row.city}
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {row.revenue}
                    </TableCell>
                    <TrendCell value={row.yoy} />
                    <TrendCell value={row.mom} />
                    <TableCell className="text-gray-600">{row.gtv}</TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {row.mr}
                    </TableCell>
                    <TrendCell value={row.mrYoy} />
                    <TrendCell value={row.mrMom} />
                    <TableCell className="text-gray-600">
                      {row.penetration}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {row.adMerchants}
                    </TableCell>
                    <TableCell className="text-gray-600">{row.arpu}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* AI 分析 */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4080FF]" />
            AI 智能分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
              <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">
                  {pLevel}级 · {rowLabel}×{colLabel}共覆盖{cities.length}个城市
                </p>
                <p className="leading-relaxed">
                  总收入{totalRevenue.toFixed(0)}万，总GTV{totalGtv >= 10000 ? `${(totalGtv / 10000).toFixed(1)}亿` : `${totalGtv.toFixed(0)}万`}，
                  平均MR {avgMr.toFixed(2)}%，广告商家{totalAdMerchants >= 10000 ? `${(totalAdMerchants / 10000).toFixed(1)}万` : totalAdMerchants}。
                  {pLevel === "P0" && "该层级为最高优先级商家，MR和ARPU显著高于均值，是核心收入贡献池。"}
                  {pLevel === "P3" && "该层级为长尾商家，数量大但MR和ARPU偏低，是增量空间最大的群体。"}
                </p>
              </div>
            </div>
            {cities.length > 0 && (
              <>
                {(() => {
                  const sortedByMr = [...cities].sort(
                    (a, b) => parseAmount(b.mr) - parseAmount(a.mr)
                  );
                  const top = sortedByMr[0];
                  const bottom = sortedByMr[sortedByMr.length - 1];
                  return (
                    <>
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800 mb-0.5">
                            {top.city}MR最高，标杆复制价值大
                          </p>
                          <p className="leading-relaxed">
                            {top.city}（{top.region}）MR {top.mr}，收入{top.revenue}，
                            ARPU {top.arpu}，渗透率{top.penetration}。
                            建议提炼其广告投放策略与运营经验，向同层级低MR城市推广。
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-white text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800 mb-0.5">
                            {bottom.city}MR最低，待提升空间大
                          </p>
                          <p className="leading-relaxed">
                            {bottom.city}（{bottom.region}）MR仅{bottom.mr}，收入{bottom.revenue}，
                            渗透率{bottom.penetration}。
                            {pLevel === "P0" || pLevel === "P1"
                              ? "作为高优层级，建议优先配置客户经理资源，推进品牌广告升级。"
                              : "建议通过批量ROI优化、首充礼包和自动化营销批量触达，提升广告渗透。"}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantTierDrilldown;
