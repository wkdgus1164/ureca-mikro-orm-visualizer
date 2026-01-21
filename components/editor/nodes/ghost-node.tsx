"use client"

/**
 * Ghost 노드 컴포넌트
 *
 * 노드 추가 대기 모드에서 마우스 위치에 표시되는 반투명 미리보기 노드
 * 사용자가 클릭하면 해당 위치에 실제 노드가 생성됨
 *
 * ReactFlow의 좌표 시스템과 동기화:
 * - position은 flow 좌표로 전달됨
 * - viewport 정보를 사용하여 화면 좌표로 변환
 * - zoom level에 따라 크기도 조정됨
 */

import { memo } from "react"
import { Box, Package, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PendingAddType } from "@/types/editor"

interface GhostNodeProps {
  /** 추가할 노드 타입 */
  type: Exclude<PendingAddType, null>
  /** 노드 위치 (flow 좌표) */
  position: { x: number; y: number }
  /** ReactFlow viewport 정보 (pan/zoom) */
  viewport: { x: number; y: number; zoom: number }
}

/**
 * 노드 타입별 설정
 */
const nodeTypeConfig = {
  entity: {
    icon: Box,
    label: "Entity",
    borderColor: "border-primary",
    iconColor: "text-primary",
    bgColor: "bg-muted/50",
  },
  embeddable: {
    icon: Package,
    label: "Embeddable",
    borderColor: "border-violet-500 border-dashed",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  enum: {
    icon: List,
    label: "Enum",
    borderColor: "border-amber-500",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
}

/**
 * Ghost 노드 컴포넌트
 *
 * 반투명 미리보기로 노드가 생성될 위치를 시각적으로 표시
 * ReactFlow의 viewport transform과 동기화되어 zoom/pan 상태에서도 정확한 위치 표시
 *
 * @example
 * ```tsx
 * {uiState.pendingAdd && uiState.mousePosition && (
 *   <GhostNode
 *     type={uiState.pendingAdd}
 *     position={uiState.mousePosition}
 *     viewport={viewport}
 *   />
 * )}
 * ```
 */
function GhostNodeComponent({ type, position, viewport }: GhostNodeProps) {
  const config = nodeTypeConfig[type]
  const Icon = config.icon

  // Flow 좌표를 화면 좌표로 변환
  // 공식: screenPos = flowPos * zoom + viewportOffset
  const screenX = position.x * viewport.zoom + viewport.x
  const screenY = position.y * viewport.zoom + viewport.y

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: screenX,
        top: screenY,
        // zoom level에 맞춰 크기 조정 + 중앙 정렬
        transform: `translate(-50%, -50%) scale(${viewport.zoom})`,
        transformOrigin: "center center",
      }}
    >
      <div
        className={cn(
          "min-w-[160px] rounded-lg shadow-lg",
          "border-2 transition-all",
          "opacity-70",
          config.borderColor
        )}
      >
        {/* 헤더 */}
        <div
          className={cn(
            "px-3 py-2 rounded-t-md border-b border-border",
            config.bgColor
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", config.iconColor)} />
            <span className="text-sm font-semibold">New {config.label}</span>
          </div>
        </div>

        {/* 바디 */}
        <div className="px-3 py-3 bg-background/90 rounded-b-md">
          <p className="text-xs text-muted-foreground text-center">
            Click to place
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 메모이제이션된 Ghost 노드 컴포넌트
 */
export const GhostNode = memo(GhostNodeComponent)
