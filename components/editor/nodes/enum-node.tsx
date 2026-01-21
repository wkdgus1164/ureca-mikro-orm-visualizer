"use client"

/**
 * Enum 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 TypeScript Enum을 시각적으로 표현
 * amber 색상 테마로 Entity/Embeddable과 시각적으로 구분
 */

import { memo, useState, useCallback } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import type { EnumData } from "@/types/entity"
import { List, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditorContext } from "@/components/providers/editor-provider"

/**
 * Enum 노드 타입 (ReactFlow Node 확장)
 */
type EnumNodeType = Node<EnumData, "enum">

/**
 * Enum 노드 Props 타입
 */
type EnumNodeProps = NodeProps<EnumNodeType>

/**
 * 핸들 스타일 (Enum 전용 - amber 계열)
 */
const handleClassName =
  "!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-background hover:!bg-amber-400 transition-colors"

/**
 * Enum 노드 컴포넌트
 *
 * Entity와 시각적으로 구분되는 특징:
 * - amber 색상 테마 (Entity는 기본 primary, Embeddable은 violet)
 * - List 아이콘
 * - Key = Value 형태로 Enum 값 표시
 *
 * @example
 * ```tsx
 * const nodeTypes = { enum: EnumNode }
 * <ReactFlow nodeTypes={nodeTypes} />
 * ```
 */
function EnumNodeComponent({ id, data, selected }: EnumNodeProps) {
  const { name, values } = data
  const { deleteEnum } = useEditorContext()
  const [isHovered, setIsHovered] = useState(false)

  /**
   * 삭제 버튼 클릭 핸들러
   */
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // 노드 선택 이벤트 방지
      deleteEnum(id)
    },
    [deleteEnum, id]
  )

  return (
    <>
      {/* 상단 핸들 (Target) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={handleClassName}
      />

      {/* 좌측 핸들 (Target) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={handleClassName}
      />

      {/* 메인 카드 */}
      <div
        className={cn(
          "min-w-[160px] max-w-[240px] bg-background rounded-lg shadow-md",
          "border-2 transition-all relative",
          selected
            ? "border-amber-500 ring-2 ring-amber-500/20"
            : "border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 삭제 버튼 (호버 시 표시) */}
        {(isHovered || selected) && (
          <button
            onClick={handleDelete}
            className={cn(
              "absolute -top-2 -right-2 z-10",
              "w-5 h-5 rounded-full",
              "bg-destructive text-destructive-foreground",
              "flex items-center justify-center",
              "hover:bg-destructive/90 transition-colors",
              "shadow-sm"
            )}
            title="Delete Enum"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* 헤더: Enum 이름 */}
        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 rounded-t-md">
          <div className="text-sm font-semibold flex items-center gap-2">
            <List className="w-4 h-4 text-amber-500" />
            <span className="truncate text-amber-700 dark:text-amber-300">
              {name}
            </span>
            <span className="text-[10px] font-normal text-amber-400 dark:text-amber-500 ml-auto">
              Enum
            </span>
          </div>
        </div>

        {/* 바디: Enum 값 목록 */}
        {values.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground italic">
            No values
          </div>
        ) : (
          <div className="py-1">
            {values.map((enumValue, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-1 text-xs hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
              >
                {/* Key */}
                <span className="font-medium text-foreground truncate">
                  {enumValue.key}
                </span>

                {/* = */}
                <span className="text-muted-foreground mx-1.5">=</span>

                {/* Value */}
                <span className="text-amber-600 dark:text-amber-400 truncate">
                  &quot;{enumValue.value}&quot;
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 우측 핸들 (Source) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={handleClassName}
      />

      {/* 하단 핸들 (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={handleClassName}
      />
    </>
  )
}

/**
 * 메모이제이션된 Enum 노드 컴포넌트
 */
export const EnumNode = memo(EnumNodeComponent)
