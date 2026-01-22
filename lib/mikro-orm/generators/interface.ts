/**
 * Interface 코드 생성기
 *
 * InterfaceNode를 TypeScript interface 코드로 변환
 */

import type { InterfaceNode } from "@/types/entity"
import { sanitizeClassName } from "./utils"

/**
 * Generate TypeScript interface code from an InterfaceNode.
 *
 * @param interfaceNode - Interface node containing the interface name, properties, and methods
 * @returns The generated TypeScript interface source code
 *
 * @example
 * ```typescript
 * const code = generateInterfaceCode(interfaceNode)
 * // export interface IRepository {
 * //   id: string;
 * //   findById(id: string): Promise<Entity>;
 * // }
 * ```
 */
export function generateInterfaceCode(interfaceNode: InterfaceNode): string {
  const { name, properties, methods } = interfaceNode.data
  const lines: string[] = []

  // Interface 선언
  lines.push(`export interface ${sanitizeClassName(name)} {`)

  // Properties
  properties.forEach((prop) => {
    const optionalMark = prop.isNullable ? "?" : ""
    lines.push(`  ${prop.name}${optionalMark}: ${prop.type};`)
  })

  // Properties와 Methods 사이 빈 줄
  if (properties.length > 0 && methods.length > 0) {
    lines.push("")
  }

  // Methods
  methods.forEach((method) => {
    const params = method.parameters || ""
    const returnType = method.returnType || "void"
    lines.push(`  ${method.name}(${params}): ${returnType};`)
  })

  // Interface 닫기
  lines.push("}")

  return lines.join("\n")
}

/**
 * Generate TypeScript code for each interface node and return a map keyed by sanitized interface names.
 *
 * @param nodes - The array of interface nodes to convert
 * @returns A map where each key is the sanitized interface name and each value is the generated TypeScript interface code
 */
export function generateAllInterfacesCode(
  nodes: InterfaceNode[]
): Map<string, string> {
  return new Map(
    nodes.map((node) => [
      sanitizeClassName(node.data.name),
      generateInterfaceCode(node),
    ])
  )
}
