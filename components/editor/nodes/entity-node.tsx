"use client"

/**
 * Entity 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 MikroORM Entity를 시각적으로 표현
 */

import { memo } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import type { EntityData } from "@/types/entity"
import { Key, Fingerprint, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Entity 노드 타입 (ReactFlow Node 확장)
 */
type EntityNodeType = Node<EntityData, "entity">

/**
 * Entity 노드 Props 타입
 */
type EntityNodeProps = NodeProps<EntityNodeType>

/**
 * 핸들 스타일 (공통)
 */
const handleClassName =
  "!w-2.5 !h-2.5 !bg-primary !border-2 !border-background hover:!bg-primary/80 transition-colors"

/**
 * Entity 노드 컴포넌트
 *
 * @example
 * ```tsx
 * const nodeTypes = { entity: EntityNode }
 * <ReactFlow nodeTypes={nodeTypes} />
 * ```
 */
function EntityNodeComponent({ data, selected }: EntityNodeProps) {
  const { name, properties } = data

  return (
    <>
      {/* 상단 핸들 (Target) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={handleClassName}
      />

      {/* 좌측 핸들 (Target) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className={handleClassName}
      />

      {/* 메인 카드 */}
      <div
        className={cn(
          "min-w-[180px] max-w-[280px] bg-background rounded-lg shadow-md",
          "border-2 transition-all",
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-muted-foreground/50"
        )}
      >
        {/* 헤더: Entity 이름 */}
        <div className="px-3 py-2 bg-muted/50 border-b border-border rounded-t-md">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Circle className="w-2 h-2 fill-primary text-primary" />
            <span className="truncate">{name}</span>
          </div>
        </div>

        {/* 바디: 프로퍼티 목록 */}
        {properties.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground italic">
            No properties
          </div>
        ) : (
          <div className="py-1">
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
          </div>
        )}
      </div>

      {/* 우측 핸들 (Source) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className={handleClassName}
      />

      {/* 하단 핸들 (Source) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={handleClassName}
      />
    </>
  )
}

/**
 * 메모이제이션된 Entity 노드 컴포넌트
 */
export const EntityNode = memo(EntityNodeComponent)
