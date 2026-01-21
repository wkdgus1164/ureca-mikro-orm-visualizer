"use client"

/**
 * Index 편집 폼 컴포넌트
 *
 * Entity의 Index 및 Unique 제약조건을 편집하는 폼
 */

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, ChevronRight, Database, Fingerprint } from "lucide-react"
import type { EntityIndex, EntityProperty } from "@/types/entity"
import { cn } from "@/lib/utils"

interface IndexFormProps {
  /** 편집할 Index */
  index: EntityIndex
  /** 선택 가능한 프로퍼티 목록 */
  availableProperties: EntityProperty[]
  /** Index 변경 핸들러 */
  onChange: (index: EntityIndex) => void
  /** Index 삭제 핸들러 */
  onDelete: () => void
}

/**
 * Renders a collapsible editor for an EntityIndex, allowing the user to edit the index name, toggle uniqueness, select properties, and delete the index.
 *
 * @param index - The EntityIndex being edited.
 * @param availableProperties - List of properties available for inclusion in the index.
 * @param onChange - Called with the updated EntityIndex whenever any field changes.
 * @param onDelete - Called when the delete action is triggered.
 *
 * @example
 * ```tsx
 * <IndexForm
 *   index={index}
 *   availableProperties={properties}
 *   onChange={(updated) => updateIndex(idx, updated)}
 *   onDelete={() => deleteIndex(idx)}
 * />
 * ```
 */
export function IndexForm({
  index,
  availableProperties,
  onChange,
  onDelete,
}: IndexFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * 필드 변경 핸들러
   */
  const handleChange = useCallback(
    <K extends keyof EntityIndex>(key: K, value: EntityIndex[K]) => {
      onChange({ ...index, [key]: value })
    },
    [index, onChange]
  )

  /**
   * 프로퍼티 선택 토글 핸들러
   */
  const handlePropertyToggle = useCallback(
    (propertyName: string, checked: boolean) => {
      const newProperties = checked
        ? [...index.properties, propertyName]
        : index.properties.filter((p) => p !== propertyName)
      handleChange("properties", newProperties)
    },
    [index.properties, handleChange]
  )

  /**
   * Index 이름 자동 생성
   */
  const getDisplayName = () => {
    if (index.name) return index.name
    if (index.properties.length === 0) return "New Index"
    const prefix = index.isUnique ? "unq" : "idx"
    return `${prefix}_${index.properties.join("_")}`
  }

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

        {/* 아이콘 */}
        {index.isUnique ? (
          <Fingerprint className="h-4 w-4 text-violet-500 flex-shrink-0" />
        ) : (
          <Database className="h-4 w-4 text-blue-500 flex-shrink-0" />
        )}

        {/* Index 이름 */}
        <span className="text-sm font-medium flex-1 truncate">
          {getDisplayName()}
        </span>

        {/* 프로퍼티 배지 */}
        <div className="flex gap-1 flex-shrink-0">
          {index.properties.slice(0, 2).map((prop) => (
            <Badge key={prop} variant="secondary" className="text-xs px-1.5 py-0">
              {prop}
            </Badge>
          ))}
          {index.properties.length > 2 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{index.properties.length - 2}
            </Badge>
          )}
        </div>

        {/* Unique 배지 */}
        {index.isUnique && (
          <Badge variant="outline" className="text-xs px-1.5 py-0 text-violet-600 border-violet-300">
            UNIQUE
          </Badge>
        )}

        {/* 삭제 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 확장된 상세 설정 영역 */}
      <CollapsibleContent>
        <div className="ml-8 mr-2 pb-3 pt-1 space-y-3 border-l-2 border-muted pl-4">
          {/* Index 이름 */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Index Name{" "}
              <span className="text-muted-foreground/70">(optional)</span>
            </label>
            <Input
              value={index.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value || undefined)}
              className="h-8 text-sm"
              placeholder="e.g., idx_user_email"
            />
          </div>

          {/* Unique 토글 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={index.isUnique}
              onCheckedChange={(checked) =>
                handleChange("isUnique", checked === true)
              }
            />
            <span className="text-sm">Unique Constraint</span>
          </label>

          {/* 프로퍼티 선택 */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Select Properties
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {availableProperties.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No properties available
                </p>
              ) : (
                availableProperties.map((prop) => (
                  <label
                    key={prop.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-sm"
                  >
                    <Checkbox
                      checked={index.properties.includes(prop.name)}
                      onCheckedChange={(checked) =>
                        handlePropertyToggle(prop.name, checked === true)
                      }
                    />
                    <span className="text-sm">{prop.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({prop.type})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {index.properties.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Select at least one property for this index
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}