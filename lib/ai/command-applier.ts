/**
 * Tool 커맨드 적용 로직
 *
 * Domain Layer - 커맨드를 에디터 상태에 적용하는 순수 함수들
 * use-tool-executor.ts에서 분리하여 테스트 용이성 향상
 */

import type { ToolCommand } from "@/lib/ai/tool-executor"
import type { EntityProperty, EnumValue, InterfaceMethod } from "@/types/entity"
import type { RelationType } from "@/types/relationship"
import type { FlowNode } from "@/hooks/use-nodes"
import type { FlowEdge } from "@/hooks/use-edges"

// ============================================
// 에디터 액션 인터페이스
// ============================================

/**
 * 에디터 상태 조작에 필요한 액션들
 * React 컴포넌트와 분리하여 테스트 가능하도록 인터페이스로 정의
 */
export interface EditorActions {
  // 노드 관련
  nodes: FlowNode[]
  edges: FlowEdge[]
  setNodes: (updater: (nodes: FlowNode[]) => FlowNode[]) => void

  // Entity
  updateEntity: (id: string, data: Record<string, unknown>) => void

  // Embeddable
  updateEmbeddable: (id: string, data: Record<string, unknown>) => void

  // Enum
  updateEnum: (id: string, data: Record<string, unknown>) => void

  // Interface
  updateInterface: (id: string, data: Record<string, unknown>) => void

  // Relationship
  onConnect: (connection: {
    source: string
    target: string
    sourceHandle: string | null
    targetHandle: string | null
  }) => string | undefined
  updateRelationship: (id: string, data: Record<string, unknown>) => void

  // EnumMapping
  addEnumMapping: (entityId: string, enumId: string) => string
  updateEnumMapping: (id: string, data: Record<string, unknown>) => void
}

// ============================================
// Entity 커맨드 적용
// ============================================

export interface AddEntityPayload {
  id: string
  name: string
  tableName?: string
  properties: EntityProperty[]
  position: { x: number; y: number }
}

export function applyAddEntityCommand(
  command: ToolCommand,
  setNodes: EditorActions["setNodes"]
): void {
  const payload = command.payload as AddEntityPayload

  setNodes((nodes) => [
    ...nodes,
    {
      id: payload.id,
      type: "entity",
      position: payload.position,
      data: {
        name: payload.name,
        tableName: payload.tableName,
        properties: payload.properties,
      },
    },
  ])
}

export interface UpdateEntityPayload {
  id: string
  newName?: string
  newTableName?: string
}

export function applyUpdateEntityCommand(
  command: ToolCommand,
  updateEntity: EditorActions["updateEntity"]
): void {
  const payload = command.payload as UpdateEntityPayload

  const updates: Record<string, unknown> = {}
  if (payload.newName) updates.name = payload.newName
  if (payload.newTableName) updates.tableName = payload.newTableName

  updateEntity(payload.id, updates)
}

// ============================================
// Embeddable 커맨드 적용
// ============================================

export interface AddEmbeddablePayload {
  id: string
  name: string
  properties: EntityProperty[]
  position: { x: number; y: number }
}

export function applyAddEmbeddableCommand(
  command: ToolCommand,
  setNodes: EditorActions["setNodes"]
): void {
  const payload = command.payload as AddEmbeddablePayload

  setNodes((nodes) => [
    ...nodes,
    {
      id: payload.id,
      type: "embeddable",
      position: payload.position,
      data: {
        name: payload.name,
        properties: payload.properties,
      },
    },
  ])
}

// ============================================
// Enum 커맨드 적용
// ============================================

export interface AddEnumPayload {
  id: string
  name: string
  values: EnumValue[]
  position: { x: number; y: number }
}

export function applyAddEnumCommand(
  command: ToolCommand,
  setNodes: EditorActions["setNodes"]
): void {
  const payload = command.payload as AddEnumPayload

  setNodes((nodes) => [
    ...nodes,
    {
      id: payload.id,
      type: "enum",
      position: payload.position,
      data: {
        name: payload.name,
        values: payload.values,
      },
    },
  ])
}

