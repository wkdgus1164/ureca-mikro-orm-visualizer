"use client"

/**
 * Interface 편집 컨텐츠 컴포넌트
 *
 * PropertySidebar 내부에서 Interface 편집 UI를 제공
 * 실시간 반영: 변경 즉시 updateInterface 호출
 */

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import { useEditorContext } from "@/components/providers/editor-provider"
import type { InterfaceNode, InterfaceMethod, EntityProperty } from "@/types/entity"
import { createDefaultProperty, createDefaultMethod } from "@/types/entity"

/**
 * Interface 편집 내부 컴포넌트 Props
 */
interface InterfaceEditInnerProps {
  selectedNode: InterfaceNode
}

/**
 * Interface 편집 내부 컴포넌트
 */
function InterfaceEditInner({ selectedNode }: InterfaceEditInnerProps) {
  const { updateInterface } = useEditorContext()

  const data = selectedNode.data
  const properties = useMemo(() => data.properties ?? [], [data.properties])
  const methods = useMemo(() => data.methods ?? [], [data.methods])

  /**
   * Interface 이름 변경 핸들러
   */
  const handleNameChange = (name: string) => {
    updateInterface(selectedNode.id, { name })
  }

  /**
   * 프로퍼티 업데이트 핸들러
   */
  const handlePropertyUpdate = (index: number, property: EntityProperty) => {
    const newProperties = [...properties]
    newProperties[index] = property
    updateInterface(selectedNode.id, { properties: newProperties })
  }

  /**
   * 프로퍼티 삭제 핸들러
   */
  const handlePropertyDelete = (index: number) => {
    const newProperties = properties.filter((_, i) => i !== index)
    updateInterface(selectedNode.id, { properties: newProperties })
  }

  /**
   * 프로퍼티 추가 핸들러
   */
  const handleAddProperty = () => {
    const newProperty = createDefaultProperty(crypto.randomUUID())
    updateInterface(selectedNode.id, { properties: [...properties, newProperty] })
  }

  /**
   * 메서드 업데이트 핸들러
   */
  const handleMethodUpdate = (index: number, method: InterfaceMethod) => {
    const newMethods = [...methods]
    newMethods[index] = method
    updateInterface(selectedNode.id, { methods: newMethods })
  }

  /**
   * 메서드 삭제 핸들러
   */
  const handleMethodDelete = (index: number) => {
    const newMethods = methods.filter((_, i) => i !== index)
    updateInterface(selectedNode.id, { methods: newMethods })
  }

  /**
   * 메서드 추가 핸들러
   */
  const handleAddMethod = () => {
    const newMethod = createDefaultMethod(crypto.randomUUID())
    updateInterface(selectedNode.id, { methods: [...methods, newMethod] })
  }

  return (
    <div className="space-y-4">
      {/* Interface 이름 */}
      <div className="space-y-1.5">
        <Label htmlFor="interface-name">Interface Name</Label>
        <p className="text-xs text-muted-foreground">
          The TypeScript interface name
        </p>
        <Input
          id="interface-name"
          value={data.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., IRepository, IRunnable"
          className="w-full"
        />
      </div>

      <Separator />

      {/* 프로퍼티 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Properties
            {properties.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({properties.length})
              </span>
            )}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddProperty}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {properties.map((property, index) => (
            <div key={property.id} className="flex items-center gap-2">
              <Input
                value={property.name}
                onChange={(e) =>
                  handlePropertyUpdate(index, { ...property, name: e.target.value })
                }
                placeholder="name"
                className="flex-1"
              />
              <Input
                value={property.type}
                onChange={(e) =>
                  handlePropertyUpdate(index, { ...property, type: e.target.value })
                }
                placeholder="type"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePropertyDelete(index)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No properties yet
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* 메서드 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Methods
            {methods.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({methods.length})
              </span>
            )}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddMethod}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {methods.map((method, index) => (
            <div key={method.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  value={method.name}
                  onChange={(e) =>
                    handleMethodUpdate(index, { ...method, name: e.target.value })
                  }
                  placeholder="methodName"
                  className="flex-1"
                />
                <Input
                  value={method.returnType}
                  onChange={(e) =>
                    handleMethodUpdate(index, { ...method, returnType: e.target.value })
                  }
                  placeholder="returnType"
                  className="w-24"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMethodDelete(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={method.parameters}
                onChange={(e) =>
                  handleMethodUpdate(index, { ...method, parameters: e.target.value })
                }
                placeholder="param1: Type1, param2: Type2"
                className="text-xs"
              />
            </div>
          ))}
          {methods.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No methods yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Interface 편집 컨텐츠 컴포넌트
 */
export function InterfaceEditContent() {
  const { getSelectedInterface } = useEditorContext()

  const selectedNode = getSelectedInterface()

  if (!selectedNode) {
    return null
  }

  return <InterfaceEditInner selectedNode={selectedNode} />
}
