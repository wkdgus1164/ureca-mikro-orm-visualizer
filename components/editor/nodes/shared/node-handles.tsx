"use client"

/**
 * 노드 핸들 공통 컴포넌트
 *
 * ReactFlow 노드의 4방향 연결 핸들을 렌더링
 * 모든 노드 타입(Entity, Embeddable, Enum)에서 공통으로 사용
 */

import { Handle, Position } from "@xyflow/react"
import { cn } from "@/lib/utils"

/**
 * 핸들 색상 테마
 */
export type HandleTheme = "blue" | "violet" | "amber" | "emerald"

/**
 * 테마별 핸들 클래스 맵핑
 */
const HANDLE_THEME_CLASSES: Record<HandleTheme, string> = {
  blue:
    "!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-background hover:!bg-blue-400 transition-colors",
  violet:
    "!w-2.5 !h-2.5 !bg-violet-500 !border-2 !border-background hover:!bg-violet-400 transition-colors",
  amber:
    "!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-background hover:!bg-amber-400 transition-colors",
  emerald:
    "!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-background hover:!bg-emerald-400 transition-colors",
}

interface NodeHandlesProps {
  /** 핸들 색상 테마 */
  theme?: HandleTheme
  /**
   * 추가 CSS 클래스
   * 각 개별 Handle 요소에 적용됨 (래퍼가 아닌 Fragment를 반환하므로 핸들별 스타일링에 사용)
   */
  className?: string
  /** 핸들 사이에 렌더링할 자식 요소 (노드 본체) */
  children: React.ReactNode
}

/**
 * 4방향 핸들을 포함한 노드 래퍼 컴포넌트
 *
 * - Top, Left: target 핸들 (연결 받는 쪽)
 * - Right, Bottom: source 핸들 (연결 시작 쪽)
 *
 * 주의: 이 컴포넌트는 Fragment(<>...</>)를 반환하므로 래퍼 요소가 없습니다.
 * className prop은 각 개별 Handle 요소에 적용되며, 래퍼 스타일링이 아닌 핸들별 스타일링에 사용해야 합니다.
 *
 * @example
 * ```tsx
 * <NodeHandles theme="violet">
 *   <div>노드 내용</div>
 * </NodeHandles>
 * ```
 */
export function NodeHandles({
  theme = "blue",
  className,
  children,
}: NodeHandlesProps) {
  const handleClassName = cn(HANDLE_THEME_CLASSES[theme], className)

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

      {/* 노드 본체 */}
      {children}

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
