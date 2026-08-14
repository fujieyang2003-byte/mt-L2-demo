import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useBizLine } from "@/contexts/BizLineContext";
import PageHeader from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
  Store,
  Sparkles,
  Users,
  Megaphone,
  DollarSign,
  Layers,
  Grid3x3,
  Info,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";

/* ================================================================== */
/* P 级别配色                                                           */
/* ================================================================== */
const pLevelStyle = {
  P0: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", label: "P0" },
  P1: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", label: "P1" },
  P2: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", label: "P2" },
  P3: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", label: "P3" },
};
const PBadge = ({ level }) => {
  const s = pLevelStyle[level] || pLevelStyle.P3;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
};

/* ================================================================== */
/* 矩阵单元格组件                                                       */
/* ================================================================== */
const MatrixCell = ({ cell, colSpan, rowLabel, colLabel }) => {
  const navigate = useNavigate();
  if (!cell) {
    return <div className="border border-gray-100 bg-gray-50/30 rounded-lg min-h-[140px]" />;
  }
  const s = pLevelStyle[cell.pLevel] || pLevelStyle.P3;
  const handleDrilldown = () => {
    const params = new URLSearchParams({
      pLevel: cell.pLevel,
      rowLabel: rowLabel || "",
      colLabel: colLabel || "",
      filter: cell.filter || "",
    });
    navigate(`/merchant/drilldown?${params.toString()}`);
  };
  return (
    <div
      className={`border ${s.border} rounded-lg p-3 min-h-[140px] flex flex-col gap-1.5 bg-white hover:shadow-md transition-shadow cursor-pointer group`}
      style={colSpan ? { gridColumn: `span ${colSpan}` } : undefined}
      onClick={handleDrilldown}
    >
      {/* 头部：P级别 + 门店数 + 透视入口 */}
      <div className="flex items-center justify-between">
        <PBadge level={cell.pLevel} />
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{cell.merchantNote}</span>
          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#4080FF] transition-colors" />
        </div>
      </div>
      {/* 指标 */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-0.5">
        {cell.gtvShare && (
          <div className="text-xs">
            <span className="text-gray-400">GTV占比 </span>
            <span className="text-gray-700 font-medium">{cell.gtvShare}</span>
          </div>
        )}
        {cell.adMerchants && (
          <div className="text-xs">
            <span className="text-gray-400">广告商家 </span>
            <span className="text-gray-700 font-medium">{cell.adMerchants}</span>
          </div>
        )}
        {cell.revenueShare && (
          <div className="text-xs">
            <span className="text-gray-400">收入占比 </span>
            <span className="text-gray-700 font-medium">{cell.revenueShare}</span>
          </div>
        )}
        {cell.mr && (
          <div className="text-xs">
            <span className="text-gray-400">MR </span>
            <span className="text-gray-700 font-medium">{cell.mr}</span>
          </div>
        )}
      </div>
      {/* 筛选条件 */}
      {cell.filter && (
        <div className="mt-auto pt-1.5 border-t border-dashed border-gray-100">
          <p className="text-[10px] text-gray-400 leading-tight">
            <Info className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
            {cell.filter}
          </p>
        </div>
      )}
    </div>
  );
};

/* ================================================================== */
/* 行 / 列汇总条                                                        */
/* ================================================================== */
const SummaryBar = ({ label, items, color = "text-gray-600" }) => (
  <div className="flex items-center gap-3 text-xs flex-wrap py-1">
    <span className={`font-semibold ${color}`}>{label}</span>
    {items.map((item, i) => (
      <span key={i} className="text-gray-400">
        {item.label} <span className="text-gray-700 font-medium">{item.value}</span>
        {i < items.length - 1 && <span className="text-gray-200 mx-1">·</span>}
      </span>
    ))}
  </div>
);

/* ================================================================== */
/* RateProgress — 表格内进度条                                          */
/* ================================================================== */
const RateProgress = ({ rate }) => (
  <div className="flex items-center gap-2">
    <Progress value={Math.min(rate, 100)} className="h-2 flex-1" />
    <span className="text-xs text-gray-500 w-10 shrink-0">{rate}%</span>
  </div>
);

/* ================================================================== */
/* 矩阵渲染组件                                                         */
/* ================================================================== */
const SegmentationMatrix = ({ data }) => {
  const colCount = data.columns.length;

  return (
    <div className="space-y-4">
      {/* 列头 */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `100px repeat(${colCount}, 1fr)` }}
      >
        <div></div>
        {data.columns.map((col) => (
          <div key={col.id} className="text-center">
            <div className="inline-flex flex-col items-center px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 w-full">
              <span className="text-sm font-semibold text-gray-800">{col.label}</span>
              <span className="text-xs text-gray-400 mt-0.5">{col.count}</span>
              <span className="text-[10px] text-gray-300 mt-0.5">{col.subLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 行 */}
      {data.rows.map((row) => (
        <div key={row.id}>
          <div
            className="grid gap-3 items-stretch"
            style={{ gridTemplateColumns: `100px repeat(${colCount}, 1fr)` }}
          >
            {/* 行标签 */}
            <div className="flex flex-col justify-center px-2">
              <span className="text-sm font-semibold text-gray-800">{row.label}</span>
              <span className="text-[10px] text-gray-400 mt-1 leading-tight">{row.filter}</span>
            </div>
            {/* 单元格 */}
            {row.fullSpan ? (
              <MatrixCell cell={row.cells[0]} colSpan={colCount} rowLabel={row.label} colLabel="全部" />
            ) : (
              row.cells.map((cell, i) => <MatrixCell key={i} cell={cell} rowLabel={row.label} colLabel={data.columns[i]?.label || ""} />)
            )}
          </div>
          {/* 行汇总 */}
          {row.rowSummary && (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `100px repeat(${colCount}, 1fr)` }}
            >
              <div></div>
              <div className="col-span-full">
                <SummaryBar label={`＞ ${row.label}合计`} items={row.rowSummary} color="text-gray-500" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 列汇总 */}
      <div className="pt-2 border-t border-gray-100">
        {data.columnSummary.map((cs, i) => (
          <SummaryBar key={i} label={cs.label} items={cs.items} color="text-[#4080FF]" />
        ))}
      </div>
    </div>
  );
};

/* ================================================================== */
/* AI 智能分析卡片                                                       */
/* ================================================================== */
const AiDiagnosisCard = ({ items }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="pt-5">
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

/* ================================================================== */
/* ====== PLATFORM_ADMIN: 全国数据（保持不变） ======                   */
/* ================================================================== */
const summaryStatsMap = {
  waimai: [
    { label: "交易商家总数", value: "116.1万", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告商家数", value: "61.6万", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "53.1%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "覆盖城市数", value: "2109", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  ],
  daocan: [
    { label: "动销商家总数", value: "31.7万", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告商家数", value: "2.6万", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "8.2%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "覆盖城市数", value: "1749", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  ],
};

const waimaiMatrix = {
  title: "下沉外卖交易商家分层",
  totalLabel: "交易商家 116.1万",
  columns: [
    { id: "large", label: "大体量城市", subLabel: "4月消费GTV ≥ 500万", count: "668个" },
    { id: "small", label: "中小体量城市", subLabel: "4月消费GTV < 500万", count: "1441个" },
  ],
  columnSummary: [
    { label: "大体量城市", items: [{ label: "GTV占比", value: "68%" }, { label: "收入占比", value: "75%" }] },
    { label: "中小体量城市", items: [{ label: "GTV占比", value: "29%" }, { label: "收入占比", value: "22%" }] },
  ],
  rows: [
    {
      id: "new", label: "新店", filter: "26年4月上线", fullSpan: true,
      cells: [{ pLevel: "P0", merchantNote: "6.6万（6%）", gtvShare: "2%", adMerchants: "4.5万（7%）", revenueShare: "3%", mr: "3.54%", filter: "26年4月上线" }],
    },
    {
      id: "head", label: "头部老店", filter: "4月消费GTV ≥ 4万",
      rowSummary: [{ label: "门店", value: "5.2万（4%）" }, { label: "GTV占比", value: "32%" }, { label: "收入占比", value: "40%" }],
      cells: [
        { pLevel: "P0", merchantNote: "4.0万（3%）", gtvShare: "25%", adMerchants: "3.4万（5%）", revenueShare: "34%", mr: "3.19%", filter: "4月消费GTV ≥ 4万 且 城市GTV ≥ 500万" },
        { pLevel: "P1", merchantNote: "1.2万（1%）", gtvShare: "7%", adMerchants: "0.9万（1%）", revenueShare: "6%", mr: "2.08%", filter: "4月消费GTV ≥ 4万 且 城市GTV < 500万" },
      ],
    },
    {
      id: "waist", label: "腰部老店", filter: "2万 ≤ 4月消费GTV < 4万",
      rowSummary: [{ label: "门店", value: "9.5万（8%）" }, { label: "GTV占比", value: "24%" }, { label: "收入占比", value: "26%" }],
      cells: [
        { pLevel: "P1", merchantNote: "6.7万（6%）", gtvShare: "17%", adMerchants: "5.2万（8%）", revenueShare: "20%", mr: "2.77%", filter: "2万≤GTV<4万 且 城市GTV ≥ 500万" },
        { pLevel: "P2", merchantNote: "2.8万（2%）", gtvShare: "7%", adMerchants: "2.0万（3%）", revenueShare: "6%", mr: "2.07%", filter: "2万≤GTV<4万 且 城市GTV < 500万" },
      ],
    },
    {
      id: "tail", label: "尾部老店", filter: "4月消费GTV < 2万",
      rowSummary: [{ label: "门店", value: "91.4万（79%）" }, { label: "GTV占比", value: "41%" }, { label: "收入占比", value: "30%" }],
      cells: [
        { pLevel: "P2", merchantNote: "55.5万（48%）", gtvShare: "26%", adMerchants: "29.5万（47%）", revenueShare: "21%", mr: "1.99%", filter: "4月消费GTV < 2万 且 城市GTV ≥ 500万" },
        { pLevel: "P3", merchantNote: "35.9万（31%）", gtvShare: "15%", adMerchants: "16.1万（25%）", revenueShare: "9%", mr: "1.48%", filter: "4月消费GTV < 2万 且 城市GTV < 500万" },
      ],
    },
  ],
  aiItems: [
    { title: "头部老店×大体量城市是核心收入池", text: "头部老店在大体量城市仅4.0万门店（3%），却贡献34%的收入和25%的GTV，MR高达3.19%。建议配置专属客户经理，推进品牌广告升级，预期ARPU仍有20%提升空间。" },
    { title: "尾部老店×大体量城市是最大增量机会", text: "尾部老店在大体量城市有55.5万门店（48%），广告商家29.5万（47%），MR仅1.99%，收入占比21%低于GTV占比26%。若MR提升0.5pct，预计月增收超千万。建议批量ROI优化+流量扶持。" },
    { title: "中小体量城市渗透空间大但MR偏低", text: "中小体量城市覆盖35.9万尾部老店，MR仅1.48%，远低于大体量城市的1.99%。建议通过首充礼包+自动化营销批量触达，按2%转化率预计月增收约200万。" },
    { title: "新店冷启专项", text: "新店6.6万（6%），广告渗透7%，MR 3.54%为全矩阵最高。说明已投广新店效果显著，建议加大新店冷启破冰力度，目标渗透率从7%提升至15%。" },
  ],
};

const daocanMatrix = {
  title: "下沉到餐动销商家分层",
  totalLabel: "动销商家 31.7万",
  columns: [
    { id: "large_tour", label: "大体量旅游城市", subLabel: "GTV≥100万·旅游", count: "182个" },
    { id: "large_norm", label: "大体量常规城市", subLabel: "GTV≥100万·常规", count: "325个" },
    { id: "small_tour", label: "中小体量旅游城市", subLabel: "GTV<100万·旅游", count: "493个" },
    { id: "small_norm", label: "中小体量常规城市", subLabel: "GTV<100万·常规", count: "749个" },
  ],
  columnSummary: [
    { label: "大体量城市(507个)", items: [{ label: "GTV占比", value: "72%" }, { label: "收入占比", value: "85%" }] },
    { label: "中小体量城市(1242个)", items: [{ label: "GTV占比", value: "28%" }, { label: "收入占比", value: "15%" }] },
  ],
  rows: [
    {
      id: "new", label: "新店", filter: "近90天首次有动销商家", fullSpan: true,
      cells: [{ pLevel: "P0", merchantNote: "0.4万（1%）", gtvShare: "0.1%", adMerchants: "134（0.5%）", revenueShare: "0.01%", mr: "0.15%", filter: "近90天首次有动销商家" }],
    },
    {
      id: "head", label: "头部老店", filter: "4月实付验证GTV ≥ 1万",
      rowSummary: [{ label: "门店", value: "4.3万（14%）" }, { label: "GTV占比", value: "74%" }, { label: "收入占比", value: "73%" }],
      cells: [
        { pLevel: "P0", merchantNote: "1.0万（3%）", gtvShare: "22%", adMerchants: "0.4万（15%）", revenueShare: "39%", mr: "1.71%", filter: "实付GTV≥1万 且 大体量旅游城市" },
        { pLevel: "P0", merchantNote: "1.9万（6%）", gtvShare: "35%", adMerchants: "0.5万（21%）", revenueShare: "26%", mr: "0.71%", filter: "实付GTV≥1万 且 大体量常规城市" },
        { pLevel: "P1", merchantNote: "0.5万（2%）", gtvShare: "7%", adMerchants: "0.1万（5%）", revenueShare: "5%", mr: "0.73%", filter: "实付GTV≥1万 且 中小体量旅游城市" },
        { pLevel: "P1", merchantNote: "0.8万（3%）", gtvShare: "11%", adMerchants: "0.1万（5%）", revenueShare: "4%", mr: "0.30%", filter: "实付GTV≥1万 且 中小体量常规城市" },
      ],
    },
    {
      id: "tail", label: "腰尾部老店", filter: "4月实付验证GTV < 1万",
      rowSummary: [{ label: "门店", value: "26.9万（85%）" }, { label: "GTV占比", value: "26%" }, { label: "收入占比", value: "27%" }],
      cells: [
        { pLevel: "P1", merchantNote: "5.3万（17%）", gtvShare: "6%", adMerchants: "0.5万（18%）", revenueShare: "13%", mr: "2.03%", filter: "实付GTV<1万 且 大体量旅游城市" },
        { pLevel: "P2", merchantNote: "9.9万（31%）", gtvShare: "10%", adMerchants: "0.5万（5%）", revenueShare: "8%", mr: "0.76%", filter: "实付GTV<1万 且 大体量常规城市" },
        { pLevel: "P2", merchantNote: "4.5万（14%）", gtvShare: "4%", adMerchants: "0.2万（10%）", revenueShare: "4%", mr: "1.05%", filter: "实付GTV<1万 且 中小体量旅游城市" },
        { pLevel: "P3", merchantNote: "7.2万（23%）", gtvShare: "6%", adMerchants: "0.2万（7%）", revenueShare: "2%", mr: "0.34%", filter: "实付GTV<1万 且 中小体量常规城市" },
      ],
    },
  ],
  aiItems: [
    { title: "头部老店×大体量旅游城市是收入核心", text: "头部老店在大体量旅游城市仅1.0万门店（3%），却贡献39%的收入和22%的GTV，MR高达1.71%。旅游城市消费弹性大，建议推进品牌广告+搜索广告组合包，持续提升货币化率。" },
    { title: "腰尾部老店×大体量旅游城市MR反超头部", text: "腰尾部老店在大体量旅游城市MR高达2.03%，高于头部老店的1.71%。说明旅游城市中小商户广告效果突出，建议加大该群体投放激励，扩大广告覆盖。" },
    { title: "大体量常规城市是最大增量池", text: "腰尾部老店在大体量常规城市有9.9万门店（31%），但MR仅0.76%，收入占比8%远低于GTV占比10%。若MR提升0.3pct，预计月增收约300万。建议定向ROI优化培训+首充礼包。" },
    { title: "中小体量城市渗透率极低", text: "中小体量城市合计11.7万腰尾部老店，广告渗透率仅7.6%，MR最低0.34%。建议通过自动化营销+社群运营批量触达，配合新商成长计划逐步培育投广习惯。" },
    { title: "新店冷启亟需破冰", text: "新店0.4万（1%），广告商家仅134个（0.5%），MR 0.15%。到餐新店投广意识和效果均不足，建议设计到餐专属新商冷启礼包+30天成长计划，目标渗透率从0.5%提升至3%。" },
  ],
};

const matrixDataMap = { waimai: waimaiMatrix, daocan: daocanMatrix };

/* ================================================================== */
/* ====== BIZ_MANAGER: 华东区数据 ======                                */
/* ================================================================== */
const regionStatsMap = {
  waimai: [
    { label: "交易商家总数", value: "18.5万", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告商家数", value: "9.8万", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "53.0%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "覆盖城市数", value: "48", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  ],
  daocan: [
    { label: "动销商家总数", value: "5.1万", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告商家数", value: "0.4万", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "7.8%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "覆盖城市数", value: "42", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  ],
};

const regionWaimaiMatrix = {
  title: "华东区外卖交易商家分层",
  totalLabel: "交易商家 18.5万",
  columns: [
    { id: "large", label: "大体量城市", subLabel: "4月消费GTV ≥ 500万", count: "7个" },
    { id: "small", label: "中小体量城市", subLabel: "4月消费GTV < 500万", count: "41个" },
  ],
  columnSummary: [
    { label: "大体量城市(7个)", items: [{ label: "GTV占比", value: "71%" }, { label: "收入占比", value: "78%" }] },
    { label: "中小体量城市(41个)", items: [{ label: "GTV占比", value: "29%" }, { label: "收入占比", value: "22%" }] },
  ],
  rows: [
    {
      id: "new", label: "新店", filter: "26年4月上线", fullSpan: true,
      cells: [{ pLevel: "P0", merchantNote: "1.05万（6%）", gtvShare: "2%", adMerchants: "0.72万（7%）", revenueShare: "3%", mr: "3.48%", filter: "26年4月上线" }],
    },
    {
      id: "head", label: "头部老店", filter: "4月消费GTV ≥ 4万",
      rowSummary: [{ label: "门店", value: "0.83万（4%）" }, { label: "GTV占比", value: "31%" }, { label: "收入占比", value: "39%" }],
      cells: [
        { pLevel: "P0", merchantNote: "0.64万（3%）", gtvShare: "24%", adMerchants: "0.54万（6%）", revenueShare: "33%", mr: "3.12%", filter: "4月消费GTV ≥ 4万 且 城市GTV ≥ 500万" },
        { pLevel: "P1", merchantNote: "0.19万（1%）", gtvShare: "7%", adMerchants: "0.14万（1%）", revenueShare: "6%", mr: "2.05%", filter: "4月消费GTV ≥ 4万 且 城市GTV < 500万" },
      ],
    },
    {
      id: "waist", label: "腰部老店", filter: "2万 ≤ 4月消费GTV < 4万",
      rowSummary: [{ label: "门店", value: "1.52万（8%）" }, { label: "GTV占比", value: "24%" }, { label: "收入占比", value: "26%" }],
      cells: [
        { pLevel: "P1", merchantNote: "1.07万（6%）", gtvShare: "17%", adMerchants: "0.83万（8%）", revenueShare: "20%", mr: "2.72%", filter: "2万≤GTV<4万 且 城市GTV ≥ 500万" },
        { pLevel: "P2", merchantNote: "0.45万（2%）", gtvShare: "7%", adMerchants: "0.32万（3%）", revenueShare: "6%", mr: "2.03%", filter: "2万≤GTV<4万 且 城市GTV < 500万" },
      ],
    },
    {
      id: "tail", label: "尾部老店", filter: "4月消费GTV < 2万",
      rowSummary: [{ label: "门店", value: "14.62万（79%）" }, { label: "GTV占比", value: "41%" }, { label: "收入占比", value: "30%" }],
      cells: [
        { pLevel: "P2", merchantNote: "8.88万（48%）", gtvShare: "26%", adMerchants: "4.72万（48%）", revenueShare: "21%", mr: "1.95%", filter: "4月消费GTV < 2万 且 城市GTV ≥ 500万" },
        { pLevel: "P3", merchantNote: "5.74万（31%）", gtvShare: "15%", adMerchants: "2.58万（26%）", revenueShare: "9%", mr: "1.46%", filter: "4月消费GTV < 2万 且 城市GTV < 500万" },
      ],
    },
  ],
  aiItems: [
    { title: "华东区头部老店集中在大体量城市", text: "华东区头部老店在大体量城市（上海、杭州、南京等7城）有0.64万门店，贡献33%收入，MR 3.12%略低于全国3.19%。建议在上海推进品牌广告升级，在杭州/南京加强专属客户经理覆盖。" },
    { title: "尾部老店×大体量城市增量空间大", text: "华东区尾部老店在大体量城市有8.88万门店（48%），MR仅1.95%，若提升0.5pct预计月增收约180万。建议在上海/杭州/南京批量ROI优化+流量扶持。" },
    { title: "中小体量城市覆盖41城但渗透偏低", text: "华东区中小体量城市覆盖5.74万尾部老店，MR仅1.46%。建议通过首充礼包+自动化营销批量触达，聚焦苏州/宁波/无锡等潜力城市。" },
  ],
};

const regionDaocanMatrix = {
  title: "华东区到餐动销商家分层",
  totalLabel: "动销商家 5.1万",
  columns: [
    { id: "large_tour", label: "大体量旅游城市", subLabel: "GTV≥100万·旅游", count: "4个" },
    { id: "large_norm", label: "大体量常规城市", subLabel: "GTV≥100万·常规", count: "8个" },
    { id: "small_tour", label: "中小体量旅游城市", subLabel: "GTV<100万·旅游", count: "10个" },
    { id: "small_norm", label: "中小体量常规城市", subLabel: "GTV<100万·常规", count: "20个" },
  ],
  columnSummary: [
    { label: "大体量城市(12个)", items: [{ label: "GTV占比", value: "74%" }, { label: "收入占比", value: "86%" }] },
    { label: "中小体量城市(30个)", items: [{ label: "GTV占比", value: "26%" }, { label: "收入占比", value: "14%" }] },
  ],
  rows: [
    {
      id: "new", label: "新店", filter: "近90天首次有动销商家", fullSpan: true,
      cells: [{ pLevel: "P0", merchantNote: "0.06万（1%）", gtvShare: "0.1%", adMerchants: "21（0.5%）", revenueShare: "0.01%", mr: "0.15%", filter: "近90天首次有动销商家" }],
    },
    {
      id: "head", label: "头部老店", filter: "4月实付验证GTV ≥ 1万",
      rowSummary: [{ label: "门店", value: "0.69万（14%）" }, { label: "GTV占比", value: "74%" }, { label: "收入占比", value: "73%" }],
      cells: [
        { pLevel: "P0", merchantNote: "0.16万（3%）", gtvShare: "22%", adMerchants: "0.06万（15%）", revenueShare: "39%", mr: "1.71%", filter: "实付GTV≥1万 且 大体量旅游城市" },
        { pLevel: "P0", merchantNote: "0.30万（6%）", gtvShare: "35%", adMerchants: "0.08万（21%）", revenueShare: "26%", mr: "0.72%", filter: "实付GTV≥1万 且 大体量常规城市" },
        { pLevel: "P1", merchantNote: "0.08万（2%）", gtvShare: "7%", adMerchants: "0.02万（5%）", revenueShare: "5%", mr: "0.73%", filter: "实付GTV≥1万 且 中小体量旅游城市" },
        { pLevel: "P1", merchantNote: "0.13万（3%）", gtvShare: "11%", adMerchants: "0.02万（5%）", revenueShare: "4%", mr: "0.31%", filter: "实付GTV≥1万 且 中小体量常规城市" },
      ],
    },
    {
      id: "tail", label: "腰尾部老店", filter: "4月实付验证GTV < 1万",
      rowSummary: [{ label: "门店", value: "4.33万（85%）" }, { label: "GTV占比", value: "26%" }, { label: "收入占比", value: "27%" }],
      cells: [
        { pLevel: "P1", merchantNote: "0.85万（17%）", gtvShare: "6%", adMerchants: "0.08万（18%）", revenueShare: "13%", mr: "2.03%", filter: "实付GTV<1万 且 大体量旅游城市" },
        { pLevel: "P2", merchantNote: "1.58万（31%）", gtvShare: "10%", adMerchants: "0.08万（5%）", revenueShare: "8%", mr: "0.77%", filter: "实付GTV<1万 且 大体量常规城市" },
        { pLevel: "P2", merchantNote: "0.72万（14%）", gtvShare: "4%", adMerchants: "0.03万（10%）", revenueShare: "4%", mr: "1.05%", filter: "实付GTV<1万 且 中小体量旅游城市" },
        { pLevel: "P3", merchantNote: "1.15万（23%）", gtvShare: "6%", adMerchants: "0.03万（7%）", revenueShare: "2%", mr: "0.35%", filter: "实付GTV<1万 且 中小体量常规城市" },
      ],
    },
  ],
  aiItems: [
    { title: "华东区到餐头部集中在旅游城市", text: "华东区到餐头部老店在大体量旅游城市（杭州、黄山等4城）有0.16万门店，MR 1.71%，贡献39%收入。旅游城市消费弹性大，建议推进品牌广告+搜索广告组合包。" },
    { title: "大体量常规城市增量池最大", text: "华东区腰尾部老店在大体量常规城市有1.58万门店（31%），MR仅0.77%。若MR提升0.3pct，预计月增收约50万。建议定向ROI优化培训+首充礼包。" },
    { title: "中小体量城市渗透率极低", text: "华东区中小体量城市合计1.87万腰尾部老店，广告渗透率仅7.6%，MR最低0.35%。建议通过自动化营销+社群运营批量触达。" },
  ],
};

const regionMatrixDataMap = { waimai: regionWaimaiMatrix, daocan: regionDaocanMatrix };

/* 华东区城市明细 */
const cityBreakdownData = {
  waimai: [
    { city: "上海", merchants: "5.8万", adMerchants: "3.1万", penetration: 53.4, gtv: "4.2亿", revenue: "1340万", mr: "3.19%", mom: "+5.2%" },
    { city: "杭州", merchants: "3.2万", adMerchants: "1.7万", penetration: 53.1, gtv: "2.3亿", revenue: "730万", mr: "3.17%", mom: "+3.8%" },
    { city: "南京", merchants: "2.8万", adMerchants: "1.5万", penetration: 53.6, gtv: "2.0亿", revenue: "640万", mr: "3.20%", mom: "+4.1%" },
    { city: "苏州", merchants: "2.5万", adMerchants: "1.3万", penetration: 52.0, gtv: "1.8亿", revenue: "570万", mr: "3.17%", mom: "+6.2%" },
    { city: "宁波", merchants: "1.9万", adMerchants: "1.0万", penetration: 52.6, gtv: "1.4亿", revenue: "440万", mr: "3.14%", mom: "+2.8%" },
    { city: "无锡", merchants: "1.2万", adMerchants: "0.64万", penetration: 53.3, gtv: "0.9亿", revenue: "280万", mr: "3.11%", mom: "+3.5%" },
    { city: "合肥", merchants: "1.1万", adMerchants: "0.58万", penetration: 52.7, gtv: "0.8亿", revenue: "250万", mr: "3.13%", mom: "+1.8%" },
    { city: "常州", merchants: "0.8万", adMerchants: "0.42万", penetration: 52.5, gtv: "0.6亿", revenue: "190万", mr: "3.17%", mom: "+4.5%" },
  ],
  daocan: [
    { city: "上海", merchants: "0.8万", adMerchants: "0.07万", penetration: 8.5, gtv: "3200万", revenue: "27万", mr: "0.84%", mom: "+3.2%" },
    { city: "杭州", merchants: "0.6万", adMerchants: "0.05万", penetration: 8.3, gtv: "2400万", revenue: "19万", mr: "0.79%", mom: "+2.1%" },
    { city: "南京", merchants: "0.5万", adMerchants: "0.04万", penetration: 8.0, gtv: "2000万", revenue: "15万", mr: "0.75%", mom: "+1.8%" },
    { city: "黄山", merchants: "0.3万", adMerchants: "0.06万", penetration: 20.0, gtv: "1200万", revenue: "22万", mr: "1.83%", mom: "+8.5%" },
    { city: "苏州", merchants: "0.4万", adMerchants: "0.03万", penetration: 7.5, gtv: "1600万", revenue: "12万", mr: "0.75%", mom: "+2.8%" },
    { city: "宁波", merchants: "0.35万", adMerchants: "0.03万", penetration: 8.6, gtv: "1400万", revenue: "12万", mr: "0.86%", mom: "+3.1%" },
    { city: "无锡", merchants: "0.25万", adMerchants: "0.02万", penetration: 8.0, gtv: "1000万", revenue: "8万", mr: "0.80%", mom: "+1.5%" },
    { city: "合肥", merchants: "0.22万", adMerchants: "0.02万", penetration: 9.1, gtv: "880万", revenue: "8万", mr: "0.91%", mom: "+2.0%" },
  ],
};

/* ================================================================== */
/* ====== PARTNER: 上海城市数据 ======                                  */
/* ================================================================== */
const cityStatsMap = {
  waimai: [
    { label: "交易商家总数", value: "5.8万", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告商家数", value: "3.1万", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "53.4%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "管辖BD数", value: "3", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  ],
  daocan: [
    { label: "动销商家总数", value: "0.8万", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告商家数", value: "0.07万", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "8.5%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "管辖BD数", value: "3", icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
  ],
};

const cityWaimaiMatrix = {
  title: "上海外卖交易商家分层",
  totalLabel: "交易商家 5.8万",
  columns: [
    { id: "core", label: "核心商圈", subLabel: "黄浦/徐汇/长宁/静安/浦东", count: "12个商圈" },
    { id: "normal", label: "普通商圈", subLabel: "闵行/宝山/嘉定/松江等", count: "16个商圈" },
  ],
  columnSummary: [
    { label: "核心商圈(12个)", items: [{ label: "GTV占比", value: "72%" }, { label: "收入占比", value: "80%" }] },
    { label: "普通商圈(16个)", items: [{ label: "GTV占比", value: "28%" }, { label: "收入占比", value: "20%" }] },
  ],
  rows: [
    {
      id: "new", label: "新店", filter: "26年4月上线", fullSpan: true,
      cells: [{ pLevel: "P0", merchantNote: "0.35万（6%）", gtvShare: "2%", adMerchants: "0.24万（8%）", revenueShare: "3%", mr: "3.51%", filter: "26年4月上线" }],
    },
    {
      id: "head", label: "头部老店", filter: "4月消费GTV ≥ 4万",
      rowSummary: [{ label: "门店", value: "0.26万（4%）" }, { label: "GTV占比", value: "32%" }, { label: "收入占比", value: "41%" }],
      cells: [
        { pLevel: "P0", merchantNote: "0.20万（3%）", gtvShare: "25%", adMerchants: "0.17万（5%）", revenueShare: "35%", mr: "3.22%", filter: "4月消费GTV ≥ 4万 且 核心商圈" },
        { pLevel: "P1", merchantNote: "0.06万（1%）", gtvShare: "7%", adMerchants: "0.045万（1%）", revenueShare: "6%", mr: "2.10%", filter: "4月消费GTV ≥ 4万 且 普通商圈" },
      ],
    },
    {
      id: "waist", label: "腰部老店", filter: "2万 ≤ 4月消费GTV < 4万",
      rowSummary: [{ label: "门店", value: "0.48万（8%）" }, { label: "GTV占比", value: "24%" }, { label: "收入占比", value: "26%" }],
      cells: [
        { pLevel: "P1", merchantNote: "0.34万（6%）", gtvShare: "17%", adMerchants: "0.26万（8%）", revenueShare: "20%", mr: "2.79%", filter: "2万≤GTV<4万 且 核心商圈" },
        { pLevel: "P2", merchantNote: "0.14万（2%）", gtvShare: "7%", adMerchants: "0.10万（3%）", revenueShare: "6%", mr: "2.09%", filter: "2万≤GTV<4万 且 普通商圈" },
      ],
    },
    {
      id: "tail", label: "尾部老店", filter: "4月消费GTV < 2万",
      rowSummary: [{ label: "门店", value: "4.58万（79%）" }, { label: "GTV占比", value: "41%" }, { label: "收入占比", value: "29%" }],
      cells: [
        { pLevel: "P2", merchantNote: "2.78万（48%）", gtvShare: "26%", adMerchants: "1.48万（48%）", revenueShare: "21%", mr: "2.01%", filter: "4月消费GTV < 2万 且 核心商圈" },
        { pLevel: "P3", merchantNote: "1.80万（31%）", gtvShare: "15%", adMerchants: "0.81万（26%）", revenueShare: "8%", mr: "1.49%", filter: "4月消费GTV < 2万 且 普通商圈" },
      ],
    },
  ],
  aiItems: [
    { title: "上海核心商圈头部老店是收入主力", text: "上海核心商圈头部老店有0.20万门店，MR 3.22%高于全国均值，贡献35%收入。建议推进品牌广告升级+搜索广告组合包，预期ARPU仍有15%提升空间。" },
    { title: "核心商圈尾部老店增量显著", text: "核心商圈尾部老店有2.78万门店，MR 2.01%高于全国1.99%。若MR提升0.5pct，预计月增收约60万。建议批量ROI优化+流量扶持。" },
    { title: "普通商圈渗透空间大", text: "普通商圈覆盖1.80万尾部老店，MR仅1.49%。建议通过首充礼包+自动化营销批量触达，聚焦闵行/宝山等高潜力商圈。" },
  ],
};

const cityDaocanMatrix = {
  title: "上海到餐动销商家分层",
  totalLabel: "动销商家 0.8万",
  columns: [
    { id: "core_tour", label: "核心旅游商圈", subLabel: "黄浦/静安·旅游", count: "3个商圈" },
    { id: "core_norm", label: "核心常规商圈", subLabel: "徐汇/长宁/浦东", count: "9个商圈" },
    { id: "norm_tour", label: "普通旅游商圈", subLabel: "闵行/松江·旅游", count: "4个商圈" },
    { id: "norm_norm", label: "普通常规商圈", subLabel: "宝山/嘉定等", count: "12个商圈" },
  ],
  columnSummary: [
    { label: "核心商圈(12个)", items: [{ label: "GTV占比", value: "75%" }, { label: "收入占比", value: "88%" }] },
    { label: "普通商圈(16个)", items: [{ label: "GTV占比", value: "25%" }, { label: "收入占比", value: "12%" }] },
  ],
  rows: [
    {
      id: "new", label: "新店", filter: "近90天首次有动销商家", fullSpan: true,
      cells: [{ pLevel: "P0", merchantNote: "0.01万（1%）", gtvShare: "0.1%", adMerchants: "4（0.5%）", revenueShare: "0.01%", mr: "0.16%", filter: "近90天首次有动销商家" }],
    },
    {
      id: "head", label: "头部老店", filter: "4月实付验证GTV ≥ 1万",
      rowSummary: [{ label: "门店", value: "0.11万（14%）" }, { label: "GTV占比", value: "75%" }, { label: "收入占比", value: "74%" }],
      cells: [
        { pLevel: "P0", merchantNote: "0.03万（3%）", gtvShare: "23%", adMerchants: "0.01万（15%）", revenueShare: "40%", mr: "1.75%", filter: "实付GTV≥1万 且 核心旅游商圈" },
        { pLevel: "P0", merchantNote: "0.05万（6%）", gtvShare: "35%", adMerchants: "0.015万（21%）", revenueShare: "26%", mr: "0.74%", filter: "实付GTV≥1万 且 核心常规商圈" },
        { pLevel: "P1", merchantNote: "0.015万（2%）", gtvShare: "7%", adMerchants: "0.003万（5%）", revenueShare: "5%", mr: "0.75%", filter: "实付GTV≥1万 且 普通旅游商圈" },
        { pLevel: "P1", merchantNote: "0.025万（3%）", gtvShare: "11%", adMerchants: "0.003万（5%）", revenueShare: "4%", mr: "0.32%", filter: "实付GTV≥1万 且 普通常规商圈" },
      ],
    },
    {
      id: "tail", label: "腰尾部老店", filter: "4月实付验证GTV < 1万",
      rowSummary: [{ label: "门店", value: "0.68万（85%）" }, { label: "GTV占比", value: "25%" }, { label: "收入占比", value: "26%" }],
      cells: [
        { pLevel: "P1", merchantNote: "0.13万（17%）", gtvShare: "6%", adMerchants: "0.012万（18%）", revenueShare: "13%", mr: "2.08%", filter: "实付GTV<1万 且 核心旅游商圈" },
        { pLevel: "P2", merchantNote: "0.25万（31%）", gtvShare: "10%", adMerchants: "0.012万（5%）", revenueShare: "8%", mr: "0.79%", filter: "实付GTV<1万 且 核心常规商圈" },
        { pLevel: "P2", merchantNote: "0.11万（14%）", gtvShare: "4%", adMerchants: "0.005万（10%）", revenueShare: "4%", mr: "1.08%", filter: "实付GTV<1万 且 普通旅游商圈" },
        { pLevel: "P3", merchantNote: "0.18万（23%）", gtvShare: "6%", adMerchants: "0.005万（7%）", revenueShare: "2%", mr: "0.36%", filter: "实付GTV<1万 且 普通常规商圈" },
      ],
    },
  ],
  aiItems: [
    { title: "上海核心旅游商圈到餐MR突出", text: "核心旅游商圈（黄浦/静安）头部老店MR 1.75%，高于全国1.71%。旅游消费弹性大，建议推进品牌广告+搜索广告组合包。" },
    { title: "核心常规商圈是最大增量池", text: "核心常规商圈腰尾部老店有0.25万门店（31%），MR仅0.79%。若MR提升0.3pct，预计月增收约8万。建议定向ROI优化+首充礼包。" },
    { title: "普通商圈渗透率极低", text: "普通商圈合计0.29万腰尾部老店，MR最低0.36%。建议通过自动化营销+社群运营批量触达，配合新商成长计划。" },
  ],
};

const cityMatrixDataMap = { waimai: cityWaimaiMatrix, daocan: cityDaocanMatrix };

/* 上海BD绩效明细 */
const bdPerformanceData = {
  waimai: [
    { bdName: "刘洋", bdMis: "liuyang04", area: "浦东/黄浦", stores: 18, adStores: 14, penetration: 77.8, gtv: "6.2万", revenue: "280万", mr: "4.52%", mom: "+5.1%" },
    { bdName: "王芳", bdMis: "wangfang02", area: "徐汇/长宁", stores: 15, adStores: 11, penetration: 73.3, gtv: "4.8万", revenue: "210万", mr: "4.38%", mom: "+3.2%" },
    { bdName: "陈刚", bdMis: "chengang03", area: "静安/普陀", stores: 12, adStores: 8, penetration: 66.7, gtv: "3.5万", revenue: "150万", mr: "4.29%", mom: "+2.8%" },
  ],
  daocan: [
    { bdName: "刘洋", bdMis: "liuyang04", area: "浦东/黄浦", stores: 8, adStores: 2, penetration: 25.0, gtv: "1200万", revenue: "10万", mr: "0.83%", mom: "+4.2%" },
    { bdName: "王芳", bdMis: "wangfang02", area: "徐汇/长宁", stores: 6, adStores: 1, penetration: 16.7, gtv: "900万", revenue: "7万", mr: "0.78%", mom: "+2.1%" },
    { bdName: "陈刚", bdMis: "chengang03", area: "静安/普陀", stores: 5, adStores: 1, penetration: 20.0, gtv: "700万", revenue: "5万", mr: "0.71%", mom: "+1.8%" },
  ],
};

/* ================================================================== */
/* ====== BD: 个人管辖门店数据 ======                                   */
/* ================================================================== */
const bdStats = {
  waimai: [
    { label: "管辖门店数", value: "18", icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告门店数", value: "14", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "77.8%", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "本月广告收入", value: "28.5万", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  ],
  daocan: [
    { label: "管辖门店数", value: "8", icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "广告门店数", value: "2", icon: Megaphone, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "广告渗透率", value: "25.0%", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "本月广告收入", value: "10.2万", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  ],
};

const tierBadgeStyle = {
  头部: { bg: "bg-red-50", text: "text-red-600" },
  腰部: { bg: "bg-orange-50", text: "text-orange-600" },
  尾部: { bg: "bg-amber-50", text: "text-amber-600" },
  新店: { bg: "bg-blue-50", text: "text-blue-600" },
};
const TierBadge = ({ tier }) => {
  const s = tierBadgeStyle[tier] || tierBadgeStyle["尾部"];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${s.bg} ${s.text}`}>{tier}</span>;
};

const bdStores = {
  waimai: [
    { name: "老山东煎饼果子", area: "浦东陆家嘴", tier: "头部", gtv: "12.5万", adStatus: "已投广", mr: "4.8%", revenue: "6000", mom: "+8.2%" },
    { name: "川香源麻辣烫", area: "浦东张江", tier: "头部", gtv: "10.8万", adStatus: "已投广", mr: "4.5%", revenue: "4860", mom: "+5.1%" },
    { name: "湘味小厨", area: "黄浦南京东路", tier: "头部", gtv: "9.2万", adStatus: "已投广", mr: "4.2%", revenue: "3864", mom: "+3.4%" },
    { name: "沙县小吃(浦东店)", area: "浦东金桥", tier: "腰部", gtv: "5.8万", adStatus: "已投广", mr: "3.2%", revenue: "1856", mom: "+2.1%" },
    { name: "兰州拉面(黄浦店)", area: "黄浦人民广场", tier: "腰部", gtv: "5.2万", adStatus: "已投广", mr: "3.5%", revenue: "1820", mom: "+4.5%" },
    { name: "正新鸡排(浦东店)", area: "浦东世博", tier: "腰部", gtv: "4.6万", adStatus: "已投广", mr: "3.1%", revenue: "1426", mom: "+1.8%" },
    { name: "五芳斋(黄浦店)", area: "黄浦老西门", tier: "腰部", gtv: "4.2万", adStatus: "已投广", mr: "3.3%", revenue: "1386", mom: "+3.2%" },
    { name: "永和大王(浦东店)", area: "浦东联洋", tier: "腰部", gtv: "3.8万", adStatus: "已投广", mr: "2.9%", revenue: "1102", mom: "+0.8%" },
    { name: "杨国福麻辣烫", area: "浦东三林", tier: "腰部", gtv: "3.5万", adStatus: "未投广", mr: "—", revenue: "0", mom: "-2.1%" },
    { name: "蜜雪冰城(浦东店)", area: "浦东北蔡", tier: "尾部", gtv: "1.8万", adStatus: "已投广", mr: "2.1%", revenue: "378", mom: "+1.2%" },
    { name: "华莱士(黄浦店)", area: "黄浦董家渡", tier: "尾部", gtv: "1.5万", adStatus: "已投广", mr: "1.9%", revenue: "285", mom: "+0.5%" },
    { name: "张亮麻辣烫", area: "浦东高行", tier: "尾部", gtv: "1.2万", adStatus: "已投广", mr: "1.8%", revenue: "216", mom: "-0.8%" },
    { name: "肯瑞汉堡", area: "浦东曹路", tier: "尾部", gtv: "0.9万", adStatus: "未投广", mr: "—", revenue: "0", mom: "-1.5%" },
    { name: "南京汤包(黄浦店)", area: "黄浦半淞园", tier: "尾部", gtv: "0.8万", adStatus: "已投广", mr: "1.6%", revenue: "128", mom: "+0.3%" },
    { name: "老上海馄饨", area: "浦东洋泾", tier: "尾部", gtv: "0.6万", adStatus: "未投广", mr: "—", revenue: "0", mom: "-2.8%" },
    { name: "重庆小面(新店)", area: "浦东花木", tier: "新店", gtv: "0.3万", adStatus: "已投广", mr: "3.5%", revenue: "105", mom: "新店" },
    { name: "东北饺子馆(新店)", area: "黄浦外滩", tier: "新店", gtv: "0.2万", adStatus: "未投广", mr: "—", revenue: "0", mom: "新店" },
    { name: "新疆大盘鸡(新店)", area: "浦东塘桥", tier: "新店", gtv: "0.15万", adStatus: "已投广", mr: "3.2%", revenue: "48", mom: "新店" },
  ],
  daocan: [
    { name: "老山东大酒店", area: "浦东陆家嘴", tier: "头部", gtv: "8.5万", adStatus: "已投广", mr: "1.8%", revenue: "1530", mom: "+6.2%" },
    { name: "黄浦江大酒楼", area: "黄浦外滩", tier: "头部", gtv: "6.2万", adStatus: "已投广", mr: "1.6%", revenue: "992", mom: "+4.1%" },
    { name: "浦东人家", area: "浦东世博", tier: "腰部", gtv: "3.8万", adStatus: "未投广", mr: "—", revenue: "0", mom: "+1.2%" },
    { name: "老城厢菜馆", area: "黄浦老西门", tier: "腰部", gtv: "2.5万", adStatus: "未投广", mr: "—", revenue: "0", mom: "-0.5%" },
    { name: "小绍兴白斩鸡", area: "黄浦人民广场", tier: "尾部", gtv: "1.2万", adStatus: "未投广", mr: "—", revenue: "0", mom: "-1.8%" },
    { name: "大壶春生煎", area: "黄浦云南南路", tier: "尾部", gtv: "0.8万", adStatus: "未投广", mr: "—", revenue: "0", mom: "+0.2%" },
    { name: "鲜得来排骨年糕", area: "黄浦老西门", tier: "尾部", gtv: "0.6万", adStatus: "未投广", mr: "—", revenue: "0", mom: "-0.8%" },
    { name: "新开业海鲜酒楼", area: "浦东花木", tier: "新店", gtv: "0.3万", adStatus: "未投广", mr: "—", revenue: "0", mom: "新店" },
  ],
};

const bdAiItems = {
  waimai: [
    { title: "4家未投广门店待转化", text: "管辖18家门店中有4家未投广（杨国福麻辣烫、肯瑞汉堡、老上海馄饨、东北饺子馆）。其中杨国福GTV 3.5万属腰部，转化优先级最高，建议首充礼包+ROI保底承诺。" },
    { title: "头部门店ARPU提升空间大", text: "3家头部门店平均MR 4.5%，高于区域均值。老山东煎饼MR 4.8%表现最优，建议推进品牌广告升级，预期ARPU再提升10-15%。" },
    { title: "新店冷启成效初显", text: "3家新店中2家已投广，重庆小面MR 3.5%效果显著。建议推动东北饺子馆尽快开户，复制冷启成功经验。" },
  ],
  daocan: [
    { title: "到餐广告渗透严重不足", text: "管辖8家到餐门店仅2家投广（25%），6家未投广。浦东人家GTV 3.8万属腰部，建议优先转化，预期月增收约5000元。" },
    { title: "头部酒楼广告效果突出", text: "2家投广到餐门店均为头部酒楼，MR分别为1.8%和1.6%，高于城市均值0.84%。建议增加搜索广告预算，扩大覆盖。" },
    { title: "新店到餐冷启亟需破冰", text: "新开业海鲜酒楼尚未投广，建议设计到餐专属新商冷启礼包+30天成长计划，目标首月开户投广。" },
  ],
};

/* ================================================================== */
/* ====== 视图组件 ======                                               */
/* ================================================================== */

/* ---- 平台管理员视图（保持原有逻辑不变） ---- */
const PlatformAdminView = () => {
  const { bizLine } = useBizLine();
  const summaryStats = summaryStatsMap[bizLine] || summaryStatsMap.waimai;
  const matrixData = matrixDataMap[bizLine] || matrixDataMap.waimai;

  return (
    <div className="space-y-5">
      {/* 汇总指标 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">核心指标</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm bg-white">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 2D 分层矩阵 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 text-[#4080FF]" />
            {matrixData.title}
          </h2>
          <Badge className="bg-gray-50 text-gray-500 border-none font-normal ml-1">{matrixData.totalLabel}</Badge>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <SegmentationMatrix data={matrixData} />
          </CardContent>
        </Card>
      </div>

      {/* 筛选条件说明 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">分层筛选条件说明</h2>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <div className="space-y-2">
              {bizLine === "waimai" ? (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 shrink-0">新店</span>
                    <span className="text-gray-600">26年4月上线</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 shrink-0">头部老店</span>
                    <span className="text-gray-600">4月消费GTV ≥ 4万</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-600 shrink-0">腰部老店</span>
                    <span className="text-gray-600">2万 ≤ 4月消费GTV {"<"} 4万</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-600 shrink-0">尾部老店</span>
                    <span className="text-gray-600">4月消费GTV {"<"} 2万</span>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600 shrink-0">大体量城市</span>
                    <span className="text-gray-600">4月消费GTV ≥ 500万（668个）</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-50 text-gray-500 shrink-0">中小体量城市</span>
                    <span className="text-gray-600">4月消费GTV {"<"} 500万（1441个）</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-600 shrink-0">新店</span>
                    <span className="text-gray-600">近90天首次有动销商家</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 shrink-0">头部老店</span>
                    <span className="text-gray-600">4月实付验证GTV ≥ 1万</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-600 shrink-0">腰尾部老店</span>
                    <span className="text-gray-600">4月实付验证GTV {"<"} 1万</span>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600 shrink-0">大体量城市</span>
                    <span className="text-gray-600">4月实付验证GTV ≥ 100万（507个）</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-50 text-gray-500 shrink-0">中小体量城市</span>
                    <span className="text-gray-600">4月实付验证GTV {"<"} 100万（1242个）</span>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-600 shrink-0">旅游城市</span>
                    <span className="text-gray-600">按城市旅游属性标记（大体量182个+中小体量493个=675个）</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-50 text-gray-500 shrink-0">常规城市</span>
                    <span className="text-gray-600">非旅游城市（大体量325个+中小体量749个=1074个）</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 智能分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4080FF]" />
            AI 智能分析
          </h2>
        </div>
        <AiDiagnosisCard items={matrixData.aiItems} />
      </div>
    </div>
  );
};

/* ---- 业务经理视图（华东区） ---- */
const BizManagerView = () => {
  const { bizLine } = useBizLine();
  const stats = regionStatsMap[bizLine] || regionStatsMap.waimai;
  const matrixData = regionMatrixDataMap[bizLine] || regionMatrixDataMap.waimai;
  const cityRows = cityBreakdownData[bizLine] || cityBreakdownData.waimai;

  return (
    <div className="space-y-5">
      {/* 汇总指标 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">华东区核心指标</h2>
          <Badge className="bg-blue-50 text-blue-600 border-none font-normal">华东区</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm bg-white">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 区域 2D 分层矩阵 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 text-[#4080FF]" />
            {matrixData.title}
          </h2>
          <Badge className="bg-gray-50 text-gray-500 border-none font-normal ml-1">{matrixData.totalLabel}</Badge>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <SegmentationMatrix data={matrixData} />
          </CardContent>
        </Card>
      </div>

      {/* 城市明细 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#4080FF]" />
            华东区城市明细
          </h2>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>城市</TableHead>
                  <TableHead>{bizLine === "waimai" ? "交易商家数" : "动销商家数"}</TableHead>
                  <TableHead>广告商家数</TableHead>
                  <TableHead className="w-32">渗透率</TableHead>
                  <TableHead>GTV</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>环比</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityRows.map((row) => (
                  <TableRow key={row.city}>
                    <TableCell className="font-medium text-gray-800">{row.city}</TableCell>
                    <TableCell>{row.merchants}</TableCell>
                    <TableCell>{row.adMerchants}</TableCell>
                    <TableCell><RateProgress rate={row.penetration} /></TableCell>
                    <TableCell className="text-gray-600">{row.gtv}</TableCell>
                    <TableCell className="text-gray-600">{row.revenue}</TableCell>
                    <TableCell className="font-medium text-gray-700">{row.mr}</TableCell>
                    <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                      {row.mom.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                      {row.mom}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* AI 智能分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4080FF]" />
            AI 智能分析
          </h2>
        </div>
        <AiDiagnosisCard items={matrixData.aiItems} />
      </div>
    </div>
  );
};

/* ---- 合作商视图（上海） ---- */
const PartnerView = () => {
  const { bizLine } = useBizLine();
  const stats = cityStatsMap[bizLine] || cityStatsMap.waimai;
  const matrixData = cityMatrixDataMap[bizLine] || cityMatrixDataMap.waimai;
  const bdRows = bdPerformanceData[bizLine] || bdPerformanceData.waimai;

  return (
    <div className="space-y-5">
      {/* 汇总指标 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">上海核心指标</h2>
          <Badge className="bg-blue-50 text-blue-600 border-none font-normal">上海 · 上海总商A</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm bg-white">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 城市 2D 分层矩阵 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 text-[#4080FF]" />
            {matrixData.title}
          </h2>
          <Badge className="bg-gray-50 text-gray-500 border-none font-normal ml-1">{matrixData.totalLabel}</Badge>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <SegmentationMatrix data={matrixData} />
          </CardContent>
        </Card>
      </div>

      {/* BD 绩效明细 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#4080FF]" />
            BD 绩效明细
          </h2>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BD姓名</TableHead>
                  <TableHead>MIS号</TableHead>
                  <TableHead>管辖商圈</TableHead>
                  <TableHead>门店数</TableHead>
                  <TableHead>广告门店数</TableHead>
                  <TableHead className="w-32">渗透率</TableHead>
                  <TableHead>GTV</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>环比</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bdRows.map((row) => (
                  <TableRow key={row.bdMis}>
                    <TableCell className="font-medium text-gray-800">{row.bdName}</TableCell>
                    <TableCell className="text-gray-500">{row.bdMis}</TableCell>
                    <TableCell className="text-gray-600">{row.area}</TableCell>
                    <TableCell>{row.stores}</TableCell>
                    <TableCell>{row.adStores}</TableCell>
                    <TableCell><RateProgress rate={row.penetration} /></TableCell>
                    <TableCell className="text-gray-600">{row.gtv}</TableCell>
                    <TableCell className="text-gray-600">{row.revenue}</TableCell>
                    <TableCell className="font-medium text-gray-700">{row.mr}</TableCell>
                    <TableCell className={row.mom.startsWith("-") ? "text-red-500" : "text-emerald-600"}>
                      {row.mom.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                      {row.mom}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* AI 智能分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4080FF]" />
            AI 智能分析
          </h2>
        </div>
        <AiDiagnosisCard items={matrixData.aiItems} />
      </div>
    </div>
  );
};

/* ---- BD 视图（个人门店） ---- */
const BdView = () => {
  const { bizLine } = useBizLine();
  const stats = bdStats[bizLine] || bdStats.waimai;
  const stores = bdStores[bizLine] || bdStores.waimai;
  const aiItems = bdAiItems[bizLine] || bdAiItems.waimai;

  /* 门店分层统计 */
  const tierCounts = stores.reduce((acc, s) => {
    acc[s.tier] = (acc[s.tier] || 0) + 1;
    return acc;
  }, {});
  const adCount = stores.filter((s) => s.adStatus === "已投广").length;

  return (
    <div className="space-y-5">
      {/* 个人统计卡片 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">个人核心指标</h2>
          <Badge className="bg-blue-50 text-blue-600 border-none font-normal">刘洋 · liuyang04</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow-sm bg-white">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 门店分层概览 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700">门店分层概览</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["头部", "腰部", "尾部", "新店"].map((tier) => {
            const s = tierBadgeStyle[tier];
            const count = tierCounts[tier] || 0;
            return (
              <Card key={tier} className="border-none shadow-sm bg-white">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${s.text}`}>{count}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{tier}门店</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${s.bg} ${s.text}`}>{tier}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 门店明细表 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#4080FF]" />
            管辖门店明细
          </h2>
          <Badge className="bg-gray-50 text-gray-500 border-none font-normal ml-1">共 {stores.length} 家 · 已投广 {adCount} 家</Badge>
        </div>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>门店名称</TableHead>
                  <TableHead>商圈</TableHead>
                  <TableHead>分层</TableHead>
                  <TableHead>GTV</TableHead>
                  <TableHead>广告状态</TableHead>
                  <TableHead>MR</TableHead>
                  <TableHead>广告收入</TableHead>
                  <TableHead>环比</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-gray-800">{store.name}</TableCell>
                    <TableCell className="text-gray-600">{store.area}</TableCell>
                    <TableCell><TierBadge tier={store.tier} /></TableCell>
                    <TableCell className="text-gray-600">{store.gtv}</TableCell>
                    <TableCell>
                      {store.adStatus === "已投广" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600">已投广</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-400">未投广</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">{store.mr}</TableCell>
                    <TableCell className="text-gray-600">{store.revenue}</TableCell>
                    <TableCell className={store.mom.startsWith("-") ? "text-red-500" : store.mom === "新店" ? "text-blue-500" : "text-emerald-600"}>
                      {store.mom.startsWith("-") ? <TrendingDown className="w-3 h-3 inline mr-0.5" /> : store.mom !== "新店" ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : null}
                      {store.mom}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* AI 智能分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4080FF] rounded-full" />
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4080FF]" />
            AI 智能分析
          </h2>
        </div>
        <AiDiagnosisCard items={aiItems} />
      </div>
    </div>
  );
};

/* ================================================================== */
/* 主组件                                                               */
/* ================================================================== */
const MerchantTierAnalysis = () => {
  const { currentUser } = useUser();
  const role = currentUser?.role || "platform_admin";

  const headerConfig = {
    platform_admin: { title: "商家", description: "基于商户GTV、城市体量、新老店等维度进行二维交叉分层，提供差异化经营策略" },
    biz_manager: { title: "商家", description: "华东区商家分层视图，按城市体量与新老店维度交叉分析，支持下辖城市钻取" },
    partner: { title: "商家", description: "上海城市商家分层视图，按商圈体量与新老店维度交叉分析，含BD管辖明细" },
    bd: { title: "商家", description: "个人管辖门店分层视图，按GTV分层分类管理，聚焦广告渗透与收入提升" },
  };
  const header = headerConfig[role] || headerConfig.platform_admin;

  return (
    <div className="space-y-5">
      <PageHeader title={header.title} description={header.description} />
      {role === "platform_admin" && <PlatformAdminView />}
      {role === "biz_manager" && <BizManagerView />}
      {role === "partner" && <PartnerView />}
      {role === "bd" && <BdView />}
    </div>
  );
};

export default MerchantTierAnalysis;
