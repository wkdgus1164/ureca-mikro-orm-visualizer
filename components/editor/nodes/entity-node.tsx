"use client"

/**
 * Entity 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 MikroORM Entity를 시각적으로 표현
 */

import { memo } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EntityData } from "@/types/entity"
import { Key, Fingerprint, CircleDot } from "lucide-react"
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
  "!w-3 !h-3 !bg-primary !border-2 !border-background hover:!bg-primary/80 transition-colors"

/**
 * Entity 노드 컴포넌트
 *
 * shadcn/ui Card를 기반으로 Entity 정보 표시
 * - 헤더: Entity 이름
 * - 바디: 프로퍼티 목록 (PK, Unique 아이콘 포함)
 * - 핸들: 상하좌우 4방향 연결 포인트
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
      <Card
        className={cn(
          "min-w-[220px] max-w-[320px] shadow-lg transition-all",
          "border-2",
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-muted-foreground/50"
        )}
      >
        {/* 헤더: Entity 이름 */}
        <CardHeader className="py-3 px-4 bg-muted/50 border-b border-border">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {name}
          </CardTitle>
        </CardHeader>

        {/* 바디: 프로퍼티 목록 */}
        <CardContent className="p-0">
          {properties.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground italic">
              No properties defined
            </div>
          ) : (
            <div className="divide-y divide-border">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted/30 transition-colors"
                >
                  {/* 아이콘: Primary Key */}
                  {prop.isPrimaryKey && (
                    <Key
                      className="h-3.5 w-3.5 text-amber-500 flex-shrink-0"
                      aria-label="Primary Key"
                    />
                  )}

                  {/* 아이콘: Unique */}
                  {prop.isUnique && !prop.isPrimaryKey && (
                    <Fingerprint
                      className="h-3.5 w-3.5 text-blue-500 flex-shrink-0"
                      aria-label="Unique"
                    />
                  )}

                  {/* 아이콘: Nullable */}
                  {prop.isNullable && !prop.isPrimaryKey && !prop.isUnique && (
                    <CircleDot
                      className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0"
                      aria-label="Nullable"
                    />
                  )}

                  {/* 아이콘 없는 경우 스페이서 */}
                  {!prop.isPrimaryKey && !prop.isUnique && !prop.isNullable && (
                    <div className="w-3.5 flex-shrink-0" />
                  )}

                  {/* 프로퍼티 이름 */}
                  <span className="font-medium truncate">{prop.name}</span>

                  {/* 타입 */}
                  <span className="text-muted-foreground ml-auto flex-shrink-0">
                    : {prop.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
 *
 * ReactFlow 성능 최적화를 위해 memo 사용
 */
export const EntityNode = memo(EntityNodeComponent)
