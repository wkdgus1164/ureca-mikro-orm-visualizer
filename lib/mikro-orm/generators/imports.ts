/**
 * Import 문 생성기
 *
 * Entity에 필요한 MikroORM 데코레이터 및 관련 Entity import 문 생성
 */

import type { EntityNode, EntityIndex, InterfaceNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"
import { RelationType } from "@/types/relationship"
import { sanitizeClassName } from "./utils"
import { getRelationDecorator, isCollectionRelation } from "./relationship"

/**
 * Import 수집 결과 타입
 */
export interface CollectedImports {
  /** 필요한 MikroORM 데코레이터 목록 */
  decorators: Set<string>
  /** 참조하는 다른 Entity 이름 목록 */
  relatedEntities: Set<string>
  /** Collection import 필요 여부 */
  needsCollection: boolean
  /** Cascade import 필요 여부 */
  needsCascade: boolean
  /** 참조하는 Enum 이름 목록 */
  referencedEnums: Set<string>
  /** 참조하는 Interface 이름 목록 */
  referencedInterfaces: Set<string>
}

/**
 * Collects MikroORM decorators and related import requirements for a given entity.
 *
 * Inspects the entity's properties, indexes, and relationships to determine which decorators
 * are required, which other entity classes must be imported, and whether Collection or Cascade
 * utilities are needed.
 *
 * @param entity - The entity node to analyze
 * @param edges - All relationship edges in the diagram
 * @param allNodes - All entity nodes in the diagram (used to resolve related entity names)
 * @param enumNames - Set of all Enum names in the diagram (for Enum reference detection)
 * @param interfaceNodes - All interface nodes in the diagram (for implements reference detection)
 * @returns An object containing:
 *  - `decorators`: a set of decorator names required for the entity
 *  - `relatedEntities`: a set of sanitized class names of other entities referenced
 *  - `needsCollection`: `true` if any relationship uses a collection type
 *  - `needsCascade`: `true` if any relationship declares cascade
 *  - `referencedEnums`: a set of Enum names that need to be imported
 *  - `referencedInterfaces`: a set of Interface names that need to be imported
 */
export function collectImports(
  entity: EntityNode,
  edges: RelationshipEdge[],
  allNodes: EntityNode[],
  enumNames: Set<string> = new Set(),
  interfaceNodes: InterfaceNode[] = []
): CollectedImports {
  const decorators = new Set<string>(["Entity"])
  const relatedEntities = new Set<string>()
  const referencedEnums = new Set<string>()
  const referencedInterfaces = new Set<string>()
  let needsCollection = false
  let needsCascade = false

  // Properties
  const hasPrimaryKey = entity.data.properties.some((p) => p.isPrimaryKey)
  if (hasPrimaryKey) {
    decorators.add("PrimaryKey")
  }

  // Enum 참조 타입 확인 (property.type이 Enum 이름인 경우)
  entity.data.properties
    .filter((p) => !p.isPrimaryKey && enumNames.has(p.type))
    .forEach((p) => {
      referencedEnums.add(p.type)
      decorators.add("Enum")
    })

  // Enum이 아닌 일반 프로퍼티가 있는지 확인 (인라인 Enum과 참조 Enum 제외)
  const hasRegularProps = entity.data.properties.some(
    (p) => !p.isPrimaryKey && p.type !== "enum" && !enumNames.has(p.type)
  )
  if (hasRegularProps) {
    decorators.add("Property")
  }

  // 인라인 Enum 타입 프로퍼티 확인
  const hasInlineEnumProps = entity.data.properties.some(
    (p) => p.type === "enum" && p.enumDef
  )
  if (hasInlineEnumProps) {
    decorators.add("Enum")
  }

  // Indexes
  const indexes: EntityIndex[] = entity.data.indexes ?? []
  const hasRegularIndex = indexes.some(
    (idx) => !idx.isUnique && idx.properties.length > 0
  )
  const hasUniqueIndex = indexes.some(
    (idx) => idx.isUnique && idx.properties.length > 0
  )

  if (hasRegularIndex) {
    decorators.add("Index")
  }
  if (hasUniqueIndex) {
    decorators.add("Unique")
  }

  // Relationships
  const entityEdges = edges.filter(
    (e) => e.source === entity.id || e.target === entity.id
  )

  entityEdges
    .filter((edge) => edge.data && edge.source === entity.id)
    .forEach((edge) => {
      const data = edge.data!
      const decorator = getRelationDecorator(data.relationType)

      // Inheritance/Implementation은 데코레이터가 아닌 extends/implements 사용
      if (decorator === null) return

      decorators.add(decorator)

      if (isCollectionRelation(data.relationType)) {
        needsCollection = true
      }

      if (data.cascade) {
        needsCascade = true
      }

      // 타겟 Entity 찾기 (sanitized name으로 비교하여 self-import 방지)
      const targetNode = allNodes.find((n) => n.id === edge.target)
      if (targetNode) {
        const targetName = sanitizeClassName(targetNode.data.name)
        const currentName = sanitizeClassName(entity.data.name)
        if (targetName !== currentName) {
          relatedEntities.add(targetName)
        }
      }
    })

  // Implementation 관계에서 Interface 참조 수집
  edges
    .filter(
      (edge) =>
        edge.source === entity.id &&
        edge.data?.relationType === RelationType.Implementation
    )
    .forEach((edge) => {
      const targetInterface = interfaceNodes.find((n) => n.id === edge.target)
      if (targetInterface) {
        referencedInterfaces.add(sanitizeClassName(targetInterface.data.name))
      }
    })

  return { decorators, relatedEntities, needsCollection, needsCascade, referencedEnums, referencedInterfaces }
}

/**
 * Builds import statements for MikroORM core decorators and related entity classes.
 *
 * @param decorators - Names of decorators to import from `@mikro-orm/core`
 * @param relatedEntities - Names of related entity classes to import from local files
 * @param needsCollection - Include `Collection` in the core import when `true`
 * @param needsCascade - Include `Cascade` in the core import when `true`
 * @param referencedEnums - Names of Enum types to import from local files
 * @param referencedInterfaces - Names of Interface types to import from local files
 * @returns A string containing the combined import statements
 */
export function generateImports(
  decorators: Set<string>,
  relatedEntities: Set<string>,
  needsCollection: boolean,
  needsCascade: boolean,
  referencedEnums: Set<string> = new Set(),
  referencedInterfaces: Set<string> = new Set()
): string {
  const lines: string[] = []

  // MikroORM core imports
  const coreImports = [...decorators]
  if (needsCollection) {
    coreImports.push("Collection")
  }
  if (needsCascade) {
    coreImports.push("Cascade")
  }

  lines.push(
    `import { ${coreImports.sort().join(", ")} } from "@mikro-orm/core"`
  )

  // Referenced Interface imports (정렬하여 결정적인 순서 보장)
  const interfaceImports = [...referencedInterfaces].sort().map(
    (interfaceName) => `import type { ${interfaceName} } from "./${interfaceName}"`
  )
  lines.push(...interfaceImports)

  // Referenced Enum imports (정렬하여 결정적인 순서 보장)
  const enumImports = [...referencedEnums].sort().map(
    (enumName) => `import { ${enumName} } from "./${enumName}"`
  )
  lines.push(...enumImports)

  // Related entity imports (정렬하여 결정적인 순서 보장)
  const entityImports = [...relatedEntities].sort().map(
    (entityName) => `import { ${entityName} } from "./${entityName}"`
  )
  lines.push(...entityImports)

  return lines.join("\n")
}
