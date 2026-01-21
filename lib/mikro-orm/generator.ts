/**
 * MikroORM TypeScript 코드 생성기
 *
 * Entity 노드와 Relationship 엣지를 MikroORM 데코레이터가 포함된
 * TypeScript 클래스로 변환
 * Phase 2: Embeddable 지원 추가
 */

import type {
  EntityNode,
  EntityProperty,
  EmbeddableNode,
  DiagramNode,
  EnumDefinition,
} from "@/types/entity"
import { isEntityNode, isEmbeddableNode } from "@/types/entity"
import type { RelationshipEdge, RelationshipData } from "@/types/relationship"
import { RelationType, FetchType } from "@/types/relationship"

/**
 * 코드 생성 옵션
 */
interface GeneratorOptions {
  /** 들여쓰기 크기 (스페이스 수) */
  indentSize?: number
  /** Collection import 경로 */
  collectionImport?: string
}

const DEFAULT_OPTIONS: GeneratorOptions = {
  indentSize: 2,
  collectionImport: "@mikro-orm/core",
}

/**
 * 들여쓰기 헬퍼
 */
function indent(level: number, size: number = 2): string {
  return " ".repeat(level * size)
}

// =============================================================================
// Enum 코드 생성 (Phase 2)
// =============================================================================

/**
 * Property 목록에서 고유한 Enum 정의를 수집
 *
 * @param properties - Property 목록
 * @returns 고유한 Enum 정의 배열 (이름 기준 중복 제거)
 */
function collectEnumDefinitions(properties: EntityProperty[]): EnumDefinition[] {
  const enumMap = new Map<string, EnumDefinition>()

  for (const prop of properties) {
    if (prop.type === "enum" && prop.enumDef) {
      // 이름 기준으로 중복 제거 (동일 이름이면 마지막 정의 사용)
      enumMap.set(prop.enumDef.name, prop.enumDef)
    }
  }

  return Array.from(enumMap.values())
}

/**
 * Enum 정의를 TypeScript enum 코드로 변환
 *
 * @param enumDef - Enum 정의
 * @returns 생성된 TypeScript enum 코드
 *
 * @example
 * ```ts
 * const code = generateEnumCode({ name: "UserRole", values: [{ key: "Admin", value: "admin" }] })
 * // 결과:
 * // export enum UserRole {
 * //   Admin = "admin",
 * // }
 * ```
 */
function generateEnumCode(enumDef: EnumDefinition): string {
  const lines: string[] = []

  lines.push(`export enum ${enumDef.name} {`)

  for (const enumValue of enumDef.values) {
    // 값이 숫자인지 문자열인지 판단
    const isNumeric = !isNaN(Number(enumValue.value)) && enumValue.value !== ""
    const formattedValue = isNumeric ? enumValue.value : `"${enumValue.value}"`
    lines.push(`  ${enumValue.key} = ${formattedValue},`)
  }

  lines.push("}")

  return lines.join("\n")
}

/**
 * 여러 Enum 정의를 TypeScript 코드로 변환
 *
 * @param enumDefs - Enum 정의 배열
 * @returns 생성된 TypeScript enum 코드 (줄바꿈으로 구분)
 */
function generateAllEnumsCode(enumDefs: EnumDefinition[]): string {
  if (enumDefs.length === 0) return ""

  return enumDefs.map(generateEnumCode).join("\n\n")
}

/**
 * Property 데코레이터 옵션 생성
 */
function generatePropertyOptions(property: EntityProperty): string {
  const options: string[] = []

  if (property.isUnique) {
    options.push("unique: true")
  }

  if (property.isNullable) {
    options.push("nullable: true")
  }

  if (property.defaultValue !== undefined && property.defaultValue !== "") {
    // 숫자나 boolean은 그대로, 문자열은 따옴표 처리
    const value = property.defaultValue
    if (
      value === "true" ||
      value === "false" ||
      !isNaN(Number(value)) ||
      value.startsWith("new ") ||
      value.startsWith("() =>")
    ) {
      options.push(`default: ${value}`)
    } else {
      options.push(`default: "${value}"`)
    }
  }

  return options.length > 0 ? `{ ${options.join(", ")} }` : ""
}

/**
 * Property 데코레이터 및 선언 생성
 */
