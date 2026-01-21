/**
 * MikroORM 코드 생성기 모듈
 *
 * 다이어그램 노드를 MikroORM TypeScript 코드로 변환하는 생성기들의 통합 export
 *
 * @module generators
 */

// 공통 유틸리티
export { indent, sanitizeClassName } from "./utils"
export type { GeneratorOptions } from "./utils"

// Enum 생성기
export {
  collectEnumDefinitions,
  generateEnumCode,
  generateAllEnumsCode,
  generateEnumNodeCode,
  generateAllEnumNodesCode,
} from "./enum"

// Property 생성기
export { generatePropertyOptions, generateProperty } from "./property"

// Relationship 생성기
export {
  getRelationDecorator,
  isCollectionRelation,
  generateRelationshipOptions,
  generateRelationship,
} from "./relationship"

// Import 생성기
export { collectImports, generateImports } from "./imports"
export type { CollectedImports } from "./imports"

// Entity 생성기
export { generateEntityCode, generateAllEntitiesCode } from "./entity"

// Embeddable 생성기
export { generateEmbeddableCode, generateAllEmbeddablesCode } from "./embeddable"
