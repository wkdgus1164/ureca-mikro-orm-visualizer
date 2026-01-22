"use client"

/**
 * Enum Mapping 엣지 커스텀 컴포넌트
 *
 * Entity의 프로퍼티가 Enum 타입을 참조함을 시각적으로 표현
 */

import { memo } from "react"
import {
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react"
import type { EnumMappingData } from "@/types/relationship"
import { cn } from "@/lib/utils"

/**
 * Enum Mapping 엣지 타입 (ReactFlow Edge 확장)
 */
type EnumMappingEdgeType = Edge<EnumMappingData, "enum-mapping">

/**
 * Enum Mapping 엣지 Props 타입
 */
type EnumMappingEdgeProps = EdgeProps<EnumMappingEdgeType>

/**
 * Enum Mapping 엣지 컴포넌트
 *
 * Entity와 Enum 간의 타입 매핑을 점선으로 시각화
 * - 점선 스타일 (Relationship과 구분)
 * - Amber 색상 (Enum 노드와 일관성)
 * - 라벨: "uses" 표시
 */
function EnumMappingEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EnumMappingEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      {/* 엣지 패스 - 점선 스타일 */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        style={{
          strokeWidth: 2,
          stroke: "#f59e0b", // amber-500
          strokeDasharray: "4 4",
        }}
      />

      {/* 라벨 렌더링 */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className={cn(
            "nodrag nopan",
            "px-2 py-1 rounded-md text-xs font-medium",
            "bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 shadow-sm",
            "transition-all",
            selected && "border-amber-500 border-2"
          )}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-amber-700 dark:text-amber-300">uses</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              Enum Type
            </span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

/**
 * 메모이제이션된 Enum Mapping 엣지 컴포넌트
 */
export const EnumMappingEdge = memo(EnumMappingEdgeComponent)
