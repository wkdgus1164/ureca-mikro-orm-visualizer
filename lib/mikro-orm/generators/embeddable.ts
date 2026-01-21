/**
 * Embeddable 코드 생성기
 *
 * EmbeddableNode를 MikroORM Embeddable 클래스 코드로 변환
 */

import type { EmbeddableNode } from "@/types/entity"
import { type GeneratorOptions, DEFAULT_OPTIONS, sanitizeClassName } from "./utils"
import { collectEnumDefinitions, generateAllEnumsCode } from "./enum"
import { generateProperty } from "./property"

/**
 * Generate TypeScript code for a MikroORM embeddable node.
 *
 * Includes any enum declarations required by the embeddable's properties.
 *
 * @param embeddable - The Embeddable node to convert into TypeScript code
 * @param options - Generator options (e.g., indentation size)
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

  // Enum 타입 프로퍼티 확인
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

  // Enum 정의
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
 * @param options - Generator options
 * @returns A map where each key is an embeddable name and each value is the generated code
 */
export function generateAllEmbeddablesCode(
  nodes: EmbeddableNode[],
  options: GeneratorOptions = {}
): Map<string, string> {
  return new Map(
    nodes.map((node) => [
      sanitizeClassName(node.data.name),
      generateEmbeddableCode(node, options),
    ])
  )
}
