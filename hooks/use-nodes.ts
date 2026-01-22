"use client"

/**
 * 노드 관리 전용 훅
 *
 * Entity, Embeddable, Enum 노드의 CRUD 작업을 담당
 * 제네릭 패턴으로 중복 코드 최소화
 */

import { useCallback } from "react"
import { useNodesState, type NodeChange } from "@xyflow/react"
import { generateId } from "@/lib/utils"
import type {
  EntityNode,
  EntityData,
  EmbeddableNode,
  EmbeddableData,
  EnumNode,
  EnumData,
  InterfaceNode,
  InterfaceData,
  NodeKind,
} from "@/types/entity"
import {
  createDefaultEntity,
  createDefaultEmbeddable,
  createDefaultEnum,
  createDefaultInterface,
} from "@/types/entity"

// =============================================================================
// 타입 정의
// =============================================================================

/**
 * ReactFlow 노드 타입 (Entity, Embeddable, Enum, 또는 Interface)
 */
export type FlowNode = (EntityNode | EmbeddableNode | EnumNode | InterfaceNode) & {
  selected?: boolean
  dragging?: boolean
}

/**
 * 노드 데이터 타입 (EntityData | EmbeddableData | EnumData | InterfaceData)
 */
type NodeData = EntityData | EmbeddableData | EnumData | InterfaceData

/**
 * 노드 팩토리 함수 타입
 */
type NodeFactory<T extends FlowNode> = (
  id: string,
  position: { x: number; y: number }
) => T

/**
 * 노드 설정 정보
 */
interface NodeConfig<T extends FlowNode> {
  /** 노드 타입 */
  type: NodeKind
  /** 기본 이름 */
  baseName: string
  /** 노드 생성 팩토리 함수 */
  factory: NodeFactory<T>
}

// =============================================================================
// 노드 타입별 설정
// =============================================================================

const NODE_CONFIGS: {
  entity: NodeConfig<EntityNode>
  embeddable: NodeConfig<EmbeddableNode>
  enum: NodeConfig<EnumNode>
  interface: NodeConfig<InterfaceNode>
} = {
  entity: {
    type: "entity",
    baseName: "NewEntity",
    factory: createDefaultEntity,
  },
  embeddable: {
    type: "embeddable",
    baseName: "NewEmbeddable",
    factory: createDefaultEmbeddable,
  },
  enum: {
    type: "enum",
    baseName: "NewEnum",
    factory: createDefaultEnum,
  },
  interface: {
    type: "interface",
    baseName: "NewInterface",
    factory: createDefaultInterface,
  },
}

// =============================================================================
// 유틸리티 함수
// =============================================================================

/**
 * Produce a unique name by appending a numeric suffix when needed.
 */
function generateUniqueName(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) {
    return baseName
  }

  const pattern = new RegExp(`^${baseName}(?: (\\d+))?$`)
  let maxNumber = 0

  existingNames.forEach((name) => {
    const match = name.match(pattern)
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 0
      if (num > maxNumber) {
        maxNumber = num
      }
    }
  })

  return `${baseName} ${maxNumber + 1}`
}

/**
 * 랜덤 기본 위치 생성
 */
function getDefaultPosition(): { x: number; y: number } {
  return {
    x: 100 + Math.random() * 200,
    y: 100 + Math.random() * 200,
  }
}

// =============================================================================
// useNodes 훅
// =============================================================================

/**
 * useNodes 훅 반환 타입
 */
export interface UseNodesReturn {
  /** 노드 목록 */
  nodes: FlowNode[]
  /** 노드 목록 설정 */
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>
  /** 노드 변경 핸들러 */
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void
  /** Entity 노드 추가 */
  addEntity: (position?: { x: number; y: number }) => void
  /** Entity 노드 업데이트 */
  updateEntity: (id: string, data: Partial<EntityData>) => void
  /** Embeddable 노드 추가 */
  addEmbeddable: (position?: { x: number; y: number }) => void
  /** Embeddable 노드 업데이트 */
  updateEmbeddable: (id: string, data: Partial<EmbeddableData>) => void
  /** Enum 노드 추가 */
  addEnum: (position?: { x: number; y: number }) => void
  /** Enum 노드 업데이트 */
  updateEnum: (id: string, data: Partial<EnumData>) => void
  /** Interface 노드 추가 */
  addInterface: (position?: { x: number; y: number }) => void
  /** Interface 노드 업데이트 */
  updateInterface: (id: string, data: Partial<InterfaceData>) => void
  /** 노드 삭제 (타입 무관) */
  deleteNode: (id: string) => void
  /** 모든 Enum 노드 가져오기 */
  getAllEnums: () => EnumNode[]
}

