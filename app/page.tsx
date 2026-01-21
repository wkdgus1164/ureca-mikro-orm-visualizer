import Image from "next/image"

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="MikroORM Visualizer"
              width={40}
              height={40}
              priority
            />
            <h1 className="text-2xl font-bold">MikroORM Visualizer</h1>
          </div>
          <AnimatedThemeToggler className="rounded-full p-2 hover:bg-accent transition-colors" />
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              MikroORM 엔티티 관계를 시각화하는 도구입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              프로젝트 초기 설정이 완료되었습니다. 이제 MikroORM 연동을 시작할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
