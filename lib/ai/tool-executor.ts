/**
 * AI Tool 실행 로직 (순수 함수)
 *
 * 프레임워크 독립적인 순수 함수로 Tool 실행 로직 분리
 */

import type { FlowNode } from "@/hooks/use-nodes"
import type { FlowEdge } from "@/hooks/use-edges"
import type {
  EntityNode,
  EnumNode,
  EntityProperty,
  EnumValue,
  InterfaceMethod,
} from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"
import { RelationType } from "@/types/relationship"
import type { ToolResult } from "@/types/chat"

// ============================================
// Tool 인자 타입
// ============================================

export interface AddEntityArgs {
  name: string
  tableName?: string
  properties?: Array<{
    name: string
    type: string
    isPrimaryKey?: boolean
    isUnique?: boolean
    isNullable?: boolean
    defaultValue?: string
  }>
}

export interface UpdateEntityArgs {
  targetName: string
  newName?: string
  newTableName?: string
}

export interface DeleteEntityArgs {
  name: string
}

export interface AddEmbeddableArgs {
  name: string
  properties?: Array<{
    name: string
    type: string
    isUnique?: boolean
    isNullable?: boolean
    defaultValue?: string
  }>
}

export interface UpdateEmbeddableArgs {
  targetName: string
  newName: string
}

export interface DeleteEmbeddableArgs {
  name: string
}

export interface AddEnumArgs {
  name: string
  values: EnumValue[]
}

export interface UpdateEnumArgs {
  targetName: string
  newName?: string
  values?: EnumValue[]
}

export interface DeleteEnumArgs {
  name: string
}

export interface AddInterfaceArgs {
  name: string
  properties?: Array<{
    name: string
    type: string
    isUnique?: boolean
    isNullable?: boolean
    defaultValue?: string
  }>
  methods?: Array<{
    name: string
    parameters: string
    returnType: string
  }>
}

export interface UpdateInterfaceArgs {
  targetName: string
  newName: string
}

export interface DeleteInterfaceArgs {
  name: string
}

export interface AddPropertyArgs {
  nodeName: string
  property: {
    name: string
    type: string
    isPrimaryKey?: boolean
    isUnique?: boolean
    isNullable?: boolean
    defaultValue?: string
  }
}

export interface UpdatePropertyArgs {
  nodeName: string
  propertyName: string
  updates: Partial<{
    name: string
    type: string
    isPrimaryKey: boolean
    isUnique: boolean
    isNullable: boolean
    defaultValue: string
  }>
}

export interface DeletePropertyArgs {
  nodeName: string
  propertyName: string
}

export interface AddRelationshipArgs {
  sourceEntity: string
  targetEntity: string
  relationType: keyof typeof RelationType
  sourceProperty: string
  targetProperty?: string
  isNullable?: boolean
  cascade?: boolean
}

export interface UpdateRelationshipArgs {
  sourceEntity: string
  targetEntity: string
  updates: {
    relationType?: keyof typeof RelationType
    sourceProperty?: string
    targetProperty?: string
    isNullable?: boolean
    cascade?: boolean
  }
}

export interface DeleteRelationshipArgs {
  sourceEntity: string
  targetEntity: string
}

export interface AddEnumMappingArgs {
  entityName: string
  propertyName: string
  enumName: string
}

export interface DeleteEnumMappingArgs {
  entityName: string
  propertyName: string
}

export interface ClearDiagramArgs {
  confirm: boolean
}

export interface GenerateCodeArgs {
  target?: "all" | "entity" | "embeddable" | "enum" | "interface"
  entityName?: string
}

export interface PreviewCodeArgs {
  nodeName: string
}

// ============================================
// 헬퍼 함수 (순수 함수)
// ============================================

/**
 * Entity 이름으로 노드 찾기
 */
export function findNodeByName(
  nodes: FlowNode[],
  name: string,
  type?: "entity" | "embeddable" | "enum" | "interface"
): FlowNode | null {
  return (
    nodes.find((n) => {
      if (type && n.type !== type) return false
      return n.data.name === name
    }) ?? null
  )
}

/**
 * Entity 이름으로 Entity 노드 찾기
 */
export function findEntityByName(
  nodes: FlowNode[],
  name: string
): EntityNode | null {
  const node = nodes.find((n) => n.type === "entity" && n.data.name === name)
  return (node as EntityNode) ?? null
}

/**
 * Enum 이름으로 Enum 노드 찾기
 */
export function findEnumByName(nodes: FlowNode[], name: string): EnumNode | null {
  const node = nodes.find((n) => n.type === "enum" && n.data.name === name)
  return (node as EnumNode) ?? null
}

