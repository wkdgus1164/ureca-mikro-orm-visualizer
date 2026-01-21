"use client"

/**
 * 엣지 관리 전용 훅
 *
 * Relationship 엣지의 CRUD 작업을 담당
 */

import { useCallback } from "react"
import {
  useEdgesState,
  addEdge,
  type Connection,
  type EdgeChange,
} from "@xyflow/react"
import { generateId } from "@/lib/utils"
import type { RelationshipEdge, RelationshipData } from "@/types/relationship"
import { RelationType, FetchType } from "@/types/relationship"

/**
 * ReactFlow 엣지 타입
 */
export type FlowEdge = RelationshipEdge & {
  selected?: boolean
}

/**
 * useEdges 훅 반환 타입
 */
export interface UseEdgesReturn {
  /** 엣지 목록 */
  edges: FlowEdge[]
  /** 엣지 목록 설정 */
  setEdges: React.Dispatch<React.SetStateAction<FlowEdge[]>>
  /** 엣지 변경 핸들러 */
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void
  /** 연결 핸들러 */
  onConnect: (connection: Connection) => void
  /** Relationship 엣지 업데이트 */
  updateRelationship: (id: string, data: Partial<RelationshipData>) => void
  /** Relationship 엣지 삭제 */
  deleteRelationship: (id: string) => void
  /** 특정 노드와 연결된 모든 엣지 삭제 */
  deleteEdgesByNodeId: (nodeId: string) => void
}

/**
 * 엣지 관리 전용 훅 (CRUD)
 *
 * Relationship 엣지의 추가/수정/삭제를 관리합니다.
 */
export function useEdges(): UseEdgesReturn {
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])

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
   * 특정 노드와 연결된 모든 엣지 삭제
   */
  const deleteEdgesByNodeId = useCallback(
    (nodeId: string) => {
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      )
    },
    [setEdges]
  )

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    updateRelationship,
    deleteRelationship,
    deleteEdgesByNodeId,
  }
}
