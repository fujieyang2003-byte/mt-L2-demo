import { Card, CardContent } from "@/components/ui/card";

export default function PlaceholderPage({ title }) {
  return (
    <div className="space-y-5">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-12 flex flex-col items-center justify-center text-gray-400 min-h-[60vh]">
          <p className="text-sm">功能开发中，敬请期待</p>
          {title && <p className="text-xs mt-2 text-gray-300">{title}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
