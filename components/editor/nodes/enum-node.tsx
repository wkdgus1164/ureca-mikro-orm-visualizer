"use client"

/**
 * Enum 노드 커스텀 컴포넌트
 *
 * ReactFlow 캔버스에서 TypeScript Enum을 시각적으로 표현
 * amber 색상 테마로 Entity/Embeddable과 시각적으로 구분
 */

import { memo } from "react"
import type { Node, NodeProps } from "@xyflow/react"
import type { EnumData } from "@/types/entity"
import { List } from "lucide-react"
import { NodeHandles } from "@/components/editor/nodes/shared/node-handles"
import {
  NodeCard,
  NodeCardHeader,
  NodeCardBody,
} from "@/components/editor/nodes/shared/node-card"

/**
 * Enum 노드 타입 (ReactFlow Node 확장)
 */
type EnumNodeType = Node<EnumData, "enum">

/**
 * Enum 노드 Props 타입
 */
type EnumNodeProps = NodeProps<EnumNodeType>

/**
 * Enum 노드 컴포넌트
 *
 * TypeScript Enum을 카드 형태로 표시
 * - 헤더: Enum 이름 + "Enum" 배지
 * - 바디: Key = "Value" 형식의 목록
 */
function EnumNodeComponent({ data, selected }: EnumNodeProps) {
  const { name, values } = data

  return (
    <NodeHandles theme="amber">
      <NodeCard
        theme="enum"
        selected={selected}
        header={
          <NodeCardHeader
            icon={<List className="w-4 h-4 text-amber-500" />}
            title={name}
            badge="Enum"
            theme="enum"
          />
        }
      >
        <NodeCardBody isEmpty={values.length === 0} emptyMessage="No values">
          {values.map((enumValue, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1 text-xs hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
            >
              {/* Key */}
              <span className="font-medium text-foreground truncate">
                {enumValue.key}
              </span>

              {/* = */}
              <span className="text-muted-foreground mx-1.5">=</span>

              {/* Value */}
              <span className="text-amber-600 dark:text-amber-400 truncate">
                &quot;{enumValue.value}&quot;
              </span>
            </div>
          ))}
        </NodeCardBody>
      </NodeCard>
    </NodeHandles>
  )
}

/**
 * 메모이제이션된 Enum 노드 컴포넌트
 */
export const EnumNode = memo(EnumNodeComponent)
