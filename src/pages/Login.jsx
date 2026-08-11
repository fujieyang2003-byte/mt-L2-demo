import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Megaphone, Loader2, Shield, Briefcase, Users, UserCheck } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "platform_admin", label: "平台管理员", desc: "全局视角，管理所有区域和总商数据", icon: Shield, color: "#4080FF" },
  { value: "biz_manager", label: "广告业务经理", desc: "区域视角，跟踪城市级经营数据", icon: Briefcase, color: "#10b981" },
  { value: "partner", label: "合作商", desc: "城市视角，管理下属BD经营表现", icon: Users, color: "#f59e0b" },
  { value: "bd", label: "BD/运营", desc: "门店视角，门店诊断与AI推荐话术", icon: UserCheck, color: "#8b5cf6" },
];

const Login = () => {
  const { login } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("platform_admin");

  const handleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(selectedRole);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ backgroundColor: "#f0f2f5" }}
    >
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-lg px-8 py-10">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#4080FF" }}
          >
            <Megaphone className="text-white" size={26} />
          </div>
          <p className="text-lg font-semibold text-gray-900">广告经营管理系统</p>
          <p className="text-xs text-gray-400 mt-1">Ads Operation Console · Demo</p>
        </div>

        <p className="text-sm text-gray-500 text-center mb-4">选择一个角色体验系统</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedRole === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedRole(opt.value)}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-[#4080FF] bg-blue-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: isSelected ? opt.color : "#f3f4f6" }}
                >
                  <Icon
                    className={isSelected ? "text-white" : "text-gray-400"}
                    size={18}
                  />
                </div>
                <span className={`text-sm font-medium ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                  {opt.label}
                </span>
                <span className="text-[11px] text-gray-400 leading-tight">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        <Button
          className="w-full h-11 text-base"
          style={{ backgroundColor: "#4080FF" }}
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              正在进入...
            </>
          ) : (
            "进入系统"
          )}
        </Button>

        <p className="text-[11px] text-gray-300 text-center mt-8">
          © 2024 增值运营组 · Demo 演示版本
        </p>
      </div>
    </div>
  );
};

export default Login;
