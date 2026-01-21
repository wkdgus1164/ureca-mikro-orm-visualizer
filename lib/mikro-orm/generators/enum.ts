/**
 * Enum 코드 생성기
 *
 * EnumDefinition과 EnumNode를 TypeScript enum 코드로 변환
 */

import type { EnumDefinition, EntityProperty, EnumNode } from "@/types/entity"
import { sanitizeClassName } from "./utils"

/**
 * Collects unique enum definitions from a list of entity properties by enum name.
 *
 * @param properties - Array of entity properties to scan for enum definitions
 * @returns An array of unique `EnumDefinition` objects; if multiple properties reference the same enum name, the last encountered definition is used
 */
export function collectEnumDefinitions(
  properties: EntityProperty[]
): EnumDefinition[] {
  const enumMap = new Map<string, EnumDefinition>()

  // enum 타입이면서 enumDef가 있는 프로퍼티만 필터링하여 Map에 추가
  properties
    .filter((prop) => prop.type === "enum" && prop.enumDef)
    .forEach((prop) => {
      // 이름 기준으로 중복 제거 (동일 이름이면 마지막 정의 사용)
      enumMap.set(prop.enumDef!.name, prop.enumDef!)
    })

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
export function generateEnumCode(enumDef: EnumDefinition): string {
  const members = enumDef.values.map((enumValue) => {
    // 값이 숫자인지 문자열인지 판단
    const isNumeric =
      !isNaN(Number(enumValue.value)) && enumValue.value !== ""
    const formattedValue = isNumeric
      ? enumValue.value
      : `"${enumValue.value}"`
    return `  ${enumValue.key} = ${formattedValue},`
  })

  return [`export enum ${enumDef.name} {`, ...members, "}"].join("\n")
}

/**
 * Generate TypeScript code for multiple enum definitions.
 *
 * @param enumDefs - The enum definitions to convert into TypeScript enums
 * @returns The concatenated TypeScript enum declarations separated by a single blank line; returns an empty string if `enumDefs` is empty
 */
export function generateAllEnumsCode(enumDefs: EnumDefinition[]): string {
  if (enumDefs.length === 0) return ""

  return enumDefs.map(generateEnumCode).join("\n\n")
}

/**
 * Generates a TypeScript enum declaration from an EnumNode.
 *
 * @param enumNode - Enum node containing the enum name and its values
 * @returns The generated TypeScript enum source code
 */
export function generateEnumNodeCode(enumNode: EnumNode): string {
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
  return new Map(
    nodes.map((node) => [
      sanitizeClassName(node.data.name),
      generateEnumNodeCode(node),
    ])
  )
}