/**
 * 두 Entity 간의 Relationship 엣지 찾기
 */
export function findRelationship(
  edges: FlowEdge[],
  nodes: FlowNode[],
  sourceName: string,
  targetName: string
): RelationshipEdge | null {
  const sourceNode = findEntityByName(nodes, sourceName)
  const targetNode = findEntityByName(nodes, targetName)

  if (!sourceNode || !targetNode) return null

  const edge = edges.find(
    (e) =>
      e.type === "relationship" &&
      e.source === sourceNode.id &&
      e.target === targetNode.id
  )

  return (edge as RelationshipEdge) ?? null
}

/**
 * 다음 노드 위치 계산
 */
export function calculateNextPosition(
  nodes: FlowNode[]
): { x: number; y: number } {
  if (nodes.length === 0) {
    return { x: 100, y: 100 }
  }

  const lastNode = nodes[nodes.length - 1]
  return {
    x: lastNode.position.x + 250,
    y: lastNode.position.y,
  }
}

/**
 * Tool 실행 결과 검증 - Relationship
 */
export function validateRelationship(
  nodes: FlowNode[],
  sourceEntity: string,
  targetEntity: string
): { valid: boolean; error?: string } {
  const source = findEntityByName(nodes, sourceEntity)
  const target = findEntityByName(nodes, targetEntity)

  if (!source) {
    return { valid: false, error: `Entity '${sourceEntity}'를 찾을 수 없습니다` }
  }
  if (!target) {
    return { valid: false, error: `Entity '${targetEntity}'를 찾을 수 없습니다` }
  }

  return { valid: true }
}

/**
 * Tool 실행 결과 검증 - EnumMapping
 */
export function validateEnumMapping(
  nodes: FlowNode[],
  entityName: string,
  propertyName: string,
  enumName: string
): { valid: boolean; error?: string } {
  const entity = findEntityByName(nodes, entityName)
  if (!entity) {
    return { valid: false, error: `Entity '${entityName}'를 찾을 수 없습니다` }
  }

  const property = entity.data.properties.find((p) => p.name === propertyName)
  if (!property) {
    return {
      valid: false,
      error: `Property '${propertyName}'를 찾을 수 없습니다`,
    }
  }

  const enumNode = findEnumByName(nodes, enumName)
  if (!enumNode) {
    return { valid: false, error: `Enum '${enumName}'을 찾을 수 없습니다` }
  }

  return { valid: true }
}

// ============================================
// Tool 실행 커맨드 타입
// ============================================

export type ToolCommandType =
  | "addEntity"
  | "updateEntity"
  | "deleteEntity"
  | "addEmbeddable"
  | "updateEmbeddable"
  | "deleteEmbeddable"
  | "addEnum"
  | "updateEnum"
  | "deleteEnum"
  | "addInterface"
  | "updateInterface"
  | "deleteInterface"
  | "addProperty"
  | "updateProperty"
  | "deleteProperty"
  | "addRelationship"
  | "updateRelationship"
  | "deleteRelationship"
  | "addEnumMapping"
  | "deleteEnumMapping"
  | "clearDiagram"
  | "getDiagramSummary"
  | "generateCode"
  | "previewCode"

export interface ToolCommand {
  type: ToolCommandType
  payload: unknown
  result: ToolResult
}

export interface ToolError {
  error: string
}

// ============================================
// 커맨드 생성 함수
// ============================================

/**
 * generateId 순수 버전 (UUID v4)
 */
function generateId(): string {
  return crypto.randomUUID()
}

/**
 * addEntity 커맨드 생성
 */
export function createAddEntityCommand(
  args: AddEntityArgs,
  nodes: FlowNode[]
): ToolCommand {
  const position = calculateNextPosition(nodes)
  const id = generateId()

  const properties: EntityProperty[] = args.properties
    ? args.properties.map((p, index) => ({
        id: `${id}-prop-${index}`,
        name: p.name,
        type: p.type,
        isPrimaryKey: p.isPrimaryKey ?? false,
        isUnique: p.isUnique ?? false,
        isNullable: p.isNullable ?? false,
        defaultValue: p.defaultValue,
      }))
    : [
        {
          id: `${id}-prop-id`,
          name: "id",
          type: "number",
          isPrimaryKey: true,
          isUnique: false,
          isNullable: false,
        },
      ]

  return {
    type: "addEntity",
    payload: {
      id,
      name: args.name,
      tableName: args.tableName,
      properties,
      position,
    },
    result: {
      type: "entityCreated",
      data: { name: args.name, propertyCount: properties.length },
    },
  }
}

