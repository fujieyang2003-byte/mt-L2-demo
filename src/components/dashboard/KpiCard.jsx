import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * KPI 摘要卡片
 * @param {string} label 指标名称
 * @param {string} value 指标数值（含单位）
 * @param {number} trend 环比涨跌幅，正数上升，负数下降
 * @param {React.ComponentType} icon lucide 图标组件
 * @param {string} iconBg 图标底色
 * @param {string} iconColor 图标颜色
 */
const KpiCard = ({ label, value, trend, icon: Icon, iconBg, iconColor, footerLabel = "较上周期" }) => {
  const isUp = trend >= 0;
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
        </div>
        {typeof trend === "number" && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                isUp ? "text-emerald-500" : "text-red-500"
              )}
            >
              {isUp ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(trend)}%
            </span>
            <span className="text-gray-400">{footerLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
