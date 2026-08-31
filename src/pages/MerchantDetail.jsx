import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBizLine } from "@/contexts/BizLineContext";
import { TrendingUp, TrendingDown, Users, Store, DollarSign, Target, BarChart3, ChevronDown, ChevronUp, Sparkles, PieChart } from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ================================================================== */
/* 配色                                                                 */
/* ================================================================== */
const COLORS = ["#4080FF", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#60A5FA"];

/* ================================================================== */
/* 演示数据 — 按业务线 × 城市体量 × 商家类型                            */
/* ================================================================== */
const SEGMENT_DATA = {
  waimai: {
    large: {
      head: {
        kpi: [
          { label: "商家数量", value: "4.0万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+2.3%" },
          { label: "广告渗透率", value: "85%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.5%" },
          { label: "平均收入", value: "3,200元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+4.2%" },
          { label: "平均MR", value: "3.19%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.3%" },
        ],
        profile: {
          score: 4.2,
          scoreLabel: "优秀",
          interpretation: "头部老店在大体量城市表现优异，广告渗透率85%为全矩阵最高，平均收入3200元。商家对广告产品接受度高，复投率稳定。",
          suggestions: [
            "推进品牌广告升级，提升高价值产品渗透",
            "配置专属客户经理，深化商家关系",
            "引入搜索广告组合包，提升ARPU约15%",
          ],
          productDistribution: [
            { name: "点金推广", value: 45 },
            { name: "订单通", value: 25 },
            { name: "超级流量卡", value: 15 },
            { name: "揽客宝", value: 10 },
            { name: "其他", value: 5 },
          ],
          tags: ["高价值", "复投率高", "品牌意识强"],
        },
        capability: {
          score: 4.2,
          scoreLabel: "小组第二名",
          dimensions: [
            { name: "广告产品认知", score: 5, desc: "对广告产品理解深入，能自主优化投放策略" },
            { name: "投放执行力", score: 4, desc: "投放频次稳定，预算管理合理" },
            { name: "数据敏感度", score: 4, desc: "能根据数据反馈调整投放策略" },
            { name: "ROI优化能力", score: 4, desc: "ROI保持在健康水平，有优化空间" },
            { name: "新客获取", score: 4, desc: "新客获取能力较强，可进一步挖掘" },
          ],
        },
      },
      waist: {
        kpi: [
          { label: "商家数量", value: "6.7万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+1.8%" },
          { label: "广告渗透率", value: "78%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2.1%" },
          { label: "平均收入", value: "2,100元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+3.5%" },
          { label: "平均MR", value: "2.77%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.2%" },
        ],
        profile: {
          score: 3.5,
          scoreLabel: "良好",
          interpretation: "腰部老店在大体量城市表现良好，广告渗透率78%，仍有提升空间。商家对广告有一定认知，但投放策略较为粗放。",
          suggestions: [
            "加强投放培训，提升精准投放能力",
            "推广自动化营销工具，降低操作门槛",
            "通过案例分享提升商家对高价值产品的认知",
          ],
          productDistribution: [
            { name: "点金推广", value: 40 },
            { name: "订单通", value: 20 },
            { name: "超级流量卡", value: 18 },
            { name: "揽客宝", value: 12 },
            { name: "其他", value: 10 },
          ],
          tags: ["潜力大", "投放粗放", "培训需求高"],
        },
        capability: {
          score: 3.5,
          scoreLabel: "小组第四名",
          dimensions: [
            { name: "广告产品认知", score: 3, desc: "对基础产品认知尚可，高价值产品了解不足" },
            { name: "投放执行力", score: 4, desc: "投放频次稳定，但预算分配不够精准" },
            { name: "数据敏感度", score: 3, desc: "数据意识较弱，需引导关注核心指标" },
            { name: "ROI优化能力", score: 3, desc: "ROI处于中等水平，优化空间较大" },
            { name: "新客获取", score: 4, desc: "新客获取意愿强，但方法单一" },
          ],
        },
      },
      tail: {
        kpi: [
          { label: "商家数量", value: "55.5万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+0.5%" },
          { label: "广告渗透率", value: "53%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.2%" },
          { label: "平均收入", value: "890元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+2.8%" },
          { label: "平均MR", value: "1.99%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.1%" },
        ],
        profile: {
          score: 2.8,
          scoreLabel: "中等",
          interpretation: "尾部老店在大体量城市数量庞大但广告渗透率仅53%，平均收入偏低。商家对广告价值认知不足，需批量培育和触达。",
          suggestions: [
            "批量投放首充礼包，降低尝试门槛",
            "通过自动化营销工具降低操作成本",
            "建立ROI优化案例库，提升商家信心",
          ],
          productDistribution: [
            { name: "点金推广", value: 35 },
            { name: "订单通", value: 15 },
            { name: "超级流量卡", value: 20 },
            { name: "揽客宝", value: 18 },
            { name: "其他", value: 12 },
          ],
          tags: ["基数大", "渗透低", "培育期"],
        },
        capability: {
          score: 2.8,
          scoreLabel: "小组第六名",
          dimensions: [
            { name: "广告产品认知", score: 2, desc: "广告产品认知薄弱，以被动接受为主" },
            { name: "投放执行力", score: 3, desc: "投放频次低，预算管理粗放" },
            { name: "数据敏感度", score: 2, desc: "数据意识薄弱，缺乏分析习惯" },
            { name: "ROI优化能力", score: 3, desc: "ROI处于中等水平，优化动力不足" },
            { name: "新客获取", score: 3, desc: "新客获取意愿一般，需激励驱动" },
          ],
        },
      },
      new: {
        kpi: [
          { label: "商家数量", value: "6.6万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+5.2%" },
          { label: "广告渗透率", value: "7%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+3.1%" },
          { label: "平均收入", value: "4,200元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+6.8%" },
          { label: "平均MR", value: "3.54%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.5%" },
        ],
        profile: {
          score: 3.8,
          scoreLabel: "良好",
          interpretation: "新店广告渗透率仅7%但平均MR 3.54%为全矩阵最高，说明已投广新店效果显著。需加大冷启破冰力度，将渗透率从7%提升至15%。",
          suggestions: [
            "设计新店专属冷启礼包，降低首次投放门槛",
            "30天成长计划，引导完成首次投放",
            "投放效果案例分享，增强新店信心",
          ],
          productDistribution: [
            { name: "点金推广", value: 50 },
            { name: "订单通", value: 30 },
            { name: "超级流量卡", value: 10 },
            { name: "揽客宝", value: 8 },
            { name: "其他", value: 2 },
          ],
          tags: ["高MR", "渗透低", "增长快"],
        },
        capability: {
          score: 3.8,
          scoreLabel: "小组第三名",
          dimensions: [
            { name: "广告产品认知", score: 3, desc: "对新店专属产品有认知，但主动探索不足" },
            { name: "投放执行力", score: 4, desc: "首次投放意愿强，执行效率较高" },
            { name: "数据敏感度", score: 3, desc: "数据关注度高，但分析能力待提升" },
            { name: "ROI优化能力", score: 4, desc: "ROI表现优异，优化潜力大" },
            { name: "新客获取", score: 5, desc: "新客获取需求强烈，效果突出" },
          ],
        },
      },
    },
    small: {
      head: {
        kpi: [
          { label: "商家数量", value: "1.2万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+1.5%" },
          { label: "广告渗透率", value: "75%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.0%" },
          { label: "平均收入", value: "2,800元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+2.5%" },
          { label: "平均MR", value: "2.08%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.2%" },
        ],
        profile: {
          score: 3.6,
          scoreLabel: "良好",
          interpretation: "头部老店在中小体量城市广告渗透率75%，平均收入2800元。商家质量较好，但受限于城市规模，增长空间有限。",
          suggestions: [
            "聚焦本地特色推广，提升差异化竞争力",
            "推广低成本广告产品，匹配城市规模",
            "建立商家互助社群，提升自运营能力",
          ],
          productDistribution: [
            { name: "点金推广", value: 42 },
            { name: "订单通", value: 22 },
            { name: "超级流量卡", value: 16 },
            { name: "揽客宝", value: 14 },
            { name: "其他", value: 6 },
          ],
          tags: ["质量稳", "规模小", "差异化"],
        },
        capability: {
          score: 3.6,
          scoreLabel: "小组第五名",
          dimensions: [
            { name: "广告产品认知", score: 3, desc: "对基础产品认知良好，高价值产品尝试少" },
            { name: "投放执行力", score: 4, desc: "投放稳定，但预算规模有限" },
            { name: "数据敏感度", score: 3, desc: "数据关注中等，优化动力一般" },
            { name: "ROI优化能力", score: 3, desc: "ROI处于中等水平，优化空间存在" },
            { name: "新客获取", score: 4, desc: "新客获取能力较好，但方法有限" },
          ],
        },
      },
      waist: {
        kpi: [
          { label: "商家数量", value: "2.8万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+1.2%" },
          { label: "广告渗透率", value: "71%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.8%" },
          { label: "平均收入", value: "1,900元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+2.2%" },
          { label: "平均MR", value: "2.07%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.1%" },
        ],
        profile: {
          score: 3.2,
          scoreLabel: "中等",
          interpretation: "腰部老店在中小体量城市表现中等，广告渗透率71%。商家对广告有一定认知，但投放效果波动较大，需加强稳定性。",
          suggestions: [
            "推广自动化投放工具，降低操作门槛",
            "建立投放效果追踪机制，提升稳定性",
            "加强商家培训，提升自主优化能力",
          ],
          productDistribution: [
            { name: "点金推广", value: 38 },
            { name: "订单通", value: 18 },
            { name: "超级流量卡", value: 20 },
            { name: "揽客宝", value: 16 },
            { name: "其他", value: 8 },
          ],
          tags: ["效果波动", "培训需求", "工具化"],
        },
        capability: {
          score: 3.2,
          scoreLabel: "小组第七名",
          dimensions: [
            { name: "广告产品认知", score: 3, desc: "产品认知中等，高价值产品了解不足" },
            { name: "投放执行力", score: 3, desc: "投放执行不够稳定，效果波动大" },
            { name: "数据敏感度", score: 3, desc: "数据关注一般，缺乏系统性分析" },
            { name: "ROI优化能力", score: 3, desc: "ROI波动较大，需建立优化方法" },
            { name: "新客获取", score: 3, desc: "新客获取能力中等，需持续激励" },
          ],
        },
      },
      tail: {
        kpi: [
          { label: "商家数量", value: "35.9万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+0.3%" },
          { label: "广告渗透率", value: "45%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+0.8%" },
          { label: "平均收入", value: "520元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+1.5%" },
          { label: "平均MR", value: "1.48%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.05%" },
        ],
        profile: {
          score: 2.2,
          scoreLabel: "待提升",
          interpretation: "尾部老店在中小体量城市数量最大但广告渗透率仅45%，平均收入最低。商家对广告价值认知严重不足，需批量培育和触达。",
          suggestions: [
            "大规模首充礼包投放，降低尝试门槛",
            "社群运营+自动化营销批量触达",
            "简化广告产品，降低操作复杂度",
          ],
          productDistribution: [
            { name: "点金推广", value: 30 },
            { name: "订单通", value: 12 },
            { name: "超级流量卡", value: 22 },
            { name: "揽客宝", value: 20 },
            { name: "其他", value: 16 },
          ],
          tags: ["基数最大", "渗透最低", "急需培育"],
        },
        capability: {
          score: 2.2,
          scoreLabel: "小组第八名",
          dimensions: [
            { name: "广告产品认知", score: 2, desc: "广告认知薄弱，被动接受为主" },
            { name: "投放执行力", score: 2, desc: "投放频次极低，缺乏持续投放习惯" },
            { name: "数据敏感度", score: 2, desc: "数据意识薄弱，不关注投放效果" },
            { name: "ROI优化能力", score: 2, desc: "ROI水平较低，缺乏优化动力" },
            { name: "新客获取", score: 2, desc: "新客获取意愿弱，需强激励驱动" },
          ],
        },
      },
      new: {
        kpi: [
          { label: "商家数量", value: "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "—" },
          { label: "广告渗透率", value: "—", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "—" },
          { label: "平均收入", value: "—", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "—" },
          { label: "平均MR", value: "—", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "—" },
        ],
        profile: {
          score: 0,
          scoreLabel: "暂无数据",
          interpretation: "中小体量城市新店数据暂未纳入统计。",
          suggestions: [],
          productDistribution: [],
          tags: [],
        },
        capability: {
          score: 0,
          scoreLabel: "暂无数据",
          dimensions: [],
        },
      },
    },
  },
  daocan: {
    large_tour: {
      head: {
        kpi: [
          { label: "商家数量", value: "1.0万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+2.0%" },
          { label: "广告渗透率", value: "40%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.5%" },
          { label: "平均收入", value: "1,800元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+3.0%" },
          { label: "平均MR", value: "1.71%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.2%" },
        ],
        profile: {
          score: 3.8,
          scoreLabel: "良好",
          interpretation: "头部老店在旅游大城市表现良好，广告渗透率40%，MR 1.71%为到餐全矩阵最高。旅游消费弹性大，广告价值易被感知。",
          suggestions: [
            "推进品牌广告+搜索广告组合包",
            "利用旅游旺季加大投放激励",
            "建立旅游商家专属广告方案",
          ],
          productDistribution: [
            { name: "推广通", value: 50 },
            { name: "订单通", value: 25 },
            { name: "置顶卡", value: 15 },
            { name: "智选展位", value: 10 },
          ],
          tags: ["高MR", "旅游特色", "组合包"],
        },
        capability: {
          score: 3.8,
          scoreLabel: "小组第三名",
          dimensions: [
            { name: "广告产品认知", score: 4, desc: "对广告产品认知较好，旅游商家特色明显" },
            { name: "投放执行力", score: 4, desc: "投放执行力良好，旺季投放积极" },
            { name: "数据敏感度", score: 3, desc: "数据关注度中等，优化空间存在" },
            { name: "ROI优化能力", score: 4, desc: "ROI表现良好，旅游场景优势明显" },
            { name: "新客获取", score: 4, desc: "新客获取能力强，旅游流量转化高" },
          ],
        },
      },
      tail: {
        kpi: [
          { label: "商家数量", value: "5.3万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+0.8%" },
          { label: "广告渗透率", value: "9.4%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.2%" },
          { label: "平均收入", value: "420元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+2.5%" },
          { label: "平均MR", value: "2.03%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.3%" },
        ],
        profile: {
          score: 3.0,
          scoreLabel: "中等",
          interpretation: "腰尾部老店在旅游大城市MR 2.03%反而高于头部，说明旅游场景中小商户广告效果突出。但渗透率仅9.4%，需扩大覆盖。",
          suggestions: [
            "加大该群体投放激励，扩大广告覆盖",
            "推广低成本广告产品，匹配中小商户预算",
            "利用旅游标签精准投放，提升转化",
          ],
          productDistribution: [
            { name: "推广通", value: 35 },
            { name: "订单通", value: 20 },
            { name: "置顶卡", value: 25 },
            { name: "智选展位", value: 20 },
          ],
          tags: ["MR反超", "渗透低", "旅游场景"],
        },
        capability: {
          score: 3.0,
          scoreLabel: "小组第五名",
          dimensions: [
            { name: "广告产品认知", score: 3, desc: "产品认知中等，对低成本产品接受度高" },
            { name: "投放执行力", score: 3, desc: "投放执行力一般，频次不稳定" },
            { name: "数据敏感度", score: 3, desc: "数据关注中等，优化意识待提升" },
            { name: "ROI优化能力", score: 4, desc: "ROI表现突出，旅游场景优势明显" },
            { name: "新客获取", score: 3, desc: "新客获取能力中等，需持续激励" },
          ],
        },
      },
      new: {
        kpi: [
          { label: "商家数量", value: "0.4万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+4.0%" },
          { label: "广告渗透率", value: "0.5%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+0.2%" },
          { label: "平均收入", value: "200元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+1.0%" },
          { label: "平均MR", value: "0.15%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.01%" },
        ],
        profile: {
          score: 1.5,
          scoreLabel: "待提升",
          interpretation: "新店广告渗透率仅0.5%，MR 0.15%极低。到餐新店投广意识和效果均不足，亟需设计专属冷启方案。",
          suggestions: [
            "设计到餐专属新商冷启礼包",
            "30天成长计划引导首次投放",
            "降低首次投放门槛，提升渗透",
          ],
          productDistribution: [
            { name: "推广通", value: 40 },
            { name: "订单通", value: 30 },
            { name: "置顶卡", value: 20 },
            { name: "智选展位", value: 10 },
          ],
          tags: ["渗透极低", "冷启需求", "培育期"],
        },
        capability: {
          score: 1.5,
          scoreLabel: "小组第八名",
          dimensions: [
            { name: "广告产品认知", score: 1, desc: "广告认知极弱，需从零培育" },
            { name: "投放执行力", score: 2, desc: "投放执行极低，无持续投放习惯" },
            { name: "数据敏感度", score: 1, desc: "数据意识薄弱，不关注效果" },
            { name: "ROI优化能力", score: 2, desc: "ROI水平极低，需强引导" },
            { name: "新客获取", score: 2, desc: "新客获取意愿弱，需激励驱动" },
          ],
        },
      },
    },
    large_norm: {
      head: {
        kpi: [
          { label: "商家数量", value: "1.9万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+1.5%" },
          { label: "广告渗透率", value: "26%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+1.0%" },
          { label: "平均收入", value: "1,200元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+2.0%" },
          { label: "平均MR", value: "0.71%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.1%" },
        ],
        profile: {
          score: 3.0,
          scoreLabel: "中等",
          interpretation: "头部老店在常规大城市广告渗透率26%，MR 0.71%偏低。商家有一定规模但广告价值感知不足。",
          suggestions: [
            "推广搜索广告组合包，提升转化",
            "加强ROI案例分享，提升商家信心",
            "定向投放激励，提升渗透率",
          ],
          productDistribution: [
            { name: "推广通", value: 45 },
            { name: "订单通", value: 25 },
            { name: "置顶卡", value: 18 },
            { name: "智选展位", value: 12 },
          ],
          tags: ["MR偏低", "渗透一般", "提升空间"],
        },
        capability: {
          score: 3.0,
          scoreLabel: "小组第六名",
          dimensions: [
            { name: "广告产品认知", score: 3, desc: "产品认知中等，高价值产品了解不足" },
            { name: "投放执行力", score: 3, desc: "投放执行力一般，频次不稳定" },
            { name: "数据敏感度", score: 3, desc: "数据关注中等，优化意识待提升" },
            { name: "ROI优化能力", score: 3, desc: "ROI水平中等，优化空间存在" },
            { name: "新客获取", score: 3, desc: "新客获取能力中等，需持续激励" },
          ],
        },
      },
      tail: {
        kpi: [
          { label: "商家数量", value: "9.9万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+0.5%" },
          { label: "广告渗透率", value: "5.1%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+0.3%" },
          { label: "平均收入", value: "380元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+1.0%" },
          { label: "平均MR", value: "0.76%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.05%" },
        ],
        profile: {
          score: 2.0,
          scoreLabel: "待提升",
          interpretation: "腰尾部老店在常规大城市是最大增量池，9.9万门店但渗透率仅5.1%，MR 0.76%极低。需定向ROI优化培训+首充礼包。",
          suggestions: [
            "定向ROI优化培训，提升商家信心",
            "首充礼包批量投放，降低尝试门槛",
            "简化广告产品，降低操作复杂度",
          ],
          productDistribution: [
            { name: "推广通", value: 30 },
            { name: "订单通", value: 15 },
            { name: "置顶卡", value: 28 },
            { name: "智选展位", value: 27 },
          ],
          tags: ["最大增量池", "渗透极低", "急需培育"],
        },
        capability: {
          score: 2.0,
          scoreLabel: "小组第七名",
          dimensions: [
            { name: "广告产品认知", score: 2, desc: "广告认知薄弱，被动接受为主" },
            { name: "投放执行力", score: 2, desc: "投放执行力极低，无持续习惯" },
            { name: "数据敏感度", score: 2, desc: "数据意识薄弱，不关注效果" },
            { name: "ROI优化能力", score: 2, desc: "ROI水平较低，缺乏优化动力" },
            { name: "新客获取", score: 2, desc: "新客获取意愿弱，需强激励驱动" },
          ],
        },
      },
      new: {
        kpi: [
          { label: "商家数量", value: "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "—" },
          { label: "广告渗透率", value: "—", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "—" },
          { label: "平均收入", value: "—", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "—" },
          { label: "平均MR", value: "—", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "—" },
        ],
        profile: { score: 0, scoreLabel: "暂无数据", interpretation: "暂无数据", suggestions: [], productDistribution: [], tags: [] },
        capability: { score: 0, scoreLabel: "暂无数据", dimensions: [] },
      },
    },
    small: {
      head: {
        kpi: [
          { label: "商家数量", value: "1.3万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+1.0%" },
          { label: "广告渗透率", value: "18%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+0.8%" },
          { label: "平均收入", value: "620元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+1.5%" },
          { label: "平均MR", value: "0.75%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.05%" },
        ],
        profile: {
          score: 2.5,
          scoreLabel: "中等",
          interpretation: "头部老店在中小城市广告渗透率18%，MR 0.75%与常规大城市接近。城市规模有限，增长空间较小。",
          suggestions: [
            "推广低成本广告产品，匹配预算",
            "建立商家互助社群，提升自运营能力",
            "聚焦本地特色推广，提升差异化",
          ],
          productDistribution: [
            { name: "推广通", value: 40 },
            { name: "订单通", value: 20 },
            { name: "置顶卡", value: 25 },
            { name: "智选展位", value: 15 },
          ],
          tags: ["规模有限", "低成本", "差异化"],
        },
        capability: {
          score: 2.5,
          scoreLabel: "小组第六名",
          dimensions: [
            { name: "广告产品认知", score: 2, desc: "产品认知一般，高价值产品尝试少" },
            { name: "投放执行力", score: 3, desc: "投放执行力一般，预算有限" },
            { name: "数据敏感度", score: 2, desc: "数据关注较弱，优化动力不足" },
            { name: "ROI优化能力", score: 3, desc: "ROI水平中等，优化空间存在" },
            { name: "新客获取", score: 3, desc: "新客获取能力一般，需持续激励" },
          ],
        },
      },
      tail: {
        kpi: [
          { label: "商家数量", value: "11.7万", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+0.3%" },
          { label: "广告渗透率", value: "7.6%", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+0.2%" },
          { label: "平均收入", value: "220元", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "+0.8%" },
          { label: "平均MR", value: "0.34%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.02%" },
        ],
        profile: {
          score: 1.8,
          scoreLabel: "待提升",
          interpretation: "腰尾部老店在中小城市合计11.7万，广告渗透率仅7.6%，MR最低0.34%。需通过自动化营销+社群运营批量触达。",
          suggestions: [
            "自动化营销+社群运营批量触达",
            "配合新商成长计划逐步培育投广习惯",
            "简化广告产品，降低操作复杂度",
          ],
          productDistribution: [
            { name: "推广通", value: 25 },
            { name: "订单通", value: 15 },
            { name: "置顶卡", value: 30 },
            { name: "智选展位", value: 30 },
          ],
          tags: ["渗透最低", "MR最低", "批量触达"],
        },
        capability: {
          score: 1.8,
          scoreLabel: "小组第八名",
          dimensions: [
            { name: "广告产品认知", score: 1, desc: "广告认知极弱，需从零培育" },
            { name: "投放执行力", score: 2, desc: "投放执行力极低，无持续习惯" },
            { name: "数据敏感度", score: 1, desc: "数据意识薄弱，不关注效果" },
            { name: "ROI优化能力", score: 2, desc: "ROI水平极低，缺乏优化动力" },
            { name: "新客获取", score: 2, desc: "新客获取意愿弱，需强激励驱动" },
          ],
        },
      },
      new: {
        kpi: [
          { label: "商家数量", value: "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "—" },
          { label: "广告渗透率", value: "—", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", trend: "—" },
          { label: "平均收入", value: "—", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50", trend: "—" },
          { label: "平均MR", value: "—", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "—" },
        ],
        profile: { score: 0, scoreLabel: "暂无数据", interpretation: "暂无数据", suggestions: [], productDistribution: [], tags: [] },
        capability: { score: 0, scoreLabel: "暂无数据", dimensions: [] },
      },
    },
  },
};

/* ================================================================== */
/* 辅助组件                                                             */
/* ================================================================== */
const KpiCard = ({ label, value, icon: Icon, color, bg, trend }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        </div>
        {trend && trend !== "—" && (
          <div className={`text-xs font-medium flex items-center gap-0.5 ${trend.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>
            {trend.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const ExpandableDimension = ({ name, score, desc }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className={`text-sm font-bold ${score >= 4 ? "text-emerald-600" : score >= 3 ? "text-[#4080FF]" : "text-amber-500"}`}>{score}分</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-gray-600 bg-gray-50/50">
          {desc}
        </div>
      )}
    </div>
  );
};

const SimpleDonut = ({ data }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RePieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-xs text-gray-600">{entry.name}</span>
            <span className="text-xs font-medium text-gray-900 ml-auto">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================== */
/* 主页面                                                              */
/* ================================================================== */
export default function MerchantDetail() {
  const { bizLine } = useBizLine();

  const citySizeOptions = bizLine === "waimai"
    ? [
        { value: "large", label: "大体量城市" },
        { value: "small", label: "中小体量城市" },
      ]
    : [
        { value: "large_tour", label: "大体量旅游城市" },
        { value: "large_norm", label: "大体量常规城市" },
        { value: "small", label: "中小体量城市" },
      ];

  const merchantTypeOptions = bizLine === "waimai"
    ? [
        { value: "head", label: "头部老店" },
        { value: "waist", label: "腰部老店" },
        { value: "tail", label: "尾部老店" },
        { value: "new", label: "新店" },
      ]
    : [
        { value: "head", label: "头部老店" },
        { value: "tail", label: "腰尾部老店" },
        { value: "new", label: "新店" },
      ];

  const [citySize, setCitySize] = useState(citySizeOptions[0].value);
  const [merchantType, setMerchantType] = useState(merchantTypeOptions[0].value);

  const data = SEGMENT_DATA[bizLine]?.[citySize]?.[merchantType] || null;

  return (
    <div className="space-y-5">
      {/* 顶部筛选 */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 shrink-0">城市体量</span>
              <Select value={citySize} onValueChange={setCitySize}>
                <SelectTrigger className="w-44 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {citySizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 shrink-0">商家类型</span>
              <Select value={merchantType} onValueChange={setMerchantType}>
                <SelectTrigger className="w-44 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {merchantTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 无数据提示 */}
      {!data || data.profile.score === 0 ? (
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-8 text-center text-gray-500">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>暂无该组合的详细数据</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI 卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.kpi.map((item, idx) => (
              <KpiCard key={idx} {...item} />
            ))}
          </div>

          {/* 左右分析区 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 左侧：商家画像分析 */}
            <Card className="border-none shadow-sm bg-white">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#4080FF]" />
                  <span className="text-sm font-semibold text-gray-900">商家画像分析</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">综合评分</span>
                  <span className="text-sm font-bold text-[#4080FF]">{data.profile.score}分</span>
                  <span className="text-xs text-gray-400">{data.profile.scoreLabel}</span>
                </div>
              </div>
              <CardContent className="p-5 space-y-5">
                {/* 综合评分解读 */}
                <div className="bg-blue-50/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">综合评分解读</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{data.profile.interpretation}</p>
                </div>

                {/* 改善建议 */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">改善建议</p>
                  <div className="space-y-2">
                    {data.profile.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-[#4080FF]/10 text-[#4080FF] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 产品分布 */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3">产品分布</p>
                  <SimpleDonut data={data.profile.productDistribution} />
                </div>

                {/* 标签 */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">商家标签</p>
                  <div className="flex flex-wrap gap-2">
                    {data.profile.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#4080FF] border border-blue-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 右侧：商家经营能力评分 */}
            <Card className="border-none shadow-sm bg-white">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-900">商家经营能力评分</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">综合得分</span>
                  <span className="text-sm font-bold text-emerald-600">{data.capability.score}分</span>
                  <span className="text-xs text-gray-400">{data.capability.scoreLabel}</span>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                {/* 综合评分解读 */}
                <div className="bg-emerald-50/50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5">综合评分解读</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    整体经营能力{data.capability.score >= 4 ? "优秀" : data.capability.score >= 3 ? "良好" : "处于中等水平"}，
                    各项能力指标分布{data.capability.score >= 4 ? "均衡" : "不均"}。
                    {data.capability.dimensions.filter((d) => d.score >= 4).length > 0 &&
                      `其中${data.capability.dimensions.filter((d) => d.score >= 4).map((d) => d.name).join("、")}表现突出。`}
                    {data.capability.dimensions.filter((d) => d.score < 3).length > 0 &&
                      `而${data.capability.dimensions.filter((d) => d.score < 3).map((d) => d.name).join("、")}需要重点提升。`}
                  </p>
                </div>

                {/* 改善建议 */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">改善建议</p>
                  <div className="space-y-2">
                    {data.capability.dimensions
                      .filter((d) => d.score < 4)
                      .slice(0, 3)
                      .map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <span>加强{d.name}建设，{d.score < 3 ? "当前水平薄弱，需重点投入" : "仍有提升空间"}。</span>
                        </div>
                      ))}
                    {data.capability.dimensions.filter((d) => d.score < 4).length === 0 && (
                      <p className="text-sm text-gray-600">各项能力表现均衡，建议保持优势并持续精进。</p>
                    )}
                  </div>
                </div>

                {/* 维度展开 */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">能力维度</p>
                  <div className="space-y-2">
                    {data.capability.dimensions.map((d) => (
                      <ExpandableDimension key={d.name} {...d} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
