"use client"

/**
 * 에디터 3-패널 레이아웃 컴포넌트
 *
 * 피그마 스타일의 레이아웃:
 * - 좌측: 노드 목록 (NodeListPanel) - 리사이즈 가능
 * - 중앙: ReactFlow 캔버스 (EditorCanvas)
 * - 우측: 프로퍼티 편집 (PropertySidebar)
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { EditorCanvas } from "@/components/editor/canvas/editor-canvas"
import { LeftPanel } from "@/components/editor/panels/left-panel"
import { PropertySidebar } from "@/components/editor/panels/property-sidebar"
import { EntityEditContent } from "@/components/editor/panels/entity-edit-panel"
import { EnumEditContent } from "@/components/editor/panels/enum-edit-panel"
import { InterfaceEditContent } from "@/components/editor/panels/interface-edit-panel"
import { RelationshipEditContent } from "@/components/editor/panels/relationship-edit-panel"
import { EnumMappingEditContent } from "@/components/editor/panels/enum-mapping-edit-panel"
import { useEditorContext } from "@/components/providers/editor-provider"
import { cn } from "@/lib/utils"

// 좌측 패널 크기 제한 (픽셀)
const LEFT_PANEL_MIN_WIDTH = 200
const LEFT_PANEL_MAX_WIDTH = 500
const LEFT_PANEL_DEFAULT_WIDTH = 240

// 우측 패널 크기 제한 (픽셀)
const RIGHT_PANEL_MIN_WIDTH = 300
const RIGHT_PANEL_MAX_WIDTH = 600
const RIGHT_PANEL_DEFAULT_WIDTH = 400

/**
 * Render the editor's three-panel layout with a dynamic right-side properties panel.
 *
 * Displays a left NodeListPanel, a central EditorCanvas, and a right PropertySidebar whose title,
 * description, and content change based on the current selection from the editor context:
 * shows EnumEditContent when an enum is selected, EntityEditContent when an entity is selected,
 * RelationshipEditContent when an edge is selected, and defaults to a "Properties" panel with no content otherwise.
 *
 * @returns The editor layout's JSX element
 */
export function EditorLayout() {
  const {
    uiState,
    closeRightPanel,
    getSelectedNode,
    getSelectedEnum,
    getSelectedInterface,
    getSelectedEdge,
    getSelectedEnumMapping,
  } = useEditorContext()

  // 좌측 패널 리사이즈 상태
  const [leftPanelWidth, setLeftPanelWidth] = useState(LEFT_PANEL_DEFAULT_WIDTH)
  const [isLeftResizing, setIsLeftResizing] = useState(false)
  const leftResizeRef = useRef<{ startX: number; startWidth: number } | null>(null)

  // 우측 패널 리사이즈 상태
  const [rightPanelWidth, setRightPanelWidth] = useState(RIGHT_PANEL_DEFAULT_WIDTH)
  const [isRightResizing, setIsRightResizing] = useState(false)
  const rightResizeRef = useRef<{ startX: number; startWidth: number } | null>(null)

  // 리사이즈 중 여부 (좌측 또는 우측)
  const isResizing = isLeftResizing || isRightResizing

  // 좌측 패널 리사이즈 시작
  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsLeftResizing(true)
    leftResizeRef.current = {
      startX: e.clientX,
      startWidth: leftPanelWidth,
    }
  }, [leftPanelWidth])

  // 우측 패널 리사이즈 시작
  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsRightResizing(true)
    rightResizeRef.current = {
      startX: e.clientX,
      startWidth: rightPanelWidth,
    }
  }, [rightPanelWidth])

  // 좌측 패널 리사이즈 중 (마우스 이동)
  useEffect(() => {
    if (!isLeftResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!leftResizeRef.current) return

      const delta = e.clientX - leftResizeRef.current.startX
      const newWidth = Math.min(
        LEFT_PANEL_MAX_WIDTH,
        Math.max(LEFT_PANEL_MIN_WIDTH, leftResizeRef.current.startWidth + delta)
      )
      setLeftPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsLeftResizing(false)
      leftResizeRef.current = null
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isLeftResizing])

  // 우측 패널 리사이즈 중 (마우스 이동) - 왼쪽으로 드래그하면 너비 증가
  useEffect(() => {
    if (!isRightResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!rightResizeRef.current) return

      // 우측 패널은 왼쪽으로 드래그하면 커지므로 delta를 반전
      const delta = rightResizeRef.current.startX - e.clientX
      const newWidth = Math.min(
        RIGHT_PANEL_MAX_WIDTH,
        Math.max(RIGHT_PANEL_MIN_WIDTH, rightResizeRef.current.startWidth + delta)
      )
      setRightPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsRightResizing(false)
      rightResizeRef.current = null
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isRightResizing])

  const selectedNode = getSelectedNode()
  const selectedEnum = getSelectedEnum()
  const selectedInterface = getSelectedInterface()
  const selectedEdge = getSelectedEdge()
  const selectedEnumMapping = getSelectedEnumMapping()

  // 선택된 요소에 따른 타이틀/설명 결정
  let title = "Properties"
  let description: string | undefined
  let content: React.ReactNode = null

  if (uiState.selection.type === "node") {
    if (selectedEnum) {
      title = "Edit Enum"
      description = "Define enum values for TypeScript generation"
      content = <EnumEditContent />
    } else if (selectedInterface) {
      title = "Edit Interface"
      description = "Define interface properties and methods"
      content = <InterfaceEditContent />
    } else if (selectedNode) {
      title = "Edit Entity"
      description = "Modify the entity properties and settings"
      content = <EntityEditContent />
    }
  } else if (uiState.selection.type === "edge") {
    if (selectedEnumMapping) {
      title = "Edit Enum Mapping"
      description = "Map entity property to enum type"
      content = <EnumMappingEditContent />
    } else if (selectedEdge) {
      title = "Edit Relationship"
      description = "Configure the relationship between entities"
      content = <RelationshipEditContent />
    }
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 좌측 사이드바 - 노드 목록 + AI Chat (리사이즈 가능) */}
      <div className="relative flex-shrink-0" style={{ width: leftPanelWidth }}>
        <LeftPanel className="w-full" />

        {/* 좌측 패널 리사이즈 핸들 */}
        <div
          className={cn(
            "absolute top-0 right-0 w-1 h-full cursor-col-resize",
            "hover:bg-primary/50 active:bg-primary/50 transition-colors",
            isLeftResizing && "bg-primary/50"
          )}
          onMouseDown={handleLeftResizeStart}
        />
      </div>

      {/* 리사이즈 중 오버레이 (텍스트 선택 방지) */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}

      {/* 중앙 캔버스 */}
      <div className="flex-1 min-w-0">
        <EditorCanvas />
      </div>

      {/* 우측 사이드바 - 프로퍼티 편집 (리사이즈 가능) */}
      <div className="relative flex-shrink-0">
        {/* 우측 패널 리사이즈 핸들 */}
        {uiState.isRightPanelOpen && (
          <div
            className={cn(
              "absolute top-0 left-0 w-1 h-full cursor-col-resize z-10",
              "hover:bg-primary/50 active:bg-primary/50 transition-colors",
              isRightResizing && "bg-primary/50"
            )}
            onMouseDown={handleRightResizeStart}
          />
        )}

        <PropertySidebar
          isOpen={uiState.isRightPanelOpen}
          onClose={closeRightPanel}
          title={title}
          description={description}
          width={rightPanelWidth}
        >
          {content}
        </PropertySidebar>
      </div>
    </div>
  )
}