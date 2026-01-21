/**
 * /editor 라우트 페이지
 *
 * MikroORM Entity 비주얼 에디터 메인 페이지
 */

import { EditorCanvas } from "@/components/editor/canvas/editor-canvas"

export const metadata = {
  title: "Editor | MikroORM Visualizer",
  description: "Visual editor for designing MikroORM entities",
}

export default function EditorPage() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <EditorCanvas />
    </main>
  )
}
