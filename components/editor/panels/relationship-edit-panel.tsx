"use client"

/**
 * Relationship 편집 패널 컴포넌트
 *
 * Relationship 엣지 선택 시 우측에서 슬라이드되며,
 * 관계 설정을 편집할 수 있는 패널
 */

import { useState, useCallback, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { RelationshipData } from "@/types/relationship"
import type { EntityProperty } from "@/types/entity"
import {
  RelationType,
  RELATION_TYPE_LABELS,
  FetchType,
  FETCH_TYPE_LABELS,
} from "@/types/relationship"

/**
 * Relationship 편집 폼 Props
 */
interface RelationshipEditFormProps {
  initialData: RelationshipData
  sourceEntityName: string
  targetEntityName: string
  sourceProperties: EntityProperty[]
  targetProperties: EntityProperty[]
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
  sourceProperties,
  targetProperties,
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
    toast.success("Changes saved!")
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
        <div className="space-y-1.5">
          <Label htmlFor="rel-type">Relationship Type</Label>
          <p className="text-xs text-muted-foreground">
            The cardinality of this relationship
          </p>
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
        <div className="space-y-1.5">
          <Label htmlFor="source-prop">Source Property Name</Label>
          <p className="text-xs text-muted-foreground">
            The property on {sourceEntityName} that holds this relationship
          </p>
          <Select
            value={localData.sourceProperty}
            onValueChange={(value) => handleChange("sourceProperty", value)}
          >
            <SelectTrigger id="source-prop">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {sourceProperties.map((prop) => (
                <SelectItem key={prop.id} value={prop.name}>
                  {prop.name} ({prop.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Property Name (양방향 관계용) */}
        <div className="space-y-1.5">
          <Label htmlFor="target-prop">Target Property Name</Label>
          <p className="text-xs text-muted-foreground">
            Optional inverse property on {targetEntityName} for bidirectional relationships
          </p>
          <Select
            value={localData.targetProperty ?? ""}
            onValueChange={(value) =>
              handleChange("targetProperty", value || undefined)
            }
          >
            <SelectTrigger id="target-prop">
              <SelectValue placeholder="Select a property (optional)" />
            </SelectTrigger>
            <SelectContent>
              {targetProperties.map((prop) => (
                <SelectItem key={prop.id} value={prop.name}>
                  {prop.name} ({prop.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fetch Type */}
        <div className="space-y-1.5">
          <Label htmlFor="fetch-type">Fetch Strategy</Label>
          <p className="text-xs text-muted-foreground">
            Lazy loads data on access, Eager loads immediately with parent
          </p>
          <Select
            value={localData.fetchType ?? FetchType.Lazy}
            onValueChange={(value) =>
              handleChange("fetchType", value as FetchType)
            }
          >
            <SelectTrigger id="fetch-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(FetchType).map((type) => (
                <SelectItem key={type} value={type}>
                  {FETCH_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* 옵션 체크박스 */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Options</Label>

          <div className="flex items-start gap-3">
            <Checkbox
              id="nullable"
              checked={localData.isNullable}
              onCheckedChange={(checked) => handleChange("isNullable", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="nullable"
                className="text-sm font-medium cursor-pointer"
              >
                Nullable
              </label>
              <p className="text-xs text-muted-foreground">
                Allow the relationship to be null
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cascade"
              checked={localData.cascade}
              onCheckedChange={(checked) => handleChange("cascade", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="cascade"
                className="text-sm font-medium cursor-pointer"
              >
                Cascade
              </label>
              <p className="text-xs text-muted-foreground">
                Cascade operations to related entities
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="orphanRemoval"
              checked={localData.orphanRemoval}
              onCheckedChange={(checked) => handleChange("orphanRemoval", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="orphanRemoval"
                className="text-sm font-medium cursor-pointer"
              >
                Orphan Removal
              </label>
              <p className="text-xs text-muted-foreground">
                Remove orphaned entities automatically
              </p>
            </div>
          </div>
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
   * Entity의 Properties 가져오기
   */
  const getEntityProperties = useCallback(
    (nodeId: string): EntityProperty[] => {
      const node = nodes.find((n) => n.id === nodeId)
      // Entity/Embeddable 노드만 properties를 가짐
      if (node?.data && "properties" in node.data && Array.isArray(node.data.properties)) {
        return node.data.properties as EntityProperty[]
      }
      return []
    },
    [nodes]
  )

  // Source와 Target Entity의 properties (메모이제이션)
  const sourceProperties = useMemo(
    () => (selectedEdge ? getEntityProperties(selectedEdge.source) : []),
    [selectedEdge, getEntityProperties]
  )

  const targetProperties = useMemo(
    () => (selectedEdge ? getEntityProperties(selectedEdge.target) : []),
    [selectedEdge, getEntityProperties]
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
            sourceProperties={sourceProperties}
            targetProperties={targetProperties}
            onSave={handleSave}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
