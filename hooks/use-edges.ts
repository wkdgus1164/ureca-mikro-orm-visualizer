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
import type {
  RelationshipEdge,
  RelationshipData,
  EnumMappingEdge,
  EnumMappingData,
} from "@/types/relationship"
import { RelationType, FetchType } from "@/types/relationship"

/**
 * ReactFlow 엣지 타입 (Relationship 또는 EnumMapping)
 */
export type FlowEdge = (RelationshipEdge | EnumMappingEdge) & {
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
  /** 기본 연결 핸들러 (Relationship 엣지 생성) */
  onConnect: (connection: Connection) => void
  /** Relationship 엣지 추가 */
  addRelationship: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => void
  /** Relationship 엣지 업데이트 */
  updateRelationship: (id: string, data: Partial<RelationshipData>) => void
  /** Relationship 엣지 삭제 */
  deleteRelationship: (id: string) => void
  /** EnumMapping 엣지 추가 */
  addEnumMapping: (entityId: string, enumId: string, sourceHandle?: string, targetHandle?: string) => void
  /** EnumMapping 엣지 업데이트 */
  updateEnumMapping: (id: string, data: Partial<EnumMappingData>) => void
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
   * 기본 연결 핸들러 - 두 노드 연결 시 Relationship 엣지 생성
   * (Entity ↔ Enum 연결은 useEditor에서 별도 처리)
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
   * Relationship 엣지 추가
   */
  const addRelationship = useCallback(
    (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
      const newEdge: FlowEdge = {
        id: generateId(),
        type: "relationship",
        source: sourceId,
        target: targetId,
        sourceHandle,
        targetHandle,
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
          edge.id === id && edge.type === "relationship"
            ? { ...edge, data: { ...edge.data, ...data } }
            : edge
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
   * EnumMapping 엣지 추가
   */
  const addEnumMapping = useCallback(
    (entityId: string, enumId: string, sourceHandle?: string, targetHandle?: string) => {
      const newEdge: FlowEdge = {
        id: generateId(),
        type: "enum-mapping",
        source: entityId,
        target: enumId,
        sourceHandle,
        targetHandle,
        data: {
          propertyId: null,
        },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  /**
   * EnumMapping 엣지 업데이트
   */
  const updateEnumMapping = useCallback(
    (id: string, data: Partial<EnumMappingData>) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === id && edge.type === "enum-mapping"
            ? { ...edge, data: { ...edge.data, ...data } }
            : edge
        )
      )
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
    addRelationship,
    updateRelationship,
    deleteRelationship,
    addEnumMapping,
    updateEnumMapping,
    deleteEdgesByNodeId,
  }
}
