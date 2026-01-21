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
  EnumNode,
} from "@/types/entity"
import { isEntityNode, isEmbeddableNode, isEnumNode } from "@/types/entity"
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
 * Create a string of spaces representing indentation for a given level and size.
 *
 * @param level - The indentation level (number of indent steps)
 * @param size - Number of spaces per indent level (default: 2)
 * @returns A string containing `level * size` space characters
 */
function indent(level: number, size: number = 2): string {
  return " ".repeat(level * size)
}

/**
 * Replace all whitespace in a class name with underscores to produce a sanitized identifier.
 *
 * @param name - The class name to sanitize
 * @returns The sanitized class name with all whitespace replaced by underscores
 */
function sanitizeClassName(name: string): string {
  return name.replace(/\s+/g, "_")
}

// =============================================================================
// Enum 코드 생성 (Phase 2)
// =============================================================================

/**
 * Collects unique enum definitions from a list of entity properties by enum name.
 *
 * @param properties - Array of entity properties to scan for enum definitions
 * @returns An array of unique `EnumDefinition` objects; if multiple properties reference the same enum name, the last encountered definition is used
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
 * Generate a TypeScript enum declaration from an EnumDefinition.
 *
 * The provided `enumDef` name becomes the enum identifier and each entry in
 * `enumDef.values` becomes a member where the `key` is the member name and the
 * `value` is the assigned literal. Values that parse as numbers (and are not
 * empty strings) are emitted unquoted; all other values are emitted as quoted
 * strings.
 *
 * @param enumDef - Enum definition with `name` and `values`, where each value has `key` and `value`
 * @returns The generated TypeScript `export enum` declaration as a string
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
 * Generate TypeScript code for multiple enum definitions.
 *
 * @param enumDefs - The enum definitions to convert into TypeScript enums
 * @returns The concatenated TypeScript enum declarations separated by a single blank line; returns an empty string if `enumDefs` is empty
 */
function generateAllEnumsCode(enumDefs: EnumDefinition[]): string {
  if (enumDefs.length === 0) return ""

  return enumDefs.map(generateEnumCode).join("\n\n")
}

/**
 * Builds a MikroORM property decorator options object string from property metadata.
 *
 * Uses the property's `isUnique`, `isNullable`, and `defaultValue` fields to include
 * `unique`, `nullable`, and `default` entries when applicable.
 *
 * @param property - The entity property metadata (reads `isUnique`, `isNullable`, and `defaultValue`)
 * @returns A string containing the options object (e.g. `{ unique: true, nullable: true, default: "x" }`) or an empty string when there are no options
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
 * Generate the decorator lines and TypeScript property declaration for an entity property.
 *
 * Produces the decorator (PrimaryKey, Enum, or Property) and a single-line TypeScript property
 * declaration including nullability marker and type. Enum-typed properties reference the enum
 * name; primary keys receive the `@PrimaryKey()` decorator.
 *
 * @param property - The entity property definition to render
 * @param indentSize - Number of spaces to use for one indentation level
 * @returns A string with the decorator line(s) and the property declaration, separated by newlines
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
 * Map a RelationType to the corresponding MikroORM relation decorator name.
 *
 * @param relationType - The relation type to map
 * @returns The decorator name: `"OneToOne"`, `"OneToMany"`, `"ManyToOne"`, or `"ManyToMany"`
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
 * Determine whether a relation type represents a collection-valued relationship.
 *
 * @param relationType - The relation type to evaluate
 * @returns `true` if the relation is `OneToMany` or `ManyToMany`, `false` otherwise
 */
function isCollectionRelation(relationType: RelationType): boolean {
  return (
    relationType === RelationType.OneToMany ||
    relationType === RelationType.ManyToMany
  )
}

/**
 * Builds MikroORM relationship decorator options as a formatted string.
 *
 * Returns an empty string when no relationship options are enabled; otherwise returns a string
 * that begins with ", {" and contains a multiline, indented object literal with the enabled options.
 *
 * @param data - Relationship configuration containing flags like `cascade`, `isNullable`, `orphanRemoval`, and `fetchType`
 * @param indentSize - Number of spaces used per indentation level when formatting the options
 * @returns An empty string if no options are set, otherwise a multiline object literal string (prefixed with `, {`) suitable for use in a decorator
 */
