"use client"

/**
 * Tool 실행 훅
 *
 * Application Layer - 도메인 로직과 에디터 상태를 연결
 * - 커맨드 생성: lib/ai/tool-executor.ts (Domain Layer)
 * - 커맨드 적용: lib/ai/command-applier.ts (Domain Layer)
 */

import { useCallback } from "react"
import { useEditorContext } from "@/components/providers/editor-provider"

// Domain Layer - 커맨드 생성 함수들
import {
  createAddEntityCommand,
  createUpdateEntityCommand,
  createDeleteEntityCommand,
  createAddEmbeddableCommand,
  createAddEnumCommand,
  createAddInterfaceCommand,
  createAddPropertyCommand,
  createAddRelationshipCommand,
  createDeleteRelationshipCommand,
  createAddEnumMappingCommand,
  createClearDiagramCommand,
  createGetDiagramSummaryCommand,
  findNodeByName,
  findEnumByName,
  findEntityByName,
  findRelationship,
  type AddEntityArgs,
  type UpdateEntityArgs,
  type DeleteEntityArgs,
  type AddEmbeddableArgs,
  type UpdateEmbeddableArgs,
  type DeleteEmbeddableArgs,
  type AddEnumArgs,
  type UpdateEnumArgs,
  type DeleteEnumArgs,
  type AddInterfaceArgs,
  type UpdateInterfaceArgs,
  type DeleteInterfaceArgs,
  type AddPropertyArgs,
  type UpdatePropertyArgs,
  type DeletePropertyArgs,
  type AddRelationshipArgs,
  type UpdateRelationshipArgs,
  type DeleteRelationshipArgs,
  type AddEnumMappingArgs,
  type DeleteEnumMappingArgs,
  type ClearDiagramArgs,
} from "@/lib/ai/tool-executor"

// Domain Layer - 커맨드 적용 함수들
import {
  applyAddEntityCommand,
  applyUpdateEntityCommand,
  applyAddEmbeddableCommand,
  applyAddEnumCommand,
  applyAddInterfaceCommand,
  applyAddPropertyCommand,
  applyAddRelationshipCommand,
  applyAddEnumMappingCommand,
} from "@/lib/ai/command-applier"

import type { ToolResult } from "@/types/chat"
import type { EntityProperty, EnumValue } from "@/types/entity"
import { RelationType } from "@/types/relationship"

export interface UseToolExecutorReturn {
  executeTool: (toolName: string, args: unknown) => ToolResult
}

/**
 * Tool 실행 훅
 *
 * AI가 호출한 Tool을 실행하고 에디터 상태를 업데이트
 * - 유스케이스 조합만 담당
 * - 실제 로직은 Domain Layer 함수에 위임
 */
