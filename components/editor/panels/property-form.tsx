"use client"

/**
 * Property 편집 폼 컴포넌트
 *
 * Entity 프로퍼티의 상세 설정을 편집하는 리스트 형태 폼
 */

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Trash2, Key, Asterisk, ChevronRight, GripVertical } from "lucide-react"
import type { EntityProperty } from "@/types/entity"
import { PROPERTY_TYPES } from "@/types/entity"
import { cn } from "@/lib/utils"

interface PropertyFormProps {
  /** 편집할 프로퍼티 */
  property: EntityProperty
  /** 프로퍼티 변경 핸들러 */
  onChange: (property: EntityProperty) => void
  /** 프로퍼티 삭제 핸들러 */
  onDelete: () => void
  /** 삭제 버튼 표시 여부 */
  showDelete?: boolean
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
   * 타입이 목록에 있는지 확인
   */
  const isKnownType = PROPERTY_TYPES.includes(
    property.type as (typeof PROPERTY_TYPES)[number]
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
          value={isKnownType ? property.type : "custom"}
          onValueChange={(value) => {
            if (value !== "custom") {
              handleChange("type", value)
            }
          }}
        >
          <SelectTrigger className="h-7 w-28 text-xs border-transparent bg-transparent hover:border-input focus:border-input flex-shrink-0">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom...</SelectItem>
          </SelectContent>
        </Select>

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
          {/* 커스텀 타입 입력 */}
          {!isKnownType && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Custom Type
              </label>
              <Input
                value={property.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="h-8 text-sm"
                placeholder="Enter custom type"
              />
            </div>
          )}

          {/* 체크박스 옵션 그룹 */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={property.isPrimaryKey}
                onChange={(e) => handleChange("isPrimaryKey", e.target.checked)}
                className="rounded border-border"
              />
              <span>Primary Key</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={property.isUnique}
                onChange={(e) => handleChange("isUnique", e.target.checked)}
                className="rounded border-border"
              />
              <span>Unique</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={property.isNullable}
                onChange={(e) => handleChange("isNullable", e.target.checked)}
                className="rounded border-border"
              />
              <span>Nullable</span>
            </label>
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
