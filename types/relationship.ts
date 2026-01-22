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
  /** 의존 관계 - 점선 화살표로 표시 (일시적 사용 관계) */
  Dependency = "Dependency",
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
 * Fetch 타입별 레이블
 */
export const FETCH_TYPE_LABELS: Record<FetchType, string> = {
  [FetchType.Lazy]: "Lazy (load on access)",
  [FetchType.Eager]: "Eager (load immediately)",
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
  [RelationType.Dependency]: "Dependency (⋯→ 의존)",
}

/**
 * 관계 타입별 MikroORM 데코레이터명
 */
export const RELATION_TYPE_DECORATORS: Record<RelationType, string> = {
  [RelationType.OneToOne]: "@OneToOne",
  [RelationType.OneToMany]: "@OneToMany",
  [RelationType.ManyToOne]: "@ManyToOne",
  [RelationType.ManyToMany]: "@ManyToMany",
  [RelationType.Dependency]: "", // Dependency는 MikroORM 데코레이터가 아님 (import만 생성)
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
    case RelationType.Dependency:
      return RelationType.Dependency // Dependency는 단방향이므로 자기 자신 반환
  }
}