/**
 * /editor 라우트 페이지
 *
 * MikroORM Entity 비주얼 에디터 메인 페이지
 */

import { EditorProvider } from "@/components/providers/editor-provider"
import { EditorCanvas } from "@/components/editor/canvas/editor-canvas"
import { EditorToolbar } from "@/components/editor/toolbar/editor-toolbar"

export const metadata = {
  title: "Editor | MikroORM Visualizer",
  description: "Visual editor for designing MikroORM entities",
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <main className="h-screen w-full overflow-hidden">
        {/* 툴바 */}
        <EditorToolbar />

        {/* 캔버스 (툴바 높이만큼 pt 추가) */}
        <div className="h-full pt-14">
          <EditorCanvas />
        </div>
      </main>
    </EditorProvider>
  )
}
