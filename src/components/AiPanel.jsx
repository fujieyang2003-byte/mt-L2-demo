import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ChevronDown } from "lucide-react";

/* ================================================================== */
/* 打字机文本组件：像 AI 生成文字一样逐字打出，带闪烁光标               */
/* ================================================================== */
const TypewriterText = ({ text, speed = 22, start = true, onDone }) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const textLen = text ? text.length : 0;

  useEffect(() => {
    if (!start) {
      setIdx(0);
      setDone(false);
      return;
    }
    if (idx >= textLen) {
      if (!done) {
        setDone(true);
        onDone && onDone();
      }
      return;
    }
    const t = setTimeout(() => setIdx((i) => i + 1), speed);
    return () => clearTimeout(t);
  }, [start, idx, textLen, done, speed, onDone]);

  return (
    <span>
      {text ? text.slice(0, idx) : ""}
      {start && !done && <span className="nk-cursor" />}
    </span>
  );
};

/* ================================================================== */
/* 苹果式高度过渡容器                                                  */
/* ================================================================== */
const AppleCollapse = ({ open, children }) => {
  const ref = useRef(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      const target = el.scrollHeight;
      setH(target);
      const t = setTimeout(() => setH(0), 520);
      return () => clearTimeout(t);
    }
    setH(el.scrollHeight);
    const raf = requestAnimationFrame(() => setH(0));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  return (
    <div
      ref={ref}
      className="nk-collapse"
      style={h ? { height: h } : undefined}
      data-open={open ? "1" : undefined}
    >
      {children}
    </div>
  );
};

/* ================================================================== */
/* 单条分析内容（兼容 { title, text } 与纯字符串）                      */
/* ================================================================== */
const AiItem = ({ item, index, typingStart = false, showStagger = true }) => {
  const text = item && typeof item === "object" ? (item.text || "") : item;
  const title = item && typeof item === "object" ? item.title : null;
  const delay = index * 45;

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg bg-white/85 backdrop-blur-sm ${showStagger ? "nk-stagger" : ""}`}
      style={{
        border: "1px solid #f3e8ff",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span
        className="w-5 h-5 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        {title && (
          <p className="font-semibold text-gray-800 mb-0.5 text-sm">{title}</p>
        )}
        <p className="leading-relaxed text-sm text-gray-600">
          <TypewriterText text={text} start={typingStart} />
        </p>
      </div>
    </div>
  );
};

/* ================================================================== */
/* 主组件                                                              */
/* ================================================================== */
export default function AiPanel({ items = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [firstTyped, setFirstTyped] = useState(false);
  const hasMore = items.length > 1;

  return (
    <div className="mb-5">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #faf5ff 0%, #f0e7ff 40%, #e8f0ff 100%)",
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
          {hasMore && (
            <span className="text-xs text-gray-400 font-normal ml-1">
              | {expanded ? "已展示全部" + items.length + "条" : "共" + items.length + "条分析"}
            </span>
          )}
        </div>

        {/* 第一条：始终显示，首次挂载时打字机效果 */}
        <div className="mx-5 mt-2 border-t border-purple-100/60" />
        <div className="px-5 pt-3 pb-2 nk-stagger" style={{ animationDelay: "60ms" }}>
          {items.slice(0, 1).map((item, i) => (
            <AiItem
              key={i}
              item={item}
              index={i}
              typingStart={true}
              showStagger={false}
            />
          ))}
        </div>

        {/* 其余条目：苹果式展开/收起 + 打字机 */}
        {hasMore && (
          <>
            <AppleCollapse open={expanded}>
              <div className="px-5 pb-1 space-y-2.5 pt-1">
                {items.slice(1).map((item, i) => (
                  <AiItem
                    key={i}
                    item={item}
                    index={i + 1}
                    typingStart={expanded}
                    showStagger={false}
                  />
                ))}
              </div>
            </AppleCollapse>

            {/* 展开/收起按钮 —— 精美胶囊样式 */}
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
      </div>
    </div>
  );
}

export { AppleCollapse, TypewriterText };

/* ================================================================== */
/* AiResultList：结果列表（默认第一条 + 苹果式展开其余）                 */
/* 适用于带触发按钮的面板                                               */
/* ================================================================== */
export function AiResultList({ items = [], emptyText = "暂无分析数据" }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-gray-400 nk-stagger">
        {emptyText}
      </div>
    );
  }
  const hasMore = items.length > 1;
  return (
    <>
      <div className="px-5 py-3 space-y-2.5 nk-stagger" style={{ animationDelay: "40ms" }}>
        {items.slice(0, 1).map((item, i) => (
          <AiItem key={i} item={item} index={i} typingStart={true} showStagger={false} />
        ))}
      </div>
      {hasMore && (
        <>
          <AppleCollapse open={expanded}>
            <div className="px-5 pb-1 space-y-2.5 pt-1">
              {items.slice(1).map((item, i) => (
                <AiItem key={i} item={item} index={i + 1} typingStart={expanded} showStagger={false} />
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
  );
}
