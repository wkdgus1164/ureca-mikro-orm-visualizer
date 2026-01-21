/**
 * Entity 및 Embeddable 관련 타입 정의
 *
 * MikroORM Entity와 Embeddable을 비주얼 에디터에서 표현하기 위한 타입들
 */

/**
 * 노드 종류 (Entity, Embeddable, 또는 Enum)
 */
export type NodeKind = "entity" | "embeddable" | "enum"

/**
 * Enum 값 정의 (Phase 2)
 *
 * @example
 * const adminValue: EnumValue = {
 *   key: "Admin",
 *   value: "admin",
 * }
 */
export interface EnumValue {
  /** Enum 키 (예: "Admin", "User") */
  key: string
  /** Enum 값 (예: "admin", "user") */
  value: string
}

/**
 * Enum 정의 (Phase 2)
 *
 * @example
 * const userRole: EnumDefinition = {
 *   name: "UserRole",
 *   values: [
 *     { key: "Admin", value: "admin" },
 *     { key: "User", value: "user" },
 *   ],
 * }
 */
export interface EnumDefinition {
  /** Enum 이름 (예: "UserRole", "PostStatus") */
  name: string
  /** Enum 값 목록 */
  values: EnumValue[]
}

/**
 * Enum 노드의 데이터 구조
 *
 * ReactFlow 노드의 data 프로퍼티에 저장되는 정보
 */
export interface EnumData {
  /** Enum 이름 (예: "UserRole", "PostStatus") - 타입명으로 사용 */
  name: string
  /** Enum 값 목록 */
  values: EnumValue[]
  /** ReactFlow 타입 호환을 위한 index signature */
  [key: string]: unknown
}

/**
 * ReactFlow Enum 노드 타입
 *
 * ReactFlow의 Node 타입을 기반으로 한 Enum 노드 정의
 */
export interface EnumNode {
  /** 노드 고유 ID (uuid) */
  id: string
  /** 노드 타입 - 항상 "enum" */
  type: "enum"
  /** 캔버스 내 위치 */
  position: {
    x: number
    y: number
  }
  /** Enum 데이터 */
  data: EnumData
}

/**
 * Entity의 개별 프로퍼티 정의
 *
 * @example
 * const emailProperty: EntityProperty = {
 *   id: "prop-1",
 *   name: "email",
 *   type: "string",
 *   isPrimaryKey: false,
 *   isUnique: true,
 *   isNullable: false,
 * }
 */
export interface EntityProperty {
  /** 프로퍼티 고유 ID (uuid) */
  id: string
  /** 프로퍼티 이름 (예: "email", "name") */
  name: string
  /** 프로퍼티 타입 (예: "string", "number", "boolean", "Date", "enum") */
  type: string
  /** Primary Key 여부 */
  isPrimaryKey: boolean
  /** Unique 제약 조건 여부 */
  isUnique: boolean
  /** Nullable 여부 */
  isNullable: boolean
  /** 기본값 (선택적) */
  defaultValue?: string
  /** Enum 정의 (type이 "enum"일 때만 사용) */
  enumDef?: EnumDefinition
}

/**
 * Entity 레벨 Index 정의
 *
 * 복합 인덱스 또는 복합 Unique 제약조건을 정의
 *
 * @example
 * const emailIndex: EntityIndex = {
 *   id: "idx-1",
 *   name: "idx_user_email",
 *   properties: ["email"],
 *   isUnique: true,
 * }
 */
export interface EntityIndex {
  /** Index 고유 ID (uuid) */
  id: string
  /** Index 이름 (선택적, 미지정시 자동 생성) */
  name?: string
  /** Index에 포함될 프로퍼티 이름 목록 */
  properties: string[]
  /** Unique 제약조건 여부 */
  isUnique: boolean
}

/**
 * Entity 노드의 데이터 구조
 *
 * ReactFlow 노드의 data 프로퍼티에 저장되는 정보
 */
export interface EntityData {
  /** Entity 이름 (예: "User", "Post") - 클래스명으로 사용 */
  name: string
  /** 커스텀 테이블명 (선택적, 미지정시 Entity 이름 사용) */
  tableName?: string
  /** Entity의 프로퍼티 목록 */
  properties: EntityProperty[]
  /** Entity 레벨 Index 목록 (Phase 2) */
  indexes?: EntityIndex[]
  /** ReactFlow 타입 호환을 위한 index signature */
  [key: string]: unknown
}

