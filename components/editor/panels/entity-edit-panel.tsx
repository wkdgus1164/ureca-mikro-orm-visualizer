"use client"

/**
 * Entity 편집 패널 컴포넌트
 *
 * Entity 노드 선택 시 우측에서 슬라이드되며,
 * Entity 이름과 프로퍼티를 편집할 수 있는 패널
 */

import { useState, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import { PropertyForm } from "@/components/editor/panels/property-form"
import type { EntityData, EntityProperty } from "@/types/entity"
import { createDefaultProperty } from "@/types/entity"

/**
 * Entity 편집 폼 Props
 */
interface EntityEditFormProps {
  initialData: EntityData
  onSave: (data: EntityData) => void
}

/**
 * Entity 편집 폼 컴포넌트
 *
 * key prop으로 노드 ID를 전달받아 노드 변경 시 상태가 리셋됨
 */
function EntityEditForm({ initialData, onSave }: EntityEditFormProps) {
  // 로컬 편집 상태 (초기값으로 initialData 사용)
  const [localData, setLocalData] = useState<EntityData>(() => ({
    ...initialData,
    properties: initialData.properties.map((p) => ({ ...p })),
  }))

  /**
   * Entity 이름 변경 핸들러
   */
  const handleNameChange = useCallback((name: string) => {
    setLocalData((prev) => ({ ...prev, name }))
  }, [])

  /**
   * 프로퍼티 업데이트 핸들러
   */
  const handlePropertyUpdate = useCallback(
    (index: number, property: EntityProperty) => {
      setLocalData((prev) => {
        const properties = [...prev.properties]
        properties[index] = property
        return { ...prev, properties }
      })
    },
    []
  )

  /**
   * 프로퍼티 삭제 핸들러
   */
  const handlePropertyDelete = useCallback((index: number) => {
    setLocalData((prev) => {
      const properties = prev.properties.filter((_, i) => i !== index)
      return { ...prev, properties }
    })
  }, [])

  /**
   * 프로퍼티 추가 핸들러
   */
  const handleAddProperty = useCallback(() => {
    setLocalData((prev) => {
      const newProperty = createDefaultProperty(crypto.randomUUID())
      return { ...prev, properties: [...prev.properties, newProperty] }
    })
  }, [])

  /**
   * 변경사항 저장 핸들러
   */
  const handleSave = useCallback(() => {
    onSave(localData)
  }, [localData, onSave])

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="px-6 space-y-4">
        {/* Entity 이름 */}
        <div className="space-y-2">
          <Label htmlFor="entity-name">Entity Name</Label>
          <Input
            id="entity-name"
            value={localData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., User, Post, Comment"
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* 프로퍼티 목록 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 mb-2">
          <Label className="text-base font-semibold">
            Properties
            {localData.properties.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({localData.properties.length})
              </span>
            )}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddProperty}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            {localData.properties.map((property, index) => (
              <PropertyForm
                key={property.id}
                property={property}
                onChange={(p) => handlePropertyUpdate(index, p)}
                onDelete={() => handlePropertyDelete(index)}
              />
            ))}
            {localData.properties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No properties yet. Click &quot;Add&quot; to create one.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 저장 버튼 */}
      <div className="p-6 pt-4 border-t">
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

/**
 * Entity 편집 패널 컴포넌트
 *
 * @example
 * ```tsx
 * <EditorProvider>
 *   <EditorCanvas />
 *   <EntityEditPanel />
 * </EditorProvider>
 * ```
 */
export function EntityEditPanel() {
  const { uiState, getSelectedNode, updateEntity, togglePanel } =
    useEditorContext()

  // 선택된 노드 가져오기
  const selectedNode = getSelectedNode()

  /**
   * 패널 열림/닫힘 핸들러
   */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        togglePanel()
      }
    },
    [togglePanel]
  )

  /**
   * Entity 저장 핸들러
   */
  const handleSave = useCallback(
    (data: EntityData) => {
      if (selectedNode) {
        updateEntity(selectedNode.id, data)
      }
    },
    [selectedNode, updateEntity]
  )

  // Entity 노드가 선택되었을 때만 패널 표시
  const isOpen =
    uiState.isPanelOpen &&
    uiState.selection.type === "node" &&
    selectedNode !== null

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Edit Entity</SheetTitle>
          <SheetDescription>
            Modify the entity properties and settings
          </SheetDescription>
        </SheetHeader>

        {selectedNode && (
          <EntityEditForm
            key={selectedNode.id}
            initialData={selectedNode.data}
            onSave={handleSave}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