function generateRelationshipOptions(data: RelationshipData, indentSize: number): string {
  const options: string[] = []

  // 옵션 순서: cascade → nullable → orphanRemoval → eager
  if (data.cascade) {
    options.push("cascade: [Cascade.ALL]")
  }

  if (data.isNullable) {
    options.push("nullable: true")
  }

  if (data.orphanRemoval) {
    options.push("orphanRemoval: true")
  }

  // Eager loading (Lazy는 기본값이므로 생략)
  if (data.fetchType === FetchType.Eager) {
    options.push("eager: true")
  }

  if (options.length === 0) {
    return ""
  }

  // 멀티라인 포맷
  const ind = indent(2, indentSize) // 옵션 들여쓰기 (2레벨)
  const closeInd = indent(1, indentSize) // 닫는 괄호 들여쓰기 (1레벨)
  const formattedOptions = options.map(opt => `${ind}${opt}`).join(",\n")

  return `, {\n${formattedOptions}\n${closeInd}}`
}

/**
 * Generate the MikroORM relationship decorator and corresponding property declaration for a given relationship edge.
 *
 * Generates code only when the provided sourceEntity is the edge's source and the edge has relationship data; returns `null` otherwise.
 *
 * @param edge - The relationship edge describing the relation and its metadata.
 * @param sourceEntity - The entity for which the relationship code is generated; generation occurs only if this entity is the edge source.
 * @param targetEntity - The related target entity referenced by the relationship.
 * @param allNodes - All entity nodes in the diagram (provided for context when resolving names/imports).
 * @param indentSize - Number of spaces to use for indentation.
 * @returns The decorator and property declaration as a string, or `null` if no code should be generated.
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
  const targetName = sanitizeClassName(targetEntity.data.name)
  const options = generateRelationshipOptions(data, indentSize)

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
 * Collects MikroORM decorators and related import requirements for a given entity.
 *
 * Inspects the entity's properties, indexes, and relationships to determine which decorators
 * are required, which other entity classes must be imported, and whether Collection or Cascade
 * utilities are needed.
 *
 * @param entity - The entity node to analyze
 * @param edges - All relationship edges in the diagram
 * @param allNodes - All entity nodes in the diagram (used to resolve related entity names)
 * @returns An object containing:
 *  - `decorators`: a set of decorator names required for the entity (e.g., "Entity", "Property", "PrimaryKey", "Enum", "Index", "Unique", relation decorators)
 *  - `relatedEntities`: a set of sanitized class names of other entities referenced by this entity's relationships (for import statements)
 *  - `needsCollection`: `true` if any relationship uses a collection type (OneToMany or ManyToMany), `false` otherwise
 *  - `needsCascade`: `true` if any relationship declares cascade, `false` otherwise
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
        relatedEntities.add(sanitizeClassName(targetNode.data.name))
      }
    }
  }

  return { decorators, relatedEntities, needsCollection, needsCascade }
}

/**
 * Generate `@Index` and `@Unique` decorator lines for the indexes defined on an entity.
 *
 * @param entity - The entity node whose `data.indexes` will be converted; indexes with no properties are ignored.
 * @returns An array of decorator strings such as `@Index({ properties: [...] })` or `@Unique({ properties: [...], name: "..." })`
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
 * Builds import statements for MikroORM core decorators and related entity classes.
 *
 * @param decorators - Names of decorators to import from `@mikro-orm/core`
 * @param relatedEntities - Names of related entity classes to import from local files (`./<EntityName>`)
 * @param needsCollection - Include `Collection` in the core import when `true`
 * @param needsCascade - Include `Cascade` in the core import when `true`
 * @returns A string containing the combined import statements
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
 * Generate TypeScript source code for a MikroORM entity node.
 *
 * Produces imports, enum declarations (if any), index/unique decorators, the @Entity decorator,
 * property declarations with decorators, relationship properties, and the enclosing class.
 *
 * @param entity - The Entity node to convert
 * @param edges - All relationship edges in the diagram (used to emit relationships where `entity` is the source)
 * @param allNodes - All entity nodes for resolving relationship targets
 * @param options - Generation options (e.g., indentation size, collection import path)
 * @returns The generated TypeScript source code for the entity as a string
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
  lines.push(`export class ${sanitizeClassName(entity.data.name)} {`)

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
 * Generate TypeScript source code for each entity node and return them keyed by sanitized entity name.
 *
 * @returns A Map where each key is the sanitized entity class name and each value is the generated TypeScript code for that entity
 */
