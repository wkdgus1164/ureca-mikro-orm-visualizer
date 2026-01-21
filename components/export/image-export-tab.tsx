"use client"

/**
 * Image Export 탭 컴포넌트
 *
 * 다이어그램을 이미지로 내보내기 위한 옵션을 제공하는 탭
 */

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import {
  exportAndDownloadImage,
  SCALE_OPTIONS,
  FORMAT_OPTIONS,
  type ImageFormat,
  type ImageScale,
} from "@/lib/export/image"
import type { FlowNode } from "@/hooks/use-nodes"

interface ImageExportTabProps {
  /** 노드 목록 (이미지 렌더링용) */
  nodes: FlowNode[]
}

/**
 * Image Export 탭 컴포넌트
 *
 * 이미지 형식과 해상도를 선택하고 다이어그램을 이미지로 내보낼 수 있습니다.
 */
export function ImageExportTab({ nodes }: ImageExportTabProps) {
  // 이미지 형식
  const [imageFormat, setImageFormat] = useState<ImageFormat>("png")
  // 이미지 해상도
  const [imageScale, setImageScale] = useState<ImageScale>(2)
  // 내보내기 진행 상태
  const [isExporting, setIsExporting] = useState(false)

  /**
   * 이미지 다운로드 핸들러
   */
  const handleDownload = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportAndDownloadImage(nodes, "diagram", {
        format: imageFormat,
        scale: imageScale,
        backgroundColor: "#ffffff",
        padding: 50,
      })
      toast.success(`diagram.${imageFormat} downloaded!`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export image"
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }, [nodes, imageFormat, imageScale])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 flex flex-col items-center justify-center h-[350px] bg-muted/30">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-base font-medium mb-4">Export Diagram as Image</p>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {/* 이미지 형식 선택 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={imageFormat}
              onValueChange={(value) => setImageFormat(value as ImageFormat)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 해상도 선택 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Resolution</label>
            <Select
              value={String(imageScale)}
              onValueChange={(value) => setImageScale(Number(value) as ImageScale)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCALE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center max-w-sm">
          {imageFormat === "svg"
            ? "SVG is vector-based and can scale to any size without quality loss."
            : `PNG will be exported at ${imageScale}x resolution for sharp display.`}
        </p>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/50 mt-auto">
        <Button onClick={handleDownload} disabled={isExporting}>
          {isExporting ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download diagram.{imageFormat}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
