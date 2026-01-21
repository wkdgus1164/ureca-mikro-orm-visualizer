"use client"

/**
 * 인라인 Enum 정의 편집 폼 컴포넌트
 *
 * Property에서 "enum" 타입 선택 시 표시되는 Enum 정의 편집 UI
 */

import { useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { EnumDefinition, EnumValue } from "@/types/entity"

interface InlineEnumFormProps {
  /** Enum 정의 데이터 */
  enumDef: EnumDefinition
  /** Enum 정의 변경 핸들러 */
  onChange: (enumDef: EnumDefinition) => void
}

/**
 * 인라인 Enum 정의 편집 폼
 *
 * Enum 이름과 값 목록을 편집할 수 있는 폼 컴포넌트
 */
export function InlineEnumForm({ enumDef, onChange }: InlineEnumFormProps) {
  /** 고유한 키 생성을 위한 카운터 */
  const counterRef = useRef(0)

  /**
   * Enum 이름 변경 핸들러
   */
  const handleNameChange = useCallback(
    (name: string) => {
      onChange({ ...enumDef, name })
    },
    [enumDef, onChange]
  )

  /**
   * Enum 값 추가 핸들러
   *
   * useRef 카운터를 사용하여 삭제 후에도 고유한 키/값 생성 보장
   */
  const handleAddValue = useCallback(() => {
    counterRef.current += 1
    const uniqueId = `${Date.now()}_${counterRef.current}`
    const newValue: EnumValue = {
      key: `Value_${uniqueId}`,
      value: `value_${uniqueId}`,
    }
    onChange({
      ...enumDef,
      values: [...enumDef.values, newValue],
    })
  }, [enumDef, onChange])

  /**
   * Enum 값 업데이트 핸들러
   */
  const handleUpdateValue = useCallback(
    (index: number, key: string, value: string) => {
      const newValues = [...enumDef.values]
      newValues[index] = { key, value }
      onChange({ ...enumDef, values: newValues })
    },
    [enumDef, onChange]
  )

  /**
   * Enum 값 삭제 핸들러
   */
  const handleDeleteValue = useCallback(
    (index: number) => {
      onChange({
        ...enumDef,
        values: enumDef.values.filter((_, i) => i !== index),
      })
    },
    [enumDef, onChange]
  )

  return (
    <div className="space-y-3">
      {/* Enum 이름 */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Enum Name</label>
        <Input
          value={enumDef.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="h-8 text-sm"
          placeholder="e.g., UserRole, PostStatus"
        />
      </div>

      {/* Enum 값 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Enum Values</label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddValue}
            className="h-6 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-1.5">
          {enumDef.values.map((enumValue, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Input
                value={enumValue.key}
                onChange={(e) =>
                  handleUpdateValue(idx, e.target.value, enumValue.value)
                }
                className="h-7 text-xs flex-1"
                placeholder="Key (e.g., Admin)"
              />
              <span className="text-muted-foreground text-xs">=</span>
              <Input
                value={enumValue.value}
                onChange={(e) =>
                  handleUpdateValue(idx, enumValue.key, e.target.value)
                }
                className="h-7 text-xs flex-1"
                placeholder="Value (e.g., admin)"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteValue(idx)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {enumDef.values.length === 0 && (
            <p className="text-xs text-muted-foreground italic py-2">
              No enum values yet. Click &quot;Add&quot; to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
