import React, { createContext, useContext, useState, useCallback } from "react";

const BizLineContext = createContext(null);

const BIZ_LINE_OPTIONS = [
  { value: "waimai", label: "外卖" },
  { value: "daocan", label: "到餐" },
];

export const BizLineProvider = ({ children }) => {
  const [bizLine, setBizLine] = useState("waimai");

  const changeBizLine = useCallback((next) => {
    setBizLine(next);
  }, []);

  const value = {
    bizLine,
    changeBizLine,
    bizLineOptions: BIZ_LINE_OPTIONS,
  };

  return (
    <BizLineContext.Provider value={value}>{children}</BizLineContext.Provider>
  );
};

export const useBizLine = () => {
  const ctx = useContext(BizLineContext);
  if (!ctx) {
    throw new Error("useBizLine 必须在 BizLineProvider 内部使用");
  }
  return ctx;
};