export function useToolExecutor(): UseToolExecutorReturn {
  const editor = useEditorContext()

  const executeTool = useCallback(
    (toolName: string, args: unknown): ToolResult => {
      try {
        switch (toolName) {
          // ============================================
          // Entity Tools
          // ============================================

          case "addEntity": {
            const command = createAddEntityCommand(args as AddEntityArgs, editor.nodes)
            applyAddEntityCommand(command, editor.setNodes)
            return command.result
          }

          case "updateEntity": {
            const commandOrError = createUpdateEntityCommand(args as UpdateEntityArgs, editor.nodes)
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            applyUpdateEntityCommand(commandOrError, editor.updateEntity)
            return commandOrError.result
          }

          case "deleteEntity": {
            const commandOrError = createDeleteEntityCommand(args as DeleteEntityArgs, editor.nodes)
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            const payload = commandOrError.payload as { id: string }
            editor.deleteEntity(payload.id)
            return commandOrError.result
          }

          // ============================================
          // Embeddable Tools
          // ============================================

          case "addEmbeddable": {
            const command = createAddEmbeddableCommand(args as AddEmbeddableArgs, editor.nodes)
            applyAddEmbeddableCommand(command, editor.setNodes)
            return command.result
          }

          case "updateEmbeddable": {
            const typedArgs = args as UpdateEmbeddableArgs
            const node = findNodeByName(editor.nodes, typedArgs.targetName, "embeddable")
            if (!node) {
              return {
                type: "error",
                data: { message: `Embeddable '${typedArgs.targetName}'를 찾을 수 없습니다` },
              }
            }
            editor.updateEmbeddable(node.id, { name: typedArgs.newName })
            return {
              type: "embeddableUpdated",
              data: { name: typedArgs.newName, changes: ["이름 변경"] },
            }
          }

          case "deleteEmbeddable": {
            const typedArgs = args as DeleteEmbeddableArgs
            const node = findNodeByName(editor.nodes, typedArgs.name, "embeddable")
            if (!node) {
              return {
                type: "error",
                data: { message: `Embeddable '${typedArgs.name}'를 찾을 수 없습니다` },
              }
            }
            editor.deleteEmbeddable(node.id)
            return { type: "embeddableDeleted", data: { name: typedArgs.name } }
          }

          // ============================================
          // Enum Tools
          // ============================================

          case "addEnum": {
            const command = createAddEnumCommand(args as AddEnumArgs, editor.nodes)
            applyAddEnumCommand(command, editor.setNodes)
            return command.result
          }

          case "updateEnum": {
            const typedArgs = args as UpdateEnumArgs
            const node = findEnumByName(editor.nodes, typedArgs.targetName)
            if (!node) {
              return {
                type: "error",
                data: { message: `Enum '${typedArgs.targetName}'을 찾을 수 없습니다` },
              }
            }
            const updates: { name?: string; values?: EnumValue[] } = {}
            if (typedArgs.newName) updates.name = typedArgs.newName
            if (typedArgs.values) updates.values = typedArgs.values
            editor.updateEnum(node.id, updates)
            return {
              type: "enumUpdated",
              data: { name: typedArgs.newName ?? typedArgs.targetName, changes: Object.keys(updates) },
            }
          }

          case "deleteEnum": {
            const typedArgs = args as DeleteEnumArgs
            const node = findEnumByName(editor.nodes, typedArgs.name)
            if (!node) {
              return {
                type: "error",
                data: { message: `Enum '${typedArgs.name}'을 찾을 수 없습니다` },
              }
            }
            editor.deleteEnum(node.id)
            return { type: "enumDeleted", data: { name: typedArgs.name } }
          }

          // ============================================
          // Interface Tools
          // ============================================

          case "addInterface": {
            const command = createAddInterfaceCommand(args as AddInterfaceArgs, editor.nodes)
            applyAddInterfaceCommand(command, editor.setNodes)
            return command.result
          }

          case "updateInterface": {
            const typedArgs = args as UpdateInterfaceArgs
            const node = findNodeByName(editor.nodes, typedArgs.targetName, "interface")
            if (!node) {
              return {
                type: "error",
                data: { message: `Interface '${typedArgs.targetName}'를 찾을 수 없습니다` },
              }
            }
            editor.updateInterface(node.id, { name: typedArgs.newName })
            return {
              type: "interfaceUpdated",
              data: { name: typedArgs.newName, changes: ["이름 변경"] },
            }
          }

          case "deleteInterface": {
            const typedArgs = args as DeleteInterfaceArgs
            const node = findNodeByName(editor.nodes, typedArgs.name, "interface")
            if (!node) {
              return {
                type: "error",
                data: { message: `Interface '${typedArgs.name}'를 찾을 수 없습니다` },
              }
            }
            editor.deleteInterface(node.id)
            return { type: "interfaceDeleted", data: { name: typedArgs.name } }
          }

          // ============================================
          // Property Tools
          // ============================================

          case "addProperty": {
            const commandOrError = createAddPropertyCommand(args as AddPropertyArgs, editor.nodes)
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            applyAddPropertyCommand(commandOrError, {
              nodes: editor.nodes,
              updateEntity: editor.updateEntity,
              updateEmbeddable: editor.updateEmbeddable,
              updateInterface: editor.updateInterface,
            })
            return commandOrError.result
          }

          case "updateProperty": {
            const typedArgs = args as UpdatePropertyArgs
            const node = findNodeByName(editor.nodes, typedArgs.nodeName)
            if (!node) {
              return {
                type: "error",
                data: { message: `노드 '${typedArgs.nodeName}'를 찾을 수 없습니다` },
              }
            }

            if (node.type === "entity" || node.type === "embeddable" || node.type === "interface") {
              const properties = (node.data.properties as EntityProperty[]).map((p) =>
                p.name === typedArgs.propertyName ? { ...p, ...typedArgs.updates } : p
              )
              if (node.type === "entity") {
                editor.updateEntity(node.id, { properties })
              } else if (node.type === "embeddable") {
                editor.updateEmbeddable(node.id, { properties })
              } else {
                editor.updateInterface(node.id, { properties })
              }
              return {
                type: "propertyUpdated",
                data: {
                  nodeName: typedArgs.nodeName,
                  propertyName: typedArgs.updates.name ?? typedArgs.propertyName,
                  propertyType: typedArgs.updates.type ?? "unchanged",
                },
              }
            }
            return { type: "error", data: { message: "프로퍼티를 수정할 수 없는 노드 타입입니다" } }
          }

          case "deleteProperty": {
            const typedArgs = args as DeletePropertyArgs
            const node = findNodeByName(editor.nodes, typedArgs.nodeName)
            if (!node) {
              return {
                type: "error",
                data: { message: `노드 '${typedArgs.nodeName}'를 찾을 수 없습니다` },
              }
            }

            if (node.type === "entity" || node.type === "embeddable" || node.type === "interface") {
              const properties = (node.data.properties as EntityProperty[]).filter(
                (p) => p.name !== typedArgs.propertyName
              )
              if (node.type === "entity") {
                editor.updateEntity(node.id, { properties })
              } else if (node.type === "embeddable") {
                editor.updateEmbeddable(node.id, { properties })
              } else {
                editor.updateInterface(node.id, { properties })
              }
              return {
                type: "propertyDeleted",
                data: { nodeName: typedArgs.nodeName, propertyName: typedArgs.propertyName },
              }
            }
            return { type: "error", data: { message: "프로퍼티를 삭제할 수 없는 노드 타입입니다" } }
          }

          // ============================================
          // Relationship Tools
          // ============================================

          case "addRelationship": {
            const commandOrError = createAddRelationshipCommand(args as AddRelationshipArgs, editor.nodes)
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            applyAddRelationshipCommand(commandOrError, {
              edges: editor.edges,
              onConnect: editor.onConnect,
              updateRelationship: editor.updateRelationship,
            })
            return commandOrError.result
          }

          case "updateRelationship": {
            const typedArgs = args as UpdateRelationshipArgs
            const relationship = findRelationship(
              editor.edges,
              editor.nodes,
              typedArgs.sourceEntity,
              typedArgs.targetEntity
            )
            if (!relationship) {
              return {
                type: "error",
                data: {
                  message: `${typedArgs.sourceEntity}와 ${typedArgs.targetEntity} 간의 관계를 찾을 수 없습니다`,
                },
              }
            }

            const updates: Record<string, unknown> = {}
            if (typedArgs.updates.relationType) {
              updates.relationType = RelationType[typedArgs.updates.relationType as keyof typeof RelationType]
            }
            if (typedArgs.updates.sourceProperty) {
              updates.sourceProperty = typedArgs.updates.sourceProperty
            }
            if (typedArgs.updates.targetProperty !== undefined) {
              updates.targetProperty = typedArgs.updates.targetProperty
            }
            if (typedArgs.updates.isNullable !== undefined) {
              updates.isNullable = typedArgs.updates.isNullable
            }
            if (typedArgs.updates.cascade !== undefined) {
              updates.cascade = typedArgs.updates.cascade
            }

            editor.updateRelationship(relationship.id, updates)
            return {
              type: "relationshipUpdated",
              data: {
                source: typedArgs.sourceEntity,
                target: typedArgs.targetEntity,
                type: typedArgs.updates.relationType ?? relationship.data.relationType,
              },
            }
          }

          case "deleteRelationship": {
            const commandOrError = createDeleteRelationshipCommand(
              args as DeleteRelationshipArgs,
              editor.nodes,
              editor.edges
            )
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            const payload = commandOrError.payload as { id: string }
            editor.deleteRelationship(payload.id)
            return commandOrError.result
          }

          // ============================================
          // EnumMapping Tools
          // ============================================

          case "addEnumMapping": {
            const commandOrError = createAddEnumMappingCommand(args as AddEnumMappingArgs, editor.nodes)
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            applyAddEnumMappingCommand(commandOrError, {
              nodes: editor.nodes,
              addEnumMapping: editor.addEnumMapping,
              updateEnumMapping: editor.updateEnumMapping,
              updateEntity: editor.updateEntity,
            })
            return commandOrError.result
          }

          case "deleteEnumMapping": {
            const typedArgs = args as DeleteEnumMappingArgs
            const entity = findEntityByName(editor.nodes, typedArgs.entityName)
            if (!entity) {
              return {
                type: "error",
                data: { message: `Entity '${typedArgs.entityName}'를 찾을 수 없습니다` },
              }
            }

            const property = entity.data.properties.find((p) => p.name === typedArgs.propertyName)
            if (!property) {
              return {
                type: "error",
                data: { message: `Property '${typedArgs.propertyName}'를 찾을 수 없습니다` },
              }
            }

            // EnumMapping 엣지 찾기
            const mapping = editor.edges.find(
              (e) =>
                e.type === "enum-mapping" &&
                e.source === entity.id &&
                e.data.propertyId === property.id
            )

            if (!mapping) {
              return {
                type: "error",
                data: { message: "해당 프로퍼티의 Enum 매핑을 찾을 수 없습니다" },
              }
            }

            editor.deleteRelationship(mapping.id)
            return {
              type: "enumMappingDeleted",
              data: {
                entityName: typedArgs.entityName,
                propertyName: typedArgs.propertyName,
              },
            }
          }

          // ============================================
          // Diagram Tools
          // ============================================

          case "clearDiagram": {
            const commandOrError = createClearDiagramCommand(args as ClearDiagramArgs)
            if ("error" in commandOrError) {
              return { type: "error", data: { message: commandOrError.error } }
            }
            editor.clearDiagram()
            return commandOrError.result
          }

          case "getDiagramSummary": {
            const command = createGetDiagramSummaryCommand(editor.nodes, editor.edges)
            return command.result
          }

          // ============================================
          // Code Generation Tools (placeholder)
          // ============================================

          case "generateCode": {
            // TODO: 코드 생성 로직 구현
            return {
              type: "codeGenerated",
              data: { target: "all", fileCount: editor.nodes.length },
            }
          }

          case "previewCode": {
            // TODO: 코드 미리보기 로직 구현
            return {
              type: "codePreview",
              data: { nodeName: (args as { nodeName: string }).nodeName, code: "// TODO" },
            }
          }

          default:
            return { type: "error", data: { message: `알 수 없는 Tool: ${toolName}` } }
        }
      } catch (error) {
        return {
          type: "error",
          data: { message: error instanceof Error ? error.message : "Unknown error" },
        }
      }
    },
    [editor]
  )

  return { executeTool }
}
