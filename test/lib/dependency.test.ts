/**
 * Dependency 관계 테스트
 *
 * UML Dependency 관계의 코드 생성 및 시각화 로직 테스트
 * - 점선 스타일 적용
 * - MikroORM 데코레이터 생성 건너뜀
 * - import 문 생성
 */

import { describe, it, expect } from "vitest"
import { RelationType } from "@/types/relationship"
import type { RelationshipEdge } from "@/types/relationship"
import type { EntityNode } from "@/types/entity"
import {
  getRelationDecorator,
  isCollectionRelation,
  generateRelationship,
} from "@/lib/mikro-orm/generators/relationship"
import { collectImports } from "@/lib/mikro-orm/generators/imports"

// ============================================================================
// 테스트용 Mock 데이터
// ============================================================================

const createMockEntityNode = (
  id: string,
  name: string,
  properties: EntityNode["data"]["properties"] = []
): EntityNode => ({
  id,
  type: "entity",
  position: { x: 0, y: 0 },
  data: {
    name,
    properties,
  },
})

const createMockDependencyEdge = (
  id: string,
  sourceId: string,
  targetId: string
): RelationshipEdge => ({
  id,
  type: "relationship",
  source: sourceId,
  target: targetId,
  data: {
    relationType: RelationType.Dependency,
    sourceProperty: "dependency",
    isNullable: false,
    cascade: false,
    orphanRemoval: false,
  },
})

const createMockOneToManyEdge = (
  id: string,
  sourceId: string,
  targetId: string
): RelationshipEdge => ({
  id,
  type: "relationship",
  source: sourceId,
  target: targetId,
  data: {
    relationType: RelationType.OneToMany,
    sourceProperty: "items",
    isNullable: false,
    cascade: false,
    orphanRemoval: false,
  },
})

// ============================================================================
// getRelationDecorator 테스트
// ============================================================================

describe("getRelationDecorator", () => {
  it("Dependency는 빈 문자열을 반환한다", () => {
    const result = getRelationDecorator(RelationType.Dependency)
    expect(result).toBe("")
  })

  it("OneToMany는 'OneToMany'를 반환한다", () => {
    const result = getRelationDecorator(RelationType.OneToMany)
    expect(result).toBe("OneToMany")
  })

  it("ManyToOne은 'ManyToOne'을 반환한다", () => {
    const result = getRelationDecorator(RelationType.ManyToOne)
    expect(result).toBe("ManyToOne")
  })

  it("OneToOne은 'OneToOne'을 반환한다", () => {
    const result = getRelationDecorator(RelationType.OneToOne)
    expect(result).toBe("OneToOne")
  })

  it("ManyToMany는 'ManyToMany'를 반환한다", () => {
    const result = getRelationDecorator(RelationType.ManyToMany)
    expect(result).toBe("ManyToMany")
  })
})

// ============================================================================
// isCollectionRelation 테스트
// ============================================================================

describe("isCollectionRelation", () => {
  it("Dependency는 Collection 관계가 아니다", () => {
    const result = isCollectionRelation(RelationType.Dependency)
    expect(result).toBe(false)
  })

  it("OneToMany는 Collection 관계이다", () => {
    const result = isCollectionRelation(RelationType.OneToMany)
    expect(result).toBe(true)
  })

  it("ManyToMany는 Collection 관계이다", () => {
    const result = isCollectionRelation(RelationType.ManyToMany)
    expect(result).toBe(true)
  })

  it("OneToOne은 Collection 관계가 아니다", () => {
    const result = isCollectionRelation(RelationType.OneToOne)
    expect(result).toBe(false)
  })

  it("ManyToOne은 Collection 관계가 아니다", () => {
    const result = isCollectionRelation(RelationType.ManyToOne)
    expect(result).toBe(false)
  })
})

// ============================================================================
// generateRelationship 테스트 - Dependency 처리
// ============================================================================

describe("generateRelationship - Dependency", () => {
  const orderService = createMockEntityNode("order-service", "OrderService")
  const paymentGateway = createMockEntityNode("payment-gateway", "PaymentGateway")

  it("Dependency 관계는 null을 반환한다 (코드 생성 건너뜀)", () => {
    const edge = createMockDependencyEdge(
      "dep-1",
      "order-service",
      "payment-gateway"
    )

    const result = generateRelationship(edge, orderService, paymentGateway, 2)

    expect(result).toBeNull()
  })

  it("OneToMany 관계는 코드를 생성한다", () => {
    const edge = createMockOneToManyEdge(
      "rel-1",
      "order-service",
      "payment-gateway"
    )

    const result = generateRelationship(edge, orderService, paymentGateway, 2)

    expect(result).not.toBeNull()
    expect(result).toContain("@OneToMany")
    expect(result).toContain("PaymentGateway")
    expect(result).toContain("Collection")
  })
})

