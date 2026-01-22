/**
 * localStorage 기반 다이어그램 상태 저장/복원 유틸리티
 *
 * 브라우저 새로고침 시에도 작업 내용이 유지되도록 자동 저장
 */

import type { DiagramNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"

/**
 * localStorage 키
 */
export const DIAGRAM_STORAGE_KEY = "mikro-diagram-autosave"

/**
 * 저장되는 다이어그램 상태
 */
export interface StoredDiagramState {
  nodes: DiagramNode[]
  edges: RelationshipEdge[]
  savedAt: string
}

/**
 * 다이어그램 상태를 localStorage에 저장
 *
 * 노드/엣지에서 임시 UI 상태(selected, dragging)를 제거하고 저장
 */
export function saveDiagramToStorage(
  nodes: DiagramNode[],
  edges: RelationshipEdge[]
): void {
  // SSR 환경 체크
  if (typeof window === "undefined") return

  // 임시 UI 상태 제거
  const cleanNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  })) as DiagramNode[]

  const cleanEdges = edges.map((edge) => ({
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.data,
  })) as RelationshipEdge[]

  const state: StoredDiagramState = {
    nodes: cleanNodes,
    edges: cleanEdges,
    savedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(DIAGRAM_STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    // localStorage 용량 초과 등의 에러 처리
    console.warn("Failed to save diagram to localStorage:", error)
  }
}

/**
 * localStorage에서 다이어그램 상태 불러오기
 *
 * @returns 저장된 상태 또는 null (저장된 데이터가 없거나 파싱 실패 시)
 */
export function loadDiagramFromStorage(): StoredDiagramState | null {
  // SSR 환경 체크
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(DIAGRAM_STORAGE_KEY)
    if (!stored) return null

    const state = JSON.parse(stored) as unknown

    // 기본 구조 검증
    if (typeof state !== "object" || state === null) return null

    const data = state as Record<string, unknown>

    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return null
    }

    return data as unknown as StoredDiagramState
  } catch (error) {
    console.warn("Failed to load diagram from localStorage:", error)
    return null
  }
}

/**
 * localStorage에서 저장된 다이어그램 삭제 (초기화)
 */
export function clearDiagramStorage(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(DIAGRAM_STORAGE_KEY)
  } catch (error) {
    console.warn("Failed to clear diagram storage:", error)
  }
}

/**
 * localStorage에 저장된 다이어그램이 있는지 확인
 */
export function hasSavedDiagram(): boolean {
  if (typeof window === "undefined") return false

  return localStorage.getItem(DIAGRAM_STORAGE_KEY) !== null
}
