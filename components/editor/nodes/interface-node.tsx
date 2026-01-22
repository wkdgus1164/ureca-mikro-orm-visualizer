"use client"

/**
 * Interface 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 TypeScript Interface를 시각적으로 표현
 */

import { memo } from "react"
import type { Node, NodeProps } from "@xyflow/react"
import type { InterfaceData } from "@/types/entity"
import { NodeHandles } from "@/components/editor/nodes/shared/node-handles"
import {
  NodeCard,
  NodeCardHeader,
  NodeCardBody,
} from "@/components/editor/nodes/shared/node-card"

/**
 * Interface 노드 타입 (ReactFlow Node 확장)
 */
type InterfaceNodeType = Node<InterfaceData, "interface">

/**
 * Interface 노드 Props 타입
 */
type InterfaceNodeProps = NodeProps<InterfaceNodeType>

/**
 * Interface 노드 컴포넌트
 *
 * TypeScript Interface를 카드 형태로 표시
 * - 헤더: Interface 이름 + <<Interface>> 배지
 * - 바디: 프로퍼티 및 메서드 시그니처 목록
 */
function InterfaceNodeComponent({ data, selected }: InterfaceNodeProps) {
  const { name, properties, methods } = data

  const hasContent = properties.length > 0 || methods.length > 0

  return (
    <NodeHandles theme="emerald">
      <NodeCard
        theme="interface"
        selected={selected}
        header={
          <NodeCardHeader
            title={name}
            badge="<<Interface>>"
            theme="interface"
          />
        }
      >
        <NodeCardBody
          isEmpty={!hasContent}
          emptyMessage="No members"
        >
          {/* Properties */}
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center px-3 py-1 text-xs hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium text-foreground truncate">
                {prop.name}
              </span>
              <span className="text-muted-foreground ml-auto pl-2 flex-shrink-0">
                {prop.type}
              </span>
            </div>
          ))}

          {/* Methods */}
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center px-3 py-1 text-xs hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium text-foreground truncate">
                {method.name}({method.parameters})
              </span>
              <span className="text-muted-foreground ml-auto pl-2 flex-shrink-0">
                {method.returnType}
              </span>
            </div>
          ))}
        </NodeCardBody>
      </NodeCard>
    </NodeHandles>
  )
}

/**
 * 메모이제이션된 Interface 노드 컴포넌트
 */
export const InterfaceNode = memo(InterfaceNodeComponent)
