"use client"

/**
 * 노드 목록 아이템 컴포넌트
 *
 * 좌측 패널에서 노드를 표시하는 선택 가능한 목록 아이템
 */

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NodeListItemProps {
  /** 노드 이름 */
  name: string
  /** 선택 상태 */
  isSelected: boolean
  /** 선택 핸들러 */
  onSelect: () => void
  /** 삭제 핸들러 */
  onDelete: () => void
}

/**
 * 선택 가능한 노드 목록 아이템
 *
 * 호버 시 삭제 버튼이 나타나며, 클릭으로 선택 가능
 *
 * @example
 * ```tsx
 * <NodeListItem
 *   name="User"
 *   isSelected={selectedId === "user-1"}
 *   onSelect={() => handleSelect("user-1")}
 *   onDelete={() => handleDelete("user-1")}
 * />
 * ```
 */
export function NodeListItem({
  name,
  isSelected,
  onSelect,
  onDelete,
}: NodeListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <span className="text-sm truncate">{name || "Untitled"}</span>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete node"
        className={cn(
          "h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
