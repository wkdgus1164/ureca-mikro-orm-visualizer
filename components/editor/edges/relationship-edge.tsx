"use client"

/**
 * Relationship 엣지 커스텀 컴포넌트
 *
 * MikroORM 관계를 시각적으로 표현하는 커스텀 엣지
 */

import { memo, useMemo } from "react"
import {
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
 * 엣지 기본 스타일
 */
const EDGE_STYLE_BASE = {
  strokeWidth: 2,
  stroke: "#64748b",
}

/**
 * 관계 타입에 따른 엣지 스타일 반환
 */
function getEdgeStyle(relationType: RelationType): React.CSSProperties {
  if (relationType === RelationType.Implementation) {
    return {
      ...EDGE_STYLE_BASE,
      strokeDasharray: "6 4",
    }
  }
  return EDGE_STYLE_BASE
}

/**
 * 관계 타입에 따른 끝점 마커 선택
 */
function getMarkerEnd(relationType: RelationType): string {
  switch (relationType) {
    case RelationType.OneToOne:
    case RelationType.ManyToOne:
      return `url(#${MARKER_IDS.arrow})`
    case RelationType.OneToMany:
    case RelationType.ManyToMany:
    case RelationType.Composition:
    case RelationType.Aggregation:
      return `url(#${MARKER_IDS.crowFoot})`
    case RelationType.Inheritance:
    case RelationType.Implementation:
      return `url(#${MARKER_IDS.triangle})`
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
    case RelationType.OneToMany:
    case RelationType.ManyToOne:
    case RelationType.Composition:
    case RelationType.Aggregation:
    case RelationType.Inheritance:
    case RelationType.Implementation:
      return undefined
  }
}

/**
 * sourcePosition에 따른 방향 벡터 반환
 */
function getDirectionFromPosition(position: string): { ux: number; uy: number } {
  switch (position) {
    case "right":
      return { ux: 1, uy: 0 }
    case "left":
      return { ux: -1, uy: 0 }
    case "top":
      return { ux: 0, uy: -1 }
    case "bottom":
      return { ux: 0, uy: 1 }
    default:
      return { ux: 1, uy: 0 }
  }
}

/**
 * Source 위치에 다이아몬드를 그리기 위한 좌표 계산
 * sourcePosition 기반으로 방향 결정 (Bezier 곡선 대응)
 */
function getDiamondPoints(
  sourceX: number,
  sourceY: number,
  sourcePosition: string,
  size: number = 14
): string {
  // sourcePosition 기반 방향 벡터
  const { ux, uy } = getDirectionFromPosition(sourcePosition)

  // 수직 벡터
  const px = -uy
  const py = ux

  const halfWidth = size / 2.5

  // 다이아몬드 시작점을 선 방향으로 오프셋 (노드에 가려지지 않도록)
  const offset = 2
  const startX = sourceX + ux * offset
  const startY = sourceY + uy * offset

  // 다이아몬드 4개 꼭지점
  // tip: 선 쪽 꼭지점
  const tip = { x: startX + ux * size, y: startY + uy * size }
  // back: 노드 쪽 꼭지점
  const back = { x: startX, y: startY }
  // 중간점
  const mid = { x: startX + ux * (size / 2), y: startY + uy * (size / 2) }
  // left, right: 좌우 꼭지점
  const left = { x: mid.x + px * halfWidth, y: mid.y + py * halfWidth }
  const right = { x: mid.x - px * halfWidth, y: mid.y - py * halfWidth }

  return `${back.x},${back.y} ${right.x},${right.y} ${tip.x},${tip.y} ${left.x},${left.y}`
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

  // Composition/Aggregation 다이아몬드 좌표 계산
  const diamondPoints = useMemo(() => {
    if (
      relationType === RelationType.Composition ||
      relationType === RelationType.Aggregation
    ) {
      return getDiamondPoints(sourceX, sourceY, sourcePosition, 14)
    }
    return null
  }, [relationType, sourceX, sourceY, sourcePosition])

  const isComposition = relationType === RelationType.Composition
  const isAggregation = relationType === RelationType.Aggregation

  return (
    <>
      {/* 엣지 패스 */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        style={getEdgeStyle(relationType)}
        markerEnd={getMarkerEnd(relationType)}
        markerStart={getMarkerStart(relationType)}
      />

      {/* Composition 다이아몬드 (채워진 ◆) */}
      {isComposition && diamondPoints && (
        <polygon
          points={diamondPoints}
          fill="#64748b"
        />
      )}

      {/* Aggregation 다이아몬드 (빈 ◇) */}
      {isAggregation && diamondPoints && (
        <polygon
          points={diamondPoints}
          fill="white"
          stroke="#64748b"
          strokeWidth="1.5"
        />
      )}

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
            selected && "border-primary border-2"
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
