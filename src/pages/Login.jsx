import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Megaphone, Shield, Loader2 } from "lucide-react";

const Login = () => {
  const { login } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await login();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ backgroundColor: "#f0f2f5" }}
    >
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg px-8 py-10">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#4080FF" }}
          >
            <Megaphone className="text-white" size={26} />
          </div>
          <p className="text-lg font-semibold text-gray-900">广告经营管理系统</p>
          <p className="text-xs text-gray-400 mt-1">Ads Operation Console</p>
        </div>

        <Button
          className="w-full h-11 text-base"
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              正在认证...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              SSO 登录
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center mt-3">
          使用美团 SSO 统一身份认证登录
        </p>

        <p className="text-[11px] text-gray-300 text-center mt-10">
          © 2024 增值运营组
        </p>
      </div>
    </div>
  );
};

export default Login;
