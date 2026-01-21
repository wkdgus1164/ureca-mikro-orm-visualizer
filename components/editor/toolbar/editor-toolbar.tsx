"use client"

/**
 * 에디터 툴바 컴포넌트
 *
 * Entity 추가, Relationship 연결, 줌, Export 등 에디터 액션 버튼 제공
 */

import { useReactFlow } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Save,
  FolderOpen,
} from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { useEditorContext } from "@/components/providers/editor-provider"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRef, useCallback } from "react"
import { downloadDiagram, loadDiagramFromFile } from "@/lib/export/diagram"
import type { DiagramNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"

interface EditorToolbarProps {
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 툴바 구분선 컴포넌트
 */
function ToolbarDivider() {
  return <div className="h-6 w-px bg-border" />
}

/**
 * 에디터 툴바 컴포넌트
 *
 * @example
 * ```tsx
 * <EditorToolbar />
 * ```
 */
export function EditorToolbar({ className }: EditorToolbarProps) {
  const {
    nodes,
    edges,
    toggleExportModal,
    loadDiagram,
  } = useEditorContext()
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // 파일 입력 ref (Load 버튼용)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 다이어그램 저장 핸들러
   */
  const handleSave = useCallback(() => {
    if (nodes.length === 0) {
      toast.error("No diagram to save. Create some entities first!")
      return
    }

    downloadDiagram(
      nodes as DiagramNode[],
      edges as RelationshipEdge[],
      "diagram"
    )
    toast.success("Diagram saved successfully!")
  }, [nodes, edges])

  /**
   * 파일 선택 다이얼로그 열기
   */
  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * 파일 선택 후 다이어그램 불러오기
   */
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const result = await loadDiagramFromFile(file)

      if (result.success && result.data) {
        loadDiagram(result.data.nodes, result.data.edges as RelationshipEdge[])
        toast.success(`Diagram loaded: ${result.data.nodes.length} nodes, ${result.data.edges.length} edges`)
        // fitView를 약간 지연시켜서 노드가 렌더링된 후 실행
        setTimeout(() => fitView({ padding: 0.2 }), 100)
      } else {
        toast.error(result.error ?? "Failed to load diagram")
      }

      // 같은 파일을 다시 선택할 수 있도록 입력 초기화
      event.target.value = ""
    },
    [loadDiagram, fitView]
  )

  /**
   * Export 모달 열기
   */
  const handleExport = () => {
    toggleExportModal()
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "border-b border-border",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex items-center gap-1 p-2">
        {/* Undo (Phase 4에서 구현 예정) */}
        <Button
          variant="ghost"
          size="icon"
          disabled
          title="Undo (Coming Soon)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        {/* Redo (Phase 4에서 구현 예정) */}
        <Button
          variant="ghost"
          size="icon"
          disabled
          title="Redo (Coming Soon)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <ToolbarDivider />

        {/* Zoom In */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomIn()}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Zoom Out */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomOut()}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        {/* Fit View */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fitView({ padding: 0.2 })}
          title="Fit View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Hidden file input for Load */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.mikro-diagram.json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Load */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadClick}
          title="Load Diagram"
          className="gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Load</span>
        </Button>

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          title="Save Diagram"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* Export */}
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>

        <ToolbarDivider />

        {/* Theme Toggle */}
        <AnimatedThemeToggler
          className="rounded-full p-2 hover:bg-accent transition-colors [&>svg]:h-4 [&>svg]:w-4"
          title="Toggle Theme"
        />
      </div>
    </div>
  )
}
