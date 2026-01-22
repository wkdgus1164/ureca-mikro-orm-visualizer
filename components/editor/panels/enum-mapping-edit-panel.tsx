"use client"

/**
 * Enum Mapping 편집 컨텐츠 컴포넌트
 *
 * PropertySidebar 내부에서 Entity ↔ Enum 매핑 UI를 제공
 * Entity의 프로퍼티를 선택하여 Enum 타입으로 매핑
 */

import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { EnumMappingEdge } from "@/types/relationship"
import type { EntityNode, EnumNode } from "@/types/entity"
import { createDefaultProperty } from "@/types/entity"

/**
 * Enum Mapping 편집 내부 컴포넌트 Props
 */
interface EnumMappingEditInnerProps {
  selectedEdge: EnumMappingEdge
  entityNode: EntityNode
  enumNode: EnumNode
}

/**
 * Enum Mapping 편집 내부 컴포넌트
 */
function EnumMappingEditInner({
  selectedEdge,
  entityNode,
  enumNode,
}: EnumMappingEditInnerProps) {
  const { updateEnumMapping, updateEntity, edges, deleteRelationship } =
    useEditorContext()

  const properties = useMemo(
    () => entityNode.data.properties ?? [],
    [entityNode.data.properties]
  )

  const selectedPropertyId = selectedEdge.data.propertyId

  /**
   * 프로퍼티 선택 핸들러
   */
  const handlePropertySelect = (propertyId: string) => {
    // 단일 updatedProperties 배열에서 모든 변경사항 계산
    let updatedProperties = [...properties]

    // 이전에 선택된 프로퍼티가 있으면 타입 복원 (string으로)
    if (selectedPropertyId) {
      updatedProperties = updatedProperties.map((p) =>
        p.id === selectedPropertyId ? { ...p, type: "string" } : p
      )
    }

    // 새로 선택된 프로퍼티의 타입을 Enum으로 변경
    updatedProperties = updatedProperties.map((p) =>
      p.id === propertyId ? { ...p, type: enumNode.data.name } : p
    )

    // 한 번만 updateEntity 호출
    updateEntity(entityNode.id, { properties: updatedProperties })

    // Enum 매핑 업데이트
    updateEnumMapping(selectedEdge.id, { propertyId })

    // 다른 EnumMapping 엣지가 같은 프로퍼티를 참조하고 있으면 엣지 삭제
    edges
      .filter(
        (e) =>
          e.type === "enum-mapping" &&
          e.id !== selectedEdge.id &&
          e.data.propertyId === propertyId
      )
      .forEach((e) => {
        deleteRelationship(e.id)
      })
  }

  /**
   * 새 프로퍼티 생성 및 Enum 타입 적용
   */
  const handleCreateProperty = () => {
    const newProperty = createDefaultProperty(crypto.randomUUID())
    // 프로퍼티명을 Enum 이름의 camelCase로 설정
    const enumName = enumNode.data.name
    const propertyName = enumName.charAt(0).toLowerCase() + enumName.slice(1)
    newProperty.name = propertyName
    newProperty.type = enumNode.data.name

    const updatedProperties = [...properties, newProperty]
    updateEntity(entityNode.id, { properties: updatedProperties })
    updateEnumMapping(selectedEdge.id, { propertyId: newProperty.id })
  }

  return (
    <div className="space-y-4">
      {/* 연결 정보 */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Connection</Label>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entity:</span>
            <span className="font-medium">{entityNode.data.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Enum:</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {enumNode.data.name}
            </span>
          </div>
        </div>
      </div>

      {/* 프로퍼티 선택 */}
      <div className="space-y-2">
        <Label htmlFor="property-select">Map to Property</Label>
        <p className="text-xs text-muted-foreground">
          Select which property should use this Enum type
        </p>
        <Select
          value={selectedPropertyId ?? ""}
          onValueChange={handlePropertySelect}
        >
          <SelectTrigger id="property-select">
            <SelectValue placeholder="Select a property..." />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}{" "}
                <span className="text-muted-foreground">: {property.type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 새 프로퍼티 생성 */}
      <div className="space-y-2">
        <Label>Or Create New Property</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateProperty}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Create &quot;{enumNode.data.name.charAt(0).toLowerCase() + enumNode.data.name.slice(1)}&quot; property
        </Button>
      </div>
    </div>
  )
}

/**
 * Enum Mapping 편집 컨텐츠 컴포넌트
 */
export function EnumMappingEditContent() {
  const { getSelectedEnumMapping, nodes } = useEditorContext()

  const selectedEdge = getSelectedEnumMapping()

  // 연결된 Entity와 Enum 노드 찾기
  const entityNode = useMemo(() => {
    if (!selectedEdge) return null
    return nodes.find(
      (n) => n.id === selectedEdge.source && n.type === "entity"
    ) as EntityNode | undefined
  }, [selectedEdge, nodes])

  const enumNode = useMemo(() => {
    if (!selectedEdge) return null
    return nodes.find(
      (n) => n.id === selectedEdge.target && n.type === "enum"
    ) as EnumNode | undefined
  }, [selectedEdge, nodes])

  if (!selectedEdge || !entityNode || !enumNode) {
    return null
  }

  return (
    <EnumMappingEditInner
      selectedEdge={selectedEdge}
      entityNode={entityNode}
      enumNode={enumNode}
    />
  )
}
