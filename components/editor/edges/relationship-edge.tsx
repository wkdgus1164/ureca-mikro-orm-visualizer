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

/**
 * Relationship 엣지 타입 (ReactFlow Edge 확장)
 */
type RelationshipEdgeType = Edge<RelationshipData, "relationship">

/**
 * Relationship 엣지 Props 타입
 */
type RelationshipEdgeProps = EdgeProps<RelationshipEdgeType>

/**
 * 관계 타입별 마커 ID
 */
const MARKER_IDS = {
  arrow: "arrow-marker",
  crowFoot: "crow-foot-marker",
  one: "one-marker",
} as const

/**
 * 관계 타입별 엣지 스타일
 */
function getEdgeStyle(relationType: RelationType, selected: boolean) {
  const baseStyle = {
    strokeWidth: selected ? 3 : 2,
    stroke: selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
  }

  return baseStyle
}

/**
 * 관계 타입별 마커 설정
 */
function getMarkerEnd(relationType: RelationType): string {
  switch (relationType) {
    case RelationType.OneToOne:
      return `url(#${MARKER_IDS.arrow})`
    case RelationType.OneToMany:
      return `url(#${MARKER_IDS.crowFoot})`
    case RelationType.ManyToOne:
      return `url(#${MARKER_IDS.arrow})`
    case RelationType.ManyToMany:
      return `url(#${MARKER_IDS.crowFoot})`
  }
}

/**
 * 관계 타입별 마커 시작점
 */
function getMarkerStart(relationType: RelationType): string | undefined {
  switch (relationType) {
    case RelationType.OneToOne:
      return `url(#${MARKER_IDS.arrow})`
    case RelationType.ManyToMany:
      return `url(#${MARKER_IDS.crowFoot})`
    default:
      return undefined
  }
}

/**
 * Relationship 엣지 컴포넌트
 *
 * 관계 타입에 따라 다른 스타일의 엣지 렌더링:
 * - OneToOne: 양방향 화살표
 * - OneToMany: Source→까마귀발
 * - ManyToOne: 화살표→Target
 * - ManyToMany: 양방향 까마귀발
 *
 * @example
 * ```tsx
 * const edgeTypes = { relationship: RelationshipEdge }
 * <ReactFlow edgeTypes={edgeTypes} />
 * ```
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
  const style = getEdgeStyle(relationType, selected ?? false)

  return (
    <>
      {/* SVG 마커 정의 */}
      <defs>
        {/* 화살표 마커 */}
        <marker
          id={MARKER_IDS.arrow}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill="hsl(var(--muted-foreground))"
            className="transition-colors"
          />
        </marker>

        {/* 까마귀발 마커 (One-to-Many 끝) */}
        <marker
          id={MARKER_IDS.crowFoot}
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 6 L 10 0 M 0 6 L 10 6 M 0 6 L 10 12"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            className="transition-colors"
          />
        </marker>

        {/* One 마커 (수직선) */}
        <marker
          id={MARKER_IDS.one}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <line
            x1="5"
            y1="0"
            x2="5"
            y2="10"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
          />
        </marker>
      </defs>

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
