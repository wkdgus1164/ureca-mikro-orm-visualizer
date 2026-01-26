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
  /** 사이드바 너비 (픽셀) */
  width?: number
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * Right-aligned property sidebar panel that slides open within the layout.
 *
 * Renders a fixed-width (400px) panel when open containing a header with a title,
 * an optional description, a close button that calls `onClose`, and a scrollable
 * content area. When `isOpen` is false the panel is not rendered and occupies no width.
 *
 * @param isOpen - Whether the sidebar is open
 * @param onClose - Callback invoked when the close action is triggered
 * @param title - Header title text
 * @param description - Optional header description text
 * @param children - Content to render inside the sidebar body
 * @param className - Optional additional CSS classes applied to the aside element
 * @returns The sidebar element to include in the layout
 */
export function PropertySidebar({
  isOpen,
  onClose,
  title,
  description,
  children,
  width = 400,
  className,
}: PropertySidebarProps) {
  return (
    <aside
      className={cn(
        "flex-shrink-0 border-l bg-background transition-[width] duration-200 ease-in-out overflow-hidden pt-[50px]",
        className
      )}
      style={{ width: isOpen ? width : 0 }}
    >
      {isOpen && (
        <div className="h-full flex flex-col overflow-hidden" style={{ width }}>
          {/* 헤더 */}
          <div className="flex items-start justify-between p-4 border-b flex-shrink-0">
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
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4">{children}</div>
          </ScrollArea>
        </div>
      )}
    </aside>
  )
}