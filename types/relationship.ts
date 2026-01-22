/**
 * Relationship 관련 타입 정의
 *
 * MikroORM의 관계 타입을 비주얼 에디터에서 표현하기 위한 타입들
 */

/**
 * MikroORM 관계 타입 열거형
 *
 * @see https://mikro-orm.io/docs/relationships
 */
export enum RelationType {
  /** 1:1 관계 - 양방향 화살표로 표시 */
  OneToOne = "OneToOne",
  /** 1:N 관계 - Source에서 Target으로 까마귀발 */
  OneToMany = "OneToMany",
  /** N:1 관계 - OneToMany의 역방향 */
  ManyToOne = "ManyToOne",
  /** N:M 관계 - 양방향 까마귀발 */
  ManyToMany = "ManyToMany",
  /** Composition - 강한 결합 (채워진 다이아몬드 ◆) */
  Composition = "Composition",
  /** Aggregation - 약한 결합 (빈 다이아몬드 ◇) */
  Aggregation = "Aggregation",
  /** Inheritance - 상속 관계 (빈 삼각형 △, 실선) */
  Inheritance = "Inheritance",
  /** Implementation - 구현 관계 (빈 삼각형 △, 점선) */
  Implementation = "Implementation",
}

/**
 * MikroORM Fetch 전략 열거형
 *
 * @see https://mikro-orm.io/docs/loading-strategies
 */
export enum FetchType {
  /** Lazy Loading - 접근 시점에 쿼리 실행 (기본값) */
  Lazy = "lazy",
  /** Eager Loading - 부모 엔티티와 함께 즉시 로딩 */
  Eager = "eager",
}

/**
 * MikroORM Delete Rule 열거형
 *
 * 부모 엔티티 삭제 시 자식 엔티티의 동작을 제어
 * @see https://mikro-orm.io/docs/cascading
 */
export enum DeleteRule {
  /** 부모 삭제 시 자식도 삭제 */
  Cascade = "cascade",
  /** 부모 삭제 시 자식의 FK를 NULL로 설정 */
  SetNull = "set null",
  /** 자식이 있으면 부모 삭제 불가 */
  Restrict = "restrict",
  /** DB 기본 동작 사용 */
  NoAction = "no action",
  /** 부모 삭제 시 자식의 FK를 기본값으로 설정 */
  SetDefault = "set default",
}

/**
 * Fetch 타입별 레이블
 */
export const FETCH_TYPE_LABELS: Record<FetchType, string> = {
  [FetchType.Lazy]: "Lazy (load on access)",
  [FetchType.Eager]: "Eager (load immediately)",
}

/**
 * Delete Rule 타입별 레이블
 */
export const DELETE_RULE_LABELS: Record<DeleteRule, string> = {
  [DeleteRule.Cascade]: "CASCADE (자식도 삭제)",
  [DeleteRule.SetNull]: "SET NULL (FK를 NULL로)",
  [DeleteRule.Restrict]: "RESTRICT (삭제 차단)",
  [DeleteRule.NoAction]: "NO ACTION (DB 기본)",
  [DeleteRule.SetDefault]: "SET DEFAULT (기본값 설정)",
}

/**
 * Relationship 엣지의 데이터 구조
 *
 * ReactFlow 엣지의 data 프로퍼티에 저장되는 정보
 */
export interface RelationshipData {
  /** 관계 타입 */
  relationType: RelationType
  /** Source Entity의 프로퍼티명 (예: "posts", "author") */
  sourceProperty: string
  /** Target Entity의 역방향 프로퍼티명 (양방향 관계일 때) */
  targetProperty?: string
  /** Nullable 여부 */
  isNullable: boolean
  /** Cascade 옵션 (연관 엔티티 자동 저장/삭제) */
  cascade: boolean
  /** OrphanRemoval 옵션 (컬렉션에서 제거 시 삭제) */
  orphanRemoval: boolean
  /** Fetch 전략 (lazy/eager) */
  fetchType?: FetchType
  /** Delete Rule (부모 삭제 시 자식 동작) */
  deleteRule?: DeleteRule
  /** ReactFlow 타입 호환을 위한 index signature */
  [key: string]: unknown
}

/**
 * ReactFlow Relationship 엣지 타입
 *
 * ReactFlow의 Edge 타입을 기반으로 한 Relationship 엣지 정의
 */
export interface RelationshipEdge {
  /** 엣지 고유 ID (uuid) */
  id: string
  /** 엣지 타입 - 항상 "relationship" */
  type: "relationship"
  /** Source Entity 노드 ID */
  source: string
  /** Target Entity 노드 ID */
  target: string
  /** Source 핸들 ID (선택적) */
  sourceHandle?: string
  /** Target 핸들 ID (선택적) */
  targetHandle?: string
  /** Relationship 데이터 */
  data: RelationshipData
}

