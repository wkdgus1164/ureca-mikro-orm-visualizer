/**
 * use-editor.ts 테스트
 *
 * 에디터 훅의 모든 기능을 테스트합니다.
 */

import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useEditor } from "@/hooks/use-editor"
import type { EntityData, EmbeddableData, EnumData } from "@/types/entity"
import { RelationType, FetchType } from "@/types/relationship"

describe("useEditor", () => {
  // ============================================================================
  // Entity 노드 CRUD 테스트
  // ============================================================================
  describe("Entity 노드 CRUD", () => {
    it("addEntity는 고유한 이름을 가진 Entity를 추가한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].data.name).toBe("NewEntity")
      expect(result.current.nodes[0].type).toBe("entity")
      expect(result.current.nodes[0].position).toEqual({ x: 100, y: 100 })
    })

    it("동일한 이름이 존재하면 숫자 접미사를 추가한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      act(() => {
        result.current.addEntity({ x: 200, y: 200 })
      })

      act(() => {
        result.current.addEntity({ x: 300, y: 300 })
      })

      expect(result.current.nodes).toHaveLength(3)
      expect(result.current.nodes[0].data.name).toBe("NewEntity")
      // 구현에서 첫 번째 중복은 "NewEntity 1"로 시작
      expect(result.current.nodes[1].data.name).toBe("NewEntity 1")
      expect(result.current.nodes[2].data.name).toBe("NewEntity 2")
    })

    it("position이 없으면 기본 위치를 생성한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity()
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].position.x).toBeGreaterThanOrEqual(100)
      expect(result.current.nodes[0].position.y).toBeGreaterThanOrEqual(100)
    })

    it("새 Entity는 기본 id 프로퍼티를 가진다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const entityData = result.current.nodes[0].data as EntityData
      expect(entityData.properties).toHaveLength(1)
      expect(entityData.properties[0].name).toBe("id")
      expect(entityData.properties[0].isPrimaryKey).toBe(true)
      expect(entityData.properties[0].type).toBe("number")
    })

    it("updateEntity는 Entity 데이터를 업데이트한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.updateEntity(nodeId, { name: "User" })
      })

      expect(result.current.nodes[0].data.name).toBe("User")
    })

    it("updateEntity는 기존 데이터를 보존한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id
      const originalProperties = (result.current.nodes[0].data as EntityData).properties

      act(() => {
        result.current.updateEntity(nodeId, { name: "User" })
      })

      expect((result.current.nodes[0].data as EntityData).properties).toEqual(originalProperties)
    })

    it("deleteEntity는 Entity를 삭제한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.deleteEntity(nodeId)
      })

      expect(result.current.nodes).toHaveLength(0)
    })

    it("deleteEntity는 연관된 엣지도 삭제한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      expect(result.current.edges).toHaveLength(1)

      act(() => {
        result.current.deleteEntity(sourceId)
      })

      expect(result.current.edges).toHaveLength(0)
    })
  })

  // ============================================================================
  // Embeddable 노드 CRUD 테스트
  // ============================================================================
  describe("Embeddable 노드 CRUD", () => {
    it("addEmbeddable은 고유한 이름을 가진 Embeddable을 추가한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEmbeddable({ x: 100, y: 100 })
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].data.name).toBe("NewEmbeddable")
      expect(result.current.nodes[0].type).toBe("embeddable")
    })

    it("동일한 Embeddable 이름이 존재하면 숫자 접미사를 추가한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEmbeddable({ x: 100, y: 100 })
      })

      act(() => {
        result.current.addEmbeddable({ x: 200, y: 200 })
      })

      expect(result.current.nodes).toHaveLength(2)
      expect(result.current.nodes[0].data.name).toBe("NewEmbeddable")
      // 구현에서 첫 번째 중복은 "NewEmbeddable 1"로 시작
      expect(result.current.nodes[1].data.name).toBe("NewEmbeddable 1")
    })

    it("새 Embeddable은 기본 value 프로퍼티를 가진다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEmbeddable({ x: 100, y: 100 })
      })

      const embeddableData = result.current.nodes[0].data as EmbeddableData
      expect(embeddableData.properties).toHaveLength(1)
      expect(embeddableData.properties[0].name).toBe("value")
      expect(embeddableData.properties[0].isPrimaryKey).toBe(false)
    })

    it("updateEmbeddable은 Embeddable 데이터를 업데이트한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEmbeddable({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.updateEmbeddable(nodeId, { name: "Address" })
      })

      expect(result.current.nodes[0].data.name).toBe("Address")
    })

    it("deleteEmbeddable은 Embeddable을 삭제한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEmbeddable({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.deleteEmbeddable(nodeId)
      })

      expect(result.current.nodes).toHaveLength(0)
    })
  })

  // ============================================================================
  // Enum 노드 CRUD 테스트
  // ============================================================================
  describe("Enum 노드 CRUD", () => {
    it("addEnum은 고유한 이름을 가진 Enum을 추가한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEnum({ x: 100, y: 100 })
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].data.name).toBe("NewEnum")
      expect(result.current.nodes[0].type).toBe("enum")
    })

    it("동일한 Enum 이름이 존재하면 숫자 접미사를 추가한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEnum({ x: 100, y: 100 })
      })

      act(() => {
        result.current.addEnum({ x: 200, y: 200 })
      })

      expect(result.current.nodes).toHaveLength(2)
      expect(result.current.nodes[0].data.name).toBe("NewEnum")
      // 구현에서 첫 번째 중복은 "NewEnum 1"로 시작
      expect(result.current.nodes[1].data.name).toBe("NewEnum 1")
    })

    it("새 Enum은 기본 값 2개를 가진다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEnum({ x: 100, y: 100 })
      })

      const enumData = result.current.nodes[0].data as EnumData
      expect(enumData.values).toHaveLength(2)
      expect(enumData.values[0]).toEqual({ key: "Value1", value: "value1" })
      expect(enumData.values[1]).toEqual({ key: "Value2", value: "value2" })
    })

    it("updateEnum은 Enum 데이터를 업데이트한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEnum({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.updateEnum(nodeId, { name: "UserRole" })
      })

      expect(result.current.nodes[0].data.name).toBe("UserRole")
    })

    it("deleteEnum은 Enum을 삭제한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEnum({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.deleteEnum(nodeId)
      })

      expect(result.current.nodes).toHaveLength(0)
    })

    it("getAllEnums는 모든 Enum 노드를 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEnum({ x: 200, y: 200 })
        result.current.addEmbeddable({ x: 300, y: 300 })
        result.current.addEnum({ x: 400, y: 400 })
      })

      const enums = result.current.getAllEnums()
      expect(enums).toHaveLength(2)
      expect(enums[0].type).toBe("enum")
      expect(enums[1].type).toBe("enum")
    })
  })

  // ============================================================================
  // Relationship 엣지 CRUD 테스트
  // ============================================================================
  describe("Relationship 엣지 CRUD", () => {
    it("onConnect는 두 노드 사이에 Relationship 엣지를 생성한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      expect(result.current.edges).toHaveLength(1)
      expect(result.current.edges[0].source).toBe(sourceId)
      expect(result.current.edges[0].target).toBe(targetId)
      expect(result.current.edges[0].type).toBe("relationship")
    })

    it("새 엣지는 기본 Relationship 데이터를 가진다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      const edgeData = result.current.edges[0].data
      expect(edgeData.relationType).toBe(RelationType.OneToMany)
      expect(edgeData.sourceProperty).toBe("items")
      expect(edgeData.isNullable).toBe(true)
      expect(edgeData.cascade).toBe(false)
      expect(edgeData.orphanRemoval).toBe(false)
      expect(edgeData.fetchType).toBe(FetchType.Lazy)
    })

    it("onConnect는 source나 target이 없으면 무시한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.onConnect({
          source: null,
          target: "some-id",
          sourceHandle: null,
          targetHandle: null,
        })
      })

      expect(result.current.edges).toHaveLength(0)
    })

    it("updateRelationship은 엣지 데이터를 업데이트한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      const edgeId = result.current.edges[0].id

      act(() => {
        result.current.updateRelationship(edgeId, {
          relationType: RelationType.ManyToMany,
          sourceProperty: "posts",
        })
      })

      expect(result.current.edges[0].data.relationType).toBe(RelationType.ManyToMany)
      expect(result.current.edges[0].data.sourceProperty).toBe("posts")
    })

    it("deleteRelationship은 엣지를 삭제한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      const edgeId = result.current.edges[0].id

      act(() => {
        result.current.deleteRelationship(edgeId)
      })

      expect(result.current.edges).toHaveLength(0)
    })
  })

  // ============================================================================
  // UI 상태 관리 테스트
  // ============================================================================
  describe("UI 상태 관리", () => {
    it("초기 UI 상태가 올바르다", () => {
      const { result } = renderHook(() => useEditor())

      expect(result.current.uiState.selection).toEqual({ type: null, id: null })
      expect(result.current.uiState.isRightPanelOpen).toBe(false)
      expect(result.current.uiState.isConnecting).toBe(false)
      expect(result.current.uiState.isExportModalOpen).toBe(false)
      expect(result.current.uiState.pendingAdd).toBeNull()
      expect(result.current.uiState.mousePosition).toBeNull()
    })

    it("setSelection은 선택 상태를 업데이트하고 패널을 연다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      expect(result.current.uiState.selection).toEqual({ type: "node", id: nodeId })
      expect(result.current.uiState.isRightPanelOpen).toBe(true)
    })

    it("setSelection에서 id가 null이면 패널을 닫지 않는다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.setSelection({ type: null, id: null })
      })

      expect(result.current.uiState.isRightPanelOpen).toBe(false)
    })

    it("toggleRightPanel은 패널 상태를 토글한다", () => {
      const { result } = renderHook(() => useEditor())

      expect(result.current.uiState.isRightPanelOpen).toBe(false)

      act(() => {
        result.current.toggleRightPanel()
      })

      expect(result.current.uiState.isRightPanelOpen).toBe(true)

      act(() => {
        result.current.toggleRightPanel()
      })

      expect(result.current.uiState.isRightPanelOpen).toBe(false)
    })

    it("closeRightPanel은 패널을 닫고 선택을 초기화한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      expect(result.current.uiState.isRightPanelOpen).toBe(true)

      act(() => {
        result.current.closeRightPanel()
      })

      expect(result.current.uiState.isRightPanelOpen).toBe(false)
      expect(result.current.uiState.selection).toEqual({ type: null, id: null })
    })

    it("toggleConnecting은 연결 모드를 토글한다", () => {
      const { result } = renderHook(() => useEditor())

      expect(result.current.uiState.isConnecting).toBe(false)

      act(() => {
        result.current.toggleConnecting()
      })

      expect(result.current.uiState.isConnecting).toBe(true)

      act(() => {
        result.current.toggleConnecting()
      })

      expect(result.current.uiState.isConnecting).toBe(false)
    })

    it("toggleExportModal은 Export 모달 상태를 토글한다", () => {
      const { result } = renderHook(() => useEditor())

      expect(result.current.uiState.isExportModalOpen).toBe(false)

      act(() => {
        result.current.toggleExportModal()
      })

      expect(result.current.uiState.isExportModalOpen).toBe(true)

      act(() => {
        result.current.toggleExportModal()
      })

      expect(result.current.uiState.isExportModalOpen).toBe(false)
    })
  })

  // ============================================================================
  // Ghost 노드 워크플로우 테스트
  // ============================================================================
  describe("Ghost 노드 워크플로우", () => {
    it("startPendingAdd는 대기 모드를 시작한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.startPendingAdd("entity")
      })

      expect(result.current.uiState.pendingAdd).toBe("entity")
      expect(result.current.uiState.mousePosition).toBeNull()
    })

    it("startPendingAdd는 다른 타입도 지원한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.startPendingAdd("embeddable")
      })

      expect(result.current.uiState.pendingAdd).toBe("embeddable")

      act(() => {
        result.current.startPendingAdd("enum")
      })

      expect(result.current.uiState.pendingAdd).toBe("enum")
    })

    it("cancelPendingAdd는 대기 모드를 취소한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.startPendingAdd("entity")
        result.current.updateMousePosition({ x: 100, y: 100 })
      })

      act(() => {
        result.current.cancelPendingAdd()
      })

      expect(result.current.uiState.pendingAdd).toBeNull()
      expect(result.current.uiState.mousePosition).toBeNull()
    })

    it("updateMousePosition은 마우스 위치를 업데이트한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.updateMousePosition({ x: 150, y: 250 })
      })

      expect(result.current.uiState.mousePosition).toEqual({ x: 150, y: 250 })

      act(() => {
        result.current.updateMousePosition(null)
      })

      expect(result.current.uiState.mousePosition).toBeNull()
    })

    it("finalizePendingAdd는 대기 중인 Entity를 생성한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.startPendingAdd("entity")
      })

      act(() => {
        // 클릭 위치가 노드 중앙이 되도록 오프셋이 적용됨
        result.current.finalizePendingAdd({ x: 200, y: 200 })
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].type).toBe("entity")
      expect(result.current.uiState.pendingAdd).toBeNull()
    })

    it("finalizePendingAdd는 대기 중인 Embeddable을 생성한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.startPendingAdd("embeddable")
      })

      act(() => {
        result.current.finalizePendingAdd({ x: 200, y: 200 })
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].type).toBe("embeddable")
    })

    it("finalizePendingAdd는 대기 중인 Enum을 생성한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.startPendingAdd("enum")
      })

      act(() => {
        result.current.finalizePendingAdd({ x: 200, y: 200 })
      })

      expect(result.current.nodes).toHaveLength(1)
      expect(result.current.nodes[0].type).toBe("enum")
    })

    it("finalizePendingAdd는 pendingAdd가 null이면 무시한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.finalizePendingAdd({ x: 200, y: 200 })
      })

      expect(result.current.nodes).toHaveLength(0)
    })
  })

  // ============================================================================
  // 다이어그램 작업 테스트
  // ============================================================================
  describe("다이어그램 작업", () => {
    it("loadDiagram은 노드와 엣지를 완전히 교체한다", () => {
      const { result } = renderHook(() => useEditor())

      // 기존 노드 추가
      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      expect(result.current.nodes).toHaveLength(1)

      // 새 다이어그램 로드
      const newNodes = [
        {
          id: "loaded-1",
          type: "entity" as const,
          position: { x: 0, y: 0 },
          data: { name: "LoadedEntity", properties: [] },
        },
        {
          id: "loaded-2",
          type: "embeddable" as const,
          position: { x: 100, y: 100 },
          data: { name: "LoadedEmbeddable", properties: [] },
        },
      ]

      act(() => {
        result.current.loadDiagram(newNodes, [])
      })

      expect(result.current.nodes).toHaveLength(2)
      expect(result.current.nodes[0].data.name).toBe("LoadedEntity")
      expect(result.current.nodes[1].data.name).toBe("LoadedEmbeddable")
    })

    it("loadDiagram은 선택 상태를 초기화한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      expect(result.current.uiState.isRightPanelOpen).toBe(true)

      act(() => {
        result.current.loadDiagram([], [])
      })

      expect(result.current.uiState.selection).toEqual({ type: null, id: null })
      expect(result.current.uiState.isRightPanelOpen).toBe(false)
    })

    it("clearDiagram은 모든 노드와 엣지를 삭제한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      expect(result.current.nodes).toHaveLength(2)
      expect(result.current.edges).toHaveLength(1)

      act(() => {
        result.current.clearDiagram()
      })

      expect(result.current.nodes).toHaveLength(0)
      expect(result.current.edges).toHaveLength(0)
    })

    it("clearDiagram은 선택 상태를 초기화한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      act(() => {
        result.current.clearDiagram()
      })

      expect(result.current.uiState.selection).toEqual({ type: null, id: null })
      expect(result.current.uiState.isRightPanelOpen).toBe(false)
    })
  })

  // ============================================================================
  // 선택 상태 Getter 테스트
  // ============================================================================
  describe("선택 상태 Getter", () => {
    it("getSelectedNode는 선택된 Entity 노드를 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      const selectedNode = result.current.getSelectedNode()
      expect(selectedNode).not.toBeNull()
      expect(selectedNode?.id).toBe(nodeId)
    })

    it("getSelectedNode는 선택이 없으면 null을 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      const selectedNode = result.current.getSelectedNode()
      expect(selectedNode).toBeNull()
    })

    it("getSelectedNode는 엣지가 선택되면 null을 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      const edgeId = result.current.edges[0].id

      act(() => {
        result.current.setSelection({ type: "edge", id: edgeId })
      })

      const selectedNode = result.current.getSelectedNode()
      expect(selectedNode).toBeNull()
    })

    it("getSelectedEnum은 선택된 Enum 노드를 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEnum({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      const selectedEnum = result.current.getSelectedEnum()
      expect(selectedEnum).not.toBeNull()
      expect(selectedEnum?.type).toBe("enum")
    })

    it("getSelectedEnum은 Entity가 선택되면 null을 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      const selectedEnum = result.current.getSelectedEnum()
      expect(selectedEnum).toBeNull()
    })

    it("getSelectedEdge는 선택된 엣지를 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
        result.current.addEntity({ x: 300, y: 100 })
      })

      const sourceId = result.current.nodes[0].id
      const targetId = result.current.nodes[1].id

      act(() => {
        result.current.onConnect({
          source: sourceId,
          target: targetId,
          sourceHandle: null,
          targetHandle: null,
        })
      })

      const edgeId = result.current.edges[0].id

      act(() => {
        result.current.setSelection({ type: "edge", id: edgeId })
      })

      const selectedEdge = result.current.getSelectedEdge()
      expect(selectedEdge).not.toBeNull()
      expect(selectedEdge?.id).toBe(edgeId)
    })

    it("getSelectedEdge는 노드가 선택되면 null을 반환한다", () => {
      const { result } = renderHook(() => useEditor())

      act(() => {
        result.current.addEntity({ x: 100, y: 100 })
      })

      const nodeId = result.current.nodes[0].id

      act(() => {
        result.current.setSelection({ type: "node", id: nodeId })
      })

      const selectedEdge = result.current.getSelectedEdge()
      expect(selectedEdge).toBeNull()
    })
  })
})
