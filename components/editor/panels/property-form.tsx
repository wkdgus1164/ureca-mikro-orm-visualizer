"use client"

/**
 * Property 편집 폼 컴포넌트
 *
 * Entity 프로퍼티의 상세 설정을 편집하는 리스트 형태 폼
 */

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Trash2, Key, Asterisk, ChevronRight, GripVertical, Plus, List } from "lucide-react"
import type { EntityProperty, EnumDefinition, EnumValue, EnumNode } from "@/types/entity"
import { PROPERTY_TYPES } from "@/types/entity"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PropertyFormProps {
  /** 편집할 프로퍼티 */
  property: EntityProperty
  /** 프로퍼티 변경 핸들러 */
  onChange: (property: EntityProperty) => void
  /** 프로퍼티 삭제 핸들러 */
  onDelete: () => void
  /** 삭제 버튼 표시 여부 */
  showDelete?: boolean
  /** 사용 가능한 Enum 노드 목록 (참조용) */
  availableEnums?: EnumNode[]
}

/**
 * Property 편집 폼 컴포넌트 (리스트 스타일)
 *
 * 프로퍼티의 이름, 타입, 옵션 등을 편집할 수 있는 폼
 *
 * @example
 * ```tsx
 * <PropertyForm
 *   property={property}
 *   onChange={(updated) => updateProperty(index, updated)}
 *   onDelete={() => deleteProperty(index)}
 * />
 * ```
 */
