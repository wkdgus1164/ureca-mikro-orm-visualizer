/**
 * MikroORM TypeScript 코드 생성기
 *
 * Entity, Embeddable, Enum, Interface 노드와 Relationship 엣지를
 * MikroORM 데코레이터가 포함된 TypeScript 클래스로 변환
 *
 * 이 파일은 generators/ 모듈의 public API를 제공합니다.
 * 상세 구현은 generators/ 하위 모듈에서 담당합니다.
 *
 * @see generators/entity.ts - Entity 코드 생성
 * @see generators/embeddable.ts - Embeddable 코드 생성
 * @see generators/enum.ts - Enum 코드 생성
 * @see generators/interface.ts - Interface 코드 생성
 * @see generators/property.ts - Property 코드 생성
 * @see generators/relationship.ts - Relationship 코드 생성
 * @see generators/imports.ts - Import 문 생성
 */

import type { DiagramNode, EntityNode, EmbeddableNode, EnumNode, InterfaceNode } from "@/types/entity"
import { isEntityNode, isEmbeddableNode, isEnumNode, isInterfaceNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"

// generators 모듈에서 필요한 함수들 import
import {
  type GeneratorOptions,
  sanitizeClassName,
  generateEntityCode,
  generateAllEntitiesCode,
  generateEmbeddableCode,
  generateAllEmbeddablesCode,
  generateEnumNodeCode,
  generateAllEnumNodesCode,
  generateInterfaceCode,
  generateAllInterfacesCode,
} from "./generators"

// Public API re-export
export type { GeneratorOptions } from "./generators"
export {
  generateEntityCode,
  generateAllEntitiesCode,
  generateEmbeddableCode,
  generateAllEmbeddablesCode,
  generateEnumNodeCode,
  generateAllEnumNodesCode,
  generateInterfaceCode,
  generateAllInterfacesCode,
}

/**
 * Generate TypeScript source code for all diagram nodes (entities, embeddables, enums, and interfaces).
 *
 * This is the main entry point for code generation from a complete diagram.
 *
 * @param nodes - Array of diagram nodes to process (Entity, Embeddable, Enum, and Interface nodes)
 * @param edges - Relationship edges used when generating entity code
 * @param options - Generator options (e.g., indent size, collection import path)
 * @returns A Map that maps each sanitized node name to its generated TypeScript source code
 *
 * @example
 * ```typescript
 * const codeMap = generateAllDiagramCode(nodes, edges)
 * for (const [name, code] of codeMap) {
 *   console.log(`// ${name}.ts`)
 *   console.log(code)
 * }
 * ```
 */
export function generateAllDiagramCode(
  nodes: DiagramNode[],
  edges: RelationshipEdge[],
  options: GeneratorOptions = {}
): Map<string, string> {
  const result = new Map<string, string>()

  // 노드 타입별 분류
  const entityNodes: EntityNode[] = nodes.filter(isEntityNode)
  const embeddableNodes: EmbeddableNode[] = nodes.filter(isEmbeddableNode)
  const enumNodes: EnumNode[] = nodes.filter(isEnumNode)
  const interfaceNodes: InterfaceNode[] = nodes.filter(isInterfaceNode)

  // Entity 코드 생성 (EnumNode, InterfaceNode 전달하여 참조 처리)
  entityNodes.forEach((entity) => {
    const code = generateEntityCode(entity, edges, entityNodes, options, enumNodes, interfaceNodes)
    result.set(sanitizeClassName(entity.data.name), code)
  })

  // Embeddable 코드 생성 (EnumNode 전달하여 Enum 참조 처리)
  embeddableNodes.forEach((embeddable) => {
    const code = generateEmbeddableCode(embeddable, options, enumNodes)
    result.set(sanitizeClassName(embeddable.data.name), code)
  })

  // Enum 코드 생성
  enumNodes.forEach((enumNode) => {
    const code = generateEnumNodeCode(enumNode)
    result.set(sanitizeClassName(enumNode.data.name), code)
  })

  // Interface 코드 생성
  interfaceNodes.forEach((interfaceNode) => {
    const code = generateInterfaceCode(interfaceNode)
    result.set(sanitizeClassName(interfaceNode.data.name), code)
  })

  return result
}
