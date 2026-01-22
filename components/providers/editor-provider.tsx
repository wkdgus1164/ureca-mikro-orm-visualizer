"use client"

/**
 * 에디터 상태 Provider
 *
 * useEditor 훅의 상태를 Context로 공유하여
 * 에디터 내 모든 컴포넌트에서 동일한 상태에 접근 가능
 *
 * localStorage를 통한 자동 저장/복원 기능 포함
 */

import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import { useEditor, type UseEditorReturn } from "@/hooks/use-editor"
import {
  saveDiagramToStorage,
  loadDiagramFromStorage,
  clearDiagramStorage,
} from "@/lib/storage/diagram-storage"
import type { DiagramNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"

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
 * 자동 저장 debounce 시간 (ms)
 */
const AUTOSAVE_DEBOUNCE_MS = 500

/**
 * Provides editor state to descendant components via EditorContext.
 *
 * 자동 저장/복원 기능:
 * - 마운트 시 localStorage에서 이전 작업 상태 복원
 * - 노드/엣지 변경 시 debounce로 자동 저장
 *
 * @param children - The React nodes rendered inside the provider
 */
function EditorContextProvider({ children }: EditorProviderProps) {
  const editorState = useEditor()
  const { nodes, edges, loadDiagram, clearDiagram } = editorState

  // 초기 로드 여부 추적 (복원 후 저장 방지)
  const isInitialLoadRef = useRef(true)
  // debounce 타이머 ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 마운트 시 localStorage에서 복원
   */
  useEffect(() => {
    const savedState = loadDiagramFromStorage()
    if (savedState && savedState.nodes.length > 0) {
      loadDiagram(savedState.nodes, savedState.edges as RelationshipEdge[])
    }
    // 초기 로드 완료 후 플래그 해제 (다음 렌더에서)
    const timer = setTimeout(() => {
      isInitialLoadRef.current = false
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 마운트 시 1회만 실행

  /**
   * 노드/엣지 변경 시 debounce로 자동 저장
   */
  useEffect(() => {
    // 초기 로드 중에는 저장하지 않음
    if (isInitialLoadRef.current) return

    // 기존 타이머 취소
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // debounce 저장
    saveTimerRef.current = setTimeout(() => {
      saveDiagramToStorage(nodes as DiagramNode[], edges as RelationshipEdge[])
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [nodes, edges])

  /**
   * clearDiagram 확장: localStorage도 함께 초기화
   */
  const clearDiagramWithStorage = useCallback(() => {
    clearDiagram()
    clearDiagramStorage()
  }, [clearDiagram])

  // 확장된 editorState 반환
  const extendedEditorState: UseEditorReturn = {
    ...editorState,
    clearDiagram: clearDiagramWithStorage,
  }

  return (
    <EditorContext.Provider value={extendedEditorState}>
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