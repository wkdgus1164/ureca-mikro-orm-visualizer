"use client"

/**
 * 줌 슬라이더 컴포넌트
 *
 * 마이너스/플러스 버튼과 드래그 가능한 슬라이더로 캔버스 줌을 제어
 */

import { useCallback } from "react"
import { useReactFlow, useViewport } from "@xyflow/react"
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

/** 줌 범위 설정 */
const MIN_ZOOM = 0.1
const MAX_ZOOM = 2
const ZOOM_STEP = 0.1

interface ZoomSliderProps {
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * Render a zoom control UI with minus/plus buttons and a draggable slider that updates the viewport zoom.
 *
 * @returns The JSX element for the zoom control component.
 */
export function ZoomSlider({ className }: ZoomSliderProps) {
  const { zoomTo } = useReactFlow()
  const { zoom } = useViewport()

  /**
   * 줌 레벨 변경 핸들러 (슬라이더 드래그)
   * - zoomTo 사용으로 화면 중앙 기준 줌
   * - duration 없이 즉각 반응
   */
  const handleZoomChange = useCallback(
    (value: number[]) => {
      const newZoom = value[0]
      zoomTo(newZoom)
    },
    [zoomTo]
  )

  /**
   * 줌 아웃 (마이너스 버튼)
   */
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP)
    zoomTo(newZoom, { duration: 100 })
  }, [zoom, zoomTo])

  /**
   * 줌 인 (플러스 버튼)
   */
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP)
    zoomTo(newZoom, { duration: 100 })
  }, [zoom, zoomTo])

  /** 현재 줌 퍼센트 표시 */
  const zoomPercent = Math.round(zoom * 100)

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-sm z-10",
        className
      )}
    >
      {/* 줌 아웃 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleZoomOut}
        disabled={zoom <= MIN_ZOOM}
        aria-label="줌 아웃"
      >
        <Minus className="h-4 w-4" />
      </Button>

      {/* 줌 슬라이더 */}
      <div className="flex items-center gap-2">
        <Slider
          value={[zoom]}
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          onValueChange={handleZoomChange}
          className="w-32"
          aria-label="줌 레벨"
        />
        {/* 줌 퍼센트 표시 */}
        <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
          {zoomPercent}%
        </span>
      </div>

      {/* 줌 인 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleZoomIn}
        disabled={zoom >= MAX_ZOOM}
        aria-label="줌 인"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}