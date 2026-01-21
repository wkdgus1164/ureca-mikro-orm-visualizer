"use client"

/**
 * ReactFlow 에디터 캔버스 컴포넌트
 *
 * MikroORM Entity 다이어그램을 시각적으로 편집하는 메인 캔버스
 */

import { useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useEditorContext } from "@/components/providers/editor-provider"
import { cn } from "@/lib/utils"
import { EntityNode } from "@/components/editor/nodes/entity-node"
import { EmbeddableNode } from "@/components/editor/nodes/embeddable-node"
import { RelationshipEdge } from "@/components/editor/edges/relationship-edge"

/**
 * 커스텀 노드 타입 등록
 */
const nodeTypes = {
  entity: EntityNode,
  embeddable: EmbeddableNode,
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
  } = useEditorContext()

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
   * 빈 영역 클릭 핸들러 - 선택 해제
   */
  const onPaneClick = useCallback(() => {
    setSelection({ type: null, id: null })
  }, [setSelection])

  return (
    <div className={cn("h-full w-full", className)}>
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
    </div>
  )
}
