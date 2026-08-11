import React from "react";

/**
 * 页面通用标题区域，展示标题与描述文字。
 */
const PageHeader = ({ title, description, extra }) => {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  );
};

export default PageHeader;
