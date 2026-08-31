import React, { useState, useEffect, memo } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, ComposedChart, LineChart,
  Line, CartesianGrid, XAxis, YAxis, Legend,
} from "recharts";

/* ================================================================== */
/* 常量（与源项目一致）                                                  */
/* ================================================================== */
const WM_REGIONS = ["KA", "CKA", "城商", "整体"];
const WM_COLORS = { KA: "#6d28d9", CKA: "#06b6d4", 城商: "#a855f7", 整体: "#f59e0b" };
const WM_PIE_COLORS = { KA: "#6d28d9", CKA: "#06b6d4", 城商: "#a855f7", 整体: "#f59e0b" };

/* ================================================================== */
/* Demo 数据（替代 Supabase 查询，行结构与表完全一致）                     */
/* ================================================================== */
// 确定性伪随机：同一 key 永远返回同一 0~1 值，刷新不变
const hash01 = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
};

// daily_revenue 行：{ date, region, revenue, gtv }，覆盖 2023 全年 + 2024-01-01 ~ 2024-08-25
const DEMO_DAILY = (() => {
  const rows = [];
  const BASE = { KA: 920000, CKA: 560000, 城商: 740000 };
  const MR = { KA: 0.078, CKA: 0.068, 城商: 0.059 };
  for (let y = 2023; y <= 2024; y++) {
    const lastMonth = y === 2024 ? 8 : 12;
    for (let m = 1; m <= lastMonth; m++) {
      const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const lastDay = (y === 2024 && m === 8) ? 25 : dim;
      for (let day = 1; day <= lastDay; day++) {
        const d = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const wk = (new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7; // 0=周一
        const wkFactor = 0.82 + 0.25 * Math.sin((wk / 6) * Math.PI); // 周末略低
        const lyFactor = y === 2023 ? 0.88 : 1;                      // 去年基数低 12%
        const trendUp = 1 + (m - 1) * 0.006;                          // 月度缓慢爬坡
        let sum = 0;
        let sumGtv = 0;
        ["KA", "CKA", "城商"].forEach((reg) => {
          const noise = 0.9 + 0.2 * hash01(d + reg);
          const rev = BASE[reg] * wkFactor * lyFactor * noise * trendUp;
          rows.push({ date: d, region: reg, revenue: Math.round(rev), gtv: Math.round(rev / MR[reg]) });
          sum += rev;
          sumGtv += rev / MR[reg];
        });
        rows.push({ date: d, region: "整体", revenue: Math.round(sum), gtv: Math.round(sumGtv) });
      }
    }
  }
  return rows;
})();

// mtd_merchant_stats 行：{ date, region, ad_merchant_count, penetration_rate, arpu }
// 覆盖 2023-07 ~ 2023-08 与 2024-07 ~ 2024-08（本月 / 上月同期 / 去年同期趋势所需）
const DEMO_MERCHANT = (() => {
  const rows = [];
  const CONF = {
    KA: { pen: 0.56, arpu: 340, mc: 42000 },
    CKA: { pen: 0.34, arpu: 185, mc: 76000 },
    城商: { pen: 0.17, arpu: 88, mc: 310000 },
    整体: { pen: 0.24, arpu: 152, mc: 428000 },
  };
  const ranges = [[2023, 7], [2023, 8], [2024, 7], [2024, 8]];
  ranges.forEach(([y, m]) => {
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let day = 1; day <= dim; day++) {
      const d = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      Object.entries(CONF).forEach(([reg, c]) => {
        rows.push({
          date: d,
          region: reg,
          ad_merchant_count: Math.round(c.mc * (0.98 + 0.04 * hash01(d + reg + "m"))),
          penetration_rate: c.pen * (0.96 + 0.08 * hash01(d + reg + "p")),
          arpu: c.arpu * (0.95 + 0.1 * hash01(d + reg + "a")),
        });
      });
    }
  });
  return rows;
})();

