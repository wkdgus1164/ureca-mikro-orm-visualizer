"use client"

/**
 * Embeddable 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 MikroORM Embeddable을 시각적으로 표현
 * Entity와 시각적으로 구분되는 디자인 (다른 색상, 아이콘)
 */

import { memo } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import type { EmbeddableData } from "@/types/entity"
import { Package, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Embeddable 노드 타입 (ReactFlow Node 확장)
 */
type EmbeddableNodeType = Node<EmbeddableData, "embeddable">

/**
 * Embeddable 노드 Props 타입
 */
type EmbeddableNodeProps = NodeProps<EmbeddableNodeType>

/**
 * 핸들 스타일 (Embeddable 전용 - 보라색 계열)
 */
const handleClassName =
  "!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-background hover:!bg-violet-400 transition-colors"

/**
 * Embeddable 노드 컴포넌트
 *
 * Entity와 시각적으로 구분되는 특징:
 * - 보라색 테마 (Entity는 기본 primary 색상)
 * - Package 아이콘 (Entity는 Circle)
 * - 점선 테두리 스타일
 *
 * @example
 * ```tsx
 * const nodeTypes = { embeddable: EmbeddableNode }
 * <ReactFlow nodeTypes={nodeTypes} />
 * ```
 */
function EmbeddableNodeComponent({ data, selected }: EmbeddableNodeProps) {
  const { name, properties } = data

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
          "min-w-[180px] max-w-[280px] bg-background rounded-lg shadow-md",
          "border-2 border-dashed transition-all",
          selected
            ? "border-violet-500 ring-2 ring-violet-500/20"
            : "border-violet-300 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-600"
        )}
      >
        {/* 헤더: Embeddable 이름 */}
        <div className="px-3 py-2 bg-violet-50 dark:bg-violet-950/30 border-b border-dashed border-violet-200 dark:border-violet-800 rounded-t-md">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-violet-500" />
            <span className="truncate text-violet-700 dark:text-violet-300">
              {name}
            </span>
            <span className="text-[10px] font-normal text-violet-400 dark:text-violet-500 ml-auto">
              Embeddable
            </span>
          </div>
        </div>

        {/* 바디: 프로퍼티 목록 */}
        {properties.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground italic">
            No properties
          </div>
        ) : (
          <div className="py-1">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center px-3 py-1 text-xs hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
              >
                {/* 아이콘 영역 (고정 너비) */}
                <div className="w-4 flex-shrink-0 flex items-center justify-center">
                  {prop.isNullable ? (
                    <Circle className="h-2 w-2 text-muted-foreground/40" />
                  ) : null}
                </div>

                {/* 프로퍼티 이름 */}
                <span className="font-medium text-foreground truncate">
                  {prop.name}
                </span>

                {/* 타입 */}
                <span className="text-muted-foreground ml-auto pl-2 flex-shrink-0">
                  {prop.type}
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
 * 메모이제이션된 Embeddable 노드 컴포넌트
 */
export const EmbeddableNode = memo(EmbeddableNodeComponent)
