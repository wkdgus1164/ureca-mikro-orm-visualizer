"use client"

/**
 * Enum 편집 컨텐츠 컴포넌트
 *
 * PropertySidebar 내부에서 Enum 편집 UI를 제공
 * 실시간 반영: 변경 즉시 updateEnum 호출
 */

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { EnumValue, EnumNode } from "@/types/entity"

/**
 * Enum 편집 내부 컴포넌트 Props
 */
interface EnumEditInnerProps {
  selectedEnum: EnumNode
}

/**
 * Renders an editor UI for a selected enum, allowing immediate updates to its name and values.
 *
 * @param selectedEnum - The EnumNode currently selected for editing.
 * @returns The UI element that lets users edit the enum's name and list of key/value entries.
 */
function EnumEditInner({ selectedEnum }: EnumEditInnerProps) {
  const { updateEnum } = useEditorContext()

  const data = selectedEnum.data
  const values = useMemo(() => data.values ?? [], [data.values])

  /**
   * Enum 이름 변경 핸들러 (실시간 반영)
   */
  const handleNameChange = (name: string) => {
    updateEnum(selectedEnum.id, { name })
  }

  /**
   * Enum 값 업데이트 핸들러 (실시간 반영)
   */
  const handleValueUpdate = (index: number, key: string, value: string) => {
    const newValues = [...values]
    newValues[index] = { key, value }
    updateEnum(selectedEnum.id, { values: newValues })
  }

  /**
   * Enum 값 삭제 핸들러 (실시간 반영)
   */
  const handleValueDelete = (index: number) => {
    const newValues = values.filter((_, i) => i !== index)
    updateEnum(selectedEnum.id, { values: newValues })
  }

  /**
   * Enum 값 추가 핸들러 (실시간 반영)
   */
  const handleAddValue = () => {
    const newValue: EnumValue = {
      key: `Value${values.length + 1}`,
      value: `value${values.length + 1}`,
    }
    updateEnum(selectedEnum.id, { values: [...values, newValue] })
  }

  return (
    <div className="space-y-4">
      {/* Enum 이름 */}
      <div className="space-y-1.5">
        <Label htmlFor="enum-name">Enum Name</Label>
        <p className="text-xs text-muted-foreground">
          The TypeScript enum/const type name
        </p>
        <Input
          id="enum-name"
          value={data.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., UserRole, PostStatus"
          className="w-full"
        />
      </div>

      {/* Enum 값 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Values
            {values.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({values.length})
              </span>
            )}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddValue}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {values.map((enumValue, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted/50 group"
            >
              {/* 드래그 핸들 (시각적 표시용) */}
              <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />

              {/* Key 입력 */}
              <Input
                value={enumValue.key}
                onChange={(e) =>
                  handleValueUpdate(index, e.target.value, enumValue.value)
                }
                className="h-8 text-sm flex-1"
                placeholder="Key (e.g., Admin)"
              />

              {/* = */}
              <span className="text-muted-foreground text-sm">=</span>

              {/* Value 입력 */}
              <Input
                value={enumValue.value}
                onChange={(e) =>
                  handleValueUpdate(index, enumValue.key, e.target.value)
                }
                className="h-8 text-sm flex-1"
                placeholder="Value (e.g., admin)"
              />

              {/* 삭제 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleValueDelete(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {values.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No values yet. Click &quot;Add&quot; to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Renders an inline editor for the currently selected enum within a PropertySidebar.
 *
 * When no enum is selected, renders `null`.
 *
 * @returns The editor component for the selected enum, or `null` if none is selected.
 */
export function EnumEditContent() {
  const { getSelectedEnum } = useEditorContext()

  const selectedEnum = getSelectedEnum()

  // 선택된 Enum이 없으면 렌더링하지 않음
  if (!selectedEnum) {
    return null
  }

  return <EnumEditInner selectedEnum={selectedEnum} />
}