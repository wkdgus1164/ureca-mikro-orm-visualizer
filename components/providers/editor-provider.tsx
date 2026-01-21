"use client"

/**
 * 에디터 상태 Provider
 *
 * useEditor 훅의 상태를 Context로 공유하여
 * 에디터 내 모든 컴포넌트에서 동일한 상태에 접근 가능
 */

import { createContext, useContext, type ReactNode } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { useEditor, type UseEditorReturn } from "@/hooks/use-editor"

/**
 * 에디터 Context
 */
const EditorContext = createContext<UseEditorReturn | null>(null)

/**
 * 에디터 상태 사용 훅
 *
 * @throws Context 외부에서 호출 시 에러
 */
export function useEditorContext(): UseEditorReturn {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error("useEditorContext must be used within EditorProvider")
  }
  return context
}

interface EditorProviderProps {
  children: ReactNode
}

/**
 * 에디터 상태를 제공하는 내부 Provider
 */
function EditorContextProvider({ children }: EditorProviderProps) {
  const editorState = useEditor()

  return (
    <EditorContext.Provider value={editorState}>
      {children}
    </EditorContext.Provider>
  )
}

/**
 * 에디터 Provider 컴포넌트
 *
 * ReactFlowProvider와 EditorContext를 함께 제공
 *
 * @example
 * ```tsx
 * <EditorProvider>
 *   <EditorToolbar />
 *   <EditorCanvas />
 * </EditorProvider>
 * ```
 */
export function EditorProvider({ children }: EditorProviderProps) {
  return (
    <ReactFlowProvider>
      <EditorContextProvider>{children}</EditorContextProvider>
    </ReactFlowProvider>
  )
}
