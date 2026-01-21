"use client"

/**
 * Entity 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 MikroORM Entity를 시각적으로 표현
 */

import { memo } from "react"
import type { Node, NodeProps } from "@xyflow/react"
import type { EntityData } from "@/types/entity"
import { Key, Fingerprint, Circle } from "lucide-react"
import { NodeHandles } from "@/components/editor/nodes/shared/node-handles"
import {
  NodeCard,
  NodeCardHeader,
  NodeCardBody,
} from "@/components/editor/nodes/shared/node-card"

/**
 * Entity 노드 타입 (ReactFlow Node 확장)
 */
type EntityNodeType = Node<EntityData, "entity">

/**
 * Entity 노드 Props 타입
 */
type EntityNodeProps = NodeProps<EntityNodeType>

/**
 * Entity 노드 컴포넌트
 *
 * MikroORM Entity를 카드 형태로 표시
 * - 헤더: Entity 이름
 * - 바디: 프로퍼티 목록 (PK, Unique, Nullable 아이콘 표시)
 */
function EntityNodeComponent({ data, selected }: EntityNodeProps) {
  const { name, properties } = data

  return (
    <NodeHandles theme="blue">
      <NodeCard
        theme="entity"
        selected={selected}
        header={
          <NodeCardHeader
            title={name}
            badge="«Entity»"
            theme="entity"
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
                {prop.isPrimaryKey ? (
                  <Key className="h-3 w-3 text-amber-500" />
                ) : prop.isUnique ? (
                  <Fingerprint className="h-3 w-3 text-blue-500" />
                ) : prop.isNullable ? (
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
 * 메모이제이션된 Entity 노드 컴포넌트
 */
export const EntityNode = memo(EntityNodeComponent)
