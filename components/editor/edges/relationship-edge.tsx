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
 * Compute the inline SVG style for an edge based on the relationship type and whether it is selected.
 *
 * The returned style adjusts stroke width for selection and chooses a stroke color that remains clear in both light and dark themes.
 *
 * @param relationType - The relationship type influencing marker/visual semantics (used for future extensibility)
 * @param selected - Whether the edge is selected; selected edges use a heavier stroke and primary color
 * @returns An object containing `strokeWidth` and `stroke` properties for the edge's inline style
 */
function getEdgeStyle(relationType: RelationType, selected: boolean) {
  const baseStyle = {
    strokeWidth: selected ? 3 : 2,
    stroke: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
  }

  return baseStyle
}

/**
 * Selects the SVG marker URL to use at the end of an edge for the given relationship type.
 *
 * @returns The SVG URL reference for the end marker corresponding to `relationType` (for example `url(#arrow)` or `url(#crowFoot)`).
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
 * Selects the SVG marker URL to use at the start of an edge based on the relationship type.
 *
 * @param relationType - The relationship type that determines the start marker
 * @returns The SVG marker URL (for use in `markerStart`), or `undefined` if no start marker applies
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
 * Render a custom React Flow edge that visualizes a MikroORM relationship.
 *
 * Chooses start/end SVG markers (arrow, crow-foot, or vertical "one") based on the relation type,
 * draws a Bezier edge between source and target, and renders a centered label showing the source
 * property name and relation type label.
 *
 * @returns A React element that renders the relationship edge with markers and a label.
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
        {/* 화살표 마커 - 더 선명한 색상 */}
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
            fill="hsl(var(--foreground))"
            className="transition-colors"
          />
        </marker>

        {/* 까마귀발 마커 (One-to-Many 끝) - 더 선명한 색상 */}
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
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            className="transition-colors"
          />
        </marker>

        {/* One 마커 (수직선) - 더 선명한 색상 */}
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
            stroke="hsl(var(--foreground))"
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