/* ================================================================== */
/* 单客群 vs 整体对比卡片（Demo：本地数据源，聚合逻辑与源一致）             */
/* ================================================================== */
const CompareCard = memo(function CompareCard({ data, WM_COLORS, dateTMinus1 }) {
  const [compareReg, setCompareReg] = useState("KA");
  const [metric, setMetric] = useState("share");
  const [rawRows, setRawRows] = useState([]);      // 今年+去年原始逐日行
  const [trend, setTrend] = useState([]);           // 聚合后的月度趋势数组

  // ── Demo 数据源：今年+去年全量，依赖 dateTMinus1 ──
  useEffect(() => {
    if (!dateTMinus1) return;
    const year = dateTMinus1.slice(0, 4);
    const prevYear = String(parseInt(year) - 1);
    const REGS = ["KA", "CKA", "城商", "整体"];
    const thisRows = DEMO_DAILY.filter((r) => r.date >= `${year}-01-01` && r.date <= dateTMinus1 && REGS.includes(r.region));
    const lyRows = DEMO_DAILY.filter((r) => r.date >= `${prevYear}-01-01` && r.date <= `${prevYear}-12-31` && REGS.includes(r.region));
    setRawRows([...thisRows, ...lyRows]);
  }, [dateTMinus1]);

  // ── 内存聚合：依赖 rawRows + compareReg + dateTMinus1 ──
  useEffect(() => {
    if (!dateTMinus1 || rawRows.length === 0) return;

    const tYear   = parseInt(dateTMinus1.slice(0, 4), 10);
    const tMon    = parseInt(dateTMinus1.slice(5, 7), 10);
    const tDay    = dateTMinus1.slice(8, 10);
    const prevYear = tYear - 1;
    const lyDateStr = `${prevYear}-${dateTMinus1.slice(5)}`;

    const acc = {};
    const add = (key, rev, g) => {
      if (!acc[key]) acc[key] = { rev: 0, gtv: 0 };
      acc[key].rev += parseFloat(rev || 0);
      acc[key].gtv += parseFloat(g  || 0);
    };

    rawRows.forEach((r) => {
      const d    = r.date;
      const rYear = parseInt(d.slice(0, 4), 10);
      const rMon  = parseInt(d.slice(5, 7), 10);
      const rReg  = r.region;
      const isThisYear = rYear === tYear;
      const isLastYear = rYear === prevYear;
      const isCurMon   = rMon === tMon;
      if (isThisYear) {
        if (isCurMon && d > dateTMinus1) return;
        add(`${rReg}__${rYear}__${rMon}`, r.revenue, r.gtv);
      } else if (isLastYear) {
        if (isCurMon && d > lyDateStr) return;
        add(`${rReg}__${rYear}__${rMon}`, r.revenue, r.gtv);
      }
    });

    const get = (reg, yr, mon) => acc[`${reg}__${yr}__${mon}`] || { rev: 0, gtv: 0 };
    const pct = (a, b, dp) => (b > 0 ? +((a / b) * 100).toFixed(dp) : null);
    const yoy = (cur, ly) => (ly > 0 ? +((cur - ly) / ly * 100).toFixed(1) : null);

    const result = Array.from({ length: tMon }, (_, i) => {
      const mon = i + 1;
      const isCur = mon === tMon;
      const cy  = get(compareReg, tYear,  mon);
      const cyA = get("整体",     tYear,  mon);
      const ly  = get(compareReg, prevYear, mon);
      const lyA = get("整体",     prevYear, mon);
      return {
        m:          `${mon}月${isCur ? " (MTD)" : ""}`,
        share:      pct(cy.rev,  cyA.rev, 1),
        shareLY:    pct(ly.rev,  lyA.rev, 1),
        mr:         pct(cy.rev,  cy.gtv,  2),
        mrLY:       pct(ly.rev,  ly.gtv,  2),
        mrAll:      pct(cyA.rev, cyA.gtv, 2),
        mrAllLY:    pct(lyA.rev, lyA.gtv, 2),
        revYoY:     yoy(cy.rev,  ly.rev),
        gtvYoY:     yoy(cy.gtv,  ly.gtv),
        revYoYAll:  yoy(cyA.rev, lyA.rev),
        gtvYoYAll:  yoy(cyA.gtv, lyA.gtv),
      };
    });

    setTrend(result);
  }, [rawRows, compareReg, dateTMinus1]);

  const METRICS = [
    { key: "share", label: "MTD收入占比", unit: "%" },
    { key: "mr",    label: "MR%",        unit: "%" },
    { key: "yoy",   label: "YoY趋势",    unit: "%" },
  ];

  const renderLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
      {payload.map((e) => {
        const dashed = e.payload.strokeDasharray && e.payload.strokeDasharray !== "0";
        return (
          <span key={e.value} className="flex items-center gap-1 text-[11px] text-gray-600">
            <span style={{ width: 16, height: 0, borderTop: `${dashed ? "2px dashed" : "2.5px solid"} ${e.color}` }} />
            {e.value}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
      <div className="mb-0.5">
        <p className="text-sm font-semibold text-gray-700">单客群 vs 整体对比</p>
      </div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400">按月趋势 · 今年 vs 去年同期</p>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {["KA", "CKA", "城商"].map((r) => (
            <button
              key={r}
              onClick={() => setCompareReg(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                compareReg === r ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 mb-2 w-fit">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              metric === m.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={trend} margin={{ top: 4, right: 12, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="m" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v, n) => [v == null ? "--" : `${v}%`, n]} />
          <Legend content={renderLegend} />
          {metric === "share" && <Line type="monotone" dataKey="share" name="今年MTD占比" stroke="#6d28d9" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />}
          {metric === "share" && <Line type="monotone" dataKey="shareLY" name="去年同期" stroke="#c4b5fd" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2 }} isAnimationActive={false} />}
          {metric === "mr" && <Line type="monotone" dataKey="mr" name={`今年${compareReg} MR%`} stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />}
          {metric === "mr" && <Line type="monotone" dataKey="mrLY" name={`去年${compareReg} MR%`} stroke="#94a3b8" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />}
          {metric === "mr" && <Line type="monotone" dataKey="mrAll" name="今年整体 MR%" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
          {metric === "mr" && <Line type="monotone" dataKey="mrAllLY" name="去年整体 MR%" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
          {metric === "yoy" && <Line type="monotone" dataKey="revYoY" name={`${compareReg} 收入YoY%`} stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />}
          {metric === "yoy" && <Line type="monotone" dataKey="revYoYAll" name="整体 收入YoY%" stroke="#ea580c" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
          {metric === "yoy" && <Line type="monotone" dataKey="gtvYoY" name={`${compareReg} GTV YoY%`} stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />}
          {metric === "yoy" && <Line type="monotone" dataKey="gtvYoYAll" name="整体 GTV YoY%" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ================================================================== */
/* MR% 月度趋势卡片（Demo：本地数据源）                                   */
/* ================================================================== */
const MrTrendCard = memo(function MrTrendCard({ dateTMinus1, className = "" }) {
  const WM_COLORS_LOCAL = { KA: "#6d28d9", CKA: "#06b6d4", 城商: "#a855f7", 整体: "#f59e0b" };
  const [compareReg, setCompareReg] = useState("KA");
  const [rawRows, setRawRows] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    if (!dateTMinus1) return;
    const year = dateTMinus1.slice(0, 4);
    const prevYear = String(parseInt(year) - 1);
    const REGS = ["KA", "CKA", "城商", "整体"];
    const thisRows = DEMO_DAILY.filter((r) => r.date >= `${year}-01-01` && r.date <= dateTMinus1 && REGS.includes(r.region));
    const lyRows = DEMO_DAILY.filter((r) => r.date >= `${prevYear}-01-01` && r.date <= `${prevYear}-12-31` && REGS.includes(r.region));
    setRawRows([...thisRows, ...lyRows]);
  }, [dateTMinus1]);

  useEffect(() => {
    if (!dateTMinus1 || rawRows.length === 0) return;
    const tYear   = parseInt(dateTMinus1.slice(0, 4), 10);
    const tMon    = parseInt(dateTMinus1.slice(5, 7), 10);
    const prevYear = tYear - 1;
    const lyDateStr = `${prevYear}-${dateTMinus1.slice(5)}`;

    const acc = {};
    const add = (key, rev, g) => {
      if (!acc[key]) acc[key] = { rev: 0, gtv: 0 };
      acc[key].rev += parseFloat(rev || 0);
      acc[key].gtv += parseFloat(g   || 0);
    };
    rawRows.forEach((r) => {
      const d      = r.date;
      const rYear  = parseInt(d.slice(0, 4), 10);
      const rMon   = parseInt(d.slice(5, 7), 10);
      const isThisYear = rYear === tYear;
      const isLastYear = rYear === prevYear;
      const isCurMon   = rMon  === tMon;
      if (isThisYear) {
        if (isCurMon && d > dateTMinus1) return;
        add(`${r.region}__${rYear}__${rMon}`, r.revenue, r.gtv);
      } else if (isLastYear) {
        if (isCurMon && d > lyDateStr) return;
        add(`${r.region}__${rYear}__${rMon}`, r.revenue, r.gtv);
      }
    });

    const get = (reg, yr, mon) => acc[`${reg}__${yr}__${mon}`] || { rev: 0, gtv: 0 };
    const pct = (a, b, dp) => (b > 0 ? +((a / b) * 100).toFixed(dp) : null);

    const result = Array.from({ length: tMon }, (_, i) => {
      const mon = i + 1;
      const isCur = mon === tMon;
      const cy  = get(compareReg, tYear,    mon);
      const cyA = get("整体",     tYear,    mon);
      const ly  = get(compareReg, prevYear, mon);
      const lyA = get("整体",     prevYear, mon);
      return {
        m:      `${mon}月${isCur ? "(MTD)" : ""}`,
        mr:     pct(cy.rev,  cy.gtv,  2),
        mrLY:   pct(ly.rev,  ly.gtv,  2),
        mrAll:  pct(cyA.rev, cyA.gtv, 2),
        mrAllLY:pct(lyA.rev, lyA.gtv, 2),
      };
    });
    setTrend(result);
  }, [rawRows, compareReg, dateTMinus1]);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-0.5">MR% 月度趋势</p>
          <p className="text-xs text-gray-400">按月趋势 · 今年 vs 去年同期</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {["KA", "CKA", "城商"].map((r) => (
            <button key={r} onClick={() => setCompareReg(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                compareReg === r ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >{r}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={268}>
        <LineChart data={trend} margin={{ top: 4, right: 12, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="m" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} unit="%" />
          <Tooltip formatter={(v, n) => [v == null ? "--" : `${v}%`, n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="mr"      name={`今年${compareReg} MR%`} stroke={WM_COLORS_LOCAL[compareReg]} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="mrLY"    name={`去年${compareReg} MR%`} stroke={WM_COLORS_LOCAL[compareReg]} strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="mrAll"   name="今年整体 MR%"            stroke="#94a3b8" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="mrAllLY" name="去年整体 MR%"            stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

/* ================================================================== */
/* 外卖-分客群主视图（Demo 数据源，聚合与渲染逻辑与源项目一致）             */
/* ================================================================== */
const WaimaiCustomerView = ({ selectedDate }) => {
  const dateTMinus1 = (() => {
    const dt = new Date(selectedDate + "T00:00:00Z");
    dt.setUTCDate(dt.getUTCDate() - 1);
    return dt.toISOString().slice(0, 10);
  })();
  const month = dateTMinus1.slice(0, 7);
  const year  = dateTMinus1.slice(0, 4);
  const prevYear = String(parseInt(year) - 1);

  const getYoYDate = (d) => {
    const dt = new Date(d + "T00:00:00Z");
    dt.setUTCFullYear(dt.getUTCFullYear() - 1);
    const y2 = dt.getUTCFullYear();
    const m2 = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const d2 = String(dt.getUTCDate()).padStart(2, "0");
    return `${y2}-${m2}-${d2}`;
  };
  const yoyDate = getYoYDate(dateTMinus1);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [trendReg, setTrendReg] = useState("整体");

  useEffect(() => {
    setLoading(true);
    setData(null);

    const fetchData = () => {
      try {
        const monthStart = month + "-01";
        const lyMonthStart = prevYear + "-" + month.slice(5) + "-01";
        const lyMonthEnd   = prevYear + "-" + month.slice(5) + "-" + dateTMinus1.slice(8);

        // ---- Demo 数据源：从本地数组按相同条件过滤，行结构与表一致 ----
        const inRegs = (rows) => rows.filter((r) => WM_REGIONS.includes(r.region));
        const between = (from, to) => DEMO_DAILY.filter((r) => r.date >= from && r.date <= to);
        const trendStart = (() => {
          const dt2 = new Date(dateTMinus1 + "T00:00:00Z");
          dt2.setUTCDate(dt2.getUTCDate() - 29);
          return dt2.toISOString().slice(0, 10);
        })();
        const lyTrendStart = (() => {
          const dt2 = new Date(yoyDate + "T00:00:00Z");
          dt2.setUTCDate(dt2.getUTCDate() - 29);
          return dt2.toISOString().slice(0, 10);
        })();
        const lmStart = (() => {
          const dt2 = new Date(dateTMinus1 + "T00:00:00Z");
          dt2.setUTCMonth(dt2.getUTCMonth() - 1);
          dt2.setUTCDate(1);
          return dt2.toISOString().slice(0, 10);
        })();
        const lmEnd = (() => {
          const dt2 = new Date(dateTMinus1 + "T00:00:00Z");
          dt2.setUTCMonth(dt2.getUTCMonth() - 1);
          return dt2.toISOString().slice(0, 10);
        })();

        const todayRows   = inRegs(DEMO_DAILY.filter((r) => r.date === dateTMinus1));
        const yoyRows     = inRegs(DEMO_DAILY.filter((r) => r.date === yoyDate));
        const mtdRows     = inRegs(between(monthStart, dateTMinus1));
        const lyMtdRows   = inRegs(between(lyMonthStart, lyMonthEnd));
        const trendRows   = inRegs(between(trendStart, dateTMinus1)).sort((a, b) => (a.date < b.date ? -1 : 1));
        const lyTrendRows = between(lyTrendStart, yoyDate)
          .filter((r) => r.region === "整体")
          .sort((a, b) => (a.date < b.date ? -1 : 1));
        const merchantRows       = DEMO_MERCHANT.filter((r) => r.date === dateTMinus1 && WM_REGIONS.includes(r.region));
        const merchantBarRaw     = DEMO_MERCHANT.filter((r) => r.date === dateTMinus1 && ["KA", "CKA", "城商"].includes(r.region));
        const merchantTrendRaw   = DEMO_MERCHANT.filter((r) => r.date >= month + "-01" && r.date <= dateTMinus1 && WM_REGIONS.includes(r.region));
        const merchantTrendLmRaw = DEMO_MERCHANT.filter((r) => r.date >= lmStart && r.date <= lmEnd && WM_REGIONS.includes(r.region));
        const merchantTrendLyRaw = DEMO_MERCHANT.filter((r) => r.date >= prevYear + "-" + month.slice(5) + "-01" && r.date <= prevYear + "-" + dateTMinus1.slice(5) && WM_REGIONS.includes(r.region));

        const sumByRegion = (rows) => {
          const m = {};
          (rows || []).forEach((r) => {
            if (!m[r.region]) m[r.region] = { revenue: 0, gtv: 0 };
            m[r.region].revenue += parseFloat(r.revenue || 0);
            m[r.region].gtv     += parseFloat(r.gtv || 0);
          });
          return m;
        };

        const todayMap   = sumByRegion(todayRows);
        const yoyMap     = sumByRegion(yoyRows);
        const mtdMap     = sumByRegion(mtdRows);
        const lyMtdMap   = sumByRegion(lyMtdRows);

        const getTodaySnap = (rows, region) => {
          const r = (rows || []).find((x) => x.region === region);
          return r ? {
            revenue: parseFloat(r.revenue || 0),
            gtv: parseFloat(r.gtv || 0),
          } : null;
        };

        const totalTodaySnap = getTodaySnap(todayRows, "整体");
        const totalTodayRev  = totalTodaySnap ? totalTodaySnap.revenue : 0;

        const regionData = {};
        WM_REGIONS.forEach((reg) => {
          const snap    = getTodaySnap(todayRows, reg);
          const yoySnap = getTodaySnap(yoyRows, reg);
          const mtd     = mtdMap[reg];
          const lyMtd   = lyMtdMap[reg];

          const todayRev = snap ? snap.revenue : null;
          const todayGtv = snap ? snap.gtv : null;
          const todayMr  = (todayRev != null && todayGtv && todayGtv > 0) ? todayRev / todayGtv * 100 : null;
          const sharePct = (todayRev != null && totalTodayRev > 0 && reg !== "整体") ? todayRev / totalTodayRev * 100 : null;

          const yoyRev = yoySnap ? yoySnap.revenue : null;
          const revYoY = (todayRev != null && yoyRev && yoyRev > 0) ? (todayRev - yoyRev) / yoyRev * 100 : null;

          const mtdRev    = mtd ? mtd.revenue : null;
          const mtdGtv    = mtd ? mtd.gtv : null;
          const mtdMr     = (mtdRev != null && mtdGtv && mtdGtv > 0) ? mtdRev / mtdGtv * 100 : null;
          const lyMtdRev  = lyMtd ? lyMtd.revenue : null;
          const mtdRevYoY = (mtdRev != null && lyMtdRev && lyMtdRev > 0) ? (mtdRev - lyMtdRev) / lyMtdRev * 100 : null;

          const mtdTotalRev = mtdMap["整体"] ? mtdMap["整体"].revenue : 0;
          const mtdSharePct = (mtdRev != null && mtdTotalRev > 0 && reg !== "整体") ? mtdRev / mtdTotalRev * 100 : null;

          regionData[reg] = {
            todayRev, todayGtv, todayMr, sharePct, revYoY,
            mtdRev, mtdMr, mtdRevYoY, mtdSharePct,
          };
        });

        const merchantMap = {};
        (merchantRows || []).forEach((r) => { merchantMap[r.region] = r; });
        WM_REGIONS.forEach((reg) => {
          const m = merchantMap[reg];
          regionData[reg].adMerchantCount = m && m.ad_merchant_count != null ? parseFloat(m.ad_merchant_count) : null;
          regionData[reg].penetrationRate = m && m.penetration_rate  != null ? parseFloat(m.penetration_rate)  : null;
          regionData[reg].arpu            = m && m.arpu              != null ? parseFloat(m.arpu)              : null;
        });

        // ---- 趋势图数据 ----
        const trendByDate = {};
        (trendRows || []).forEach((r) => {
          if (!trendByDate[r.date]) trendByDate[r.date] = {};
          trendByDate[r.date][r.region] = parseFloat(r.revenue || 0) / 10000;
        });
        const lyTrendByDate = {};
        (lyTrendRows || []).forEach((r) => {
          if (!lyTrendByDate[r.date]) lyTrendByDate[r.date] = {};
          lyTrendByDate[r.date][r.region] = parseFloat(r.revenue || 0) / 10000;
        });

        const trendDates = Object.keys(trendByDate).sort();
        const chartData = trendDates.map((d) => {
          const row = trendByDate[d] || {};
          const dt2 = new Date(d + "T00:00:00Z");
          dt2.setUTCFullYear(dt2.getUTCFullYear() - 1);
          const lyD = dt2.toISOString().slice(0, 10);
          const lyRow = lyTrendByDate[lyD] || {};
          const calcMr = (reg) => {
            const row2 = (trendRows || []).find((x) => x.date === d && x.region === reg);
            if (!row2) return null;
            const g = parseFloat(row2.gtv || 0);
            return g > 0 ? parseFloat((parseFloat(row2.revenue || 0) / g * 100).toFixed(2)) : null;
          };
          return {
            date: d.slice(5),
            KA:    row["KA"]    != null ? parseFloat(row["KA"].toFixed(1))    : null,
            CKA:   row["CKA"]   != null ? parseFloat(row["CKA"].toFixed(1))   : null,
            城商:  row["城商"]   != null ? parseFloat(row["城商"].toFixed(1))  : null,
            整体:  row["整体"]   != null ? parseFloat(row["整体"].toFixed(1))  : null,
            去年整体: lyRow["整体"] != null ? parseFloat(lyRow["整体"].toFixed(1)) : null,
            MR_KA:   calcMr("KA"),
            MR_CKA:  calcMr("CKA"),
            MR_城商: calcMr("城商"),
            MR_整体: calcMr("整体"),
          };
        });

        // ---- 甜甜圈饼图数据（T-1 KA/CKA/城商 原始 revenue）----
        const pieRaw = ["KA", "CKA", "城商"].map((reg) => {
          const snap = getTodaySnap(todayRows, reg);
          return snap && snap.revenue > 0 ? { name: reg, value: parseFloat((snap.revenue / 10000).toFixed(1)) } : null;
        }).filter(Boolean);
        const pieTotalWan = pieRaw.reduce((a, x) => a + x.value, 0);

        // ---- MTD 饼图数据 ----
        const mtdPieRaw = ["KA", "CKA", "城商"].map((reg) => {
          const m = mtdMap[reg];
          const rev = m ? m.revenue / 10000 : 0;
          return rev > 0 ? { name: reg, value: parseFloat(rev.toFixed(1)) } : null;
        }).filter(Boolean);
        const mtdPieTotalWan = mtdPieRaw.reduce((a, x) => a + x.value, 0);

        const overallRow = (merchantRows || []).find((r) => r.region === "整体");
        const overallPenetration = overallRow && overallRow.penetration_rate != null ? parseFloat((overallRow.penetration_rate * 100).toFixed(2)) : null;
        const overallArpu        = overallRow && overallRow.arpu != null ? parseFloat(parseFloat(overallRow.arpu).toFixed(1)) : null;
        const merchantBarData = ["KA", "CKA", "城商"].map((reg) => {
          const row = (merchantBarRaw || []).find((r) => r.region === reg);
          return {
            reg,
            penetration:        row && row.penetration_rate != null ? parseFloat((row.penetration_rate * 100).toFixed(2)) : null,
            arpu:               row && row.arpu != null ? parseFloat(parseFloat(row.arpu).toFixed(1)) : null,
            penetrationOverall: overallPenetration,
            arpuOverall:        overallArpu,
          };
        });

        // 商家趋势图数据：按 region 分组，以"月内第几天"为X轴
        const toRegionDayMap = (rows) => {
          const rm = {};
          (rows || []).forEach((r) => {
            const reg = r.region;
            const day = parseInt(r.date.slice(8), 10);
            if (!rm[reg]) rm[reg] = {};
            rm[reg][day] = {
              penetration: r.penetration_rate != null ? parseFloat((parseFloat(r.penetration_rate) * 100).toFixed(2)) : null,
              arpu:        r.arpu != null ? parseFloat(parseFloat(r.arpu).toFixed(1)) : null,
            };
          });
          return rm;
        };
        const curRegMap = toRegionDayMap(merchantTrendRaw);
        const lmRegMap  = toRegionDayMap(merchantTrendLmRaw);
        const lyRegMap  = toRegionDayMap(merchantTrendLyRaw);
        const maxDay = parseInt(dateTMinus1.slice(8), 10);
        const merchantTrendData = {};
        WM_REGIONS.forEach((reg) => {
          const cur = curRegMap[reg] || {};
          const lm  = lmRegMap[reg]  || {};
          const ly  = lyRegMap[reg]  || {};
          merchantTrendData[reg] = Array.from({ length: maxDay }, (_, i) => {
            const day = i + 1;
            return {
              day: `${day}日`,
              penetration:   cur[day]?.penetration ?? null,
              arpu:          cur[day]?.arpu ?? null,
              penetrationLm: lm[day]?.penetration ?? null,
              arpuLm:        lm[day]?.arpu ?? null,
              penetrationLy: ly[day]?.penetration ?? null,
              arpuLy:        ly[day]?.arpu ?? null,
            };
          });
        });

        setData({ regionData, chartData, pieRaw, pieTotalWan, mtdPieRaw, mtdPieTotalWan, merchantBarData, merchantTrendData });
      } catch (e) {
        console.error("WaimaiCustomerView demo fetch error:", e);
        setData({ regionData: {}, chartData: [] });
      } finally {
        setLoading(false);
      }
    };

    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
  }, [selectedDate]);

  const fmtW = (v) => v == null ? "--" : (v / 10000).toFixed(1);         // 元→万
  const fmtY = (v) => v == null ? "--" : (v / 100000000).toFixed(3);     // 元→亿
  const fmtP = (v) => v == null ? "--" : v.toFixed(2) + "%";
  const fmtPct = (v) => v == null ? "--" : v.toFixed(1) + "%";
  const fmtChg = (v, unit="%") => {
    if (v == null) return "--";
    const n = parseFloat(v.toFixed(1));
    return (n > 0 ? "+" : "") + n + unit;
  };
  const clrChg = (v) => {
    if (v == null) return "text-gray-400";
    return v > 0 ? "text-emerald-600" : v < 0 ? "text-red-500" : "text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-sm text-gray-400">数据加载中…</span>
      </div>
    );
  }

  const rd = data?.regionData || {};

  return (
    <div className="space-y-4">
      {/* ── (1) KPI 卡片 4 张 ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {WM_REGIONS.map((reg) => {
          const r = rd[reg] || {};
          const color = WM_COLORS[reg];
          return (
            <div key={reg} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex">
                <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-base font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>{reg}</span>
                    <span className="text-[10px] text-gray-400">客群</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                    <div>
                      <p className="text-[10px] text-gray-400">当日收入(万)</p>
                      <p className="text-sm font-bold text-gray-800">{fmtW(r.todayRev)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">当日GTV(亿)</p>
                      <p className="text-sm font-bold text-gray-800">{fmtY(r.todayGtv)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">当日MR%</p>
                      <p className="text-sm font-bold text-gray-800">{fmtP(r.todayMr)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{reg === "整体" ? "当日YoY" : "占整体比"}</p>
                      <p className={`text-sm font-bold ${reg === "整体" ? clrChg(r.revYoY) : "text-gray-800"}`}>
                        {reg === "整体" ? fmtChg(r.revYoY) : fmtPct(r.sharePct)}
                      </p>
                    </div>
                  </div>
                  {/* 商家经营指标 */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 mt-2 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] text-gray-400">渗透率</p>
                      <p className="text-sm font-bold text-gray-800">
                        {r.penetrationRate != null ? (r.penetrationRate * 100).toFixed(1) + "%" : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">ARPU</p>
                      <p className="text-sm font-bold text-gray-800">
                        {r.arpu != null ? parseFloat(r.arpu).toFixed(1) + "元" : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── (2) 图表区 第一行：T-1饼图 + MTD饼图 并排 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* 左：T-1当天客群收入结构 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">客群收入结构（T-1当天）</p>
          <p className="text-xs text-gray-400 mb-2">KA / CKA / 城商 收入占比</p>
          <div className="grid grid-cols-2 items-center gap-4 mt-2">
            <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie data={data?.pieRaw || []} cx="50%" cy="50%" innerRadius={62} outerRadius={92} dataKey="value" isAnimationActive={false} label={false} labelLine={false}>
                    {(data?.pieRaw || []).map((entry) => (
                      <Cell key={entry.name} fill={WM_PIE_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}万`, "收入"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-400">整体</span>
                <span className="text-xl font-bold text-gray-700">{data?.pieTotalWan != null ? data.pieTotalWan.toFixed(1) : "--"}</span>
                <span className="text-[10px] text-gray-400">万元</span>
              </div>
            </div>
            <div className="space-y-3 flex flex-col justify-center">
              {(data?.pieRaw || []).map((entry) => {
                const total = data?.pieTotalWan || 0;
                const pct = total > 0 ? (entry.value / total * 100).toFixed(1) : "--";
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: WM_PIE_COLORS[entry.name] }} />
                    <span className="text-sm text-gray-600 font-medium w-8">{entry.name}</span>
                    <span className="text-sm font-bold text-gray-800">{entry.value}万</span>
                    <span className="text-sm text-gray-400 ml-0.5">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右：MTD客群收入结构 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">客群收入结构（MTD）</p>
          <p className="text-xs text-gray-400 mb-2">KA / CKA / 城商 月累计收入占比</p>
          <div className="grid grid-cols-2 items-center gap-4 mt-2">
            <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie data={data?.mtdPieRaw || []} cx="50%" cy="50%" innerRadius={62} outerRadius={92} dataKey="value" isAnimationActive={false} label={false} labelLine={false}>
                    {(data?.mtdPieRaw || []).map((entry) => (
                      <Cell key={entry.name} fill={WM_PIE_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}万`, "MTD收入"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-400">整体</span>
                <span className="text-xl font-bold text-gray-700">{data?.mtdPieTotalWan != null ? data.mtdPieTotalWan.toFixed(1) : "--"}</span>
                <span className="text-[10px] text-gray-400">万元</span>
              </div>
            </div>
            <div className="space-y-3 flex flex-col justify-center">
              {(data?.mtdPieRaw || []).map((entry) => {
                const total = data?.mtdPieTotalWan || 0;
                const pct = total > 0 ? (entry.value / total * 100).toFixed(1) : "--";
                return (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: WM_PIE_COLORS[entry.name] }} />
                    <span className="text-sm text-gray-600 font-medium w-8">{entry.name}</span>
                    <span className="text-sm font-bold text-gray-800">{entry.value}万</span>
                    <span className="text-sm text-gray-400 ml-0.5">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 图表区 2×2 网格 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* 左上：单客群 vs 整体对比 */}
        <CompareCard data={data} WM_COLORS={WM_COLORS} dateTMinus1={dateTMinus1} />

        {/* 右上：客群收入趋势 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">客群收入趋势（万元）</p>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={data?.chartData || []} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="KA"        name="KA"      stroke={WM_COLORS.KA}       dot={false} strokeWidth={2}   isAnimationActive={false} connectNulls />
              <Line type="monotone" dataKey="CKA"       name="CKA"     stroke={WM_COLORS.CKA}      dot={false} strokeWidth={2}   isAnimationActive={false} connectNulls />
              <Line type="monotone" dataKey="城商"      name="城商"    stroke={WM_COLORS["城商"]}  dot={false} strokeWidth={2}   isAnimationActive={false} connectNulls />
              <Line type="monotone" dataKey="整体"      name="整体"    stroke={WM_COLORS["整体"]}  dot={false} strokeWidth={2}   isAnimationActive={false} connectNulls />
              <Line type="monotone" dataKey="去年整体"  name="去年整体" stroke="#d1d5db"            dot={false} strokeWidth={1.5} strokeDasharray="4 3" isAnimationActive={false} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 左下：渗透率 & ARPU 月内趋势（可切换客群） */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">渗透率 & ARPU 月内趋势</p>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {WM_REGIONS.map((reg) => (
                <button key={reg} onClick={() => setTrendReg(reg)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                    trendReg === reg ? "text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  style={trendReg === reg ? { backgroundColor: WM_COLORS[reg] } : {}}
                >{reg}</button>
              ))}
            </div>
          </div>
          {(() => {
            const trendArr = data?.merchantTrendData?.[trendReg] || [];
            const ivl = Math.max(1, Math.floor(trendArr.length / 6));
            return (
              <>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">渗透率月内趋势（{trendReg}）</p>
                  <p className="text-xs text-gray-400 mb-1">本月 vs 上月同期 vs 去年同期 · 单位 %</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={trendArr} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={ivl} />
                      <YAxis tick={{ fontSize: 10 }} unit="%" domain={['auto', 'auto']} tickFormatter={v => v.toFixed(1)} />
                      <Tooltip formatter={(v, name) => v != null ? [`${v}%`, name] : ["--", name]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="penetration"   name="本月"     stroke="#6366f1" strokeWidth={2}   dot={false} isAnimationActive={false} connectNulls />
                      <Line type="monotone" dataKey="penetrationLm" name="上月同期" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="5 3" isAnimationActive={false} connectNulls />
                      <Line type="monotone" dataKey="penetrationLy" name="去年同期" stroke="#cbd5e1" strokeWidth={1.5} dot={false} strokeDasharray="3 3" isAnimationActive={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">ARPU月内趋势（{trendReg}）</p>
                  <p className="text-xs text-gray-400 mb-1">本月 vs 上月同期 vs 去年同期 · 单位 元</p>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={trendArr} margin={{ top: 4, right: 8, left: -4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={ivl} />
                      <YAxis tick={{ fontSize: 10 }} unit="元" domain={['auto', 'auto']} />
                      <Tooltip formatter={(v, name) => v != null ? [`${v}元`, name] : ["--", name]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="arpu"   name="本月"     stroke="#f59e0b" strokeWidth={2}   dot={false} isAnimationActive={false} connectNulls />
                      <Line type="monotone" dataKey="arpuLm" name="上月同期" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="5 3" isAnimationActive={false} connectNulls />
                      <Line type="monotone" dataKey="arpuLy" name="去年同期" stroke="#cbd5e1" strokeWidth={1.5} dot={false} strokeDasharray="3 3" isAnimationActive={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            );
          })()}
        </div>

        {/* 右下：MR% 月度趋势 */}
        <MrTrendCard dateTMinus1={dateTMinus1} className="h-full" />
      </div>

      {/* ── (3) 客群明细表 ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">客群明细（数据截至 {dateTMinus1}）</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* 双色分区表头 第1行：分组标题 */}
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 bg-gray-50 border-r border-gray-200" rowSpan={2}>客群</th>
                {/* 左区：收入 */}
                <th colSpan={4} className="px-3 py-2 text-center font-semibold text-indigo-700 bg-indigo-50 border-b border-indigo-200">
                  MTD 收入
                </th>
                {/* 右区：MR */}
                <th colSpan={1} className="px-3 py-2 text-center font-semibold text-purple-700 bg-purple-50 border-b border-purple-200 border-l border-gray-200">
                  当日 MR
                </th>
              </tr>
              <tr className="text-gray-500">
                <th className="px-3 py-2 text-right font-medium bg-indigo-50/60">MTD收入(万)</th>
                <th className="px-3 py-2 text-right font-medium bg-indigo-50/60">收入占比</th>
                <th className="px-3 py-2 text-right font-medium bg-indigo-50/60">收入YoY</th>
                <th className="px-3 py-2 text-right font-medium bg-purple-50/60 border-l border-gray-200">当日MR%</th>
              </tr>
            </thead>
            <tbody>
              {WM_REGIONS.map((reg, i) => {
                const r = rd[reg] || {};
                const isLast = reg === "整体";
                return (
                  <tr key={reg} className={`${isLast ? "bg-amber-50/30 font-semibold border-t-2 border-amber-200" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-3 py-2.5 border-r border-gray-200">
                      <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: WM_COLORS[reg] }}>{reg}</span>
                    </td>
                    {/* 收入区 */}
                    <td className="px-3 py-2.5 text-right">{fmtW(r.mtdRev)}</td>
                    <td className="px-3 py-2.5 text-right">{reg === "整体" ? "--" : fmtPct(r.mtdSharePct)}</td>
                    <td className={`px-3 py-2.5 text-right ${clrChg(r.mtdRevYoY)}`}>{fmtChg(r.mtdRevYoY)}</td>
                    {/* MR区 */}
                    <td className="px-3 py-2.5 text-right border-l border-gray-200">{fmtP(r.todayMr)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* 主页面                                                               */
/* ================================================================== */
export default function MerchantSegment() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">外卖商家分客群</h1>
        <p className="text-sm text-gray-400 mt-1">KA / CKA / 城商 客群经营看板</p>
      </div>
      <WaimaiCustomerView selectedDate="2024-08-25" />
    </div>
  );
}
