"use client"

/**
 * Export 모달 래퍼 컴포넌트
 *
 * EditorContext의 상태와 ExportModal을 연결
 */

import { useEditorContext } from "@/components/providers/editor-provider"
import { ExportModal } from "./export-modal"

/**
 * Export 모달 래퍼
 *
 * Context의 isExportModalOpen 상태와 toggleExportModal을 사용하여
 * ExportModal을 제어
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
