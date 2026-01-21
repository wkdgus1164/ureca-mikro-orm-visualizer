"use client"

/**
 * 카테고리 섹션 컴포넌트
 *
 * 접을 수 있는 그룹 섹션, 노드 목록 패널에서 사용
 */

import { useState } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

export interface CategorySectionProps {
  /** 섹션 제목 */
  title: string
  /** 제목 옆 아이콘 */
  icon: React.ReactNode
  /** 아이템 개수 */
  count: number
  /** 기본 열림 상태 */
  defaultOpen?: boolean
  /** 섹션 내용 */
  children: React.ReactNode
  /** Add 버튼 클릭 핸들러 */
  onAdd?: () => void
  /** Add 버튼 레이블 */
  addLabel?: string
}

/**
 * 접을 수 있는 카테고리 섹션
 *
 * 헤더에 아이콘, 제목, 개수 배지를 표시하고
 * 펼치면 자식 요소와 선택적으로 Add 버튼을 렌더링
 *
 * @example
 * ```tsx
 * <CategorySection
 *   title="Entities"
 *   icon={<Box className="h-4 w-4 text-blue-500" />}
 *   count={3}
 *   onAdd={() => handleAddEntity()}
 * >
 *   {entities.map((e) => <NodeListItem key={e.id} ... />)}
 * </CategorySection>
 * ```
 */
export function CategorySection({
  title,
  icon,
  count,
  defaultOpen = true,
  children,
  onAdd,
  addLabel,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted/50 rounded-md transition-colors">
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {icon}
        <span className="text-sm font-medium flex-1 text-left">{title}</span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pr-2 space-y-0.5">
        {children}
        {/* Add 버튼 */}
        {onAdd && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className={cn(
              "flex items-center justify-start gap-2 w-full h-auto px-3 py-1.5",
              "text-xs text-muted-foreground font-normal",
              "hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel ?? `Add new ${title.toLowerCase()}`}
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