// ============================================
// Interface 커맨드 적용
// ============================================

export interface AddInterfacePayload {
  id: string
  name: string
  properties: EntityProperty[]
  methods: InterfaceMethod[]
  position: { x: number; y: number }
}

export function applyAddInterfaceCommand(
  command: ToolCommand,
  setNodes: EditorActions["setNodes"]
): void {
  const payload = command.payload as AddInterfacePayload

  setNodes((nodes) => [
    ...nodes,
    {
      id: payload.id,
      type: "interface",
      position: payload.position,
      data: {
        name: payload.name,
        properties: payload.properties,
        methods: payload.methods,
      },
    },
  ])
}

// ============================================
// Property 커맨드 적용
// ============================================

export interface AddPropertyPayload {
  nodeId: string
  property: EntityProperty
}

export function applyAddPropertyCommand(
  command: ToolCommand,
  editor: Pick<EditorActions, "nodes" | "updateEntity" | "updateEmbeddable" | "updateInterface">
): void {
  const payload = command.payload as AddPropertyPayload

  const node = editor.nodes.find((n) => n.id === payload.nodeId)
  if (!node) return

  const currentProperties = (node.data.properties as EntityProperty[]) ?? []
  const newProperties = [...currentProperties, payload.property]

  if (node.type === "entity") {
    editor.updateEntity(payload.nodeId, { properties: newProperties })
  } else if (node.type === "embeddable") {
    editor.updateEmbeddable(payload.nodeId, { properties: newProperties })
  } else if (node.type === "interface") {
    editor.updateInterface(payload.nodeId, { properties: newProperties })
  }
}

// ============================================
// Relationship 커맨드 적용
// ============================================

export interface AddRelationshipPayload {
  id: string
  sourceId: string
  targetId: string
  relationType: RelationType
  sourceProperty: string
  targetProperty?: string
  isNullable: boolean
  cascade: boolean
}

export function applyAddRelationshipCommand(
  command: ToolCommand,
  editor: Pick<EditorActions, "onConnect" | "updateRelationship">
): void {
  const payload = command.payload as AddRelationshipPayload

  // onConnect를 통해 기본 Relationship 생성하고 엣지 ID 반환받음
  const edgeId = editor.onConnect({
    source: payload.sourceId,
    target: payload.targetId,
    sourceHandle: "right",
    targetHandle: "left",
  })

  // 생성된 엣지 ID로 바로 업데이트 (stale closure 문제 해결)
  if (edgeId) {
    editor.updateRelationship(edgeId, {
      relationType: payload.relationType,
      sourceProperty: payload.sourceProperty,
      targetProperty: payload.targetProperty,
      isNullable: payload.isNullable,
      cascade: payload.cascade,
    })
  }
}

// ============================================
// EnumMapping 커맨드 적용
// ============================================

export interface AddEnumMappingPayload {
  id: string
  entityId: string
  enumId: string
  propertyId: string
  previousType: string
}

export function applyAddEnumMappingCommand(
  command: ToolCommand,
  editor: Pick<EditorActions, "nodes" | "addEnumMapping" | "updateEnumMapping" | "updateEntity">
): void {
  const payload = command.payload as AddEnumMappingPayload

  // EnumMapping 엣지 생성
  const edgeId = editor.addEnumMapping(payload.entityId, payload.enumId)

  // 엣지 데이터 업데이트
  editor.updateEnumMapping(edgeId, {
    propertyId: payload.propertyId,
    previousType: payload.previousType,
  })

  // Entity의 프로퍼티 타입을 Enum으로 변경
  const entity = editor.nodes.find((n) => n.id === payload.entityId)
  const enumNode = editor.nodes.find((n) => n.id === payload.enumId)

  if (entity && enumNode && entity.type === "entity") {
    const properties = (entity.data.properties as EntityProperty[]).map((p) =>
      p.id === payload.propertyId ? { ...p, type: enumNode.data.name as string } : p
    )
    editor.updateEntity(payload.entityId, { properties })
  }
}