export function generateAllEntitiesCode(
  nodes: EntityNode[],
  edges: RelationshipEdge[],
  options: GeneratorOptions = {}
): Map<string, string> {
  const result = new Map<string, string>()

  for (const node of nodes) {
    const code = generateEntityCode(node, edges, nodes, options)
    result.set(sanitizeClassName(node.data.name), code)
  }

  return result
}

// =============================================================================
// Embeddable 코드 생성 (Phase 2)
// =============================================================================

/**
 * Generate TypeScript code for a MikroORM embeddable node.
 *
 * Includes any enum declarations required by the embeddable's properties.
 *
 * @param embeddable - The Embeddable node to convert into TypeScript code
 * @param options - Generator options (e.g., indentation size, collection import path)
 * @returns The generated TypeScript source code for the embeddable class
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
  lines.push(`export class ${sanitizeClassName(embeddable.data.name)} {`)

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
 * Generate TypeScript code for each embeddable node.
 *
 * @param nodes - Array of embeddable nodes to convert into code
 * @param options - Generator options that customize output formatting and imports
 * @returns A map where each key is an embeddable name and each value is the generated TypeScript code for that embeddable
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
 * Generates a TypeScript enum declaration from an EnumNode.
 *
 * @param enumNode - Enum node containing the enum name and its values
 * @returns The generated TypeScript enum source code
 */
export function generateEnumNodeCode(enumNode: EnumNode): string {
  // EnumNode의 data를 EnumDefinition으로 사용
  const enumDef: EnumDefinition = {
    name: enumNode.data.name,
    values: enumNode.data.values,
  }
  return generateEnumCode(enumDef)
}

/**
 * Generate TypeScript code for each enum node and return a map keyed by sanitized enum names.
 *
 * @param nodes - The array of enum nodes to convert
 * @returns A map where each key is the sanitized enum name and each value is the generated TypeScript enum code
 */
export function generateAllEnumNodesCode(
  nodes: EnumNode[]
): Map<string, string> {
  const result = new Map<string, string>()

  for (const node of nodes) {
    const code = generateEnumNodeCode(node)
    result.set(sanitizeClassName(node.data.name), code)
  }

  return result
}

/**
 * Generate TypeScript source code for all diagram nodes (entities, embeddables, and enums).
 *
 * @param nodes - Array of diagram nodes to process (Entity, Embeddable, and Enum nodes)
 * @param edges - Relationship edges used when generating entity code
 * @param options - Generator options (e.g., indent size, collection import path)
 * @returns A Map that maps each sanitized node name to its generated TypeScript source code
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
  // Enum 노드만 필터링
  const enumNodes = nodes.filter(isEnumNode)

  // Entity 코드 생성
  for (const entity of entityNodes) {
    const code = generateEntityCode(entity, edges, entityNodes, options)
    result.set(sanitizeClassName(entity.data.name), code)
  }

  // Embeddable 코드 생성
  for (const embeddable of embeddableNodes) {
    const code = generateEmbeddableCode(embeddable, options)
    result.set(sanitizeClassName(embeddable.data.name), code)
  }

  // Enum 코드 생성
  for (const enumNode of enumNodes) {
    const code = generateEnumNodeCode(enumNode)
    result.set(sanitizeClassName(enumNode.data.name), code)
  }

  return result
}