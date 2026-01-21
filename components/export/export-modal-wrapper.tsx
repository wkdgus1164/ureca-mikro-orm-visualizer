"use client"

/**
 * Export 모달 래퍼 컴포넌트
 *
 * EditorContext의 상태와 ExportModal을 연결
 */

import { useEditorContext } from "@/components/providers/editor-provider"
import { ExportModal } from "./export-modal"

/**
 * Connects editor context modal state to the ExportModal component.
 *
 * Renders ExportModal with its `isOpen` driven by the editor UI state and `onClose` bound to the context's toggle handler.
 *
 * @returns The ExportModal component with visibility and close behavior bound to the editor context.
 *
 * @example
 * ```tsx
 * <EditorProvider>
 *   <EditorCanvas />
 *   <ExportModalWrapper />
 * </EditorProvider>
 * ```
 */
export function ExportModalWrapper() {
  const { uiState, toggleExportModal } = useEditorContext()

  return (
    <ExportModal
      isOpen={uiState.isExportModalOpen}
      onClose={toggleExportModal}
    />
  )
}