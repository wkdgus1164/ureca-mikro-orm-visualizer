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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus, Trash2, Key, Asterisk } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { EntityData, EntityProperty } from "@/types/entity"
import { createDefaultProperty } from "@/types/entity"

/**
 * 프로퍼티 아이템 Props
 */
interface PropertyItemProps {
  property: EntityProperty
  onUpdate: (property: EntityProperty) => void
  onDelete: () => void
}

/**
 * 개별 프로퍼티 편집 아이템
 */
function PropertyItem({ property, onUpdate, onDelete }: PropertyItemProps) {
  return (
    <Card className="bg-muted/50">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.isPrimaryKey && (
              <span title="Primary Key">
                <Key className="h-3 w-3 text-yellow-500" />
              </span>
            )}
            {!property.isNullable && (
              <span title="Required">
                <Asterisk className="h-3 w-3 text-red-500" />
              </span>
            )}
            <CardTitle className="text-sm font-medium">
              {property.name}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        {/* 프로퍼티 이름 */}
        <div className="space-y-1">
          <Label htmlFor={`prop-name-${property.id}`} className="text-xs">
            Name
          </Label>
          <Input
            id={`prop-name-${property.id}`}
            value={property.name}
            onChange={(e) => onUpdate({ ...property, name: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* 프로퍼티 타입 */}
        <div className="space-y-1">
          <Label htmlFor={`prop-type-${property.id}`} className="text-xs">
            Type
          </Label>
          <Input
            id={`prop-type-${property.id}`}
            value={property.type}
            onChange={(e) => onUpdate({ ...property, type: e.target.value })}
            className="h-8 text-sm"
            placeholder="string, number, boolean, Date..."
          />
        </div>

        {/* 체크박스 그룹 */}
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.isPrimaryKey}
              onChange={(e) =>
                onUpdate({ ...property, isPrimaryKey: e.target.checked })
              }
              className="rounded border-border"
            />
            <span>Primary Key</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.isUnique}
              onChange={(e) =>
                onUpdate({ ...property, isUnique: e.target.checked })
              }
              className="rounded border-border"
            />
            <span>Unique</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.isNullable}
              onChange={(e) =>
                onUpdate({ ...property, isNullable: e.target.checked })
              }
              className="rounded border-border"
            />
            <span>Nullable</span>
          </label>
        </div>

        {/* Default Value */}
        <div className="space-y-1">
          <Label htmlFor={`prop-default-${property.id}`} className="text-xs">
            Default Value
          </Label>
          <Input
            id={`prop-default-${property.id}`}
            value={property.defaultValue ?? ""}
            onChange={(e) =>
              onUpdate({
                ...property,
                defaultValue: e.target.value || undefined,
              })
            }
            className="h-8 text-sm"
            placeholder="(optional)"
          />
        </div>
      </CardContent>
    </Card>
  )
}

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
   * 테이블명 변경 핸들러
   */
  const handleTableNameChange = useCallback((tableName: string) => {
    setLocalData((prev) => ({
      ...prev,
      tableName: tableName || undefined,
    }))
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

        {/* 커스텀 테이블명 */}
        <div className="space-y-2">
          <Label htmlFor="table-name">
            Custom Table Name{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="table-name"
            value={localData.tableName ?? ""}
            onChange={(e) => handleTableNameChange(e.target.value)}
            placeholder={`defaults to "${localData.name.toLowerCase()}"`}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* 프로퍼티 목록 */}
      <div className="px-6 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-semibold">Properties</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddProperty}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Property
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 pb-4">
            {localData.properties.map((property, index) => (
              <PropertyItem
                key={property.id}
                property={property}
                onUpdate={(p) => handlePropertyUpdate(index, p)}
                onDelete={() => handlePropertyDelete(index)}
              />
            ))}
            {localData.properties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No properties yet. Click &quot;Add Property&quot; to create one.
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
