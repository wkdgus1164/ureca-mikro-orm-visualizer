/**
 * Property 코드 생성기
 *
 * EntityProperty를 MikroORM 데코레이터가 포함된 프로퍼티 코드로 변환
 */

import type { EntityProperty } from "@/types/entity"
import { indent } from "./utils"

/**
 * Builds a MikroORM property decorator options object string from property metadata.
 *
 * Uses the property's `isUnique`, `isNullable`, and `defaultValue` fields to include
 * `unique`, `nullable`, and `default` entries when applicable.
 *
 * @param property - The entity property metadata (reads `isUnique`, `isNullable`, and `defaultValue`)
 * @returns A string containing the options object (e.g. `{ unique: true, nullable: true, default: "x" }`) or an empty string when there are no options
 */
export function generatePropertyOptions(property: EntityProperty): string {
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
      // 문자열 내 백슬래시와 따옴표를 이스케이프 처리
      const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      options.push(`default: "${escaped}"`)
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
export function generateProperty(
  property: EntityProperty,
  indentSize: number
): string {
  const lines: string[] = []
  const ind = indent(1, indentSize)

  if (property.isPrimaryKey) {
    lines.push(`${ind}@PrimaryKey()`)
  } else if (property.type === "enum" && property.enumDef) {
    // Enum 타입 처리
    const enumName = property.enumDef.name
    const options = generatePropertyOptions(property)
    if (options) {
      lines.push(
        `${ind}@Enum({ items: () => ${enumName}, ${options.slice(2, -2)} })`
      )
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
  const propertyType =
    property.type === "enum" && property.enumDef
      ? property.enumDef.name
      : property.type
  lines.push(`${ind}${property.name}${nullable}: ${propertyType}`)

  return lines.join("\n")
}
