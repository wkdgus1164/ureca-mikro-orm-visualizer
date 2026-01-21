"use client"

/**
 * Relationship 편집 패널 컴포넌트
 *
 * Relationship 엣지 선택 시 우측에서 슬라이드되며,
 * 관계 설정을 편집할 수 있는 패널
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { RelationshipData } from "@/types/relationship"
import { RelationType, RELATION_TYPE_LABELS } from "@/types/relationship"

/**
 * Relationship 편집 폼 Props
 */
interface RelationshipEditFormProps {
  initialData: RelationshipData
  sourceEntityName: string
  targetEntityName: string
  onSave: (data: RelationshipData) => void
}

/**
 * Relationship 편집 폼 컴포넌트
 *
 * key prop으로 엣지 ID를 전달받아 엣지 변경 시 상태가 리셋됨
 */
function RelationshipEditForm({
  initialData,
  sourceEntityName,
  targetEntityName,
  onSave,
}: RelationshipEditFormProps) {
  // 로컬 편집 상태
  const [localData, setLocalData] = useState<RelationshipData>(() => ({
    ...initialData,
  }))

  /**
   * 필드 변경 핸들러
   */
  const handleChange = useCallback(
    <K extends keyof RelationshipData>(key: K, value: RelationshipData[K]) => {
      setLocalData((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  /**
   * 저장 핸들러
   */
  const handleSave = useCallback(() => {
    onSave(localData)
  }, [localData, onSave])

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="px-6 space-y-4">
        {/* 연결 정보 표시 */}
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{sourceEntityName}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium">{targetEntityName}</span>
          </div>
        </div>

        {/* 관계 타입 */}
        <div className="space-y-2">
          <Label htmlFor="rel-type">Relationship Type</Label>
          <Select
            value={localData.relationType}
            onValueChange={(value) =>
              handleChange("relationType", value as RelationType)
            }
          >
            <SelectTrigger id="rel-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RelationType).map((type) => (
                <SelectItem key={type} value={type}>
                  {RELATION_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Property Name */}
        <div className="space-y-2">
          <Label htmlFor="source-prop">
            Source Property Name{" "}
            <span className="text-muted-foreground text-xs">
              (on {sourceEntityName})
            </span>
          </Label>
          <Input
            id="source-prop"
            value={localData.sourceProperty}
            onChange={(e) => handleChange("sourceProperty", e.target.value)}
            placeholder="e.g., posts, author, items"
          />
        </div>

        {/* Target Property Name (양방향 관계용) */}
        <div className="space-y-2">
          <Label htmlFor="target-prop">
            Target Property Name{" "}
            <span className="text-muted-foreground text-xs">
              (on {targetEntityName}, optional for bidirectional)
            </span>
          </Label>
          <Input
            id="target-prop"
            value={localData.targetProperty ?? ""}
            onChange={(e) =>
              handleChange("targetProperty", e.target.value || undefined)
            }
            placeholder="e.g., user, parent"
          />
        </div>

        <Separator />

        {/* 옵션 체크박스 */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Options</Label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localData.isNullable}
              onChange={(e) => handleChange("isNullable", e.target.checked)}
              className="rounded border-border"
            />
            <div>
              <span className="text-sm font-medium">Nullable</span>
              <p className="text-xs text-muted-foreground">
                Allow the relationship to be null
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localData.cascade}
              onChange={(e) => handleChange("cascade", e.target.checked)}
              className="rounded border-border"
            />
            <div>
              <span className="text-sm font-medium">Cascade</span>
              <p className="text-xs text-muted-foreground">
                Cascade operations to related entities
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localData.orphanRemoval}
              onChange={(e) => handleChange("orphanRemoval", e.target.checked)}
              className="rounded border-border"
            />
            <div>
              <span className="text-sm font-medium">Orphan Removal</span>
              <p className="text-xs text-muted-foreground">
                Remove orphaned entities automatically
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-auto p-6 pt-4 border-t">
        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

/**
 * Relationship 편집 패널 컴포넌트
 *
 * @example
 * ```tsx
 * <EditorProvider>
 *   <EditorCanvas />
 *   <RelationshipEditPanel />
 * </EditorProvider>
 * ```
 */
export function RelationshipEditPanel() {
  const {
    uiState,
    nodes,
    getSelectedEdge,
    updateRelationship,
    togglePanel,
  } = useEditorContext()

  // 선택된 엣지 가져오기
  const selectedEdge = getSelectedEdge()

  /**
   * Source Entity 이름 가져오기
   */
  const getEntityName = useCallback(
    (nodeId: string): string => {
      const node = nodes.find((n) => n.id === nodeId)
      return node?.data?.name ?? "Unknown"
    },
    [nodes]
  )

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
   * Relationship 저장 핸들러
   */
  const handleSave = useCallback(
    (data: RelationshipData) => {
      if (selectedEdge) {
        updateRelationship(selectedEdge.id, data)
      }
    },
    [selectedEdge, updateRelationship]
  )

  // Relationship 엣지가 선택되었을 때만 패널 표시
  const isOpen =
    uiState.isPanelOpen &&
    uiState.selection.type === "edge" &&
    selectedEdge !== null

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>Edit Relationship</SheetTitle>
          <SheetDescription>
            Configure the relationship between entities
          </SheetDescription>
        </SheetHeader>

        {selectedEdge && selectedEdge.data && (
          <RelationshipEditForm
            key={selectedEdge.id}
            initialData={selectedEdge.data}
            sourceEntityName={getEntityName(selectedEdge.source)}
            targetEntityName={getEntityName(selectedEdge.target)}
            onSave={handleSave}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
