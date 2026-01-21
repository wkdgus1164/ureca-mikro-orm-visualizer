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
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Trash2, Key, Asterisk, ChevronRight, GripVertical, List } from "lucide-react"
import type { EntityProperty, EnumNode } from "@/types/entity"
import { cn } from "@/lib/utils"
import { InlineEnumForm } from "@/components/editor/panels/inline-enum-form"
import { PropertyTypeSelector } from "@/components/editor/panels/property-type-selector"

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
 * Property 편집 폼 컴포넌트
 *
 * 인라인 이름 편집, 타입 선택, 체크박스 옵션, 기본값 입력을 제공
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

  // Enum 참조 여부 확인
  const enumRefNode = availableEnums.find((e) => e.data.name === property.type)
  const isEnumRef = enumRefNode !== undefined
  const isEnumType = property.type === "enum"

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
        <PropertyTypeSelector
          property={property}
          onChange={onChange}
          availableEnums={availableEnums}
        />

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
          {/* Enum 정의 편집 (인라인 Enum인 경우만) */}
          {isEnumType && property.enumDef && (
            <InlineEnumForm
              enumDef={property.enumDef}
              onChange={(enumDef) => onChange({ ...property, enumDef })}
            />
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
