"use client"

/**
 * Property 편집 폼 컴포넌트
 *
 * Entity 프로퍼티의 상세 설정을 편집하는 폼
 */

import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Trash2, Key, Asterisk } from "lucide-react"
import type { EntityProperty } from "@/types/entity"
import { PROPERTY_TYPES } from "@/types/entity"

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
 * Property 편집 폼 컴포넌트
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
              {property.name || "Unnamed Property"}
            </CardTitle>
          </div>
          {showDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
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
            onChange={(e) => handleChange("name", e.target.value)}
            className="h-8 text-sm"
            placeholder="propertyName"
          />
        </div>

        {/* 프로퍼티 타입 */}
        <div className="space-y-1">
          <Label htmlFor={`prop-type-${property.id}`} className="text-xs">
            Type
          </Label>
          <Select
            value={isKnownType ? property.type : "custom"}
            onValueChange={(value) => {
              if (value !== "custom") {
                handleChange("type", value)
              }
            }}
          >
            <SelectTrigger id={`prop-type-${property.id}`} className="h-8 text-sm">
              <SelectValue placeholder="Select type" />
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
          {/* 커스텀 타입 입력 */}
          {(!isKnownType || property.type === "custom") && (
            <Input
              value={isKnownType ? "" : property.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="h-8 text-sm mt-1"
              placeholder="Enter custom type"
            />
          )}
        </div>

        {/* 체크박스 옵션 그룹 */}
        <div className="flex flex-wrap gap-4 text-xs">
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
          <Label htmlFor={`prop-default-${property.id}`} className="text-xs">
            Default Value{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id={`prop-default-${property.id}`}
            value={property.defaultValue ?? ""}
            onChange={(e) =>
              handleChange("defaultValue", e.target.value || undefined)
            }
            className="h-8 text-sm"
            placeholder='e.g., "", 0, false, new Date()'
          />
        </div>
      </CardContent>
    </Card>
  )
}
