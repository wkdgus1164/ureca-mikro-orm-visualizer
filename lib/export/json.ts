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
 * Convert a RelationType enum value to its canonical string representation.
 *
 * @param relationType - The relation type to convert
 * @returns The string `"OneToOne"`, `"OneToMany"`, `"ManyToOne"`, or `"ManyToMany"` corresponding to `relationType`
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
 * Convert an EntityProperty into a JsonPropertySchema.
 *
 * @param property - The entity property to convert
 * @returns A JsonPropertySchema representing the input property, including optional flags and enum definition when present
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
 * Convert an EntityIndex into its JSON Schema representation.
 *
 * @param index - The entity index to convert
 * @returns The corresponding JsonIndexSchema containing `properties`, `isUnique`, and `name` when present
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
 * Convert an entity definition into a JSON Schema representation.
 *
 * @param data - The entity definition to convert.
 * @returns The JSON Schema object representing the entity, including its properties; includes `tableName` and `indexes` when present.
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
 * Convert an EmbeddableData object into a JsonEmbeddableSchema.
 *
 * @param data - The embeddable definition to convert
 * @returns The corresponding JsonEmbeddableSchema with `kind: "embeddable"`, `name`, and converted `properties`
 */
function convertEmbeddableData(data: EmbeddableData): JsonEmbeddableSchema {
  return {
    kind: "embeddable",
    name: data.name,
    properties: data.properties.map(convertProperty),
  }
}

/**
 * Convert a relationship edge into a JsonRelationshipSchema.
 *
 * Returns `null` if the edge has no relationship data or if the source or target node cannot be resolved from `nodes`.
 *
 * @param edge - The relationship edge to convert
 * @param nodes - Array of diagram nodes used to resolve source and target node names
 * @returns A JsonRelationshipSchema describing the relationship, or `null` if conversion cannot be performed
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
 * Produce a DiagramJsonSchema representing the provided diagram nodes and relationship edges.
 *
 * @param nodes - Array of diagram nodes (entities and embeddables)
 * @param edges - Array of relationship edges connecting the nodes
 * @returns A DiagramJsonSchema object containing `version`, `metadata` (`exportedAt`, `nodeCount`, `relationshipCount`), `entities`, `embeddables`, and `relationships`
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
 * Format a DiagramJsonSchema as a pretty-printed JSON string.
 *
 * @param schema - The DiagramJsonSchema to stringify
 * @param indent - Number of spaces to use for indentation (default: 2)
 * @returns The formatted JSON string representing `schema`
 */
export function stringifyJsonSchema(
  schema: DiagramJsonSchema,
  indent: number = 2
): string {
  return JSON.stringify(schema, null, indent)
}

/**
 * Convert diagram nodes and relationships into a formatted JSON string.
 *
 * @param nodes - All diagram nodes to include in the export
 * @param edges - Relationship edges to include in the export
 * @param indent - Number of spaces to use for indentation (default: 2)
 * @returns The formatted JSON string representing the diagram schema
 */
export function exportDiagramAsJson(
  nodes: DiagramNode[],
  edges: RelationshipEdge[],
  indent: number = 2
): string {
  const schema = generateJsonSchema(nodes, edges)
  return stringifyJsonSchema(schema, indent)
}