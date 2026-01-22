/**
 * 루트 라우트 페이지
 *
 * MikroORM Entity 비주얼 에디터 메인 페이지
 * 피그마 스타일의 3-패널 레이아웃:
 * - 좌측: 노드 목록
 * - 중앙: ReactFlow 캔버스
 * - 우측: 프로퍼티 편집 패널
 */

import { EditorProvider } from "@/components/providers/editor-provider"
import { EditorToolbar } from "@/components/editor/toolbar/editor-toolbar"
import { EditorLayout } from "@/components/editor/editor-layout"
import { ExportModalWrapper } from "@/components/export/export-modal-wrapper"

export const metadata = {
  title: { absolute: "MikroORM Visualizer" },
  description: "Visual editor for designing MikroORM entities",
}

/**
 * Root editor page that provides editor context and renders the editor UI.
 *
 * Renders an EditorProvider that wraps the main editor surface, including the top toolbar,
 * the three-panel editor layout (left node list, center canvas, right properties), and the export modal.
 *
 * @returns The React element for the editor page: an EditorProvider wrapping the main editor structure.
 */
export default function EditorPage() {
  return (
    <EditorProvider>
      <main className="h-screen w-full overflow-hidden flex flex-col">
        {/* 툴바 */}
        <EditorToolbar />

        {/* 3-패널 레이아웃 (좌측 목록 + 중앙 캔버스 + 우측 프로퍼티) */}
        <EditorLayout />

        {/* Export 모달 */}
        <ExportModalWrapper />
      </main>
    </EditorProvider>
  )
}