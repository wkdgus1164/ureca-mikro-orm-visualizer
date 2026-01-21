"use client"

/**
 * 에디터 툴바 컴포넌트
 *
 * Entity 추가, Relationship 연결, 줌, Export 등 에디터 액션 버튼 제공
 */

import { useReactFlow } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Link,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Trash2,
} from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import { cn } from "@/lib/utils"

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
    addEntity,
    uiState,
    toggleConnecting,
    toggleExportModal,
    deleteEntity,
    deleteRelationship,
  } = useEditorContext()
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  /**
   * Entity 추가 핸들러
   */
  const handleAddEntity = () => {
    addEntity()
  }

  /**
   * Relationship 연결 모드 토글
   */
  const handleToggleConnecting = () => {
    toggleConnecting()
  }

  /**
   * 선택된 요소 삭제
   */
  const handleDelete = () => {
    const { selection } = uiState
    if (selection.type === "node" && selection.id) {
      deleteEntity(selection.id)
    } else if (selection.type === "edge" && selection.id) {
      deleteRelationship(selection.id)
    }
  }

  /**
   * Export 모달 열기
   */
  const handleExport = () => {
    toggleExportModal()
  }

  const hasSelection = uiState.selection.id !== null

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
        {/* Entity 추가 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddEntity}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Entity</span>
        </Button>

        {/* Relationship 연결 모드 */}
        <Button
          variant={uiState.isConnecting ? "default" : "outline"}
          size="sm"
          onClick={handleToggleConnecting}
          className="gap-2"
        >
          <Link className="h-4 w-4" />
          <span className="hidden sm:inline">Connect</span>
        </Button>

        <ToolbarDivider />

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

        <ToolbarDivider />

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={!hasSelection}
          title="Delete Selected"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Export */}
        <Button onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  )
}
