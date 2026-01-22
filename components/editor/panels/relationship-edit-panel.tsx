"use client"

/**
 * Relationship 편집 컨텐츠 컴포넌트
 *
 * PropertySidebar 내부에서 Relationship 편집 UI를 제공
 * 실시간 반영: 변경 즉시 updateRelationship 호출
 */

import { useCallback, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { EntityProperty } from "@/types/entity"
import {
  RelationType,
  RELATION_TYPE_LABELS,
  FetchType,
  FETCH_TYPE_LABELS,
  DeleteRule,
  DELETE_RULE_LABELS,
} from "@/types/relationship"

/**
 * Render editable UI for the selected relationship inside the PropertySidebar.
 *
 * Allows editing relationship properties (type, source/target properties, fetch strategy,
 * and options) and applies changes in real time to the selected edge.
 *
 * @returns A JSX element containing the relationship editing controls, or `null` when no relationship is selected.
 */
export function RelationshipEditContent() {
  const { nodes, getSelectedEdge, updateRelationship } = useEditorContext()

  const selectedEdge = getSelectedEdge()

  /**
   * Entity 이름 가져오기
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

  // 선택된 엣지가 없으면 렌더링하지 않음
  if (!selectedEdge || !selectedEdge.data) {
    return null
  }

  const data = selectedEdge.data
  const sourceEntityName = getEntityName(selectedEdge.source)
  const targetEntityName = getEntityName(selectedEdge.target)

  /**
   * 필드 변경 핸들러 (실시간 반영)
   */
  const handleChange = <K extends keyof RelationshipData>(
    key: K,
    value: RelationshipData[K]
  ) => {
    updateRelationship(selectedEdge.id, { [key]: value })
  }

  return (
    <div className="space-y-4">
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
          value={data.relationType}
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
          value={data.sourceProperty}
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
          value={data.targetProperty ?? ""}
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
          value={data.fetchType ?? FetchType.Lazy}
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

      {/* Delete Rule */}
      <div className="space-y-1.5">
        <Label htmlFor="delete-rule">Delete Rule</Label>
        <p className="text-xs text-muted-foreground">
          Action to take on related entities when parent is deleted
        </p>
        <Select
          value={data.deleteRule ?? "none"}
          onValueChange={(value) =>
            handleChange("deleteRule", value === "none" ? undefined : (value as DeleteRule))
          }
        >
          <SelectTrigger id="delete-rule">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {Object.values(DeleteRule).map((rule) => (
              <SelectItem key={rule} value={rule}>
                {DELETE_RULE_LABELS[rule]}
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
            checked={data.isNullable}
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
            checked={data.cascade}
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
            checked={data.orphanRemoval}
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
  )
}