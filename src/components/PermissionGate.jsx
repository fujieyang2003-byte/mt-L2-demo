import React, { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "biz_manager", label: "广告业务经理" },
  { value: "partner", label: "合作商" },
  { value: "bd", label: "BD/运营" },
];

/**
 * 权限门禁组件：包裹需要权限控制的功能区域。
 * 有权限时正常渲染 children；无权限时在 children 上覆盖半透明遮罩，
 * 并提供"申请权限"入口，弹窗中选择要申请的系统角色并填写原因后写入 permission_requests 表。
 *
 * @param {string} permissionKey 权限标识，如 'target_mgmt'
 * @param {string} featureName 功能名称，用于遮罩提示展示
 * @param {React.ReactNode} children 被门禁保护的内容
 */
const PermissionGate = ({ permissionKey, featureName, children }) => {
  const { currentUser, hasPermission, requestPermission } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [role, setRole] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const granted = hasPermission(permissionKey);

  const resetForm = () => {
    setRole("");
    setReason("");
  };

  const handleSubmit = async () => {
    if (submitting || !role) return;
    setSubmitting(true);
    try {
      const result = await requestPermission(role, reason);
      if (result?.success) {
        toast.success("权限申请已提交，等待管理员审批");
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(result?.error || "权限申请提交失败，请稍后重试");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (granted) {
    return children;
  }

  const department = currentUser?.team || currentUser?.region || "未设置";

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[2px] opacity-60">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          <Lock className="w-6 h-6 text-[#4080FF]" />
        </div>
        <p className="text-sm text-gray-600">
          {featureName ? `「${featureName}」` : "该功能"}需要申请权限
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          申请权限
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!submitting) {
            setDialogOpen(open);
            if (!open) resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申请系统角色权限</DialogTitle>
            <DialogDescription>
              提交申请后，需等待管理员审批通过
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>MIS 账号</Label>
                <Input value={currentUser?.mis_id || ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label>所属部门</Label>
                <Input value={department} disabled />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="permission-role">申请角色</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="permission-role">
                  <SelectValue placeholder="请选择要申请的角色" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="permission-reason">申请原因</Label>
              <Textarea
                id="permission-reason"
                placeholder="请说明申请该角色的原因，如负责区域、业务场景等"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !role}>
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionGate;
