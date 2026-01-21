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
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
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
 * 에디터 캔버스 컴포넌트
 *
 * @example
 * ```tsx
 * export default function EditorPage() {
 *   return (
 *     <div className="h-screen w-full">
 *       <EditorCanvas />
 *     </div>
 *   )
 * }
 * ```
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
   * Ghost 노드는 DOM 요소이므로 컨테이너 기준 화면 좌표 사용
   */
  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!uiState.pendingAdd) return

      // 컨테이너 기준 상대 좌표 계산
      const container = event.currentTarget
      const rect = container.getBoundingClientRect()
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      updateMousePosition(position)
    },
    [uiState.pendingAdd, updateMousePosition]
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
        fitView
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

        {/* 줌/패닝 컨트롤 */}
        <Controls
          showZoom
          showFitView
          showInteractive
          className="bg-background border border-border rounded-lg"
        />

        {/* 미니맵 */}
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-muted border border-border rounded-lg"
        />
      </ReactFlow>

      {/* Ghost 노드 미리보기 */}
      {uiState.pendingAdd && uiState.mousePosition && (
        <GhostNode type={uiState.pendingAdd} position={uiState.mousePosition} />
      )}
    </div>
  )
}
