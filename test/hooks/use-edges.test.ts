/**
 * use-edges.ts 테스트
 *
 * 엣지 관리 훅의 기능을 테스트합니다.
 */

import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useEdges } from "@/hooks/use-edges"

describe("useEdges", () => {
  // ============================================================================
  // EnumMapping 엣지 테스트
  // ============================================================================
  describe("EnumMapping 엣지", () => {
    it("addEnumMapping은 생성된 엣지 ID를 반환한다", () => {
      const { result } = renderHook(() => useEdges())

      let edgeId: string = ""

      act(() => {
        edgeId = result.current.addEnumMapping("entity-1", "enum-1")
      })

      expect(typeof edgeId).toBe("string")
      expect(edgeId).toBeTruthy()
      expect(edgeId.length).toBeGreaterThan(0)
    })

    it("반환된 ID로 엣지를 즉시 업데이트할 수 있다", () => {
      const { result } = renderHook(() => useEdges())

      let edgeId: string = ""

      act(() => {
        edgeId = result.current.addEnumMapping("entity-1", "enum-1")
      })

      act(() => {
        result.current.updateEnumMapping(edgeId, {
          propertyId: "prop-123",
          previousType: "string",
        })
      })

      const updatedEdge = result.current.edges.find((e) => e.id === edgeId)
      expect(updatedEdge).toBeDefined()
      expect(updatedEdge?.type).toBe("enum-mapping")
      expect(updatedEdge?.data.propertyId).toBe("prop-123")
      expect(updatedEdge?.data.previousType).toBe("string")
    })

    it("addEnumMapping은 올바른 source/target을 설정한다", () => {
      const { result } = renderHook(() => useEdges())

      let edgeId: string = ""

      act(() => {
        edgeId = result.current.addEnumMapping("entity-1", "enum-1")
      })

      const edge = result.current.edges.find((e) => e.id === edgeId)
      expect(edge?.source).toBe("entity-1")
      expect(edge?.target).toBe("enum-1")
    })

    it("addEnumMapping은 초기 propertyId를 null로 설정한다", () => {
      const { result } = renderHook(() => useEdges())

      let edgeId: string = ""

      act(() => {
        edgeId = result.current.addEnumMapping("entity-1", "enum-1")
      })

      const edge = result.current.edges.find((e) => e.id === edgeId)
      expect(edge?.data.propertyId).toBeNull()
    })

    it("여러 EnumMapping 엣지를 생성하면 각각 고유한 ID를 가진다", () => {
      const { result } = renderHook(() => useEdges())

      let edgeId1: string = ""
      let edgeId2: string = ""
      let edgeId3: string = ""

      act(() => {
        edgeId1 = result.current.addEnumMapping("entity-1", "enum-1")
        edgeId2 = result.current.addEnumMapping("entity-2", "enum-1")
        edgeId3 = result.current.addEnumMapping("entity-1", "enum-2")
      })

      expect(edgeId1).not.toBe(edgeId2)
      expect(edgeId2).not.toBe(edgeId3)
      expect(edgeId1).not.toBe(edgeId3)
      expect(result.current.edges).toHaveLength(3)
    })
  })

  // ============================================================================
  // Relationship 엣지 테스트
  // ============================================================================
  describe("Relationship 엣지", () => {
    it("addRelationship은 Relationship 엣지를 추가한다", () => {
      const { result } = renderHook(() => useEdges())

      act(() => {
        result.current.addRelationship("source-1", "target-1")
      })

      expect(result.current.edges).toHaveLength(1)
      expect(result.current.edges[0].type).toBe("relationship")
      expect(result.current.edges[0].source).toBe("source-1")
      expect(result.current.edges[0].target).toBe("target-1")
    })

    it("deleteRelationship은 엣지를 삭제한다", () => {
      const { result } = renderHook(() => useEdges())

      act(() => {
        result.current.addRelationship("source-1", "target-1")
      })

      const edgeId = result.current.edges[0].id

      act(() => {
        result.current.deleteRelationship(edgeId)
      })

      expect(result.current.edges).toHaveLength(0)
    })
  })

  // ============================================================================
  // deleteEdgesByNodeId 테스트
  // ============================================================================
  describe("deleteEdgesByNodeId", () => {
    it("특정 노드와 연결된 모든 엣지를 삭제한다", () => {
      const { result } = renderHook(() => useEdges())

      act(() => {
        result.current.addRelationship("node-1", "node-2")
        result.current.addRelationship("node-2", "node-3")
        result.current.addEnumMapping("node-1", "enum-1")
      })

      expect(result.current.edges).toHaveLength(3)

      act(() => {
        result.current.deleteEdgesByNodeId("node-1")
      })

      // node-1과 연결된 엣지 2개 삭제, node-2 → node-3 엣지만 남음
      expect(result.current.edges).toHaveLength(1)
      expect(result.current.edges[0].source).toBe("node-2")
      expect(result.current.edges[0].target).toBe("node-3")
    })
  })
})
