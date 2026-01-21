"use client"

/**
 * 에디터 전역 상태 관리 훅
 *
 * ReactFlow의 노드/엣지 상태와 에디터 UI 상태를 통합 관리
 */

import { useCallback, useState } from "react"
import {
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeChange,
  type EdgeChange,
  addEdge,
} from "@xyflow/react"
import type {
  EntityNode,
  EntityData,
  EmbeddableNode,
  EmbeddableData,
  EnumNode,
  EnumData,
} from "@/types/entity"
import type { RelationshipEdge, RelationshipData } from "@/types/relationship"
import { RelationType, FetchType } from "@/types/relationship"
import {
  type Selection,
  type EditorUIState,
  INITIAL_UI_STATE,
} from "@/types/editor"
import { createDefaultEntity, createDefaultEmbeddable, createDefaultEnum } from "@/types/entity"

/**
 * ReactFlow 노드 타입 (내부 사용)
 * Entity, Embeddable, 또는 Enum 노드 모두 포함
 */
type FlowNode = (EntityNode | EmbeddableNode | EnumNode) & {
  selected?: boolean
  dragging?: boolean
}

/**
 * ReactFlow 엣지 타입 (내부 사용)
 */
type FlowEdge = RelationshipEdge & {
  selected?: boolean
}

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
  /** 패널 열림/닫힘 토글 */
  togglePanel: () => void
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
}

/**
 * UUID 생성 헬퍼
 */
function generateId(): string {
  return crypto.randomUUID()
}

/**
 * 에디터 상태 관리 훅
 *
 * @example
 * ```tsx
 * function EditorCanvas() {
 *   const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useEditor()
 *   return <ReactFlow nodes={nodes} edges={edges} ... />
 * }
 * ```
 */
