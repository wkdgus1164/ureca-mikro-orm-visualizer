"use client"

/**
 * Property 타입 선택 컴포넌트
 *
 * 기본 타입, Enum 참조, 인라인 Enum 중 선택할 수 있는 드롭다운
 */

import { useCallback } from "react"
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
import { List } from "lucide-react"
import type { EntityProperty, EnumNode } from "@/types/entity"
import { PROPERTY_TYPES } from "@/types/entity"

interface PropertyTypeSelectorProps {
  /** 현재 Property */
  property: EntityProperty
  /** Property 변경 핸들러 */
  onChange: (property: EntityProperty) => void
  /** 사용 가능한 Enum 노드 목록 */
  availableEnums: EnumNode[]
}

/**
 * Property 타입 선택 컴포넌트
 *
 * 기본 타입(string, number 등), Enum 참조, 인라인 Enum 중 선택
 */
export function PropertyTypeSelector({
  property,
  onChange,
  availableEnums,
}: PropertyTypeSelectorProps) {
  // Enum 참조 여부 확인
  const enumRefNode = availableEnums.find((e) => e.data.name === property.type)
  const isEnumRef = enumRefNode !== undefined

  /**
   * 타입 변경 핸들러
   */
  const handleTypeChange = useCallback(
    (value: string) => {
      if (value.startsWith("enumRef:")) {
        // Enum 참조 선택 시 Enum 이름을 타입으로 설정
        const enumName = value.replace("enumRef:", "")
        onChange({
          ...property,
          type: enumName,
        })
      } else {
        // 기본 타입 선택
        onChange({
          ...property,
          type: value,
        })
      }
    },
    [property, onChange]
  )

  return (
    <Select
      value={isEnumRef ? `enumRef:${property.type}` : property.type}
      onValueChange={handleTypeChange}
    >
      <SelectTrigger className="h-7 w-32 text-xs border-transparent bg-transparent hover:border-input focus:border-input flex-shrink-0">
        <SelectValue placeholder="Type">
          {property.type}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* 기본 타입 그룹 */}
        <SelectGroup>
          <SelectLabel className="text-xs text-muted-foreground">
            Types
          </SelectLabel>
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
              <SelectLabel className="text-xs text-muted-foreground">
                Enums
              </SelectLabel>
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
  )
}
