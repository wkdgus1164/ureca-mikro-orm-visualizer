"use client"

/**
 * Enum 편집 패널 컴포넌트
 *
 * Enum 노드 선택 시 우측에서 슬라이드되며,
 * Enum 이름과 값 목록을 편집할 수 있는 패널
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
import { Plus, Trash2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { EnumData, EnumValue } from "@/types/entity"

/**
 * Enum 편집 폼 Props
 */
interface EnumEditFormProps {
  initialData: EnumData
  onSave: (data: EnumData) => void
}

/**
 * Enum 편집 폼 컴포넌트
 *
 * key prop으로 노드 ID를 전달받아 노드 변경 시 상태가 리셋됨
 */
function EnumEditForm({ initialData, onSave }: EnumEditFormProps) {
  // 로컬 편집 상태 (초기값으로 initialData 사용)
  const [localData, setLocalData] = useState<EnumData>(() => ({
    ...initialData,
    values: initialData.values.map((v) => ({ ...v })),
  }))

  /**
   * Enum 이름 변경 핸들러
   */
  const handleNameChange = useCallback((name: string) => {
    setLocalData((prev) => ({ ...prev, name }))
  }, [])

  /**
   * Enum 값 업데이트 핸들러
   */
  const handleValueUpdate = useCallback(
    (index: number, key: string, value: string) => {
      setLocalData((prev) => {
        const values = [...prev.values]
        values[index] = { key, value }
        return { ...prev, values }
      })
    },
    []
  )

  /**
   * Enum 값 삭제 핸들러
   */
  const handleValueDelete = useCallback((index: number) => {
    setLocalData((prev) => {
      const values = prev.values.filter((_, i) => i !== index)
      return { ...prev, values }
    })
  }, [])

  /**
   * Enum 값 추가 핸들러
   */
  const handleAddValue = useCallback(() => {
    setLocalData((prev) => {
      const newValue: EnumValue = {
        key: `Value${prev.values.length + 1}`,
        value: `value${prev.values.length + 1}`,
      }
      return { ...prev, values: [...prev.values, newValue] }
    })
  }, [])

  /**
   * 변경사항 저장 핸들러
   */
  const handleSave = useCallback(() => {
    onSave(localData)
    toast.success("Changes saved!")
  }, [localData, onSave])

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="px-6 space-y-4">
        {/* Enum 이름 */}
        <div className="space-y-1.5">
          <Label htmlFor="enum-name">Enum Name</Label>
          <p className="text-xs text-muted-foreground">
            The TypeScript enum/const type name
          </p>
          <Input
            id="enum-name"
            value={localData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., UserRole, PostStatus"
            className="w-full"
          />
        </div>
      </div>

      {/* Enum 값 목록 */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-6">
        <div className="flex items-center justify-between px-6 mb-2">
          <Label className="text-base font-semibold">
            Values
            {localData.values.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({localData.values.length})
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

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            {localData.values.map((enumValue, index) => (
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
            {localData.values.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No values yet. Click &quot;Add&quot; to create one.
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
 * Enum 편집 패널 컴포넌트
 *
 * @example
 * ```tsx
 * <EditorProvider>
 *   <EditorCanvas />
 *   <EnumEditPanel />
 * </EditorProvider>
 * ```
 */
export function EnumEditPanel() {
  const { uiState, getSelectedEnum, updateEnum, togglePanel } =
    useEditorContext()

  // 선택된 Enum 노드 가져오기
  const selectedEnum = getSelectedEnum()

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
   * Enum 저장 핸들러
   */
  const handleSave = useCallback(
    (data: EnumData) => {
      if (selectedEnum) {
        updateEnum(selectedEnum.id, data)
      }
    },
    [selectedEnum, updateEnum]
  )

  // Enum 노드가 선택되었을 때만 패널 표시
  const isOpen =
    uiState.isPanelOpen &&
    uiState.selection.type === "node" &&
    selectedEnum !== null

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Edit Enum</SheetTitle>
          <SheetDescription>
            Define enum values for TypeScript generation
          </SheetDescription>
        </SheetHeader>

        {selectedEnum && (
          <EnumEditForm
            key={selectedEnum.id}
            initialData={selectedEnum.data}
            onSave={handleSave}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
