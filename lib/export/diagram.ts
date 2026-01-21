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
 * Create a serializable DiagramFile from node and edge lists.
 *
 * Nodes and edges are normalized by removing transient UI state (e.g., selection or dragging)
 * before being stored in the file metadata.
 *
 * @param nodes - Array of diagram nodes; transient UI state will be stripped
 * @param edges - Array of relationship edges; transient UI state will be stripped
 * @param name - Optional diagram name to include in the file metadata
 * @returns A DiagramFile containing the version, metadata (createdAt, updatedAt, name), and cleaned nodes and edges
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
 * Convert a DiagramFile into a human-readable JSON string.
 *
 * @returns A JSON string representation of the DiagramFile formatted with 2-space indentation
 */
export function stringifyDiagramFile(file: DiagramFile): string {
  return JSON.stringify(file, null, 2)
}

/**
 * Trigger a browser download of the diagram as a `.mikro-diagram.json` file.
 *
 * @param nodes - Diagram nodes to include in the exported file
 * @param edges - Diagram edges to include in the exported file
 * @param filename - Base filename to use for the download (without extension)
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
 * Parse a JSON string into a DiagramFile and validate its structure.
 *
 * Validates top-level object shape and the presence/types of `version`, `nodes`, and `edges`,
 * and ensures each node and edge conforms to expected schemas.
 *
 * @param jsonString - JSON text representing a serialized diagram file
 * @returns A LoadDiagramResult: `success: true` with `data` containing the parsed `DiagramFile` when valid; `success: false` with `error` describing the validation or parse failure otherwise
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
    const hasInvalidNode = (file.nodes as unknown[]).some(
      (node) => !isValidNode(node)
    )
    if (hasInvalidNode) {
      return { success: false, error: "Invalid node structure detected" }
    }

    // 엣지 유효성 검증
    const hasInvalidEdge = (file.edges as unknown[]).some(
      (edge) => !isValidEdge(edge)
    )
    if (hasInvalidEdge) {
      return { success: false, error: "Invalid edge structure detected" }
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
 * Checks whether a value conforms to the expected diagram node shape.
 *
 * @param node - The value to validate as a diagram node
 * @returns `true` if `node` has a string `id`, a string `type`, and non-null object `position` and `data`, `false` otherwise
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
 * Check whether a value conforms to the required relationship edge structure.
 *
 * @param edge - The value to validate as an edge object
 * @returns `true` if `edge` is an object with string `id`, `source`, and `target`; `false` otherwise
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
 * Load a diagram from a File object and parse it into a DiagramFile structure.
 *
 * @param file - The input File to read and parse
 * @returns A LoadDiagramResult containing `data` with the parsed DiagramFile on success, or `error` with a message on failure
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