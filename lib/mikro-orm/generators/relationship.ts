/**
 * Relationship 코드 생성기
 *
 * RelationshipEdge를 MikroORM 관계 데코레이터 코드로 변환
 */

import type { EntityNode } from "@/types/entity"
import type { RelationshipEdge, RelationshipData } from "@/types/relationship"
import { RelationType, FetchType } from "@/types/relationship"
import { indent, sanitizeClassName } from "./utils"

/**
 * Map a RelationType to the corresponding MikroORM relation decorator name.
 *
 * @param relationType - The relation type to map
 * @returns The decorator name, or `null` for Inheritance/Implementation (which use extends/implements)
 */
export function getRelationDecorator(relationType: RelationType): string | null {
  switch (relationType) {
    case RelationType.OneToOne:
      return "OneToOne"
    case RelationType.OneToMany:
    case RelationType.Composition:
    case RelationType.Aggregation:
      return "OneToMany"
    case RelationType.ManyToOne:
      return "ManyToOne"
    case RelationType.ManyToMany:
      return "ManyToMany"
    case RelationType.Inheritance:
    case RelationType.Implementation:
      // 상속/구현은 데코레이터가 아닌 extends/implements 키워드 사용
      return null
  }
}

/**
 * Determine whether a relation type represents a collection-valued relationship.
 *
 * @param relationType - The relation type to evaluate
 * @returns `true` if the relation is `OneToMany` or `ManyToMany`, `false` otherwise
 */
export function isCollectionRelation(relationType: RelationType): boolean {
  return (
    relationType === RelationType.OneToMany ||
    relationType === RelationType.ManyToMany ||
    relationType === RelationType.Composition ||
    relationType === RelationType.Aggregation
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
export function generateRelationshipOptions(
  data: RelationshipData,
  indentSize: number
): string {
  const options: string[] = []

  // 옵션 순서: cascade → nullable → orphanRemoval → eager
  if (data.cascade) {
    options.push("cascade: [Cascade.ALL]")
  }

  if (data.isNullable) {
    options.push("nullable: true")
  }

  // Composition은 자동으로 orphanRemoval: true
  if (data.orphanRemoval || data.relationType === RelationType.Composition) {
    options.push("orphanRemoval: true")
  }

  // Eager loading (Lazy는 기본값이므로 생략)
  if (data.fetchType === FetchType.Eager) {
    options.push("eager: true")
  }

  // Delete Rule
  if (data.deleteRule) {
    options.push(`deleteRule: '${data.deleteRule}'`)
  }

  if (options.length === 0) {
    return ""
  }

  // 멀티라인 포맷
  const ind = indent(2, indentSize) // 옵션 들여쓰기 (2레벨)
  const closeInd = indent(1, indentSize) // 닫는 괄호 들여쓰기 (1레벨)
  const formattedOptions = options.map((opt) => `${ind}${opt}`).join(",\n")

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
 * @param indentSize - Number of spaces to use for indentation.
 * @returns The decorator and property declaration as a string, or `null` if no code should be generated.
 */
export function generateRelationship(
  edge: RelationshipEdge,
  sourceEntity: EntityNode,
  targetEntity: EntityNode,
  indentSize: number
): string | null {
  const data = edge.data
  if (!data) return null

  // 현재 Entity가 source인 경우만 처리 (중복 방지)
  if (sourceEntity.id !== edge.source) return null

  const decorator = getRelationDecorator(data.relationType)

  // Inheritance/Implementation은 데코레이터가 아닌 extends/implements 사용
  if (decorator === null) return null

  const lines: string[] = []
  const ind = indent(1, indentSize)
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
      `${ind}${data.sourceProperty}: Collection<${targetName}> = new Collection<${targetName}>(this)`
    )
  } else {
    // 단일 참조 타입
    lines.push(`${ind}@${decorator}(() => ${targetName}${mappedBy}${options})`)
    const nullable = data.isNullable ? "?" : "!"
    lines.push(`${ind}${data.sourceProperty}${nullable}: ${targetName}`)
  }

  return lines.join("\n")
}
