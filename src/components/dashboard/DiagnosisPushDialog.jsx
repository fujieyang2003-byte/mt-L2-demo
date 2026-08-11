import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * 基于当前行数据生成一段 AI 模拟的经营诊断文本。
 */
const buildDiagnosisText = (targetName, rowData = {}) => {
  const name = targetName || rowData.name || rowData.city || rowData.region || "该对象";

  const revenue = rowData.revenue || rowData.consumption || "暂无数据";
  const rfRate = rowData.rfRate || rowData.rf || "暂无数据";
  const mr = rowData.mr || rowData.mrRate || "暂无数据";
  const yoy = rowData.yoy || "暂无数据";
  const mom = rowData.mom || "暂无数据";
  const level = rowData.level || rowData.score || "暂无数据";

  const currentSituation = `广告收入 ${revenue}，收入完成率(RF) ${rfRate}，MR ${mr}，YoY ${yoy}，MoM ${mom}，健康评级 ${level}。`;

  const isWarning =
    typeof mom === "string" && mom.includes("-") ||
    (typeof level === "string" && level.includes("预警"));

  const suggestion = isWarning
    ? "近期经营数据出现下滑趋势，建议尽快排查核心原因（如商户流失、活动到期、竞对影响等），并制定针对性的挽回计划。"
    : "整体经营表现平稳向好，建议保持当前投入节奏，重点关注头部商户的持续转化与复购情况。";

  const strategy = isWarning
    ? "1）优先介入高风险门店/商户，安排线下拜访；2）推送专项激励政策，加速资源到位；3）一周内跟踪整改效果并复盘。"
    : "1）总结现有增长打法，形成可复制经验；2）适度加大优质资源倾斜，扩大领先优势；3）持续监控关键指标，防止增速回落。";

  return `【经营诊断】${name}\n当前经营情况：${currentSituation}\n诊断建议：${suggestion}\n推荐策略：${strategy}`;
};

/**
 * 诊断消息下发弹窗（Demo 模式：模拟发送，不调用真实 API）。
 */
const DiagnosisPushDialog = ({
  open,
  onOpenChange,
  targetName,
  targetMis = "demo_user",
  rowData = {},
}) => {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(buildDiagnosisText(targetName, rowData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleRegenerate = () => {
    setContent(buildDiagnosisText(targetName, rowData));
  };

  const handleConfirmSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      // Demo 模式：模拟 500ms 网络延迟后提示成功
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`诊断消息已推送至 ${targetName}（${targetMis}）`);
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>诊断消息下发</DialogTitle>
          <DialogDescription>
            推送至：{targetName}（{targetMis}）
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="resize-none"
        />

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleRegenerate}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            重新生成
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
              取消
            </Button>
            <Button
              className="bg-[#4080FF] hover:bg-[#3070f0]"
              onClick={handleConfirmSend}
              disabled={sending}
            >
              {sending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              确认发送
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiagnosisPushDialog;
