"use client"

/**
 * ReactFlow 에디터 캔버스 컴포넌트
 *
 * MikroORM Entity 다이어그램을 시각적으로 편집하는 메인 캔버스
 */

import { useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  useViewport,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useEditorContext } from "@/components/providers/editor-provider"
import { cn } from "@/lib/utils"
import { EntityNode } from "@/components/editor/nodes/entity-node"
import { EmbeddableNode } from "@/components/editor/nodes/embeddable-node"
import { EnumNode } from "@/components/editor/nodes/enum-node"
import { RelationshipEdge } from "@/components/editor/edges/relationship-edge"
import { GhostNode } from "@/components/editor/nodes/ghost-node"
import { ZoomSlider } from "@/components/editor/toolbar/zoom-slider"

/**
 * 커스텀 노드 타입 등록
 */
const nodeTypes = {
  entity: EntityNode,
  embeddable: EmbeddableNode,
  enum: EnumNode,
}

/**
 * 커스텀 엣지 타입 등록
 */
const edgeTypes = {
  relationship: RelationshipEdge,
}

interface EditorCanvasProps {
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * Render the main editor canvas used to visually create and edit MikroORM entity diagrams.
 *
 * Renders a React Flow canvas with registered custom node and edge types, selection handlers,
 * pane and mouse event handling, a minimap, background grid, zoom controls, and a ghost-node
 * preview when a node is being added.
 *
 * @param className - Optional additional CSS class applied to the canvas container
 * @returns The React element for the editor canvas
 */
export function EditorCanvas({ className }: EditorCanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelection,
    uiState,
    updateMousePosition,
    cancelPendingAdd,
    finalizePendingAdd,
  } = useEditorContext()

  const { screenToFlowPosition } = useReactFlow()
  const viewport = useViewport()

  /**
   * 노드 클릭 핸들러 - 선택 상태 업데이트
   */
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelection({ type: "node", id: node.id })
    },
    [setSelection]
  )

  /**
   * 엣지 클릭 핸들러 - 선택 상태 업데이트
   */
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      setSelection({ type: "edge", id: edge.id })
    },
    [setSelection]
  )

  /**
   * 빈 영역 클릭 핸들러 - 선택 해제 또는 노드 생성
   */
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // 노드 추가 대기 모드인 경우 해당 위치에 노드 생성
      if (uiState.pendingAdd) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        finalizePendingAdd(position)
        return
      }

      // 일반 모드에서는 선택 해제
      setSelection({ type: null, id: null })
    },
    [uiState.pendingAdd, screenToFlowPosition, finalizePendingAdd, setSelection]
  )

  /**
   * 마우스 이동 핸들러 - Ghost 노드 위치 업데이트
   *
   * screenToFlowPosition을 사용하여 Flow 좌표로 변환
   * 이렇게 하면 zoom/pan 상태와 관계없이 정확한 위치 계산 가능
   */
  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!uiState.pendingAdd) return

      // 화면 좌표를 Flow 좌표로 변환
      // 이 좌표는 실제 노드 생성 시 사용되는 좌표와 동일함
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      updateMousePosition(position)
    },
    [uiState.pendingAdd, screenToFlowPosition, updateMousePosition]
  )

  /**
   * 마우스 캔버스 벗어남 핸들러
   */
  const onMouseLeave = useCallback(() => {
    if (uiState.pendingAdd) {
      updateMousePosition(null)
    }
  }, [uiState.pendingAdd, updateMousePosition])

  /**
   * Escape 키 핸들러 - 노드 추가 대기 모드 취소
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && uiState.pendingAdd) {
        cancelPendingAdd()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [uiState.pendingAdd, cancelPendingAdd])

  // 노드 추가 대기 모드일 때 커서 스타일 변경
  const isPendingAdd = !!uiState.pendingAdd

  return (
    <div
      className={cn("h-full w-full relative", className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: isPendingAdd ? "crosshair" : undefined }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // fitView 제거 - 노드 추가 시 갑작스러운 확대 방지
        // 초기 뷰는 중앙(0,0)에서 시작, zoom 1
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          type: "relationship",
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        {/* 배경 그리드 */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-background"
        />

        {/* 미니맵 - 전체 캔버스 표시, 뷰포트 드래그로 캔버스 이동 */}
        <MiniMap
          nodeStrokeWidth={3}
          zoomable={false}
          pannable={true}
          maskColor="rgba(0, 0, 0, 0.6)"
          maskStrokeColor="hsl(var(--primary))"
          maskStrokeWidth={2}
          className="bg-muted border border-border rounded-lg"
        />

        {/* 줌 슬라이더 - 하단 중앙 */}
        <ZoomSlider className="absolute bottom-4 left-1/2 -translate-x-1/2" />
      </ReactFlow>

      {/* Ghost 노드 미리보기 - viewport 동기화로 zoom/pan 상태에서도 정확한 위치 표시 */}
      {uiState.pendingAdd && uiState.mousePosition && (
        <GhostNode
          type={uiState.pendingAdd}
          position={uiState.mousePosition}
          viewport={viewport}
        />
      )}
    </div>
  )
}