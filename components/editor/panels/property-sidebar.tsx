"use client"

/**
 * 우측 Property 사이드바 컨테이너
 *
 * Sheet 오버레이 대신 레이아웃 플로우에 포함되는 사이드바
 * 피그마 스타일의 3-패널 레이아웃에서 우측 패널 역할
 */

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface PropertySidebarProps {
  /** 사이드바 열림 여부 */
  isOpen: boolean
  /** 사이드바 닫기 핸들러 */
  onClose: () => void
  /** 사이드바 헤더 타이틀 */
  title: string
  /** 사이드바 헤더 설명 */
  description?: string
  /** 사이드바 컨텐츠 */
  children: ReactNode
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 우측 Property 사이드바 컴포넌트
 *
 * 애니메이션과 함께 열림/닫힘이 전환되며,
 * 오버레이 없이 레이아웃에 포함됨
 *
 * @example
 * ```tsx
 * <PropertySidebar
 *   isOpen={uiState.isRightPanelOpen}
 *   onClose={closeRightPanel}
 *   title="Edit Entity"
 *   description="Modify entity properties"
 * >
 *   <EntityEditContent />
 * </PropertySidebar>
 * ```
 */
export function PropertySidebar({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: PropertySidebarProps) {
  return (
    <aside
      className={cn(
        "flex-shrink-0 border-l bg-background transition-all duration-200 ease-in-out overflow-hidden",
        isOpen ? "w-[400px]" : "w-0",
        className
      )}
    >
      {isOpen && (
        <div className="h-full flex flex-col w-[400px]">
          {/* 헤더 */}
          <div className="flex items-start justify-between p-4 border-b">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </Button>
          </div>

          {/* 컨텐츠 영역 */}
          <ScrollArea className="flex-1">
            <div className="p-4">{children}</div>
          </ScrollArea>
        </div>
      )}
    </aside>
  )
}