/**
 * updateEntity 커맨드 생성
 */
export function createUpdateEntityCommand(
  args: UpdateEntityArgs,
  nodes: FlowNode[]
): ToolCommand | ToolError {
  const entity = findEntityByName(nodes, args.targetName)
  if (!entity) {
    return { error: `Entity '${args.targetName}'를 찾을 수 없습니다` }
  }

  const changes: string[] = []
  if (args.newName) changes.push(`이름: ${args.newName}`)
  if (args.newTableName) changes.push(`테이블명: ${args.newTableName}`)

  return {
    type: "updateEntity",
    payload: {
      id: entity.id,
      newName: args.newName,
      newTableName: args.newTableName,
    },
    result: {
      type: "entityUpdated",
      data: { name: args.newName ?? args.targetName, changes },
    },
  }
}

/**
 * deleteEntity 커맨드 생성
 */
export function createDeleteEntityCommand(
  args: DeleteEntityArgs,
  nodes: FlowNode[]
): ToolCommand | ToolError {
  const entity = findEntityByName(nodes, args.name)
  if (!entity) {
    return { error: `Entity '${args.name}'를 찾을 수 없습니다` }
  }

  return {
    type: "deleteEntity",
    payload: { id: entity.id, name: args.name },
    result: {
      type: "entityDeleted",
      data: { name: args.name },
    },
  }
}

/**
 * addEmbeddable 커맨드 생성
 */
export function createAddEmbeddableCommand(
  args: AddEmbeddableArgs,
  nodes: FlowNode[]
): ToolCommand {
  const position = calculateNextPosition(nodes)
  const id = generateId()

  const properties: EntityProperty[] = args.properties
    ? args.properties.map((p, index) => ({
        id: `${id}-prop-${index}`,
        name: p.name,
        type: p.type,
        isPrimaryKey: false,
        isUnique: p.isUnique ?? false,
        isNullable: p.isNullable ?? false,
        defaultValue: p.defaultValue,
      }))
    : [
        {
          id: `${id}-prop-1`,
          name: "value",
          type: "string",
          isPrimaryKey: false,
          isUnique: false,
          isNullable: false,
        },
      ]

  return {
    type: "addEmbeddable",
    payload: { id, name: args.name, properties, position },
    result: {
      type: "embeddableCreated",
      data: { name: args.name, propertyCount: properties.length },
    },
  }
}

/**
 * addEnum 커맨드 생성
 */
export function createAddEnumCommand(
  args: AddEnumArgs,
  nodes: FlowNode[]
): ToolCommand {
  const position = calculateNextPosition(nodes)
  const id = generateId()

  return {
    type: "addEnum",
    payload: { id, name: args.name, values: args.values, position },
    result: {
      type: "enumCreated",
      data: { name: args.name, valueCount: args.values.length },
    },
  }
}

/**
 * addInterface 커맨드 생성
 */
export function createAddInterfaceCommand(
  args: AddInterfaceArgs,
  nodes: FlowNode[]
): ToolCommand {
  const position = calculateNextPosition(nodes)
  const id = generateId()

  const properties: EntityProperty[] = args.properties
    ? args.properties.map((p, index) => ({
        id: `${id}-prop-${index}`,
        name: p.name,
        type: p.type,
        isPrimaryKey: false,
        isUnique: p.isUnique ?? false,
        isNullable: p.isNullable ?? false,
        defaultValue: p.defaultValue,
      }))
    : []

  const methods: InterfaceMethod[] = args.methods
    ? args.methods.map((m, index) => ({
        id: `${id}-method-${index}`,
        name: m.name,
        parameters: m.parameters,
        returnType: m.returnType,
      }))
    : []

  return {
    type: "addInterface",
    payload: { id, name: args.name, properties, methods, position },
    result: {
      type: "interfaceCreated",
      data: { name: args.name, propertyCount: properties.length },
    },
  }
}

/**
 * addProperty 커맨드 생성
 */
export function createAddPropertyCommand(
  args: AddPropertyArgs,
  nodes: FlowNode[]
): ToolCommand | ToolError {
  const node = findNodeByName(nodes, args.nodeName)
  if (!node) {
    return { error: `노드 '${args.nodeName}'를 찾을 수 없습니다` }
  }

  if (node.type === "enum") {
    return { error: "Enum 노드에는 프로퍼티를 추가할 수 없습니다" }
  }

  const id = generateId()
  const property: EntityProperty = {
    id: `${id}-prop`,
    name: args.property.name,
    type: args.property.type,
    isPrimaryKey: args.property.isPrimaryKey ?? false,
    isUnique: args.property.isUnique ?? false,
    isNullable: args.property.isNullable ?? false,
    defaultValue: args.property.defaultValue,
  }

  return {
    type: "addProperty",
    payload: { nodeId: node.id, property },
    result: {
      type: "propertyAdded",
      data: {
        nodeName: args.nodeName,
        propertyName: args.property.name,
        propertyType: args.property.type,
      },
    },
  }
}