function generateProperty(
  property: EntityProperty,
  indentSize: number
): string {
  const lines: string[] = []
  const ind = indent(1, indentSize)

  if (property.isPrimaryKey) {
    lines.push(`${ind}@PrimaryKey()`)
  } else if (property.type === "enum" && property.enumDef) {
    // Enum 타입 처리 (Phase 2)
    const enumName = property.enumDef.name
    const options = generatePropertyOptions(property)
    if (options) {
      lines.push(`${ind}@Enum({ items: () => ${enumName}, ${options.slice(2, -2)} })`)
    } else {
      lines.push(`${ind}@Enum(() => ${enumName})`)
    }
  } else {
    const options = generatePropertyOptions(property)
    lines.push(`${ind}@Property(${options})`)
  }

  // 타입 선언
  const nullable = property.isNullable ? "?" : "!"
  // Enum인 경우 enum 이름을 타입으로 사용
  const propertyType = property.type === "enum" && property.enumDef
    ? property.enumDef.name
    : property.type
  lines.push(`${ind}${property.name}${nullable}: ${propertyType}`)

  return lines.join("\n")
}

/**
 * 관계 타입에 따른 데코레이터 이름
 */
function getRelationDecorator(relationType: RelationType): string {
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
 * 관계가 Collection 타입인지 확인
 */
function isCollectionRelation(relationType: RelationType): boolean {
  return (
    relationType === RelationType.OneToMany ||
    relationType === RelationType.ManyToMany
  )
}

/**
 * Relationship 데코레이터 옵션 생성
 */
function generateRelationshipOptions(data: RelationshipData): string {
  const options: string[] = []

  if (data.isNullable) {
    options.push("nullable: true")
  }

  if (data.cascade) {
    options.push("cascade: [Cascade.ALL]")
  }

  if (data.orphanRemoval) {
    options.push("orphanRemoval: true")
  }

  // Eager loading (Lazy는 기본값이므로 생략)
  if (data.fetchType === FetchType.Eager) {
    options.push("eager: true")
  }

  return options.length > 0 ? `, { ${options.join(", ")} }` : ""
}

/**
 * Relationship 데코레이터 및 선언 생성
 */
function generateRelationship(
  edge: RelationshipEdge,
  sourceEntity: EntityNode,
  targetEntity: EntityNode,
  allNodes: EntityNode[],
  indentSize: number
): string | null {
  const data = edge.data
  if (!data) return null

  // 현재 Entity가 source인 경우만 처리 (중복 방지)
  if (sourceEntity.id !== edge.source) return null

  const lines: string[] = []
  const ind = indent(1, indentSize)
  const decorator = getRelationDecorator(data.relationType)
  const targetName = targetEntity.data.name
  const options = generateRelationshipOptions(data)

  // mappedBy 옵션 (양방향 관계인 경우)
  const mappedBy = data.targetProperty
    ? `, ${data.sourceProperty} => ${data.sourceProperty}.${data.targetProperty}`
    : ""

  if (isCollectionRelation(data.relationType)) {
    // Collection 타입
    lines.push(`${ind}@${decorator}(() => ${targetName}${mappedBy}${options})`)
    lines.push(
      `${ind}${data.sourceProperty} = new Collection<${targetName}>(this)`
    )
  } else {
    // 단일 참조 타입
    lines.push(`${ind}@${decorator}(() => ${targetName}${mappedBy}${options})`)
    const nullable = data.isNullable ? "?" : "!"
    lines.push(`${ind}${data.sourceProperty}${nullable}: ${targetName}`)
  }

  return lines.join("\n")
}

/**
 * Entity별 필요한 데코레이터 import 수집
 */
function collectImports(
  entity: EntityNode,
  edges: RelationshipEdge[],
  allNodes: EntityNode[]
): {
  decorators: Set<string>
  relatedEntities: Set<string>
  needsCollection: boolean
  needsCascade: boolean
} {
  const decorators = new Set<string>(["Entity"])
  const relatedEntities = new Set<string>()
  let needsCollection = false
  let needsCascade = false

  // Properties
  const hasPrimaryKey = entity.data.properties.some((p) => p.isPrimaryKey)
  if (hasPrimaryKey) {
    decorators.add("PrimaryKey")
  }

  // Enum이 아닌 일반 프로퍼티가 있는지 확인
  const hasRegularProps = entity.data.properties.some(
    (p) => !p.isPrimaryKey && p.type !== "enum"
  )
  if (hasRegularProps) {
    decorators.add("Property")
  }

  // Enum 타입 프로퍼티 확인 (Phase 2)
  const hasEnumProps = entity.data.properties.some(
    (p) => p.type === "enum" && p.enumDef
  )
  if (hasEnumProps) {
    decorators.add("Enum")
  }

  // Indexes (Phase 2)
  const indexes = entity.data.indexes ?? []
  const hasRegularIndex = indexes.some((idx) => !idx.isUnique && idx.properties.length > 0)
  const hasUniqueIndex = indexes.some((idx) => idx.isUnique && idx.properties.length > 0)

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

  for (const edge of entityEdges) {
    const data = edge.data
    if (!data) continue

    // 이 Entity가 source인 경우만 데코레이터 추가
    if (edge.source === entity.id) {
      decorators.add(getRelationDecorator(data.relationType))

      if (isCollectionRelation(data.relationType)) {
        needsCollection = true
      }

      if (data.cascade) {
        needsCascade = true
      }

      // 타겟 Entity 찾기
      const targetNode = allNodes.find((n) => n.id === edge.target)
      if (targetNode && targetNode.data.name !== entity.data.name) {
        relatedEntities.add(targetNode.data.name)
      }
    }
  }

  return { decorators, relatedEntities, needsCollection, needsCascade }
}

/**
 * Entity 레벨 Index 데코레이터 생성
 */
function generateIndexDecorators(entity: EntityNode): string[] {
  const indexes = entity.data.indexes ?? []
  const lines: string[] = []

  for (const index of indexes) {
    // 프로퍼티가 없는 Index는 무시
    if (index.properties.length === 0) continue

    const decorator = index.isUnique ? "Unique" : "Index"
    const propsArray = `[${index.properties.map((p) => `"${p}"`).join(", ")}]`

    if (index.name) {
      lines.push(`@${decorator}({ properties: ${propsArray}, name: "${index.name}" })`)
    } else {
      lines.push(`@${decorator}({ properties: ${propsArray} })`)
    }
  }

  return lines
}

/**
 * Import 문 생성
 */
function generateImports(
  decorators: Set<string>,
  relatedEntities: Set<string>,
  needsCollection: boolean,
  needsCascade: boolean
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

  // Related entity imports
  for (const entityName of relatedEntities) {
    lines.push(`import { ${entityName} } from "./${entityName}"`)
  }

  return lines.join("\n")
}

/**
 * Entity 노드를 TypeScript 코드로 변환
 *
 * @param entity - 변환할 Entity 노드
 * @param edges - 모든 Relationship 엣지
 * @param allNodes - 모든 Entity 노드 (관계 참조용)
 * @param options - 생성 옵션
 * @returns 생성된 TypeScript 코드
 *
 * @example
 * ```ts
 * const code = generateEntityCode(userNode, edges, allNodes)
 * // 결과:
 * // import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core"
 * // import { Post } from "./Post"
 * //
 * // @Entity()
 * // export class User {
 * //   @PrimaryKey()
 * //   id!: number
 * //
 * //   @Property({ unique: true })
 * //   email!: string
 * //
 * //   @OneToMany(() => Post, post => post.author)
 * //   posts = new Collection<Post>(this)
 * // }
 * ```
 */
export function generateEntityCode(
  entity: EntityNode,
  edges: RelationshipEdge[],
  allNodes: EntityNode[],
  options: GeneratorOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const indentSize = opts.indentSize!

  // Import 정보 수집
  const { decorators, relatedEntities, needsCollection, needsCascade } =
    collectImports(entity, edges, allNodes)

  // Enum 정의 수집 (Phase 2)
  const enumDefs = collectEnumDefinitions(entity.data.properties)

  const lines: string[] = []

  // Import 문
  const imports = generateImports(
    decorators,
    relatedEntities,
    needsCollection,
    needsCascade
  )
  lines.push(imports)
  lines.push("")

  // Enum 정의 (Phase 2 - Import 문 뒤, 클래스 앞)
  const enumsCode = generateAllEnumsCode(enumDefs)
  if (enumsCode) {
    lines.push(enumsCode)
    lines.push("")
  }

  // Index/Unique 데코레이터 (Phase 2)
  const indexDecorators = generateIndexDecorators(entity)
  for (const indexDec of indexDecorators) {
    lines.push(indexDec)
  }

  // Entity 데코레이터
  if (entity.data.tableName) {
    lines.push(`@Entity({ tableName: "${entity.data.tableName}" })`)
  } else {
    lines.push("@Entity()")
  }

  // 클래스 선언
  lines.push(`export class ${entity.data.name} {`)

  // Properties
  const propertyCode = entity.data.properties
    .map((prop) => generateProperty(prop, indentSize))
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
      return generateRelationship(edge, entity, targetNode, allNodes, indentSize)
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
 * 모든 Entity를 TypeScript 코드로 변환
 *
 * @param nodes - Entity 노드 목록
 * @param edges - Relationship 엣지 목록
 * @param options - 생성 옵션
 * @returns Entity 이름과 코드의 맵
 */
export function generateAllEntitiesCode(
  nodes: EntityNode[],
  edges: RelationshipEdge[],
  options: GeneratorOptions = {}
): Map<string, string> {
  const result = new Map<string, string>()

  for (const node of nodes) {
    const code = generateEntityCode(node, edges, nodes, options)
    result.set(node.data.name, code)
  }

  return result
}

// =============================================================================
// Embeddable 코드 생성 (Phase 2)
// =============================================================================

/**
 * Embeddable 노드를 TypeScript 코드로 변환
 *
 * @param embeddable - 변환할 Embeddable 노드
 * @param options - 생성 옵션
 * @returns 생성된 TypeScript 코드
 *
 * @example
 * ```ts
 * const code = generateEmbeddableCode(addressNode)
 * // 결과:
 * // import { Embeddable, Property } from "@mikro-orm/core"
 * //
 * // @Embeddable()
 * // export class Address {
 * //   @Property()
 * //   street!: string
 * //
 * //   @Property()
 * //   city!: string
 * // }
 * ```
 */
export function generateEmbeddableCode(
  embeddable: EmbeddableNode,
  options: GeneratorOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const indentSize = opts.indentSize!

  const lines: string[] = []

  // Import 문 (Embeddable은 관계가 없으므로 간단)
  const decorators = new Set<string>(["Embeddable"])

  // Enum이 아닌 일반 프로퍼티가 있는지 확인
  const hasRegularProps = embeddable.data.properties.some(
    (p) => !p.isPrimaryKey && p.type !== "enum"
  )
  if (hasRegularProps) {
    decorators.add("Property")
  }

  // Enum 타입 프로퍼티 확인 (Phase 2)
  const hasEnumProps = embeddable.data.properties.some(
    (p) => p.type === "enum" && p.enumDef
  )
  if (hasEnumProps) {
    decorators.add("Enum")
  }

  lines.push(
    `import { ${[...decorators].sort().join(", ")} } from "@mikro-orm/core"`
  )
  lines.push("")

  // Enum 정의 (Phase 2)
  const enumDefs = collectEnumDefinitions(embeddable.data.properties)
  const enumsCode = generateAllEnumsCode(enumDefs)
  if (enumsCode) {
    lines.push(enumsCode)
    lines.push("")
  }

  // Embeddable 데코레이터
  lines.push("@Embeddable()")

  // 클래스 선언
  lines.push(`export class ${embeddable.data.name} {`)

  // Properties (PrimaryKey 제외 - Embeddable에는 PK가 없음)
  const propertyCode = embeddable.data.properties
    .filter((prop) => !prop.isPrimaryKey) // Embeddable에는 PK 불필요
    .map((prop) => generateProperty(prop, indentSize))
    .join("\n\n")

  if (propertyCode) {
    lines.push(propertyCode)
  }

  // 클래스 닫기
  lines.push("}")

  return lines.join("\n")
}

/**
 * 모든 Embeddable을 TypeScript 코드로 변환
 *
 * @param nodes - Embeddable 노드 목록
 * @param options - 생성 옵션
 * @returns Embeddable 이름과 코드의 맵
 */
export function generateAllEmbeddablesCode(
  nodes: EmbeddableNode[],
  options: GeneratorOptions = {}
): Map<string, string> {
  const result = new Map<string, string>()

  for (const node of nodes) {
    const code = generateEmbeddableCode(node, options)
    result.set(node.data.name, code)
  }

  return result
}

/**
 * 모든 다이어그램 노드 (Entity + Embeddable)를 TypeScript 코드로 변환
 *
 * @param nodes - 모든 노드 (Entity + Embeddable)
 * @param edges - Relationship 엣지 목록
 * @param options - 생성 옵션
 * @returns 노드 이름과 코드의 맵
 */
export function generateAllDiagramCode(
  nodes: DiagramNode[],
  edges: RelationshipEdge[],
  options: GeneratorOptions = {}
): Map<string, string> {
  const result = new Map<string, string>()

  // Entity 노드만 필터링
  const entityNodes = nodes.filter(isEntityNode)
  // Embeddable 노드만 필터링
  const embeddableNodes = nodes.filter(isEmbeddableNode)

  // Entity 코드 생성
  for (const entity of entityNodes) {
    const code = generateEntityCode(entity, edges, entityNodes, options)
    result.set(entity.data.name, code)
  }

  // Embeddable 코드 생성
  for (const embeddable of embeddableNodes) {
    const code = generateEmbeddableCode(embeddable, options)
    result.set(embeddable.data.name, code)
  }

  return result
}
