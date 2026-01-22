"use client"

/**
 * Relationship 엣지 커스텀 컴포넌트
 *
 * MikroORM 관계를 시각적으로 표현하는 커스텀 엣지
 */

import { memo } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react"
import type { RelationshipData } from "@/types/relationship"
import { RelationType, RELATION_TYPE_LABELS } from "@/types/relationship"
import { cn } from "@/lib/utils"
import { MARKER_IDS } from "@/components/editor/edges/shared/edge-markers"

/**
 * Relationship 엣지 타입 (ReactFlow Edge 확장)
 */
type RelationshipEdgeType = Edge<RelationshipData, "relationship">

/**
 * Relationship 엣지 Props 타입
 */
type RelationshipEdgeProps = EdgeProps<RelationshipEdgeType>

/**
 * 엣지 스타일 계산
 *
 * 선택 상태와 관계 타입에 따라 strokeWidth, 색상, 점선 여부 결정
 */
function getEdgeStyle(selected: boolean, relationType: RelationType) {
  const baseStyle = {
    strokeWidth: selected ? 3 : 2,
    stroke: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
  }

  // Dependency는 점선으로 표시
  if (relationType === RelationType.Dependency) {
    return {
      ...baseStyle,
      strokeDasharray: "5,5",
    }
  }

  return baseStyle
}

/**
 * 관계 타입에 따른 끝점 마커 선택
 */
function getMarkerEnd(relationType: RelationType): string {
  switch (relationType) {
    case RelationType.OneToOne:
    case RelationType.ManyToOne:
    case RelationType.Dependency: // Dependency는 일반 화살표
      return `url(#${MARKER_IDS.arrow})`
    case RelationType.OneToMany:
    case RelationType.ManyToMany:
      return `url(#${MARKER_IDS.crowFoot})`
  }
}

/**
 * 관계 타입에 따른 시작점 마커 선택
 */
function getMarkerStart(relationType: RelationType): string | undefined {
  switch (relationType) {
    case RelationType.OneToOne:
      return `url(#${MARKER_IDS.arrow})`
    case RelationType.ManyToMany:
      return `url(#${MARKER_IDS.crowFoot})`
    case RelationType.Dependency: // Dependency는 단방향 (시작점 마커 없음)
    case RelationType.OneToMany:
    case RelationType.ManyToOne:
      return undefined
  }
}

/**
 * Relationship 엣지 컴포넌트
 *
 * MikroORM 관계를 Bezier 곡선과 마커로 시각화
 * - 1:1, N:1: 화살표 마커
 * - 1:N, N:M: 까마귀발 마커
 * - 라벨: 프로퍼티명 + 관계 타입
 */
function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: RelationshipEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const relationType = data?.relationType ?? RelationType.OneToMany
  const sourceProperty = data?.sourceProperty ?? "relation"
  const style = getEdgeStyle(selected ?? false, relationType)

  return (
    <>
      {/* 엣지 패스 */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={getMarkerEnd(relationType)}
        markerStart={getMarkerStart(relationType)}
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
            "bg-background border border-border shadow-sm",
            "transition-all",
            selected && "border-primary bg-primary/5"
          )}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-foreground">{sourceProperty}</span>
            <span className="text-[10px] text-muted-foreground">
              {RELATION_TYPE_LABELS[relationType]}
            </span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

/**
 * 메모이제이션된 Relationship 엣지 컴포넌트
 */
export const RelationshipEdge = memo(RelationshipEdgeComponent)
