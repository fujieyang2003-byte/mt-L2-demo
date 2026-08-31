import React, { useState, useEffect } from "react";
import { Sparkles, ChevronRight, ChevronDown } from "lucide-react";
import { AppleCollapse, TypewriterText } from "@/components/AiPanel";

/**
 * 通用 AI 智能分析面板
 * - 顶部展示，支持板块选择
 * - 参考设计稿：紫色主题、pill 选择器、"开始分析" 按钮
 * - 打字机效果：文字像 AI 生成一样逐字打出
 *
 * Props:
 *   modules: Array<{ key, label, items: Array<{ title?, text }> }>
 *   subtitle?: string  自定义副标题
 */
const AiAnalysisPanel = ({ modules = [], subtitle = "选一个对象，让 AI 帮你解读数据" }) => {
  const [selectedKey, setSelectedKey] = useState(modules[0]?.key || "");
  const [analyzed, setAnalyzed] = useState(modules[0]?.key || "");
  const [expanded, setExpanded] = useState(false);

  const currentModule = modules.find((m) => m.key === analyzed);
  const items = currentModule?.items || [];
  const hasMore = items.length > 1;

  // 切换分析对象时重置为"只看第一条"
  useEffect(() => {
    setExpanded(false);
  }, [analyzed]);

  return (
    <div className="mb-5">
      {/* 面板容器 */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #faf5ff 0%, #f0e7ff 40%, #e8f0ff 100%)",
          border: "1px solid #e9d5ff",
        }}
      >
        {/* 标题行 */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-gray-900">AI 智能分析</h2>
          <span className="text-xs text-gray-400 font-normal ml-1">| {subtitle}</span>
        </div>

        {/* 选择器行 */}
        <div className="flex items-center gap-2 px-5 py-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium shrink-0">分析对象</span>
          {modules.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedKey(m.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedKey === m.key
                  ? "text-white shadow-sm"
                  : "bg-white/70 text-gray-600 hover:bg-white border border-purple-100"
              }`}
              style={
                selectedKey === m.key
                  ? { background: "linear-gradient(135deg, #7c3aed, #6366f1)" }
                  : {}
              }
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={() => setAnalyzed(selectedKey)}
            className="ml-auto flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
          >
            开始分析
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 分割线 */}
        <div className="mx-5 border-t border-purple-100/60" />

        {/* 分析结果：默认第一条打字机，点击展开其余 */}
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-sm text-gray-400 nk-stagger">
            请选择分析对象并点击"开始分析"
          </div>
        ) : (
          <>
            <div className="px-5 py-3 space-y-2.5 nk-stagger" key={analyzed} style={{ animationDelay: "40ms" }}>
              {items.slice(0, 1).map((item, idx) => (
                <AiRow key={idx} item={item} idx={idx} typingStart={true} />
              ))}
            </div>
            {hasMore && (
              <>
                <AppleCollapse open={expanded}>
                  <div className="px-5 pb-1 space-y-2.5 pt-1">
                    {items.slice(1).map((item, idx) => (
                      <AiRow key={idx} item={item} idx={idx + 1} typingStart={expanded} />
                    ))}
                  </div>
                </AppleCollapse>
                <div className="px-5 pb-3 pt-1">
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="nk-expand-btn"
                  >
                    <span className="nk-expand-line" />
                    <span className="nk-expand-text">
                      {expanded ? "点击收起" : `展开其余 ${items.length - 1} 条分析`}
                    </span>
                    <ChevronDown
                      className="nk-expand-chevron"
                      style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                    <span className="nk-expand-line" />
                  </button>
                </div>
              </>
            )}
            {!hasMore && <div className="pb-3" />}
          </>
        )}
      </div>
    </div>
  );
};

/* 单条结果行（带打字机效果） */
const AiRow = ({ item, idx, typingStart = false }) => {
  const text = item && typeof item === "object" ? (item.text || "") : item;
  const title = item && typeof item === "object" ? item.title : null;
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg bg-white/80 backdrop-blur-sm"
      style={{
        border: "1px solid #f3e8ff",
        transitionDelay: `${idx * 45}ms`,
      }}
    >
      <span
        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
      >
        {idx + 1}
      </span>
      <div className="min-w-0 flex-1">
        {title && (
          <p className="font-semibold text-gray-800 text-sm mb-0.5">{title}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">
          <TypewriterText text={text} start={typingStart} />
        </p>
      </div>
    </div>
  );
};

export default AiAnalysisPanel;
