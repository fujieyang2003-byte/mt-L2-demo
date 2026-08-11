import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/dashboard/PageHeader";
import RequireAdmin from "@/components/dashboard/RequireAdmin";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "待审批", className: "bg-amber-50 text-amber-600" },
  approved: { label: "已通过", className: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "已拒绝", className: "bg-red-50 text-red-500" },
};

const ROLE_OPTIONS = [
  { value: "pending", label: "待审批" },
  { value: "platform_admin", label: "平台管理员" },
  { value: "biz_manager", label: "广告业务经理" },
  { value: "partner", label: "合作商" },
  { value: "bd", label: "BD/运营" },
];

const ROLE_LABEL_MAP = ROLE_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const formatDateTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, className: "bg-gray-100 text-gray-500" };
  return <Badge className={`border-none font-normal ${cfg.className}`}>{cfg.label}</Badge>;
};

/* ============ Demo Mock 数据 ============ */
const MOCK_REQUESTS = [
  { id: 1, user_mis: "liwei01", user_name: "李伟", permission_key: "role_request", request_reason: "需要查看经营诊断数据", status: "pending", created_at: "2024-12-20T10:30:00Z" },
  { id: 2, user_mis: "zhangfei", user_name: "张飞", permission_key: "data_export", request_reason: "需要导出月度报表", status: "approved", created_at: "2024-12-18T08:15:00Z", reviewed_by: "admin_demo" },
  { id: 3, user_mis: "wangwu03", user_name: "王武", permission_key: "role_request", request_reason: "转岗至运营组", status: "rejected", created_at: "2024-12-15T14:00:00Z", reviewed_by: "admin_demo" },
];

const MOCK_USERS = [
  { mis_id: "admin_demo", name: "张管理", role: "platform_admin", region: null, is_active: true, created_at: "2024-01-01T00:00:00Z" },
  { mis_id: "biz_demo", name: "李经理", role: "biz_manager", region: "福建区域", is_active: true, created_at: "2024-03-15T00:00:00Z" },
  { mis_id: "partner_demo", name: "王合作", role: "partner", region: "福建区域", is_active: true, created_at: "2024-06-01T00:00:00Z" },
  { mis_id: "bd_demo", name: "赵运营", role: "bd", region: "福建区域", is_active: true, created_at: "2024-06-01T00:00:00Z" },
  { mis_id: "liwei01", name: "李伟", role: "pending", region: null, is_active: true, created_at: "2024-12-20T10:00:00Z" },
];

/** Tab 1：权限申请审批（Demo mock） */
const ApprovalTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequests([...MOCK_REQUESTS]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleReview = (row, decision) => {
    if (processingId) return;
    setProcessingId(row.id);
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: decision, reviewed_by: "admin_demo" } : r))
      );
      toast.success(decision === "approved" ? "已通过该权限申请" : "已拒绝该权限申请");
      setProcessingId(null);
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        加载中...
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>申请人 MIS</TableHead>
              <TableHead>申请人姓名</TableHead>
              <TableHead>申请功能</TableHead>
              <TableHead>申请原因</TableHead>
              <TableHead>申请时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                  暂无权限申请记录
                </TableCell>
              </TableRow>
            ) : (
              requests.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-gray-800">{row.user_mis}</TableCell>
                  <TableCell className="text-gray-600">{row.user_name || "-"}</TableCell>
                  <TableCell className="text-gray-600">{row.permission_key}</TableCell>
                  <TableCell className="text-gray-500 max-w-[240px] truncate" title={row.request_reason}>
                    {row.request_reason || "-"}
                  </TableCell>
                  <TableCell className="text-gray-500">{formatDateTime(row.created_at)}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {row.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" disabled={processingId === row.id} onClick={() => handleReview(row, "approved")}>
                          {processingId === row.id && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                          通过
                        </Button>
                        <Button size="sm" variant="outline" disabled={processingId === row.id} onClick={() => handleReview(row, "rejected")}>
                          拒绝
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">已处理</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

/** Tab 2：用户管理（Demo mock） */
const UserManagementTab = () => {
  const { currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingMis, setUpdatingMis] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers([...MOCK_USERS]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleChange = (row, nextRole) => {
    if (nextRole === row.role || updatingMis === row.mis_id) return;
    setUpdatingMis(row.mis_id);
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((u) => (u.mis_id === row.mis_id ? { ...u, role: nextRole } : u))
      );
      toast.success(`已将 ${row.name || row.mis_id} 的角色更新为「${ROLE_LABEL_MAP[nextRole] || nextRole}」`);
      setUpdatingMis(null);
    }, 300);
  };

  const handleDeleteUser = (row) => {
    const confirmed = window.confirm(`确定要移除用户 ${row.name || row.mis_id} 吗？此操作不可恢复。`);
    if (!confirmed) return;
    setUsers((prev) => prev.filter((u) => u.mis_id !== row.mis_id));
    toast.success(`已移除用户 ${row.name || row.mis_id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        加载中...
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MIS 号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>区域</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                  暂无用户数据
                </TableCell>
              </TableRow>
            ) : (
              users.map((row) => (
                <TableRow key={row.mis_id}>
                  <TableCell className="font-medium text-gray-800">{row.mis_id}</TableCell>
                  <TableCell className="text-gray-600">{row.name || "-"}</TableCell>
                  <TableCell>
                    <Select value={row.role} onValueChange={(value) => handleRoleChange(row, value)} disabled={updatingMis === row.mis_id}>
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-gray-500">{row.region || "-"}</TableCell>
                  <TableCell>
                    <Badge className={`border-none font-normal ${row.is_active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-600"}`}>
                      {row.is_active === false ? "已禁用" : "正常"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {updatingMis === row.mis_id && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                      {row.mis_id !== currentUser?.mis_id && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteUser(row)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          移除
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const PermissionManagement = () => {
  const [tab, setTab] = useState("approval");

  return (
    <RequireAdmin>
      <div>
        <PageHeader title="权限管理" description="审批功能权限申请，管理系统用户角色" />

        <div className="rounded-lg bg-blue-50/60 border border-blue-100 px-4 py-3 flex items-center gap-2.5 mb-5 text-sm text-[#4080FF]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          当前页面仅管理员角色可见，请谨慎操作用户权限配置
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="approval">权限申请审批</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
          </TabsList>

          <TabsContent value="approval" className="mt-4">
            <ApprovalTab />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <UserManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </RequireAdmin>
  );
};

export default PermissionManagement;
