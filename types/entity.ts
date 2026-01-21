/**
 * Entity 관련 타입 정의
 *
 * MikroORM Entity를 비주얼 에디터에서 표현하기 위한 타입들
 */

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
  /** 프로퍼티 타입 (예: "string", "number", "boolean", "Date") */
  type: string
  /** Primary Key 여부 */
  isPrimaryKey: boolean
  /** Unique 제약 조건 여부 */
  isUnique: boolean
  /** Nullable 여부 */
  isNullable: boolean
  /** 기본값 (선택적) */
  defaultValue?: string
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
