/**
 * 다이어그램 저장/불러오기 유틸리티
 *
 * 현재 다이어그램 상태를 JSON 파일로 저장하고 불러오기
 * Phase 2: 다이어그램 저장/불러오기 기능
 */

import type { DiagramNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"

/**
 * 다이어그램 파일 버전
 */
export const DIAGRAM_VERSION = "1.0"

/**
 * 다이어그램 파일 확장자
 */
export const DIAGRAM_FILE_EXTENSION = ".mikro-diagram.json"

/**
 * 저장된 다이어그램 파일 형식
 */
export interface DiagramFile {
  /** 파일 형식 버전 */
  version: string
  /** 메타데이터 */
  metadata: {
    createdAt: string
    updatedAt: string
    name?: string
  }
  /** 노드 목록 */
  nodes: DiagramNode[]
  /** 엣지 목록 */
  edges: RelationshipEdge[]
}

/**
 * 불러오기 결과 타입
 */
export interface LoadDiagramResult {
  success: boolean
  data?: DiagramFile
  error?: string
}

/**
 * 다이어그램 데이터를 JSON 파일 형식으로 변환
 *
 * @param nodes - 노드 목록
 * @param edges - 엣지 목록
 * @param name - 다이어그램 이름 (선택)
 * @returns DiagramFile 객체
 */
export function createDiagramFile(
  nodes: DiagramNode[],
  edges: RelationshipEdge[],
  name?: string
): DiagramFile {
  const now = new Date().toISOString()

  // 노드에서 selected, dragging 등 임시 상태 제거
  const cleanNodes = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  })) as DiagramNode[]

  // 엣지에서 selected 등 임시 상태 제거
  const cleanEdges = edges.map((edge) => ({
    id: edge.id,
    type: edge.type,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: edge.data,
  })) as RelationshipEdge[]

  return {
    version: DIAGRAM_VERSION,
    metadata: {
      createdAt: now,
      updatedAt: now,
      name,
    },
    nodes: cleanNodes,
    edges: cleanEdges,
  }
}

/**
 * DiagramFile을 JSON 문자열로 변환
 *
 * @param file - DiagramFile 객체
 * @returns 포맷된 JSON 문자열
 */
export function stringifyDiagramFile(file: DiagramFile): string {
  return JSON.stringify(file, null, 2)
}

/**
 * 다이어그램을 JSON 파일로 다운로드
 *
 * @param nodes - 노드 목록
 * @param edges - 엣지 목록
 * @param filename - 파일명 (확장자 제외)
 */
export function downloadDiagram(
  nodes: DiagramNode[],
  edges: RelationshipEdge[],
  filename: string = "diagram"
): void {
  const diagramFile = createDiagramFile(nodes, edges, filename)
  const jsonString = stringifyDiagramFile(diagramFile)

  const blob = new Blob([jsonString], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.download = `${filename}${DIAGRAM_FILE_EXTENSION}`
  link.href = url

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * JSON 문자열을 DiagramFile로 파싱
 *
 * @param jsonString - JSON 문자열
 * @returns 파싱 결과
 */
export function parseDiagramFile(jsonString: string): LoadDiagramResult {
  try {
    const data = JSON.parse(jsonString) as unknown

    // 기본 구조 검증
    if (typeof data !== "object" || data === null) {
      return { success: false, error: "Invalid JSON structure" }
    }

    const file = data as Record<string, unknown>

    // version 필드 검증
    if (typeof file.version !== "string") {
      return { success: false, error: "Missing or invalid version field" }
    }

    // nodes 필드 검증
    if (!Array.isArray(file.nodes)) {
      return { success: false, error: "Missing or invalid nodes field" }
    }

    // edges 필드 검증
    if (!Array.isArray(file.edges)) {
      return { success: false, error: "Missing or invalid edges field" }
    }

    // 노드 유효성 검증
    for (const node of file.nodes) {
      if (!isValidNode(node)) {
        return { success: false, error: "Invalid node structure detected" }
      }
    }

    // 엣지 유효성 검증
    for (const edge of file.edges) {
      if (!isValidEdge(edge)) {
        return { success: false, error: "Invalid edge structure detected" }
      }
    }

    return {
      success: true,
      data: file as unknown as DiagramFile,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse JSON"
    return { success: false, error: message }
  }
}

/**
 * 노드 유효성 검증
 */
function isValidNode(node: unknown): boolean {
  if (typeof node !== "object" || node === null) return false

  const n = node as Record<string, unknown>

  return (
    typeof n.id === "string" &&
    typeof n.type === "string" &&
    typeof n.position === "object" &&
    n.position !== null &&
    typeof n.data === "object" &&
    n.data !== null
  )
}

/**
 * 엣지 유효성 검증
 */
function isValidEdge(edge: unknown): boolean {
  if (typeof edge !== "object" || edge === null) return false

  const e = edge as Record<string, unknown>

  return (
    typeof e.id === "string" &&
    typeof e.source === "string" &&
    typeof e.target === "string"
  )
}

/**
 * 파일 입력으로부터 다이어그램 불러오기
 *
 * @param file - 파일 객체
 * @returns Promise<LoadDiagramResult>
 */
export async function loadDiagramFromFile(
  file: File
): Promise<LoadDiagramResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content !== "string") {
        resolve({ success: false, error: "Failed to read file content" })
        return
      }

      resolve(parseDiagramFile(content))
    }

    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file" })
    }

    reader.readAsText(file)
  })
}