/**
 * ReactFlow Entity 노드 타입
 *
 * ReactFlow의 Node 타입을 기반으로 한 Entity 노드 정의
 */
export interface EntityNode {
  /** 노드 고유 ID (uuid) */
  id: string
  /** 노드 타입 - 항상 "entity" */
  type: "entity"
  /** 캔버스 내 위치 */
  position: {
    x: number
    y: number
  }
  /** Entity 데이터 */
  data: EntityData
}

/**
 * 지원하는 프로퍼티 타입 목록
 */
export const PROPERTY_TYPES = [
  "string",
  "number",
  "boolean",
  "Date",
  "bigint",
  "Buffer",
  "uuid",
  "enum",
] as const

/**
 * 프로퍼티 타입 유니온 타입
 */
export type PropertyType = (typeof PROPERTY_TYPES)[number] | string

/**
 * 새 Entity 생성을 위한 기본값 팩토리
 */
export function createDefaultEntity(
  id: string,
  position: { x: number; y: number }
): EntityNode {
  return {
    id,
    type: "entity",
    position,
    data: {
      name: "NewEntity",
      properties: [
        {
          id: `${id}-prop-id`,
          name: "id",
          type: "number",
          isPrimaryKey: true,
          isUnique: false,
          isNullable: false,
        },
      ],
    },
  }
}

/**
 * 새 Property 생성을 위한 기본값 팩토리
 */
export function createDefaultProperty(id: string): EntityProperty {
  return {
    id,
    name: "newProperty",
    type: "string",
    isPrimaryKey: false,
    isUnique: false,
    isNullable: true,
  }
}

// =============================================================================
// Embeddable 관련 타입 (Phase 2)
// =============================================================================

/**
 * Embeddable 노드의 데이터 구조
 *
 * ReactFlow 노드의 data 프로퍼티에 저장되는 정보
 * Entity와 유사하지만 tableName이 없고 @Embeddable 데코레이터 사용
 */
export interface EmbeddableData {
  /** Embeddable 이름 (예: "Address", "Money") - 클래스명으로 사용 */
  name: string
  /** Embeddable의 프로퍼티 목록 (PrimaryKey 없음) */
  properties: EntityProperty[]
  /** ReactFlow 타입 호환을 위한 index signature */
  [key: string]: unknown
}

/**
 * ReactFlow Embeddable 노드 타입
 *
 * ReactFlow의 Node 타입을 기반으로 한 Embeddable 노드 정의
 */
export interface EmbeddableNode {
  /** 노드 고유 ID (uuid) */
  id: string
  /** 노드 타입 - 항상 "embeddable" */
  type: "embeddable"
  /** 캔버스 내 위치 */
  position: {
    x: number
    y: number
  }
  /** Embeddable 데이터 */
  data: EmbeddableData
}

/**
 * 새 Embeddable 생성을 위한 기본값 팩토리
 */
export function createDefaultEmbeddable(
  id: string,
  position: { x: number; y: number }
): EmbeddableNode {
  return {
    id,
    type: "embeddable",
    position,
    data: {
      name: "NewEmbeddable",
      properties: [
        {
          id: `${id}-prop-1`,
          name: "value",
          type: "string",
          isPrimaryKey: false,
          isUnique: false,
          isNullable: false,
        },
      ],
    },
  }
}

/**
 * 새 Enum 생성을 위한 기본값 팩토리
 */
export function createDefaultEnum(
  id: string,
  position: { x: number; y: number }
): EnumNode {
  return {
    id,
    type: "enum",
    position,
    data: {
      name: "NewEnum",
      values: [
        { key: "Value1", value: "value1" },
        { key: "Value2", value: "value2" },
      ],
    },
  }
}

/**
 * 모든 다이어그램 노드 타입 (Entity, Embeddable, 또는 Enum)
 */
export type DiagramNode = EntityNode | EmbeddableNode | EnumNode

/**
 * 노드가 Entity인지 확인하는 타입 가드
 */
export function isEntityNode(node: DiagramNode): node is EntityNode {
  return node.type === "entity"
}

/**
 * 노드가 Embeddable인지 확인하는 타입 가드
 */
export function isEmbeddableNode(node: DiagramNode): node is EmbeddableNode {
  return node.type === "embeddable"
}

/**
 * 노드가 Enum인지 확인하는 타입 가드
 */
export function isEnumNode(node: DiagramNode): node is EnumNode {
  return node.type === "enum"
}