/**
 * 관계 타입별 한글 레이블
 */
export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  [RelationType.OneToOne]: "One to One (1:1)",
  [RelationType.OneToMany]: "One to Many (1:N)",
  [RelationType.ManyToOne]: "Many to One (N:1)",
  [RelationType.ManyToMany]: "Many to Many (N:M)",
  [RelationType.Composition]: "Composition (◆ 강한 결합)",
  [RelationType.Aggregation]: "Aggregation (◇ 약한 결합)",
  [RelationType.Inheritance]: "Inheritance (△ 상속)",
  [RelationType.Implementation]: "Implementation (△ 구현)",
}

/**
 * 관계 타입별 MikroORM 데코레이터명
 */
export const RELATION_TYPE_DECORATORS: Record<RelationType, string> = {
  [RelationType.OneToOne]: "@OneToOne",
  [RelationType.OneToMany]: "@OneToMany",
  [RelationType.ManyToOne]: "@ManyToOne",
  [RelationType.ManyToMany]: "@ManyToMany",
  [RelationType.Composition]: "@OneToMany",
  [RelationType.Aggregation]: "@OneToMany",
  [RelationType.Inheritance]: "extends",
  [RelationType.Implementation]: "implements",
}

/**
 * Create a RelationshipEdge populated with sensible defaults for a new relationship.
 *
 * @returns A RelationshipEdge configured with `relationType` set to `RelationType.OneToMany`, `fetchType` set to `FetchType.Lazy`, `isNullable: true`, `cascade: false`, and `orphanRemoval: false`
 */
export function createDefaultRelationship(
  id: string,
  sourceId: string,
  targetId: string,
  sourceProperty: string
): RelationshipEdge {
  return {
    id,
    type: "relationship",
    source: sourceId,
    target: targetId,
    data: {
      relationType: RelationType.OneToMany,
      sourceProperty,
      isNullable: true,
      cascade: false,
      orphanRemoval: false,
      fetchType: FetchType.Lazy,
    },
  }
}

/**
 * Get the inverse RelationType for a given relation.
 *
 * @returns The corresponding inverse `RelationType` (OneToMany ↔ ManyToOne; OneToOne and ManyToMany map to themselves)
 */
export function getInverseRelationType(type: RelationType): RelationType {
  switch (type) {
    case RelationType.OneToOne:
      return RelationType.OneToOne
    case RelationType.OneToMany:
      return RelationType.ManyToOne
    case RelationType.ManyToOne:
      return RelationType.OneToMany
    case RelationType.ManyToMany:
      return RelationType.ManyToMany
    case RelationType.Composition:
      return RelationType.ManyToOne
    case RelationType.Aggregation:
      return RelationType.ManyToOne
    case RelationType.Inheritance:
      return RelationType.Inheritance
    case RelationType.Implementation:
      return RelationType.Implementation
  }
}

// =============================================================================
// Enum Mapping Edge (Entity ↔ Enum 연결)
// =============================================================================

/**
 * Enum Mapping 엣지의 데이터 구조
 *
 * Entity의 프로퍼티를 Enum 타입으로 매핑할 때 사용
 */
export interface EnumMappingData {
  /** 매핑된 프로퍼티 ID (Entity의 property.id) */
  propertyId: string | null
  /** ReactFlow 타입 호환을 위한 index signature */
  [key: string]: unknown
}

/**
 * ReactFlow Enum Mapping 엣지 타입
 *
 * Entity와 Enum 간의 타입 매핑을 나타내는 엣지
 */
export interface EnumMappingEdge {
  /** 엣지 고유 ID (uuid) */
  id: string
  /** 엣지 타입 - 항상 "enum-mapping" */
  type: "enum-mapping"
  /** Entity 노드 ID */
  source: string
  /** Enum 노드 ID */
  target: string
  /** Source 핸들 ID (선택적) */
  sourceHandle?: string
  /** Target 핸들 ID (선택적) */
  targetHandle?: string
  /** Enum Mapping 데이터 */
  data: EnumMappingData
}

/**
 * Create an EnumMappingEdge with default data.
 */
export function createDefaultEnumMapping(
  id: string,
  entityId: string,
  enumId: string
): EnumMappingEdge {
  return {
    id,
    type: "enum-mapping",
    source: entityId,
    target: enumId,
    data: {
      propertyId: null,
    },
  }
}