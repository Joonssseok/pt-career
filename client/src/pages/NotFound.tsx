import { Link } from "wouter";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-7xl font-bold text-accent mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다
        </p>
        <Link href="/">
          <Button className="btn-press">
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
