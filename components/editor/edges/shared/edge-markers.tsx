"use client"

/**
 * 엣지 SVG 마커 정의
 *
 * ReactFlow 엣지에서 사용하는 SVG 마커들
 * CSS 변수를 사용해 라이트/다크 테마 지원
 */

/**
 * 마커 ID 상수
 */
export const MARKER_IDS = {
  /** 화살표 마커 (1:1, N:1 관계) */
  arrow: "arrow-marker",
  /** 까마귀발 마커 (1:N, N:M 관계) */
  crowFoot: "crow-foot-marker",
  /** 수직선 마커 (1 표시) */
  one: "one-marker",
} as const

export type MarkerId = (typeof MARKER_IDS)[keyof typeof MARKER_IDS]

/**
 * 화살표 마커 컴포넌트
 *
 * 1:1, N:1 관계의 끝점에 사용
 */
export function ArrowMarker() {
  return (
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
  )
}

/**
 * 까마귀발 마커 컴포넌트
 *
 * 1:N, N:M 관계의 "다" 쪽 끝점에 사용
 */
export function CrowFootMarker() {
  return (
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
  )
}

/**
 * 수직선(One) 마커 컴포넌트
 *
 * "1" 표시용 수직선
 */
export function OneMarker() {
  return (
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
        className="transition-colors"
      />
    </marker>
  )
}

/**
 * 모든 엣지 마커를 포함하는 SVG defs
 *
 * 엣지 컴포넌트 내부에서 한 번만 렌더링
 *
 * @example
 * ```tsx
 * <defs>
 *   <EdgeMarkerDefs />
 * </defs>
 * ```
 */
export function EdgeMarkerDefs() {
  return (
    <>
      <ArrowMarker />
      <CrowFootMarker />
      <OneMarker />
    </>
  )
}
