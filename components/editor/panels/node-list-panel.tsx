"use client"

/**
 * 좌측 노드 목록 패널
 *
 * 피그마 스타일의 3-패널 레이아웃에서 좌측 사이드바 역할
 * 노드를 카테고리별로 그룹화하여 표시
 */

import { useMemo, useCallback } from "react"
import { useReactFlow } from "@xyflow/react"
import { Box, List, FileCode } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useEditorContext } from "@/components/providers/editor-provider"
import { NodeListItem } from "@/components/editor/panels/shared/node-list-item"
import { CategorySection } from "@/components/editor/panels/shared/category-section"
import type { EntityNode, EmbeddableNode, EnumNode, InterfaceNode } from "@/types/entity"
import type { PendingAddType } from "@/types/editor"

interface NodeListPanelProps {
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 좌측 노드 목록 패널
 *
 * Entities, Embeddables, Enums를 카테고리별로 그룹화하여 표시
 * 선택, 추가, 삭제 기능 제공
 */
export function NodeListPanel({ className }: NodeListPanelProps) {
  const {
    nodes,
    uiState,
    setSelection,
    setNodes,
    deleteEntity,
    deleteEmbeddable,
    deleteEnum,
    deleteInterface,
    startPendingAdd,
  } = useEditorContext()

  const { setCenter } = useReactFlow()

  // 노드를 카테고리별로 그룹화
  const groupedNodes = useMemo(() => {
    const entities: EntityNode[] = []
    const embeddables: EmbeddableNode[] = []
    const enums: EnumNode[] = []
    const interfaces: InterfaceNode[] = []

    nodes.forEach((node) => {
      switch (node.type) {
        case "entity":
          entities.push(node as EntityNode)
          break
        case "embeddable":
          embeddables.push(node as EmbeddableNode)
          break
        case "enum":
          enums.push(node as EnumNode)
          break
        case "interface":
          interfaces.push(node as InterfaceNode)
          break
      }
    })

    return { entities, embeddables, enums, interfaces }
  }, [nodes])

  /**
   * 노드 선택 핸들러 (캔버스 선택 동기화 포함)
   */
  const handleSelectNode = useCallback(
    (id: string) => {
      // 에디터 선택 상태 업데이트
      setSelection({ type: "node", id })

      // ReactFlow 노드 선택 상태 동기화
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === id,
        }))
      )

      // 선택한 노드로 뷰 이동
      const node = nodes.find((n) => n.id === id)
      if (node) {
        // 노드 중심 위치로 이동 (대략적인 노드 크기 고려)
        setCenter(node.position.x + 90, node.position.y + 50, { duration: 300 })
      }
    },
    [setSelection, setNodes, nodes, setCenter]
  )

  /**
   * 노드 추가 대기 모드 시작
   */
  const handleStartAdd = useCallback(
    (type: PendingAddType) => {
      startPendingAdd(type)
    },
    [startPendingAdd]
  )

  /**
   * 선택 여부 확인
   */
  const isSelected = (id: string) =>
    uiState.selection.type === "node" && uiState.selection.id === id

  return (
    <aside
      className={cn(
        "flex-shrink-0 border-r bg-background h-full flex flex-col pt-[60px]",
        className
      )}
    >
      {/* 노드 목록 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Entity 섹션 */}
          <CategorySection
            title="Entities"
            icon={<Box className="h-4 w-4 text-blue-500" />}
            count={groupedNodes.entities.length}
            onAdd={() => handleStartAdd("entity")}
            addLabel="Add new entity"
          >
            {groupedNodes.entities.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No entities yet
              </p>
            ) : (
              groupedNodes.entities.map((entity) => (
                <NodeListItem
                  key={entity.id}
                  name={entity.data.name}
                  isSelected={isSelected(entity.id)}
                  onSelect={() => handleSelectNode(entity.id)}
                  onDelete={() => deleteEntity(entity.id)}
                />
              ))
            )}
          </CategorySection>

          <Separator className="my-2" />

          {/* Embeddable 섹션 */}
          <CategorySection
            title="Embeddables"
            icon={<Box className="h-4 w-4 text-purple-500" />}
            count={groupedNodes.embeddables.length}
            onAdd={() => handleStartAdd("embeddable")}
            addLabel="Add new embeddable"
          >
            {groupedNodes.embeddables.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No embeddables yet
              </p>
            ) : (
              groupedNodes.embeddables.map((embeddable) => (
                <NodeListItem
                  key={embeddable.id}
                  name={embeddable.data.name}
                  isSelected={isSelected(embeddable.id)}
                  onSelect={() => handleSelectNode(embeddable.id)}
                  onDelete={() => deleteEmbeddable(embeddable.id)}
                />
              ))
            )}
          </CategorySection>

          <Separator className="my-2" />

          {/* Enum 섹션 */}
          <CategorySection
            title="Enums"
            icon={<List className="h-4 w-4 text-amber-500" />}
            count={groupedNodes.enums.length}
            onAdd={() => handleStartAdd("enum")}
            addLabel="Add new enum"
          >
            {groupedNodes.enums.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No enums yet
              </p>
            ) : (
              groupedNodes.enums.map((enumNode) => (
                <NodeListItem
                  key={enumNode.id}
                  name={enumNode.data.name}
                  isSelected={isSelected(enumNode.id)}
                  onSelect={() => handleSelectNode(enumNode.id)}
                  onDelete={() => deleteEnum(enumNode.id)}
                />
              ))
            )}
          </CategorySection>

          <Separator className="my-2" />

          {/* Interface 섹션 */}
          <CategorySection
            title="Interfaces"
            icon={<FileCode className="h-4 w-4 text-emerald-500" />}
            count={groupedNodes.interfaces.length}
            onAdd={() => handleStartAdd("interface")}
            addLabel="Add new interface"
          >
            {groupedNodes.interfaces.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No interfaces yet
              </p>
            ) : (
              groupedNodes.interfaces.map((interfaceNode) => (
                <NodeListItem
                  key={interfaceNode.id}
                  name={interfaceNode.data.name}
                  isSelected={isSelected(interfaceNode.id)}
                  onSelect={() => handleSelectNode(interfaceNode.id)}
                  onDelete={() => deleteInterface(interfaceNode.id)}
                />
              ))
            )}
          </CategorySection>
        </div>
      </ScrollArea>
    </aside>
  )
}