export function useEditor(): UseEditorReturn {
  // ReactFlow 노드/엣지 상태
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])

  // UI 상태
  const [uiState, setUIState] = useState<EditorUIState>(INITIAL_UI_STATE)

  /**
   * 연결 핸들러 - 두 노드 연결 시 Relationship 엣지 생성
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return

      const newEdge: FlowEdge = {
        id: generateId(),
        type: "relationship",
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        data: {
          relationType: RelationType.OneToMany,
          sourceProperty: "items",
          isNullable: true,
          cascade: false,
          orphanRemoval: false,
          fetchType: FetchType.Lazy,
        },
      }

      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  /**
   * Entity 노드 추가
   */
  const addEntity = useCallback(
    (position?: { x: number; y: number }) => {
      const id = generateId()
      const defaultPosition = position ?? {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      }

      const newEntity = createDefaultEntity(id, defaultPosition)
      setNodes((nds) => [...nds, newEntity as FlowNode])
    },
    [setNodes]
  )

  /**
   * Entity 노드 업데이트
   */
  const updateEntity = useCallback(
    (id: string, data: Partial<EntityData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? ({ ...node, data: { ...node.data, ...data } } as FlowNode)
            : node
        )
      )
    },
    [setNodes]
  )

  /**
   * Entity 노드 삭제
   */
  const deleteEntity = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
      // 연관된 엣지도 삭제
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      )
    },
    [setNodes, setEdges]
  )

  /**
   * Embeddable 노드 추가
   */
  const addEmbeddable = useCallback(
    (position?: { x: number; y: number }) => {
      const id = generateId()
      const defaultPosition = position ?? {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      }

      const newEmbeddable = createDefaultEmbeddable(id, defaultPosition)
      setNodes((nds) => [...nds, newEmbeddable as FlowNode])
    },
    [setNodes]
  )

  /**
   * Embeddable 노드 업데이트
   */
  const updateEmbeddable = useCallback(
    (id: string, data: Partial<EmbeddableData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? ({ ...node, data: { ...node.data, ...data } } as FlowNode)
            : node
        )
      )
    },
    [setNodes]
  )

  /**
   * Embeddable 노드 삭제
   */
  const deleteEmbeddable = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
      // 연관된 엣지도 삭제
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      )
    },
    [setNodes, setEdges]
  )

  /**
   * Enum 노드 추가
   */
  const addEnum = useCallback(
    (position?: { x: number; y: number }) => {
      const id = generateId()
      const defaultPosition = position ?? {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      }

      const newEnum = createDefaultEnum(id, defaultPosition)
      setNodes((nds) => [...nds, newEnum as FlowNode])
    },
    [setNodes]
  )

  /**
   * Enum 노드 업데이트
   */
  const updateEnum = useCallback(
    (id: string, data: Partial<EnumData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? ({ ...node, data: { ...node.data, ...data } } as FlowNode)
            : node
        )
      )
    },
    [setNodes]
  )

  /**
   * Enum 노드 삭제
   */
  const deleteEnum = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
      // 연관된 엣지도 삭제
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      )
    },
    [setNodes, setEdges]
  )

  /**
   * Relationship 엣지 업데이트
   */
  const updateRelationship = useCallback(
    (id: string, data: Partial<RelationshipData>) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === id ? { ...edge, data: { ...edge.data, ...data } } : edge
        )
      )
    },
    [setEdges]
  )

  /**
   * Relationship 엣지 삭제
   */
  const deleteRelationship = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== id))
    },
    [setEdges]
  )

  /**
   * 선택 상태 설정
   */
  const setSelection = useCallback((selection: Selection) => {
    setUIState((prev) => ({
      ...prev,
      selection,
      isPanelOpen: selection.id !== null,
    }))
  }, [])

  /**
   * 패널 토글
   */
  const togglePanel = useCallback(() => {
    setUIState((prev) => ({ ...prev, isPanelOpen: !prev.isPanelOpen }))
  }, [])

  /**
   * 연결 모드 토글
   */
  const toggleConnecting = useCallback(() => {
    setUIState((prev) => ({ ...prev, isConnecting: !prev.isConnecting }))
  }, [])

  /**
   * Export 모달 토글
   */
  const toggleExportModal = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      isExportModalOpen: !prev.isExportModalOpen,
    }))
  }, [])

  /**
   * 선택된 노드 가져오기
   */
  const getSelectedNode = useCallback((): EntityNode | null => {
    if (uiState.selection.type !== "node" || !uiState.selection.id) return null
    return (
      (nodes.find((node) => node.id === uiState.selection.id) as EntityNode) ??
      null
    )
  }, [nodes, uiState.selection])

  /**
   * 선택된 엣지 가져오기
   */
  const getSelectedEdge = useCallback((): RelationshipEdge | null => {
    if (uiState.selection.type !== "edge" || !uiState.selection.id) return null
    return (
      (edges.find(
        (edge) => edge.id === uiState.selection.id
      ) as RelationshipEdge) ?? null
    )
  }, [edges, uiState.selection])

  /**
   * 선택된 Enum 노드 가져오기
   */
  const getSelectedEnum = useCallback((): EnumNode | null => {
    if (uiState.selection.type !== "node" || !uiState.selection.id) return null
    const node = nodes.find((n) => n.id === uiState.selection.id)
    if (node?.type === "enum") {
      return node as EnumNode
    }
    return null
  }, [nodes, uiState.selection])

  /**
   * 모든 Enum 노드 가져오기 (Property Form에서 참조용)
   */
  const getAllEnums = useCallback((): EnumNode[] => {
    return nodes.filter((n) => n.type === "enum") as EnumNode[]
  }, [nodes])

  /**
   * 다이어그램 불러오기 (노드/엣지 전체 교체)
   */
  const loadDiagram = useCallback(
    (newNodes: FlowNode[], newEdges: FlowEdge[]) => {
      setNodes(newNodes)
      setEdges(newEdges)
      // 선택 상태 초기화
      setUIState((prev) => ({
        ...prev,
        selection: { type: null, id: null },
        isPanelOpen: false,
      }))
    },
    [setNodes, setEdges]
  )

  /**
   * 다이어그램 초기화 (모든 노드/엣지 삭제)
   */
  const clearDiagram = useCallback(() => {
    setNodes([])
    setEdges([])
    // 선택 상태 초기화
    setUIState((prev) => ({
      ...prev,
      selection: { type: null, id: null },
      isPanelOpen: false,
    }))
  }, [setNodes, setEdges])

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    uiState,
    addEntity,
    updateEntity,
    deleteEntity,
    addEmbeddable,
    updateEmbeddable,
    deleteEmbeddable,
    addEnum,
    updateEnum,
    deleteEnum,
    updateRelationship,
    deleteRelationship,
    setSelection,
    togglePanel,
    toggleConnecting,
    toggleExportModal,
    getSelectedNode,
    getSelectedEnum,
    getSelectedEdge,
    loadDiagram,
    clearDiagram,
    getAllEnums,
  }
}
