/**
 * JSON Schema Export 유틸리티
 *
 * 다이어그램의 Entity, Embeddable, Relationship을 JSON Schema 형식으로 변환
 * Phase 2: JSON Schema Export 기능
 */

import type {
  DiagramNode,
  EntityData,
  EmbeddableData,
  EntityProperty,
  EntityIndex,
  EnumDefinition,
} from "@/types/entity"
import { isEntityNode, isEmbeddableNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"
import { RelationType } from "@/types/relationship"

// =============================================================================
// JSON Schema 타입 정의
// =============================================================================

/**
 * JSON Schema의 Property 정의
 */
interface JsonPropertySchema {
  name: string
  type: string
  isPrimaryKey?: boolean
  isUnique?: boolean
  isNullable?: boolean
  defaultValue?: string
  enumDef?: EnumDefinition
}

/**
 * JSON Schema의 Index 정의
 */
interface JsonIndexSchema {
  name?: string
  properties: string[]
  isUnique: boolean
}

/**
 * JSON Schema의 Entity 정의
 */
interface JsonEntitySchema {
  kind: "entity"
  name: string
  tableName?: string
  properties: JsonPropertySchema[]
  indexes?: JsonIndexSchema[]
}

/**
 * JSON Schema의 Embeddable 정의
 */
interface JsonEmbeddableSchema {
  kind: "embeddable"
  name: string
  properties: JsonPropertySchema[]
}

/**
 * JSON Schema의 Relationship 정의
 */
interface JsonRelationshipSchema {
  type: string
  source: string
  target: string
  sourceProperty: string
  targetProperty?: string
  isNullable?: boolean
  cascade?: boolean
  orphanRemoval?: boolean
}

/**
 * 전체 JSON Schema 구조
 */
export interface DiagramJsonSchema {
  version: string
  metadata: {
    exportedAt: string
    nodeCount: number
    relationshipCount: number
  }
  entities: JsonEntitySchema[]
  embeddables: JsonEmbeddableSchema[]
  relationships: JsonRelationshipSchema[]
}

// =============================================================================
// 변환 유틸리티 함수
// =============================================================================

/**
 * RelationType을 문자열로 변환
 */
function relationTypeToString(relationType: RelationType): string {
  switch (relationType) {
    case RelationType.OneToOne:
      return "OneToOne"
    case RelationType.OneToMany:
      return "OneToMany"
    case RelationType.ManyToOne:
      return "ManyToOne"
    case RelationType.ManyToMany:
      return "ManyToMany"
  }
}

/**
 * EntityProperty를 JsonPropertySchema로 변환
 */
function convertProperty(property: EntityProperty): JsonPropertySchema {
  const result: JsonPropertySchema = {
    name: property.name,
    type: property.type,
  }

  if (property.isPrimaryKey) {
    result.isPrimaryKey = true
  }

  if (property.isUnique) {
    result.isUnique = true
  }

  if (property.isNullable) {
    result.isNullable = true
  }

  if (property.defaultValue !== undefined && property.defaultValue !== "") {
    result.defaultValue = property.defaultValue
  }

  if (property.type === "enum" && property.enumDef) {
    result.enumDef = property.enumDef
  }

  return result
}

/**
 * EntityIndex를 JsonIndexSchema로 변환
 */
function convertIndex(index: EntityIndex): JsonIndexSchema {
  const result: JsonIndexSchema = {
    properties: index.properties,
    isUnique: index.isUnique,
  }

  if (index.name) {
    result.name = index.name
  }

  return result
}

/**
 * EntityData를 JsonEntitySchema로 변환
 */
function convertEntityData(data: EntityData): JsonEntitySchema {
  const result: JsonEntitySchema = {
    kind: "entity",
    name: data.name,
    properties: data.properties.map(convertProperty),
  }

  if (data.tableName) {
    result.tableName = data.tableName
  }

  if (data.indexes && data.indexes.length > 0) {
    result.indexes = data.indexes.map(convertIndex)
  }

  return result
}

/**
 * EmbeddableData를 JsonEmbeddableSchema로 변환
 */
function convertEmbeddableData(data: EmbeddableData): JsonEmbeddableSchema {
  return {
    kind: "embeddable",
    name: data.name,
    properties: data.properties.map(convertProperty),
  }
}

/**
 * RelationshipData를 JsonRelationshipSchema로 변환
 */
function convertRelationship(
  edge: RelationshipEdge,
  nodes: DiagramNode[]
): JsonRelationshipSchema | null {
  const data = edge.data
  if (!data) return null

  // source/target 노드 찾기
  const sourceNode = nodes.find((n) => n.id === edge.source)
  const targetNode = nodes.find((n) => n.id === edge.target)

  if (!sourceNode || !targetNode) return null

  const result: JsonRelationshipSchema = {
    type: relationTypeToString(data.relationType),
    source: sourceNode.data.name,
    target: targetNode.data.name,
    sourceProperty: data.sourceProperty,
  }

  if (data.targetProperty) {
    result.targetProperty = data.targetProperty
  }

  if (data.isNullable) {
    result.isNullable = true
  }

  if (data.cascade) {
    result.cascade = true
  }

  if (data.orphanRemoval) {
    result.orphanRemoval = true
  }

  return result
}

// =============================================================================
// 메인 Export 함수
// =============================================================================

/**
 * 다이어그램을 JSON Schema로 변환
 *
 * @param nodes - 모든 다이어그램 노드 (Entity + Embeddable)
 * @param edges - Relationship 엣지 목록
 * @returns JSON Schema 객체
 *
 * @example
 * ```ts
 * const schema = generateJsonSchema(nodes, edges)
 * const jsonString = JSON.stringify(schema, null, 2)
 * ```
 */
export function generateJsonSchema(
  nodes: DiagramNode[],
  edges: RelationshipEdge[]
): DiagramJsonSchema {
  // Entity 노드 분리
  const entityNodes = nodes.filter(isEntityNode)
  // Embeddable 노드 분리
  const embeddableNodes = nodes.filter(isEmbeddableNode)

  // Entity 변환
  const entities = entityNodes.map((node) => convertEntityData(node.data))

  // Embeddable 변환
  const embeddables = embeddableNodes.map((node) =>
    convertEmbeddableData(node.data)
  )

  // Relationship 변환
  const relationships = edges
    .map((edge) => convertRelationship(edge, nodes))
    .filter((r): r is JsonRelationshipSchema => r !== null)

  return {
    version: "1.0",
    metadata: {
      exportedAt: new Date().toISOString(),
      nodeCount: nodes.length,
      relationshipCount: edges.length,
    },
    entities,
    embeddables,
    relationships,
  }
}

/**
 * JSON Schema를 포맷된 문자열로 변환
 *
 * @param schema - JSON Schema 객체
 * @param indent - 들여쓰기 크기 (기본: 2)
 * @returns 포맷된 JSON 문자열
 */
export function stringifyJsonSchema(
  schema: DiagramJsonSchema,
  indent: number = 2
): string {
  return JSON.stringify(schema, null, indent)
}

/**
 * 다이어그램을 JSON 문자열로 직접 변환
 *
 * @param nodes - 모든 다이어그램 노드
 * @param edges - Relationship 엣지 목록
 * @param indent - 들여쓰기 크기 (기본: 2)
 * @returns 포맷된 JSON 문자열
 */
export function exportDiagramAsJson(
  nodes: DiagramNode[],
  edges: RelationshipEdge[],
  indent: number = 2
): string {
  const schema = generateJsonSchema(nodes, edges)
  return stringifyJsonSchema(schema, indent)
}