// ============================================================================
// collectImports 테스트 - Dependency import 생성
// ============================================================================

describe("collectImports - Dependency", () => {
  const orderService = createMockEntityNode("order-service", "OrderService", [
    {
      id: "prop-1",
      name: "id",
      type: "number",
      isPrimaryKey: true,
      isUnique: false,
      isNullable: false,
    },
  ])
  const paymentGateway = createMockEntityNode("payment-gateway", "PaymentGateway")
  const logger = createMockEntityNode("logger", "Logger")

  it("Dependency 관계의 타겟 Entity는 relatedEntities에 포함된다", () => {
    const dependencyEdge = createMockDependencyEdge(
      "dep-1",
      "order-service",
      "payment-gateway"
    )

    const allNodes = [orderService, paymentGateway]
    const edges = [dependencyEdge]

    const result = collectImports(orderService, edges, allNodes, new Set())

    expect(result.relatedEntities.has("PaymentGateway")).toBe(true)
  })

  it("Dependency 관계는 MikroORM 데코레이터를 추가하지 않는다", () => {
    const dependencyEdge = createMockDependencyEdge(
      "dep-1",
      "order-service",
      "payment-gateway"
    )

    const allNodes = [orderService, paymentGateway]
    const edges = [dependencyEdge]

    const result = collectImports(orderService, edges, allNodes, new Set())

    // Dependency는 데코레이터를 추가하지 않음
    expect(result.decorators.has("")).toBe(false)
    expect(result.decorators.has("Dependency")).toBe(false)
  })

  it("Dependency 관계는 Collection이 필요하지 않다", () => {
    const dependencyEdge = createMockDependencyEdge(
      "dep-1",
      "order-service",
      "payment-gateway"
    )

    const allNodes = [orderService, paymentGateway]
    const edges = [dependencyEdge]

    const result = collectImports(orderService, edges, allNodes, new Set())

    expect(result.needsCollection).toBe(false)
  })

  it("Dependency 관계는 Cascade가 필요하지 않다", () => {
    const dependencyEdge: RelationshipEdge = {
      ...createMockDependencyEdge("dep-1", "order-service", "payment-gateway"),
      data: {
        ...createMockDependencyEdge("dep-1", "order-service", "payment-gateway").data!,
        cascade: true, // cascade가 true여도 Dependency는 무시
      },
    }

    const allNodes = [orderService, paymentGateway]
    const edges = [dependencyEdge]

    const result = collectImports(orderService, edges, allNodes, new Set())

    expect(result.needsCascade).toBe(false)
  })

  it("여러 Dependency 관계가 있으면 모든 타겟이 relatedEntities에 포함된다", () => {
    const dep1 = createMockDependencyEdge("dep-1", "order-service", "payment-gateway")
    const dep2 = createMockDependencyEdge("dep-2", "order-service", "logger")

    const allNodes = [orderService, paymentGateway, logger]
    const edges = [dep1, dep2]

    const result = collectImports(orderService, edges, allNodes, new Set())

    expect(result.relatedEntities.has("PaymentGateway")).toBe(true)
    expect(result.relatedEntities.has("Logger")).toBe(true)
  })

  it("Dependency와 일반 관계가 혼합되어 있으면 각각 올바르게 처리된다", () => {
    const dependencyEdge = createMockDependencyEdge(
      "dep-1",
      "order-service",
      "payment-gateway"
    )
    const oneToManyEdge = createMockOneToManyEdge(
      "rel-1",
      "order-service",
      "logger"
    )

    const allNodes = [orderService, paymentGateway, logger]
    const edges = [dependencyEdge, oneToManyEdge]

    const result = collectImports(orderService, edges, allNodes, new Set())

    // 둘 다 relatedEntities에 포함
    expect(result.relatedEntities.has("PaymentGateway")).toBe(true)
    expect(result.relatedEntities.has("Logger")).toBe(true)

    // OneToMany만 데코레이터 추가
    expect(result.decorators.has("OneToMany")).toBe(true)

    // OneToMany는 Collection 필요
    expect(result.needsCollection).toBe(true)
  })
})

// ============================================================================
// RelationType enum 테스트
// ============================================================================

describe("RelationType enum", () => {
  it("Dependency 값이 존재한다", () => {
    expect(RelationType.Dependency).toBe("Dependency")
  })

  it("모든 RelationType 값이 정의되어 있다", () => {
    expect(RelationType.OneToOne).toBe("OneToOne")
    expect(RelationType.OneToMany).toBe("OneToMany")
    expect(RelationType.ManyToOne).toBe("ManyToOne")
    expect(RelationType.ManyToMany).toBe("ManyToMany")
    expect(RelationType.Dependency).toBe("Dependency")
  })
})
