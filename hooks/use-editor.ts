"use client"

/**
 * 에디터 전역 상태 관리 훅
 *
 * ReactFlow의 노드/엣지 상태와 에디터 UI 상태를 통합 관리
 * use-nodes, use-edges, use-editor-ui 훅을 조합하여 통합 인터페이스 제공
 */

import { useCallback } from "react"
import type { NodeChange, EdgeChange, Connection } from "@xyflow/react"
import type {
  EntityNode,
  EntityData,
  EmbeddableData,
  EnumNode,
  EnumData,
} from "@/types/entity"
import type { RelationshipEdge, RelationshipData } from "@/types/relationship"
import type { Selection, EditorUIState, PendingAddType } from "@/types/editor"
import { useNodes, type FlowNode } from "@/hooks/use-nodes"
import { useEdges, type FlowEdge } from "@/hooks/use-edges"
import { useEditorUI } from "@/hooks/use-editor-ui"

// 타입 재export (외부 사용을 위해)
export type { FlowNode } from "@/hooks/use-nodes"
export type { FlowEdge } from "@/hooks/use-edges"

/**
 * 노드 타입별 예상 크기 (중앙 정렬용 오프셋 계산에 사용)
 */
const NODE_SIZE_ESTIMATES = {
  entity: { width: 180, height: 80 },
  embeddable: { width: 180, height: 80 },
  enum: { width: 180, height: 80 },
} as const

/**
 * useEditor 훅 반환 타입
 */
export interface UseEditorReturn {
  /** Entity 노드 목록 */
  nodes: FlowNode[]
  /** Relationship 엣지 목록 */
  edges: FlowEdge[]
  /** 노드 변경 핸들러 */
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  /** 엣지 변경 핸들러 */
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  /** 연결 핸들러 */
  onConnect: (connection: Connection) => void
  /** UI 상태 */
  uiState: EditorUIState
  /** Entity 노드 추가 */
  addEntity: (position?: { x: number; y: number }) => void
  /** Entity 노드 업데이트 */
  updateEntity: (id: string, data: Partial<EntityData>) => void
  /** Entity 노드 삭제 */
  deleteEntity: (id: string) => void
  /** Embeddable 노드 추가 */
  addEmbeddable: (position?: { x: number; y: number }) => void
  /** Embeddable 노드 업데이트 */
  updateEmbeddable: (id: string, data: Partial<EmbeddableData>) => void
  /** Embeddable 노드 삭제 */
  deleteEmbeddable: (id: string) => void
  /** Enum 노드 추가 */
  addEnum: (position?: { x: number; y: number }) => void
  /** Enum 노드 업데이트 */
  updateEnum: (id: string, data: Partial<EnumData>) => void
  /** Enum 노드 삭제 */
  deleteEnum: (id: string) => void
  /** Relationship 엣지 업데이트 */
  updateRelationship: (id: string, data: Partial<RelationshipData>) => void
  /** Relationship 엣지 삭제 */
  deleteRelationship: (id: string) => void
  /** 선택 상태 설정 */
  setSelection: (selection: Selection) => void
  /** 우측 패널 열림/닫힘 토글 */
  toggleRightPanel: () => void
  /** 우측 패널 닫기 */
  closeRightPanel: () => void
  /** 연결 모드 토글 */
  toggleConnecting: () => void
  /** Export 모달 열림/닫힘 토글 */
  toggleExportModal: () => void
  /** 선택된 노드 가져오기 */
  getSelectedNode: () => EntityNode | null
  /** 선택된 Enum 노드 가져오기 */
  getSelectedEnum: () => EnumNode | null
  /** 선택된 엣지 가져오기 */
  getSelectedEdge: () => RelationshipEdge | null
  /** 다이어그램 불러오기 (노드/엣지 전체 교체) */
  loadDiagram: (nodes: FlowNode[], edges: FlowEdge[]) => void
  /** 다이어그램 초기화 (모든 노드/엣지 삭제) */
  clearDiagram: () => void
  /** 모든 Enum 노드 가져오기 (Property Form에서 참조용) */
  getAllEnums: () => EnumNode[]
  /** 노드 추가 대기 모드 시작 (Ghost 노드 미리보기) */
  startPendingAdd: (type: PendingAddType) => void
  /** 노드 추가 대기 모드 취소 */
  cancelPendingAdd: () => void
  /** Ghost 노드용 마우스 위치 업데이트 */
  updateMousePosition: (position: { x: number; y: number } | null) => void
  /** 대기 중인 노드를 해당 위치에 생성 */
  finalizePendingAdd: (position: { x: number; y: number }) => void
  /** 노드 목록 직접 설정 (캔버스 동기화용) */
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>
}

/**
 * 에디터 전역 상태 관리 훅 (통합)
 *
 * use-nodes, use-edges, use-editor-ui 훅을 조합하여
 * 에디터의 모든 상태와 동작을 통합된 인터페이스로 제공합니다.
 */
