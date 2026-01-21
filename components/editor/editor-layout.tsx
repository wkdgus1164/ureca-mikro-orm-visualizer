"use client"

/**
 * 에디터 3-패널 레이아웃 컴포넌트
 *
 * 피그마 스타일의 레이아웃:
 * - 좌측: 노드 목록 (NodeListPanel)
 * - 중앙: ReactFlow 캔버스 (EditorCanvas)
 * - 우측: 프로퍼티 편집 (PropertySidebar)
 */

import { EditorCanvas } from "@/components/editor/canvas/editor-canvas"
import { NodeListPanel } from "@/components/editor/panels/node-list-panel"
import { PropertySidebar } from "@/components/editor/panels/property-sidebar"
import { EntityEditContent } from "@/components/editor/panels/entity-edit-panel"
import { EnumEditContent } from "@/components/editor/panels/enum-edit-panel"
import { RelationshipEditContent } from "@/components/editor/panels/relationship-edit-panel"
import { useEditorContext } from "@/components/providers/editor-provider"

/**
 * 에디터 3-패널 레이아웃
 *
 * 좌측 사이드바, 중앙 캔버스, 우측 프로퍼티 패널로 구성
 */
export function EditorLayout() {
  const {
    uiState,
    closeRightPanel,
    getSelectedNode,
    getSelectedEnum,
    getSelectedEdge,
  } = useEditorContext()

  const selectedNode = getSelectedNode()
  const selectedEnum = getSelectedEnum()
  const selectedEdge = getSelectedEdge()

  // 선택된 요소에 따른 타이틀/설명 결정
  let title = "Properties"
  let description: string | undefined
  let content: React.ReactNode = null

  if (uiState.selection.type === "node") {
    if (selectedEnum) {
      title = "Edit Enum"
      description = "Define enum values for TypeScript generation"
      content = <EnumEditContent />
    } else if (selectedNode) {
      title = "Edit Entity"
      description = "Modify the entity properties and settings"
      content = <EntityEditContent />
    }
  } else if (uiState.selection.type === "edge" && selectedEdge) {
    title = "Edit Relationship"
    description = "Configure the relationship between entities"
    content = <RelationshipEditContent />
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 좌측 사이드바 - 노드 목록 */}
      <NodeListPanel className="w-60" />

      {/* 중앙 캔버스 */}
      <div className="flex-1 min-w-0">
        <EditorCanvas />
      </div>

      {/* 우측 사이드바 - 프로퍼티 편집 */}
      <PropertySidebar
        isOpen={uiState.isRightPanelOpen}
        onClose={closeRightPanel}
        title={title}
        description={description}
      >
        {content}
      </PropertySidebar>
    </div>
  )
}