/**
 * addRelationship 커맨드 생성
 */
export function createAddRelationshipCommand(
  args: AddRelationshipArgs,
  nodes: FlowNode[]
): ToolCommand | ToolError {
  const validation = validateRelationship(
    nodes,
    args.sourceEntity,
    args.targetEntity
  )

  if (!validation.valid) {
    return { error: validation.error! }
  }

  const source = findEntityByName(nodes, args.sourceEntity)!
  const target = findEntityByName(nodes, args.targetEntity)!
  const id = generateId()

  return {
    type: "addRelationship",
    payload: {
      id,
      sourceId: source.id,
      targetId: target.id,
      relationType: RelationType[args.relationType as keyof typeof RelationType],
      sourceProperty: args.sourceProperty,
      targetProperty: args.targetProperty,
      isNullable: args.isNullable ?? true,
      cascade: args.cascade ?? false,
    },
    result: {
      type: "relationshipCreated",
      data: {
        source: args.sourceEntity,
        target: args.targetEntity,
        type: args.relationType,
      },
    },
  }
}

/**
 * deleteRelationship 커맨드 생성
 */
export function createDeleteRelationshipCommand(
  args: DeleteRelationshipArgs,
  nodes: FlowNode[],
  edges: FlowEdge[]
): ToolCommand | ToolError {
  const relationship = findRelationship(
    edges,
    nodes,
    args.sourceEntity,
    args.targetEntity
  )

  if (!relationship) {
    return {
      error: `${args.sourceEntity}와 ${args.targetEntity} 간의 관계를 찾을 수 없습니다`,
    }
  }

  return {
    type: "deleteRelationship",
    payload: { id: relationship.id },
    result: {
      type: "relationshipDeleted",
      data: {
        source: args.sourceEntity,
        target: args.targetEntity,
        type: relationship.data.relationType,
      },
    },
  }
}

/**
 * addEnumMapping 커맨드 생성
 */
export function createAddEnumMappingCommand(
  args: AddEnumMappingArgs,
  nodes: FlowNode[]
): ToolCommand | ToolError {
  const validation = validateEnumMapping(
    nodes,
    args.entityName,
    args.propertyName,
    args.enumName
  )

  if (!validation.valid) {
    return { error: validation.error! }
  }

  const entity = findEntityByName(nodes, args.entityName)!
  const enumNode = findEnumByName(nodes, args.enumName)!
  const property = entity.data.properties.find((p) => p.name === args.propertyName)!
  const id = generateId()

  return {
    type: "addEnumMapping",
    payload: {
      id,
      entityId: entity.id,
      enumId: enumNode.id,
      propertyId: property.id,
      previousType: property.type,
    },
    result: {
      type: "enumMappingCreated",
      data: {
        entityName: args.entityName,
        propertyName: args.propertyName,
        enumName: args.enumName,
      },
    },
  }
}

/**
 * clearDiagram 커맨드 생성
 */
export function createClearDiagramCommand(
  args: ClearDiagramArgs
): ToolCommand | ToolError {
  if (!args.confirm) {
    return { error: "다이어그램 초기화를 위해 confirm: true가 필요합니다" }
  }

  return {
    type: "clearDiagram",
    payload: {},
    result: {
      type: "diagramCleared",
      data: {},
    },
  }
}

/**
 * getDiagramSummary 커맨드 생성
 */
export function createGetDiagramSummaryCommand(
  nodes: FlowNode[],
  edges: FlowEdge[]
): ToolCommand {
  const entities = nodes.filter((n) => n.type === "entity")
  const embeddables = nodes.filter((n) => n.type === "embeddable")
  const enums = nodes.filter((n) => n.type === "enum")
  const interfaces = nodes.filter((n) => n.type === "interface")
  const relationships = edges.filter((e) => e.type === "relationship")
  const enumMappings = edges.filter((e) => e.type === "enum-mapping")

  return {
    type: "getDiagramSummary",
    payload: {},
    result: {
      type: "diagramSummary",
      data: {
        entityCount: entities.length,
        embeddableCount: embeddables.length,
        enumCount: enums.length,
        interfaceCount: interfaces.length,
        relationshipCount: relationships.length,
        enumMappingCount: enumMappings.length,
      },
    },
  }
}