/**
 * 노드 관리 전용 훅 (CRUD)
 *
 * Entity, Embeddable, Enum 노드의 추가/수정/삭제를 관리합니다.
 * 제네릭 패턴으로 중복 코드를 최소화했습니다.
 */
export function useNodes(): UseNodesReturn {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])

  // ===========================================================================
  // 제네릭 노드 추가 함수
  // ===========================================================================

  /**
   * 제네릭 노드 추가 함수
   *
   * @param config - 노드 설정 (타입, 기본이름, 팩토리)
   * @param position - 노드 위치 (선택적)
   */
  const addNode = useCallback(
    <T extends FlowNode>(
      config: NodeConfig<T>,
      position?: { x: number; y: number }
    ) => {
      const id = generateId()
      const nodePosition = position ?? getDefaultPosition()
      const newNode = config.factory(id, nodePosition)

      setNodes((nds) => {
        const existingNames = nds
          .filter((n) => n.type === config.type)
          .map((n) => n.data.name)

        const uniqueName = generateUniqueName(config.baseName, existingNames)

        return [
          ...nds,
          {
            ...newNode,
            data: { ...newNode.data, name: uniqueName },
          } as FlowNode,
        ]
      })
    },
    [setNodes]
  )

  // ===========================================================================
  // 제네릭 노드 업데이트 함수
  // ===========================================================================

  /**
   * 제네릭 노드 업데이트 함수
   *
   * @param id - 노드 ID
   * @param data - 업데이트할 데이터
   */
  const updateNode = useCallback(
    <T extends NodeData>(id: string, data: Partial<T>) => {
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

  // ===========================================================================
  // 타입별 래퍼 함수
  // ===========================================================================

  const addEntity = useCallback(
    (position?: { x: number; y: number }) =>
      addNode(NODE_CONFIGS.entity, position),
    [addNode]
  )

  const addEmbeddable = useCallback(
    (position?: { x: number; y: number }) =>
      addNode(NODE_CONFIGS.embeddable, position),
    [addNode]
  )

  const addEnum = useCallback(
    (position?: { x: number; y: number }) =>
      addNode(NODE_CONFIGS.enum, position),
    [addNode]
  )

  const updateEntity = useCallback(
    (id: string, data: Partial<EntityData>) => updateNode(id, data),
    [updateNode]
  )

  const updateEmbeddable = useCallback(
    (id: string, data: Partial<EmbeddableData>) => updateNode(id, data),
    [updateNode]
  )

  const updateEnum = useCallback(
    (id: string, data: Partial<EnumData>) => updateNode(id, data),
    [updateNode]
  )

  const addInterface = useCallback(
    (position?: { x: number; y: number }) =>
      addNode(NODE_CONFIGS.interface, position),
    [addNode]
  )

  const updateInterface = useCallback(
    (id: string, data: Partial<InterfaceData>) => updateNode(id, data),
    [updateNode]
  )

  // ===========================================================================
  // 기타 함수
  // ===========================================================================

  /**
   * 노드 삭제 (타입 무관)
   */
  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id))
    },
    [setNodes]
  )

  /**
   * 모든 Enum 노드 가져오기
   */
  const getAllEnums = useCallback((): EnumNode[] => {
    return nodes.filter((n) => n.type === "enum") as EnumNode[]
  }, [nodes])

  // ===========================================================================
  // 반환
  // ===========================================================================

  return {
    nodes,
    setNodes,
    onNodesChange,
    addEntity,
    updateEntity,
    addEmbeddable,
    updateEmbeddable,
    addEnum,
    updateEnum,
    addInterface,
    updateInterface,
    deleteNode,
    getAllEnums,
  }
}