export function PropertyForm({
  property,
  onChange,
  onDelete,
  showDelete = true,
  availableEnums = [],
}: PropertyFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * 필드 변경 핸들러
   */
  const handleChange = useCallback(
    <K extends keyof EntityProperty>(key: K, value: EntityProperty[K]) => {
      onChange({ ...property, [key]: value })
    },
    [property, onChange]
  )

  /**
   * Enum 참조 타입 여부 (기존 Enum 노드 참조)
   */
  const enumRefNode = availableEnums.find((e) => e.data.name === property.type)
  const isEnumRef = enumRefNode !== undefined

  /**
   * 인라인 Enum 정의 타입 여부
   */
  const isEnumType = property.type === "enum"

  /**
   * Enum 정의 업데이트 핸들러
   */
  const handleEnumDefChange = useCallback(
    (enumDef: EnumDefinition) => {
      onChange({ ...property, enumDef })
    },
    [property, onChange]
  )

  /**
   * Enum 값 추가 핸들러
   */
  const handleAddEnumValue = useCallback(() => {
    const currentDef = property.enumDef ?? { name: "NewEnum", values: [] }
    const newValue: EnumValue = {
      key: `Value${currentDef.values.length + 1}`,
      value: `value${currentDef.values.length + 1}`,
    }
    handleEnumDefChange({
      ...currentDef,
      values: [...currentDef.values, newValue],
    })
  }, [property.enumDef, handleEnumDefChange])

  /**
   * Enum 값 업데이트 핸들러
   */
  const handleUpdateEnumValue = useCallback(
    (index: number, key: string, value: string) => {
      const currentDef = property.enumDef ?? { name: "NewEnum", values: [] }
      const newValues = [...currentDef.values]
      newValues[index] = { key, value }
      handleEnumDefChange({ ...currentDef, values: newValues })
    },
    [property.enumDef, handleEnumDefChange]
  )

  /**
   * Enum 값 삭제 핸들러
   */
  const handleDeleteEnumValue = useCallback(
    (index: number) => {
      const currentDef = property.enumDef ?? { name: "NewEnum", values: [] }
      handleEnumDefChange({
        ...currentDef,
        values: currentDef.values.filter((_, i) => i !== index),
      })
    },
    [property.enumDef, handleEnumDefChange]
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* 리스트 아이템 헤더 */}
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
          "hover:bg-muted/50 group",
          isOpen && "bg-muted/50"
        )}
      >
        {/* 드래그 핸들 (시각적 표시용) */}
        <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

        {/* 확장 토글 */}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-90"
              )}
            />
          </Button>
        </CollapsibleTrigger>

        {/* 아이콘 표시 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {property.isPrimaryKey && (
            <span title="Primary Key">
              <Key className="h-3.5 w-3.5 text-yellow-500" />
            </span>
          )}
          {(isEnumType || isEnumRef) && (
            <span title={isEnumRef ? `Enum: ${property.type}` : "Inline Enum"}>
              <List className="h-3.5 w-3.5 text-amber-500" />
            </span>
          )}
          {!property.isNullable && !property.isPrimaryKey && (
            <span title="Required">
              <Asterisk className="h-3.5 w-3.5 text-red-500" />
            </span>
          )}
        </div>

        {/* 프로퍼티 이름 (인라인 편집) */}
        <Input
          value={property.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="h-7 text-sm font-medium border-transparent bg-transparent hover:border-input focus:border-input px-2"
          placeholder="propertyName"
        />

        {/* 타입 선택 */}
        <Select
          value={isEnumRef ? `enumRef:${property.type}` : property.type}
          onValueChange={(value) => {
            if (value === "enum") {
              // 인라인 Enum 선택 시 기본 enumDef 생성
              onChange({
                ...property,
                type: value,
                enumDef: property.enumDef ?? { name: "NewEnum", values: [] },
              })
            } else if (value.startsWith("enumRef:")) {
              // Enum 참조 선택 시 Enum 이름을 타입으로 설정
              const enumName = value.replace("enumRef:", "")
              onChange({
                ...property,
                type: enumName,
                enumDef: undefined, // 참조 시 인라인 정의 제거
              })
            } else {
              handleChange("type", value)
            }
          }}
        >
          <SelectTrigger className="h-7 w-32 text-xs border-transparent bg-transparent hover:border-input focus:border-input flex-shrink-0">
            <SelectValue placeholder="Type">
              {isEnumRef
                ? `${property.type}`
                : isEnumType && property.enumDef?.name
                  ? property.enumDef.name
                  : property.type}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {/* 기본 타입 그룹 */}
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">Types</SelectLabel>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectGroup>

            {/* Enum 참조 그룹 (Enum 노드가 있는 경우만 표시) */}
            {availableEnums.length > 0 && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel className="text-xs text-muted-foreground">Enums</SelectLabel>
                  {availableEnums.map((enumNode) => (
                    <SelectItem
                      key={enumNode.id}
                      value={`enumRef:${enumNode.data.name}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <List className="h-3 w-3 text-amber-500" />
                        {enumNode.data.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>

        {/* Enum 배지 표시 */}
        {isEnumType && property.enumDef && property.enumDef.values.length > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
            {property.enumDef.values.length} values
          </Badge>
        )}

        {/* 삭제 버튼 */}
        {showDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* 확장된 상세 설정 영역 */}
      <CollapsibleContent>
        <div className="ml-12 mr-2 pb-3 pt-1 space-y-3 border-l-2 border-muted pl-4">
          {/* Enum 정의 편집 */}
          {isEnumType && (
            <div className="space-y-3">
              {/* Enum 이름 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Enum Name
                </label>
                <Input
                  value={property.enumDef?.name ?? "NewEnum"}
                  onChange={(e) =>
                    handleEnumDefChange({
                      ...(property.enumDef ?? { name: "NewEnum", values: [] }),
                      name: e.target.value,
                    })
                  }
                  className="h-8 text-sm"
                  placeholder="e.g., UserRole, PostStatus"
                />
              </div>

              {/* Enum 값 목록 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">
                    Enum Values
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddEnumValue}
                    className="h-6 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {(property.enumDef?.values ?? []).map((enumValue, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        value={enumValue.key}
                        onChange={(e) =>
                          handleUpdateEnumValue(idx, e.target.value, enumValue.value)
                        }
                        className="h-7 text-xs flex-1"
                        placeholder="Key (e.g., Admin)"
                      />
                      <span className="text-muted-foreground text-xs">=</span>
                      <Input
                        value={enumValue.value}
                        onChange={(e) =>
                          handleUpdateEnumValue(idx, enumValue.key, e.target.value)
                        }
                        className="h-7 text-xs flex-1"
                        placeholder="Value (e.g., admin)"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteEnumValue(idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {(property.enumDef?.values ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No enum values yet. Click &quot;Add&quot; to create one.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 체크박스 옵션 그룹 */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`pk-${property.name}`}
                checked={property.isPrimaryKey}
                onCheckedChange={(checked) =>
                  handleChange("isPrimaryKey", checked === true)
                }
              />
              <Label
                htmlFor={`pk-${property.name}`}
                className="text-xs cursor-pointer"
              >
                Primary Key
              </Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`unique-${property.name}`}
                checked={property.isUnique}
                onCheckedChange={(checked) =>
                  handleChange("isUnique", checked === true)
                }
              />
              <Label
                htmlFor={`unique-${property.name}`}
                className="text-xs cursor-pointer"
              >
                Unique
              </Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`nullable-${property.name}`}
                checked={property.isNullable}
                onCheckedChange={(checked) =>
                  handleChange("isNullable", checked === true)
                }
              />
              <Label
                htmlFor={`nullable-${property.name}`}
                className="text-xs cursor-pointer"
              >
                Nullable
              </Label>
            </div>
          </div>

          {/* Default Value */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Default Value{" "}
              <span className="text-muted-foreground/70">(optional)</span>
            </label>
            <Input
              value={property.defaultValue ?? ""}
              onChange={(e) =>
                handleChange("defaultValue", e.target.value || undefined)
              }
              className="h-8 text-sm"
              placeholder='e.g., "", 0, false, new Date()'
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