export function useEditor(): UseEditorReturn {
  // 하위 훅들 사용
  const nodeOps = useNodes()
  const edgeOps = useEdges()
  const uiOps = useEditorUI()

  // ============================================================================
  // 노드 삭제 (엣지도 함께 삭제)
  // ============================================================================

  /**
   * Entity 노드 삭제
   */
  const deleteEntity = useCallback(
    (id: string) => {
      nodeOps.deleteNode(id)
      edgeOps.deleteEdgesByNodeId(id)
    },
    [nodeOps, edgeOps]
  )

  /**
   * Embeddable 노드 삭제
   */
  const deleteEmbeddable = useCallback(
    (id: string) => {
      nodeOps.deleteNode(id)
      edgeOps.deleteEdgesByNodeId(id)
    },
    [nodeOps, edgeOps]
  )

  /**
   * Enum 노드 삭제
   */
  const deleteEnum = useCallback(
    (id: string) => {
      nodeOps.deleteNode(id)
      edgeOps.deleteEdgesByNodeId(id)
    },
    [nodeOps, edgeOps]
  )

  // ============================================================================
  // Pending Add 완료 (Ghost → 실제 노드)
  // ============================================================================

  /**
   * 대기 중인 노드를 해당 위치에 생성
   */
  const finalizePendingAdd = useCallback(
    (position: { x: number; y: number }) => {
      const pendingType = uiOps.uiState.pendingAdd
      if (!pendingType) return

      // 노드 중앙이 클릭 위치에 오도록 오프셋 적용
      const size = NODE_SIZE_ESTIMATES[pendingType]
      const centeredPosition = {
        x: position.x - size.width / 2,
        y: position.y - size.height / 2,
      }

      // 타입에 따라 해당 노드 추가
      switch (pendingType) {
        case "entity":
          nodeOps.addEntity(centeredPosition)
          break
        case "embeddable":
          nodeOps.addEmbeddable(centeredPosition)
          break
        case "enum":
          nodeOps.addEnum(centeredPosition)
          break
      }

      // 대기 모드 종료
      uiOps.cancelPendingAdd()
    },
    [nodeOps, uiOps]
  )

  // ============================================================================
  // 선택 상태 Getter
  // ============================================================================

  /**
   * 선택된 노드 가져오기 (Entity 타입만 반환)
   */
  const getSelectedNode = useCallback((): EntityNode | null => {
    if (uiOps.uiState.selection.type !== "node" || !uiOps.uiState.selection.id) {
      return null
    }
    const node = nodeOps.nodes.find((n) => n.id === uiOps.uiState.selection.id)
    if (node?.type === "entity") {
      return node as EntityNode
    }
    return null
  }, [nodeOps.nodes, uiOps.uiState.selection])

  /**
   * 선택된 엣지 가져오기
   */
  const getSelectedEdge = useCallback((): RelationshipEdge | null => {
    if (uiOps.uiState.selection.type !== "edge" || !uiOps.uiState.selection.id) {
      return null
    }
    return (
      (edgeOps.edges.find(
        (edge) => edge.id === uiOps.uiState.selection.id
      ) as RelationshipEdge) ?? null
    )
  }, [edgeOps.edges, uiOps.uiState.selection])

  /**
   * 선택된 Enum 노드 가져오기
   */
  const getSelectedEnum = useCallback((): EnumNode | null => {
    if (uiOps.uiState.selection.type !== "node" || !uiOps.uiState.selection.id) {
      return null
    }
    const node = nodeOps.nodes.find((n) => n.id === uiOps.uiState.selection.id)
    if (node?.type === "enum") {
      return node as EnumNode
    }
    return null
  }, [nodeOps.nodes, uiOps.uiState.selection])

  // ============================================================================
  // 다이어그램 작업
  // ============================================================================

  /**
   * 다이어그램 불러오기 (노드/엣지 전체 교체)
   */
  const loadDiagram = useCallback(
    (newNodes: FlowNode[], newEdges: FlowEdge[]) => {
      nodeOps.setNodes(newNodes)
      edgeOps.setEdges(newEdges)
      uiOps.closeRightPanel()
    },
    [nodeOps, edgeOps, uiOps]
  )

  /**
   * 다이어그램 초기화 (모든 노드/엣지 삭제)
   */
  const clearDiagram = useCallback(() => {
    nodeOps.setNodes([])
    edgeOps.setEdges([])
    uiOps.closeRightPanel()
  }, [nodeOps, edgeOps, uiOps])

  // ============================================================================
  // 통합 인터페이스 반환
  // ============================================================================

  return {
    // 노드 관련
    nodes: nodeOps.nodes,
    onNodesChange: nodeOps.onNodesChange,
    addEntity: nodeOps.addEntity,
    updateEntity: nodeOps.updateEntity,
    deleteEntity,
    addEmbeddable: nodeOps.addEmbeddable,
    updateEmbeddable: nodeOps.updateEmbeddable,
    deleteEmbeddable,
    addEnum: nodeOps.addEnum,
    updateEnum: nodeOps.updateEnum,
    deleteEnum,
    getAllEnums: nodeOps.getAllEnums,
    setNodes: nodeOps.setNodes,

    // 엣지 관련
    edges: edgeOps.edges,
    onEdgesChange: edgeOps.onEdgesChange,
    onConnect: edgeOps.onConnect,
    updateRelationship: edgeOps.updateRelationship,
    deleteRelationship: edgeOps.deleteRelationship,

    // UI 관련
    uiState: uiOps.uiState,
    setSelection: uiOps.setSelection,
    toggleRightPanel: uiOps.toggleRightPanel,
    closeRightPanel: uiOps.closeRightPanel,
    toggleConnecting: uiOps.toggleConnecting,
    toggleExportModal: uiOps.toggleExportModal,
    startPendingAdd: uiOps.startPendingAdd,
    cancelPendingAdd: uiOps.cancelPendingAdd,
    updateMousePosition: uiOps.updateMousePosition,

    // 선택 상태 getter
    getSelectedNode,
    getSelectedEnum,
    getSelectedEdge,

    // 다이어그램 작업
    loadDiagram,
    clearDiagram,

    // Pending add
    finalizePendingAdd,
  }
}
