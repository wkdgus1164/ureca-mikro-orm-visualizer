"use client"

/**
 * Entity 편집 컨텐츠 컴포넌트
 *
 * PropertySidebar 내부에서 Entity 편집 UI를 제공
 * 실시간 반영: 변경 즉시 updateEntity 호출
 */

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Plus, Database } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import { PropertyForm } from "@/components/editor/panels/property-form"
import { IndexForm } from "@/components/editor/panels/index-form"
import type { EntityProperty, EntityIndex, EntityNode } from "@/types/entity"
import { createDefaultProperty } from "@/types/entity"

/**
 * Entity 편집 내부 컴포넌트 Props
 */
interface EntityEditInnerProps {
  selectedNode: EntityNode
}

/**
 * Renders an inline editor for a selected Entity and applies edits through the editor context.
 *
 * Displays controls to edit the entity name, manage properties (add, update, delete), and manage indexes (add, update, delete). All modifications are propagated immediately to the underlying entity via the editor context.
 *
 * @param selectedNode - The entity node being edited; its data provides the current name, properties, and indexes shown in the UI.
 */
function EntityEditInner({ selectedNode }: EntityEditInnerProps) {
  const {
    updateEntity,
    getAllEnums,
    edges,
    addEnumMapping,
    updateEnumMapping,
    deleteRelationship,
  } = useEditorContext()

  const availableEnums = getAllEnums()

  const data = selectedNode.data
  const properties = useMemo(() => data.properties ?? [], [data.properties])
  const indexes = useMemo(() => data.indexes ?? [], [data.indexes])

  /**
   * Entity 이름 변경 핸들러 (실시간 반영)
   */
  const handleNameChange = (name: string) => {
    updateEntity(selectedNode.id, { name })
  }

  /**
   * Aggregate Root 변경 핸들러 (실시간 반영)
   */
  const handleAggregateRootChange = (isAggregateRoot: boolean) => {
    updateEntity(selectedNode.id, { isAggregateRoot })
  }

  /**
   * 프로퍼티 업데이트 핸들러 (실시간 반영)
   */
  const handlePropertyUpdate = (index: number, property: EntityProperty) => {
    const oldProperty = properties[index]
    const newProperties = [...properties]
    newProperties[index] = property
    updateEntity(selectedNode.id, { properties: newProperties })

    // Enum 타입으로 변경되었는지 확인
    const newEnumNode = availableEnums.find((e) => e.data.name === property.type)
    const oldEnumNode = availableEnums.find((e) => e.data.name === oldProperty.type)

    // 타입이 변경되지 않았으면 아무것도 하지 않음
    if (property.type === oldProperty.type) {
      return
    }

    // 1. 이전 Enum과의 연결 해제 (Enum → 다른 Enum 또는 Enum → 기본 타입)
    if (oldEnumNode) {
      const oldEnumEdge = edges.find(
        (e) =>
          e.type === "enum-mapping" &&
          e.source === selectedNode.id &&
          e.target === oldEnumNode.id
      )

      if (oldEnumEdge) {
        // 이전 Enum 엣지 삭제
        deleteRelationship(oldEnumEdge.id)
      }
    }

    // 2. 새 Enum 타입으로 변경된 경우 → EnumMapping 엣지 자동 생성
    if (newEnumNode) {
      // 해당 Entity와 새 Enum 사이에 EnumMapping 엣지가 있는지 확인
      const existingEdge = edges.find(
        (e) =>
          e.type === "enum-mapping" &&
          e.source === selectedNode.id &&
          e.target === newEnumNode.id
      )

      if (existingEdge) {
        // 기존 엣지가 있으면 propertyId 업데이트
        updateEnumMapping(existingEdge.id, {
          propertyId: property.id,
          previousType: oldProperty.type,
        })
      } else {
        // 기존 엣지가 없으면 새로 생성하고 바로 propertyId 업데이트
        const newEdgeId = addEnumMapping(selectedNode.id, newEnumNode.id)
        updateEnumMapping(newEdgeId, {
          propertyId: property.id,
          previousType: oldProperty.type,
        })
      }
    }
  }

  /**
   * 프로퍼티 삭제 핸들러 (실시간 반영)
   */
  const handlePropertyDelete = (index: number) => {
    const newProperties = properties.filter((_, i) => i !== index)
    updateEntity(selectedNode.id, { properties: newProperties })
  }

  /**
   * 프로퍼티 추가 핸들러 (실시간 반영)
   */
  const handleAddProperty = () => {
    const newProperty = createDefaultProperty(crypto.randomUUID())
    updateEntity(selectedNode.id, { properties: [...properties, newProperty] })
  }

  /**
   * Index 업데이트 핸들러 (실시간 반영)
   */
  const handleIndexUpdate = (idx: number, index: EntityIndex) => {
    const newIndexes = [...indexes]
    newIndexes[idx] = index
    updateEntity(selectedNode.id, { indexes: newIndexes })
  }

  /**
   * Index 삭제 핸들러 (실시간 반영)
   */
  const handleIndexDelete = (idx: number) => {
    const newIndexes = indexes.filter((_, i) => i !== idx)
    updateEntity(selectedNode.id, { indexes: newIndexes })
  }

  /**
   * Index 추가 핸들러 (실시간 반영)
   */
  const handleAddIndex = () => {
    const newIndex: EntityIndex = {
      id: crypto.randomUUID(),
      properties: [],
      isUnique: false,
    }
    updateEntity(selectedNode.id, { indexes: [...indexes, newIndex] })
  }

  return (
    <div className="space-y-4">
      {/* Aggregate Root 스위치 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="aggregate-root" className="cursor-pointer">
            Aggregate Root
          </Label>
          <p className="text-xs text-muted-foreground">
            DDD 패턴의 집합 루트 (Repository 기본 단위)
          </p>
        </div>
        <Switch
          id="aggregate-root"
          checked={data.isAggregateRoot ?? false}
          onCheckedChange={handleAggregateRootChange}
        />
      </div>

      <Separator />

      {/* Entity 이름 */}
      <div className="space-y-1.5">
        <Label htmlFor="entity-name">Entity Name</Label>
        <p className="text-xs text-muted-foreground">
          The TypeScript class name for this entity
        </p>
        <Input
          id="entity-name"
          value={data.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., User, Post, Comment"
          className="w-full"
        />
      </div>

      <Separator />

      {/* 프로퍼티 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Properties
            {properties.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({properties.length})
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

        <div className="space-y-1">
          {properties.map((property, index) => (
            <PropertyForm
              key={property.id}
              property={property}
              onChange={(p) => handlePropertyUpdate(index, p)}
              onDelete={() => handlePropertyDelete(index)}
              availableEnums={availableEnums}
            />
          ))}
          {properties.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No properties yet. Click &quot;Add&quot; to create one.
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Indexes 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Database className="h-4 w-4" />
            Indexes
            {indexes.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                ({indexes.length})
              </span>
            )}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddIndex}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-1">
          {indexes.map((index, idx) => (
            <IndexForm
              key={index.id}
              index={index}
              availableProperties={properties}
              onChange={(i) => handleIndexUpdate(idx, i)}
              onDelete={() => handleIndexDelete(idx)}
            />
          ))}
          {indexes.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No indexes yet. Click &quot;Add&quot; to create composite indexes or unique constraints.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Renders an in-panel editor for the currently selected entity inside the property sidebar.
 *
 * If no entity is selected, the component renders `null`.
 *
 * @returns The editor UI as a `JSX.Element`, or `null` when there is no selected entity.
 */
export function EntityEditContent() {
  const { getSelectedNode } = useEditorContext()

  const selectedNode = getSelectedNode()

  // 선택된 노드가 없으면 렌더링하지 않음
  if (!selectedNode) {
    return null
  }

  return <EntityEditInner selectedNode={selectedNode} />
}