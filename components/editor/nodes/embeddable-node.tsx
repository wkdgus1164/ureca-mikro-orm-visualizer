"use client"

/**
 * Embeddable 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 MikroORM Embeddable을 시각적으로 표현
 * Entity와 시각적으로 구분되는 디자인 (보라색 테마, 점선 테두리)
 */

import { memo } from "react"
import type { Node, NodeProps } from "@xyflow/react"
import type { EmbeddableData } from "@/types/entity"
import { Circle } from "lucide-react"
import { NodeHandles } from "@/components/editor/nodes/shared/node-handles"
import {
  NodeCard,
  NodeCardHeader,
  NodeCardBody,
} from "@/components/editor/nodes/shared/node-card"

/**
 * Embeddable 노드 타입 (ReactFlow Node 확장)
 */
type EmbeddableNodeType = Node<EmbeddableData, "embeddable">

/**
 * Embeddable 노드 Props 타입
 */
type EmbeddableNodeProps = NodeProps<EmbeddableNodeType>

/**
 * Embeddable 노드 컴포넌트
 *
 * MikroORM Embeddable을 카드 형태로 표시
 * - 헤더: Embeddable 이름 + "Embeddable" 배지
 * - 바디: 프로퍼티 목록
 */
function EmbeddableNodeComponent({ data, selected }: EmbeddableNodeProps) {
  const { name, properties } = data

  return (
    <NodeHandles theme="violet">
      <NodeCard
        theme="embeddable"
        selected={selected}
        header={
          <NodeCardHeader
            title={name}
            badge="«VO»"
            theme="embeddable"
          />
        }
      >
        <NodeCardBody
          isEmpty={properties.length === 0}
          emptyMessage="No properties"
        >
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center px-3 py-1 text-xs hover:bg-muted/30 transition-colors"
            >
              {/* 아이콘 영역 (고정 너비) */}
              <div className="w-4 flex-shrink-0 flex items-center justify-center">
                {prop.isNullable ? (
                  <Circle className="h-2 w-2 text-muted-foreground/40" />
                ) : null}
              </div>

              {/* 프로퍼티 이름 */}
              <span className="font-medium text-foreground truncate">
                {prop.name}
              </span>

              {/* 타입 */}
              <span className="text-muted-foreground ml-auto pl-2 flex-shrink-0">
                {prop.type}
              </span>
            </div>
          ))}
        </NodeCardBody>
      </NodeCard>
    </NodeHandles>
  )
}

/**
 * 메모이제이션된 Embeddable 노드 컴포넌트
 */
export const EmbeddableNode = memo(EmbeddableNodeComponent)
