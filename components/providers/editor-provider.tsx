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
 * Accesses the editor state provided by the nearest EditorProvider.
 *
 * @returns The shared editor state (`UseEditorReturn`) from context.
 * @throws Error if called outside of an EditorProvider
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
 * Provides editor state to descendant components via EditorContext.
 *
 * @param children - The React nodes rendered inside the provider
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
 * Provides editor state and React Flow context to descendant components.
 *
 * Composes ReactFlowProvider and the internal EditorContextProvider so children can access the shared editor state and React Flow APIs.
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