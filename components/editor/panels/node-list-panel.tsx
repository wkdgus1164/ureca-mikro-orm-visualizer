"use client"

/**
 * 좌측 노드 목록 패널
 *
 * 피그마 스타일의 3-패널 레이아웃에서 좌측 사이드바 역할
 * 노드를 카테고리별로 그룹화하여 표시
 */

import { useMemo, useState, useCallback } from "react"
import { useReactFlow } from "@xyflow/react"
import { ChevronRight, Box, List, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { EntityNode, EmbeddableNode, EnumNode } from "@/types/entity"
import type { PendingAddType } from "@/types/editor"

interface NodeListPanelProps {
  /** 추가 CSS 클래스 */
  className?: string
}

/**
 * 노드 목록 아이템 컴포넌트
 */
interface NodeListItemProps {
  name: string
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function NodeListItem({
  name,
  isSelected,
  onSelect,
  onDelete,
}: NodeListItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <span className="text-sm truncate">{name || "Untitled"}</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/**
 * 카테고리 섹션 컴포넌트
 */
interface CategorySectionProps {
  title: string
  icon: React.ReactNode
  count: number
  defaultOpen?: boolean
  children: React.ReactNode
  /** Add 버튼 클릭 핸들러 */
  onAdd?: () => void
  /** Add 버튼 레이블 */
  addLabel?: string
}

function CategorySection({
  title,
  icon,
  count,
  defaultOpen = true,
  children,
  onAdd,
  addLabel,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted/50 rounded-md transition-colors">
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {icon}
        <span className="text-sm font-medium flex-1 text-left">{title}</span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pr-2 space-y-0.5">
        {children}
        {/* Add 버튼 */}
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd()
            }}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-1.5 rounded-md",
              "text-xs text-muted-foreground",
              "hover:bg-muted/50 hover:text-foreground transition-colors"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{addLabel ?? `+ Add new ${title.toLowerCase()}`}</span>
          </button>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

/**
 * 좌측 노드 목록 패널 컴포넌트
 *
 * Entity, Embeddable, Enum 노드를 카테고리별로 그룹화하여 표시
 * 클릭 시 노드 선택 및 우측 패널 열기
 *
 * @example
 * ```tsx
 * <NodeListPanel className="w-60" />
 * ```
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
    startPendingAdd,
  } = useEditorContext()

  const { setCenter } = useReactFlow()

  // 노드를 카테고리별로 그룹화
  const groupedNodes = useMemo(() => {
    const entities: EntityNode[] = []
    const embeddables: EmbeddableNode[] = []
    const enums: EnumNode[] = []

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
      }
    })

    return { entities, embeddables, enums }
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
        "flex-shrink-0 border-r bg-background h-full flex flex-col",
        className
      )}
    >
      {/* 헤더 */}
      <div className="p-3 border-b">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Objects
        </h2>
      </div>

      {/* 노드 목록 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Entity 섹션 */}
          <CategorySection
            title="Entities"
            icon={<Box className="h-4 w-4 text-blue-500" />}
            count={groupedNodes.entities.length}
            onAdd={() => handleStartAdd("entity")}
            addLabel="+ Add new entity"
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

          {/* Embeddable 섹션 */}
          <CategorySection
            title="Embeddables"
            icon={<Box className="h-4 w-4 text-purple-500" />}
            count={groupedNodes.embeddables.length}
            onAdd={() => handleStartAdd("embeddable")}
            addLabel="+ Add new embeddable"
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

          {/* Enum 섹션 */}
          <CategorySection
            title="Enums"
            icon={<List className="h-4 w-4 text-amber-500" />}
            count={groupedNodes.enums.length}
            onAdd={() => handleStartAdd("enum")}
            addLabel="+ Add new enum"
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
        </div>
      </ScrollArea>
    </aside>
  )
}
