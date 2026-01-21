/**
 * Entity 코드 생성기
 *
 * EntityNode를 완전한 MikroORM Entity 클래스 코드로 변환
 */

import type { EntityNode, EnumNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"
import {
  type GeneratorOptions,
  DEFAULT_OPTIONS,
  sanitizeClassName,
} from "./utils"
import { collectEnumDefinitions, generateAllEnumsCode } from "./enum"
import { generateProperty } from "./property"
import { generateRelationship } from "./relationship"
import { collectImports, generateImports } from "./imports"

/**
 * Enum 이름 Set 생성 (Enum 참조 확인용)
 */
function getEnumNames(enumNodes: EnumNode[]): Set<string> {
  return new Set(enumNodes.map((node) => node.data.name))
}

/**
 * Generate `@Index` and `@Unique` decorator lines for the indexes defined on an entity.
 *
 * @param entity - The entity node whose `data.indexes` will be converted
 * @returns An array of decorator strings such as `@Index({ properties: [...] })`
 */
function generateIndexDecorators(entity: EntityNode): string[] {
  const indexes = entity.data.indexes ?? []

  return indexes
    .filter((index) => index.properties.length > 0)
    .map((index) => {
      const decorator = index.isUnique ? "Unique" : "Index"
      const propsArray = `[${index.properties.map((p) => `"${p}"`).join(", ")}]`

      return index.name
        ? `@${decorator}({ properties: ${propsArray}, name: "${index.name}" })`
        : `@${decorator}({ properties: ${propsArray} })`
    })
}

/**
 * Generate TypeScript source code for a MikroORM entity node.
 *
 * Produces imports, enum declarations (if any), index/unique decorators, the @Entity decorator,
 * property declarations with decorators, relationship properties, and the enclosing class.
 *
 * @param entity - The Entity node to convert
 * @param edges - All relationship edges in the diagram
 * @param allNodes - All entity nodes for resolving relationship targets
 * @param options - Generation options (e.g., indentation size)
 * @param enumNodes - All enum nodes in the diagram (for Enum reference resolution)
 * @returns The generated TypeScript source code for the entity as a string
 */
export function generateEntityCode(
  entity: EntityNode,
  edges: RelationshipEdge[],
  allNodes: EntityNode[],
  options: GeneratorOptions = {},
  enumNodes: EnumNode[] = []
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const indentSize = opts.indentSize!

  // Enum 이름 Set (참조 확인용)
  const enumNames = getEnumNames(enumNodes)

  // Import 정보 수집 (Enum 참조 포함)
  const { decorators, relatedEntities, needsCollection, needsCascade, referencedEnums } =
    collectImports(entity, edges, allNodes, enumNames)

  // Enum 정의 수집 (인라인 Enum만)
  const enumDefs = collectEnumDefinitions(entity.data.properties)

  const lines: string[] = []

  // Import 문
  const imports = generateImports(
    decorators,
    relatedEntities,
    needsCollection,
    needsCascade,
    referencedEnums
  )
  lines.push(imports)
  lines.push("")

  // Enum 정의 (Import 문 뒤, 클래스 앞)
  const enumsCode = generateAllEnumsCode(enumDefs)
  if (enumsCode) {
    lines.push(enumsCode)
    lines.push("")
  }

  // Index/Unique 데코레이터
  const indexDecorators = generateIndexDecorators(entity)
  indexDecorators.forEach((dec) => lines.push(dec))

  // Entity 데코레이터
  if (entity.data.tableName) {
    lines.push(`@Entity({ tableName: "${entity.data.tableName}" })`)
  } else {
    lines.push("@Entity()")
  }

  // 클래스 선언
  lines.push(`export class ${sanitizeClassName(entity.data.name)} {`)

  // Properties
  const propertyCode = entity.data.properties
    .map((prop) => generateProperty(prop, indentSize, enumNames))
    .join("\n\n")

  if (propertyCode) {
    lines.push(propertyCode)
  }

  // Relationships
  const relationshipCode = edges
    .filter((e) => e.source === entity.id)
    .map((edge) => {
      const targetNode = allNodes.find((n) => n.id === edge.target)
      if (!targetNode) return null
      return generateRelationship(edge, entity, targetNode, indentSize)
    })
    .filter((code): code is string => code !== null)
    .join("\n\n")

  if (relationshipCode) {
    if (propertyCode) {
      lines.push("")
    }
    lines.push(relationshipCode)
  }

  // 클래스 닫기
  lines.push("}")

  return lines.join("\n")
}

/**
 * Generate TypeScript source code for each entity node and return them keyed by sanitized entity name.
 *
 * @param nodes - Array of entity nodes to convert
 * @param edges - All relationship edges in the diagram
 * @param options - Generation options
 * @param enumNodes - All enum nodes in the diagram (for Enum reference resolution)
 * @returns A Map where each key is the sanitized entity class name and each value is the generated code
 */
export function generateAllEntitiesCode(
  nodes: EntityNode[],
  edges: RelationshipEdge[],
  options: GeneratorOptions = {},
  enumNodes: EnumNode[] = []
): Map<string, string> {
  return new Map(
    nodes.map((node) => [
      sanitizeClassName(node.data.name),
      generateEntityCode(node, edges, nodes, options, enumNodes),
    ])
  )
}
